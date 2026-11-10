"""Local photo catalog/contact sheets. Originals and private metadata stay in .cache."""
import io
import json
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageCms
import pillow_heif

pillow_heif.register_heif_opener()
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
CACHE.mkdir(exist_ok=True)
(CACHE / 'thumbs').mkdir(exist_ok=True)
SRGB = ImageCms.createProfile('sRGB')

def srgb_image(im):
    im = ImageOps.exif_transpose(im)
    profile = im.info.get('icc_profile')
    if profile:
        try:
            return ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(profile)), SRGB, outputMode='RGB')
        except (OSError, ValueError):
            pass
    return im.convert('RGB')

def process(path):
    with Image.open(path) as raw:
        exif = raw.getexif()
        tags = exif.get_ifd(34665)
        gps = exif.get_ifd(34853)
        stamp = tags.get(36867, exif.get(306, ''))
        offset = tags.get(36881, '')
        lat = lon = None
        if 2 in gps and 4 in gps:
            def deg(v): return float(v[0]) + float(v[1])/60 + float(v[2])/3600
            lat = deg(gps[2]) * (-1 if gps.get(1) == 'S' else 1)
            lon = deg(gps[4]) * (-1 if gps.get(3) == 'W' else 1)
        local = stamp
        if stamp and offset:
            local = datetime.strptime(stamp + offset, '%Y:%m:%d %H:%M:%S%z').astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
        im = srgb_image(raw)
        w, h = im.size
        im.thumbnail((330, 250))
        thumb = CACHE / 'thumbs' / (path.stem + '.jpg')
        im.save(thumb, quality=85)
        small = im.convert('L').resize((9, 8))
        px = list(small.getdata())
        dhash = sum((px[y*9+x] > px[y*9+x+1]) << (y*8+x) for y in range(8) for x in range(8))
        return {'file': path.name, 'id': path.stem.split('_')[-1], 'width': w, 'height': h,
                'date': local, 'originalDate': stamp, 'offset': offset, 'lat': lat, 'lon': lon,
                'camera': exif.get(272, ''), 'focal': float(tags.get(41989, 0)),
                'live': path.with_suffix('.MOV').exists(), 'hash': str(dhash)}

def main():
    files = sorted(p for p in (ROOT / '.temp').iterdir() if p.suffix.lower() in ['.heic', '.jpg', '.jpeg', '.png'])
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(process, files))
    (CACHE/'catalog.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
    font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 17)
    for page, start in enumerate(range(0, len(rows), 30), 1):
        sheet = Image.new('RGB', (1650, 1704), '#171717')
        draw = ImageDraw.Draw(sheet)
        for i, row in enumerate(rows[start:start+30]):
            x, y = (i%5)*330, (i//5)*284
            with Image.open(CACHE/'thumbs'/(Path(row['file']).stem+'.jpg')) as thumb:
                sheet.paste(thumb, (x+(330-thumb.width)//2, y+(250-thumb.height)//2))
            draw.text((x+8, y+254), f"{row['id']} | {row['date'][5:16]}", font=font, fill='white')
        sheet.save(CACHE/f'contact-{page:02d}.jpg', quality=90)
    print(json.dumps({'photos': len(rows), 'sheets': page, 'dates': sorted(set(r['date'][:10] for r in rows)), 'gps': sum(r['lat'] is not None for r in rows)}))

if __name__ == '__main__': main()
