// Gallery sections. `file` is a name in public/images/chosen (a web-sized copy is
// made in public/images/web) unless it starts with "/", which is used as-is.

export const GALLERY_CATS = [
  ['pods', 'Pods'],
  ['exterior', 'Exterior'],
  ['interior', 'Interior'],
  ['decking', 'Decking & Pergolas'],
  ['steelwork', 'Steelwork'],
  ['glazing', 'Glazing'],
  ['carpentry', 'Carpentry & Kitchens'],
  ['construction', 'Construction'],
];

const range = (prefix, nums) => nums.map((n) => `${prefix}${n}`);

export const GALLERY = [
  // Pods: real photos only. The brochure's AI renders stay out of the gallery;
  // pod-5 and office-storage-pod are the only brochure images that are real photos.
  ...['pod-5', 'office-storage-pod'].map((s) => ({ file: `/images/pods/${s}.jpg`, cat: 'pods', alt: 'ASAD pod' })),
  ...range('asad-pod', [1, 2, 3, 4, 5, 10, 13, 14, 17, 25]).map((f) => ({ file: f, cat: 'pods', alt: 'ASAD pod' })),

  ...range('asad-pod', [12, 21, 22]).map((f) => ({ file: f, cat: 'exterior', alt: 'ASAD pod exterior' })),
  ...range('asad-pod', [6, 7, 8, 9, 11, 15, 16, 18, 19]).map((f) => ({ file: f, cat: 'interior', alt: 'ASAD pod interior' })),

  ...range('services-pergola', [1, 2, 3, 4, 5, 6, 7, 8, 9]).map((f) => ({ file: f, cat: 'decking', alt: 'Decking and pergola' })),
  ...range('services-steel', [1, 2, 3, 4, 5, 6, 7]).map((f) => ({ file: f, cat: 'steelwork', alt: 'Bespoke steelwork' })),
  ...range('services-glazed', [1, 2, 3, 4, 6, 7, 10, 11, 12]).map((f) => ({ file: f, cat: 'glazing', alt: 'Custom glazed steelwork' })),
  ...range('services-carpentry', [3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14]).map((f) => ({ file: f, cat: 'carpentry', alt: 'Carpentry and kitchens' })),
  ...[...range('asad-pod', [20, 23, 24]), ...range('services-const', [1, 2, 3, 4, 5, 7, 8, 9])].map((f) => ({ file: f, cat: 'construction', alt: 'Construction and renovation' })),
];
