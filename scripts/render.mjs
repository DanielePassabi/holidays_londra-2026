import { days, videos } from '../src/journey.mjs';

export const escape = (text = '') => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function render(photos) {
  const lookup = new Map(photos.map(p => [p.id, p]));
  const groups = new Set(['0722','0740','0764','0807','0827','0851','0874','0876','0899','0911','0954']);
  const photo = (id, className = '', sizes = '(max-width: 700px) 95vw, 48vw') => {
    const p = lookup.get(id);
    if (!p) throw new Error(`Missing photo ${id}`);
    if(groups.has(id)) className += ' photo-group';
    return `<figure class="photo ${className}"><a class="photo-open" href="${p.sizes[2].file}" data-photo="${id}" aria-label="Ingrandisci: ${escape(p.alt)}"><img src="${p.sizes[1].file}" srcset="${p.sizes.map(s=>`${s.file} ${s.width}w`).join(', ')}" sizes="${sizes}" width="${p.width}" height="${p.height}" alt="${escape(p.alt)}" loading="lazy" decoding="async"><span class="photo-expand" aria-hidden="true">↗</span></a><figcaption><span>${escape(p.place)}</span><span class="photo-time">${p.date.slice(11,16)}</span></figcaption></figure>`;
  };
  function block(b) {
    if (b.type === 'night') return `<section class="night-section" aria-labelledby="night-title"><div class="night-inner"><div class="night-heading"><p class="eyebrow">06 NOV / DOPO IL TRAMONTO</p><h3 id="night-title">Quando Londra<br><em>si accende.</em></h3><p>${escape(b.aside)}</p><span class="night-star" aria-hidden="true">✳</span></div>${photo(b.photos[0], 'night-cover', '96vw')}<div class="photo-grid night-grid">${b.photos.slice(1).map(id=>photo(id)).join('')}</div><span class="night-end">BUONANOTTE, LONDRA <span aria-hidden="true">☾</span></span></div></section>`;
    const label = b.label ? `<div class="sequence-label"><span>${escape(b.label)}</span><span aria-hidden="true">↘</span></div>` : '';
    const note = b.aside ? `<p class="margin-note">${escape(b.aside).replaceAll('\n','<br>')}<span aria-hidden="true">↗</span></p>` : '';
    return `<div class="sequence sequence-${b.type}">${label}<div class="photo-grid grid-${b.type}">${b.photos.map((id,i)=>photo(id,`photo-${i+1}`, ['wide','closing'].includes(b.type) || (b.type==='feature' && i===0) ? '94vw' : undefined)).join('')}${note}</div></div>`;
  }
  const journal = days.map(day => `<section class="chapter" id="day-${day.id}" aria-labelledby="title-${day.id}" data-day="${day.id}"><header class="chapter-heading"><span class="chapter-number" aria-hidden="true">${day.number}</span><div><p class="eyebrow">${day.weekday} / ${day.id} novembre 2026</p><h2 id="title-${day.id}">${day.title}</h2><p class="chapter-note">${day.note}</p></div><p class="chapter-route">${day.route.split(' → ').map(escape).join('<span aria-hidden="true">↓</span>')}</p></header>${day.blocks.map(block).join('')}${videos.filter(v=>v.day===day.id).map(v=>`<div class="video-slot"><button class="video-load" data-video="${escape(v.id)}"><span aria-hidden="true">▷</span> Guarda: ${escape(v.title)}</button></div>`).join('')}<a class="chapter-next" href="${day.id==='09' ? '#top' : '#day-'+days[days.indexOf(day)+1].id}">${day.id==='09' ? 'Ricomincia il viaggio ↑' : 'Il giorno dopo ↓'}</a></section>`).join('');
  const nav = days.map(day=>`<a href="#day-${day.id}" data-nav="${day.id}"><span class="stop" aria-hidden="true"></span><span class="nav-date">${day.id} NOV</span><span class="nav-label">${day.label}</span></a>`).join('');
  const archive = photos.map(p=>`<button class="contact-photo" data-photo="${p.id}" data-day="${p.day}" aria-label="Ingrandisci: ${escape(p.alt)}"><img src="${p.sizes[0].file}" width="${p.width}" height="${p.height}" loading="lazy" alt="${escape(p.alt)}"><span><span>${escape(p.place)}</span><span>${p.day}.11</span></span></button>`).join('');
  const filters = `<button type="button" data-filter="all" aria-pressed="true">Tutte <span>${photos.length}</span></button>` + days.map(d=>`<button type="button" data-filter="${d.id}" aria-pressed="false">${d.id} nov <span>${photos.filter(p=>p.day===d.id).length}</span></button>`).join('');
  return {journal, nav, archive, filters, count: photos.length, photoData: JSON.stringify(photos).replaceAll('<','\\u003c')};
}
