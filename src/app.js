'use strict';

const photos = JSON.parse(document.querySelector('#photo-data').textContent);
const lookup = new Map(photos.map(photo => [photo.id, photo]));
const lightbox = document.querySelector('#lightbox');
const archive = document.querySelector('#archive');
const image = document.querySelector('.lightbox-image');
const error = document.querySelector('.image-error');
const details = document.querySelector('#photo-details');
const detailsToggle = document.querySelector('.photo-details-toggle');
const counter = document.querySelector('.lightbox-counter');
let activePhotos = photos;
let currentIndex = 0;
let filter = 'all';
let pointerStart = null;

document.documentElement.classList.add('has-js');

function syncScrollLock() {
  document.body.classList.toggle('modal-open', lightbox.open || archive.open);
}

function renderPhoto() {
  const photo = activePhotos[currentIndex];
  if (!photo) return;
  error.hidden = true;
  image.alt = photo.alt;
  image.src = photo.sizes[2].file;
  document.querySelector('#lightbox-title').textContent = photo.place;
  const date = new Date(photo.date + 'Z');
  const day = new Intl.DateTimeFormat('it-IT', {day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'}).format(date);
  document.querySelector('.lightbox-date').textContent = `${day} · ${photo.date.slice(11,16)}${photo.timeSource === 'exif' ? ' GMT' : ' (export)'}`;
  counter.textContent = `${String(currentIndex+1).padStart(2,'0')} / ${activePhotos.length}`;
  details.textContent = [photo.camera, photo.focal ? `${photo.focal} mm equivalenti` : '', `${photo.width} × ${photo.height} px originali`, photo.timeSource === 'exif' ? 'Orario dai metadati · ora di Londra' : 'Orario dal nome del file esportato'].filter(Boolean).join(' · ');
  document.querySelectorAll('.prev-photo, .next-photo').forEach(button=>button.disabled=activePhotos.length<2);
  if (!navigator.connection?.saveData && activePhotos.length > 1) {
    const next = activePhotos[(currentIndex+1)%activePhotos.length];
    const preload = new Image();
    preload.src = next.sizes[2].file;
  }
}

function openPhoto(id, fromArchive = false) {
  activePhotos = fromArchive && filter !== 'all' ? photos.filter(p=>p.day===filter) : photos;
  currentIndex = activePhotos.findIndex(photo=>photo.id===id);
  if(currentIndex<0) return;
  renderPhoto();
  if(!lightbox.open) lightbox.showModal();
  syncScrollLock();
}

function changePhoto(direction) {
  currentIndex = (currentIndex+direction+activePhotos.length)%activePhotos.length;
  renderPhoto();
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-photo]');
  if(!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if(!lookup.has(target.dataset.photo)) return;
  event.preventDefault();
  openPhoto(target.dataset.photo, Boolean(target.closest('#archive')));
});

document.querySelectorAll('.archive-trigger').forEach(button => button.addEventListener('click',()=>{
  archive.showModal();
  syncScrollLock();
}));
document.querySelector('.close-archive').addEventListener('click',()=>archive.close());
document.querySelector('.close-lightbox').addEventListener('click',()=>lightbox.close());
archive.addEventListener('close',syncScrollLock);
lightbox.addEventListener('close',()=>{
  syncScrollLock();
  details.hidden=true;
  detailsToggle.setAttribute('aria-expanded','false');
  detailsToggle.querySelector('span').textContent='+';
});
document.querySelector('.prev-photo').addEventListener('click',()=>changePhoto(-1));
document.querySelector('.next-photo').addEventListener('click',()=>changePhoto(1));
lightbox.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft' || event.key==='ArrowRight') {
    event.preventDefault();
    changePhoto(event.key==='ArrowRight'?1:-1);
  }
  if(event.key==='Home' || event.key==='End') {
    event.preventDefault();
    currentIndex=event.key==='Home'?0:activePhotos.length-1;
    renderPhoto();
  }
});
image.addEventListener('error',()=>{error.hidden=false;});
image.addEventListener('load',()=>{error.hidden=true;});
document.querySelector('.retry-photo').addEventListener('click',()=>{error.hidden=true;image.src=activePhotos[currentIndex].sizes[2].file;});
image.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};});
image.addEventListener('pointerup',event=>{
  if(!pointerStart || pointerStart.id!==event.pointerId)return;
  const dx=event.clientX-pointerStart.x;
  const dy=event.clientY-pointerStart.y;
  pointerStart=null;
  if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.5)changePhoto(dx<0?1:-1);
});
image.addEventListener('pointercancel',()=>{pointerStart=null;});
detailsToggle.addEventListener('click',()=>{
  details.hidden=!details.hidden;
  detailsToggle.setAttribute('aria-expanded',String(!details.hidden));
  detailsToggle.querySelector('span').textContent=details.hidden?'+':'−';
});
document.querySelector('.random-photo').addEventListener('click',()=>{
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  openPhoto(photos[random%photos.length].id);
});

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let count=0;
  document.querySelectorAll('.contact-photo').forEach(photo=>{
    photo.hidden=filter!=='all' && photo.dataset.day!==filter;
    if(!photo.hidden)count++;
  });
  document.querySelector('#archive-count').textContent=`${count} ${count===1?'fotografia':'fotografie'}`;
  archive.scrollTop=0;
}));

const chapters = [...document.querySelectorAll('.chapter')];
const navLinks = [...document.querySelectorAll('[data-nav]')];
const progress = document.querySelector('.reading-progress');
let scheduled=false;
function updateReadingPosition() {
  scheduled=false;
  const at=window.scrollY+150;
  let active=null;
  for(const chapter of chapters)if(chapter.offsetTop<=at)active=chapter.dataset.day;
  for(const link of navLinks){
    if(link.dataset.nav===active)link.setAttribute('aria-current','true');
    else link.removeAttribute('aria-current');
  }
  const scrollable=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.transform=`scaleX(${Math.min(1,Math.max(0,window.scrollY/Math.max(1,scrollable)))})`;
}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateReadingPosition);}},{passive:true});
window.addEventListener('resize',updateReadingPosition,{passive:true});
window.addEventListener('load',updateReadingPosition);
updateReadingPosition();

// No external video requests are sent until a visitor explicitly presses play.
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.video;
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  const iframe=document.createElement('iframe');
  iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  iframe.title=button.textContent.trim();
  iframe.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  button.replaceWith(iframe);
}));
