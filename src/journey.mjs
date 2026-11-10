export const days = [
  {
    id: '05', number: '01', weekday: 'Giovedì', label: 'L’arrivo', title: 'Si parte. Di notte.',
    route: 'Stansted → Saffron Walden', note: 'Le prime luci, dall’altra parte del finestrino.',
    blocks: [
      { type: 'arrival', photos: ['0695', '0697', '0700', '0702'] },
    ],
  },
  {
    id: '06', number: '02', weekday: 'Venerdì', label: 'Londra', title: 'Finalmente, Londra.',
    route: 'Saffron Walden → City → Westminster', note: 'A piedi, fino a quando si accendono le luci.',
    blocks: [
      { type: 'four', photos: ['0707', '0713', '0719', '0722'], label: 'Prima, un caffè.' },
      { type: 'duo', photos: ['0728', '0731'], label: 'Dentro la città' },
      { type: 'duo', photos: ['0737', '0740'] },
      { type: 'feature', photos: ['0755', '0752'], label: 'Sulle due rive', aside: 'Il Tamigi. Il ponte.\nCi siamo davvero.' },
      { type: 'four', photos: ['0757', '0758', '0761', '0764'], label: 'Una pausa, al pub.' },
      { type: 'four', photos: ['0772', '0775', '0777', '0778'], label: 'La città cambia luce' },
      { type: 'night', photos: ['0797', '0786', '0789', '0795', '0800', '0807', '0813', '0815'], label: 'Quando Londra si accende.', aside: 'Dalle 17:00, un’altra città.' },
    ],
  },
  {
    id: '07', number: '03', weekday: 'Sabato', label: 'L’autunno', title: 'Tutti i colori di novembre.',
    route: 'Buckingham Palace → Regent’s Park → British Museum', note: 'Un po’ di sole. Un sacco di foglie. Nessuna fretta.',
    blocks: [
      { type: 'breakfast', photos: ['0825', '0827', '0830'], label: 'Il rito della colazione' },
      { type: 'wide', photos: ['0833'] },
      { type: 'three', photos: ['0837', '0842', '0851'], label: 'Saluti da Buckingham Palace' },
      { type: 'feature', photos: ['0853', '0857'], aside: 'Novembre sa\ncome farsi guardare.' },
      { type: 'three', photos: ['0860', '0864', '0867'] },
      { type: 'wide', photos: ['0870'], label: 'Una parentesi verde' },
      { type: 'three', photos: ['0874', '0876', '0881'] },
      { type: 'three', photos: ['0885', '0887', '0892'], label: 'Ultima fermata: British Museum' },
    ],
  },
  {
    id: '08', number: '04', weekday: 'Domenica', label: 'Cambridge', title: 'Fuori città, un’altra storia.',
    route: 'Hinxton → Cambridge', note: 'Alberi giganti, college e un’ultima pinta insieme.',
    blocks: [
      { type: 'breakfast', photos: ['0896', '0897', '0899'], label: 'La domenica comincia piano' },
      { type: 'feature', photos: ['0903', '0920'], label: 'Una deviazione nel verde', aside: 'A volte basta\nun albero enorme.' },
      { type: 'duo', photos: ['0911', '0923'] },
      { type: 'three', photos: ['0924', '0926', '0936'], label: 'Cambridge, nel pomeriggio' },
      { type: 'duo', photos: ['0933', '0939'] },
      { type: 'three', photos: ['0945', '0950', '0954'], label: 'L’ultima sera' },
    ],
  },
  {
    id: '09', number: '05', weekday: 'Lunedì', label: 'Il ritorno', title: 'Sopra le nuvole.',
    route: 'Verso casa', note: 'In valigia, un po’ di novembre inglese.',
    blocks: [{ type: 'closing', photos: ['0959'] }],
  },
];

// Future YouTube embeds: add only selected links here. An empty list renders nothing.
// Example: { day: '06', id: 'abcdefghijk', title: 'Una sera sul Tamigi' }
export const videos = [];
