// VIDEO LISTS for /video. The page builds its two shelves from this file.
// To add a video: put <file>.mp4 and <file>.jpg (poster) in assets/video, then add ONE line below.
//   file   name of the two files in assets/video, without the extension
//   name   the title shown under the clip
//   shape  'v' for 9:16 (vertical), 'h' for 16:9 (wide)
//   tag    optional small label. Use 'Paraugs' for an example made without a client order,
//          and leave the business name out of `name` until that business agrees.
//   sound  true only when the file carries audio we are allowed to publish
//   alt    one sentence that says what is in the clip (for screen readers)
window.VD_REELS = {
  // Shelf 1: Reklāmas
  ads: [
    { file: 'casanorte',      name: 'CASANORTE',        shape: 'v', sound: true, alt: 'CASANORTE reklāma: ar rokām darināti zābaki uz skatuves un vitrīnā' },
    { file: 'car-swap',       name: 'MMK riepu centrs', shape: 'h', alt: 'Tas pats kadrs pie MMK riepu centra, cita automašīna' },
    { file: 'ad-bottle',      name: 'Produkts gaismā',  shape: 'h', alt: 'Stikla pudele lēni griežas studijas gaismā' },
    { file: 'chimney-system', name: 'JAWAR · sistēma',  shape: 'v', alt: 'Skursteņa čaulas sistēma izjauktā skatā ar detaļu nosaukumiem' },
    { file: 'chimney-specs',  name: 'JAWAR · fakti',    shape: 'v', alt: 'Produkta fakti kustīgos uzrakstos pie skursteņa T-gabala' },
    { file: 'ad-suv',         name: 'Auto naktī',       shape: 'h', alt: 'Apvidus auto naktī iebrauc kadrā pa slapju ielu' },
  ],
  // Shelf 2: Montāža
  edits: [
    { file: 'restart',     name: 'RESTART',      shape: 'v', tag: 'Pašu projekts', alt: 'Rīta rutīna īsā video: ūdens, kafija, piezīmes, skrējiens' },
    { file: 'mmk-drift',   name: 'MMK · drifts', shape: 'h', alt: 'Zils sporta auto driftē naktī pie MMK riepu centra' },
    { file: 'les-twins',   name: 'Deju batls',   shape: 'v', tag: 'Pilnekrāna 9:16', alt: 'Dejotājs deju batlā skatītāju lokā, kadrs seko dejotājam' },
    { file: 'show-dancer', name: 'Deju šovs',    shape: 'v', tag: 'Paraugs', alt: 'Dejotāja mirdzošā tērpā uz skatuves sarkanā gaismā' },
  ],
};
