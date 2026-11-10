import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { days, videos } from '../src/journey.mjs';
import { render } from '../scripts/render.mjs';

const photos=JSON.parse(await readFile(new URL('../public/photos.json',import.meta.url),'utf8'));

test('Every selected photo is in exactly one chapter, on the correct date',()=>{
  const references=days.flatMap(day=>day.blocks.flatMap(block=>block.photos.map(id=>({id,day:day.id}))));
  assert.equal(new Set(references.map(p=>p.id)).size,references.length);
  assert.equal(references.length,photos.length);
  for(const reference of references){
    const photo=photos.find(p=>p.id===reference.id);
    assert.ok(photo,`Unknown image ${reference.id}`);
    assert.equal(photo.day,reference.day);
    assert.equal(photo.date.slice(8,10),reference.day);
    assert.ok(photo.alt && photo.place);
  }
});

test('All responsive still images exist, use relative paths and contain no raw GPS',async()=>{
  for(const photo of photos){
    assert.equal('lat' in photo || 'lon' in photo,false);
    assert.equal(photo.sizes.length,3);
    assert.ok(photo.sizes[2].width>photo.sizes[0].width);
    for(const asset of photo.sizes){
      assert.match(asset.file,/^photos\/\d{4}-(480|960|1920)\.webp$/);
      await access(new URL(`../public/${asset.file}`,import.meta.url));
    }
  }
});

test('Built diary works below a GitHub Pages subpath and has a no-JavaScript image fallback',()=>{
  const html=render(photos);
  assert.equal((html.journal.match(/class="chapter"/g)||[]).length,5);
  assert.equal((html.archive.match(/class="contact-photo"/g)||[]).length,photos.length);
  assert.equal((html.journal.match(/class="photo-open" href="photos\//g)||[]).length,photos.length);
  assert.doesNotMatch(html.journal,/(?:src|href)="\/(?!\/)/);
  assert.doesNotMatch(html.journal,/\.MOV|\.HEIC|\.temp\//i);
  for(const day of days)assert.ok(html.nav.includes(`#day-${day.id}`));
});

test('No empty video placeholders; future clips use valid IDs and existing days',()=>{
  for(const video of videos){
    assert.match(video.id,/^[A-Za-z0-9_-]{11}$/);
    assert.ok(days.some(d=>d.id===video.day));
    assert.ok(video.title);
  }
  if(!videos.length)assert.doesNotMatch(render(photos).journal,/video-slot|iframe/);
});
