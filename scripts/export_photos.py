"""Export only the curated stills. No MOV, original EXIF or GPS is published."""
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from catalog_photos import ROOT, srgb_image

OUT = ROOT / 'public' / 'photos'
OUT.mkdir(parents=True, exist_ok=True)
catalog = {r['id']: r for r in json.loads((ROOT/'.cache/catalog.json').read_text(encoding='utf-8'))}
selection = json.loads((ROOT/'content/selection.json').read_text(encoding='utf-8'))

def export(row):
    key, day, place, alt = row
    info = catalog[key]
    with Image.open(ROOT/'.temp'/info['file']) as raw:
        im = srgb_image(raw)
        sizes = []
        for size in [480, 960, 1920]:
            target = OUT/f'{key}-{size}.webp'
            resized = im.copy()
            resized.thumbnail((size, size), Image.Resampling.LANCZOS)
            resized.save(target, 'WEBP', quality=80 if size < 1920 else 84, method=5, exif=b'')
            sizes.append({'file': f'photos/{target.name}', 'width': resized.width, 'height': resized.height})
        if key == '0755':
            preview = im.copy()
            preview.thumbnail((1200, 1200))
            preview.save(ROOT/'public/social.jpg', quality=85, exif=b'')
    stamp = info['date']
    source = 'exif'
    if not stamp or ':' in stamp[:10]:
        # Filename is the only available timestamp for exports lacking original EXIF.
        parts = info['file'].split('_')
        stamp = '-'.join(parts[:3]) + 'T' + ':'.join(parts[3:6])
        source = 'filename'
    return {'id': key, 'day': day, 'place': place, 'alt': alt,
            'date': stamp, 'timeSource': source, 'camera': info['camera'],
            'focal': info['focal'], 'width': info['width'], 'height': info['height'], 'sizes': sizes}

with ThreadPoolExecutor(max_workers=3) as pool:
    photos = list(pool.map(export, selection))
(ROOT/'public/photos.json').write_text(json.dumps(photos, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f'{len(photos)} curated photos; {sum(p.stat().st_size for p in OUT.iterdir())/1024/1024:.1f} MB across all responsive sizes.')
