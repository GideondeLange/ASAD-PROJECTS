// Source of truth for every pod on the site. Prices and specs come from the
// 2026 Living Pods brochure. Edit here, then run `npm run pages` to rebuild
// the pod pages, the pods index and the home page.

export const SPEC = [
  'LSF fully galvanised',
  'Aluminium doors & windows',
  'R3.2 insulation',
  'Engineer’s certificate & electrical COC',
  'Delivery & installation included within 100 km of Boksburg branch',
  'Coastal option: R1 600 per m² additional',
];

export const CATEGORIES = {
  homes:      { label: 'Family Homes',  blurb: 'Full-size living for families and guest houses.' },
  compact:    { label: 'Compact Pods',  blurb: 'Off-grid cabins, cottages and guest suites.' },
  backyard:   { label: 'Backyard',      blurb: 'Entertainment, office and storage pods.' },
  commercial: { label: 'Commercial',    blurb: 'Guard houses and coffee shops.' },
  specialty:  { label: 'Specialty',     blurb: 'Bespoke builds on custom sites.' },
};

const FULL = ['Bathroom', 'Kitchen', 'Plumbing', 'Full electrical'];

export const PODS = [
  {
    slug: '2-bedroom', name: '2 Bedroom Pod', category: 'homes', label: 'Family Homes · Option 1',
    size: 85, price: 980000, tags: FULL, spec: SPEC,
    summary: 'A full two-bedroom family home in steel and timber, with an open-plan kitchen and lounge.',
    alt: '2 Bedroom Pod exterior at golden hour',
  },
  {
    slug: '2-bedroom-living-unit', name: '2 Bedroom Living Unit', category: 'homes', label: 'Family Homes · Option 2',
    size: 75, price: 750000, tags: FULL, spec: SPEC,
    facts: ['75 m² building + 31.2 m² decking', '2 queen bedrooms · 1 bathroom · open plan'],
    summary: 'Two queen bedrooms, one bathroom and an open-plan living space with a generous deck.',
    alt: '2 Bedroom Living Unit render',
  },
  {
    slug: '3-bedroom', name: '3 Bedroom Pod', category: 'homes', label: 'Family Homes',
    size: 100, price: 1095000, tags: FULL, spec: SPEC,
    summary: 'Our largest family home: three bedrooms and room to grow.',
    alt: '3 Bedroom Pod exterior render',
  },
  {
    slug: '1-bedroom-living-unit', name: '1 Bedroom Living Unit', category: 'homes', label: 'Featured Unit',
    size: 40, price: 512000, tags: FULL, spec: SPEC,
    facts: ['40 m² building + 9.5 m² decking'],
    summary: 'A one-bedroom unit with a raised mono-pitch roof, timber slat detail and a deck.',
    alt: '1 Bedroom Living Unit render',
    note: 'Renders are for illustration purposes only. Actual designs are available on quotation.',
  },
  {
    slug: 'pod-1', name: 'Elevated Steel Off-Grid Pod', category: 'compact', label: 'Compact Pods · Pod 1',
    size: 17, price: 365000, tags: FULL, spec: SPEC,
    summary: 'A compact pod lifted off the ground on steel legs, made for off-grid sites.',
    alt: 'Elevated Steel Off-Grid Pod on a rocky site',
  },
  {
    slug: 'pod-2', name: 'Garden Cottage Living Unit', category: 'compact', label: 'Compact Pods · Pod 2',
    size: 25, price: 325000, tags: FULL, spec: SPEC,
    summary: 'A small cottage for the garden: guest room, studio or a first home.',
    alt: 'Garden Cottage Living Unit render',
  },
  {
    slug: 'pod-4', name: 'Off-Grid Cabin Pod', category: 'compact', label: 'Compact Pods · Pod 4',
    size: 24, price: 352000, tags: FULL, spec: SPEC,
    summary: 'A self-contained cabin for remote land, retreats and lodges.',
    alt: 'Off-Grid Cabin Pod render',
  },
  {
    slug: 'pod-5', name: 'A-Frame Cabin Pod', category: 'compact', label: 'Compact Pods · Pod 5',
    size: 17, price: 410000, tags: FULL, spec: SPEC,
    summary: 'The classic A-frame cabin, finished in warm timber with a glazed front.',
    alt: 'A-Frame Cabin Pod on a rocky hillside',
  },
  {
    slug: 'pod-6', name: 'Airbnb Guest Suite Pod', category: 'compact', label: 'Compact Pods · Pod 6',
    size: 24, price: 362000, tags: FULL, spec: SPEC,
    summary: 'A guest suite designed to earn: a strong investment pod for short stays.',
    alt: 'Airbnb Guest Suite Pod render',
  },
  {
    slug: 'entertainment-pod', name: 'Backyard Entertainment Pod', category: 'backyard', label: 'Backyard Range',
    size: 17, price: 275000, tags: ['Full electrical'],
    facts: ['Kitchenette units available · Custom sizes'],
    summary: 'A pod for the braai, the bar and the weekend.',
    alt: 'Backyard Entertainment Pod render',
  },
  {
    slug: 'office-storage-pod', name: 'Backyard Office / Storage Pod', category: 'backyard', label: 'Backyard Range',
    size: 4, price: 45000, tags: [],
    facts: ['Custom design and sizes available'],
    summary: 'A compact office or storage pod with glazed double doors and timber interior.',
    alt: 'Backyard Office pod with glazed double doors', gallery: ['office-storage-pod-2'],
  },
  {
    slug: 'guard-house', name: 'Guard House', category: 'commercial', label: 'Commercial Pods',
    size: 4, price: 52000, tags: ['Full electrical'],
    facts: ['Custom design and sizes available'],
    summary: 'A steel-clad guard house with glazing on every side.',
    alt: 'Guard House pod in steel cladding',
  },
  {
    slug: 'coffee-shop-pod', name: 'Coffee Shop Pod', category: 'commercial', label: 'Commercial Pods',
    size: 5, price: 75000, tags: ['Full electrical'],
    facts: ['Custom design and sizes available'],
    summary: 'A small-footprint coffee shop ready to trade.',
    alt: 'Coffee Shop Pod',
  },
  {
    slug: 'roof-top-pod', name: 'Roof Top Pod', category: 'specialty', label: 'Specialty Builds',
    size: 36, price: 504000, tags: FULL,
    facts: ['Custom design and sizes available'],
    summary: 'A pod built for a rooftop, with a concrete roof and a clear view.',
    alt: 'Roof Top Pod render',
  },
];

PODS.forEach((p, i) => {
  p.image = `/images/pods/${p.slug}.jpg`;
  p.hasPlan = ['2-bedroom', '2-bedroom-living-unit', '3-bedroom', 'pod-1', 'pod-2', '1-bedroom-living-unit', 'pod-4', 'pod-5', 'pod-6'].includes(p.slug);
  p.plan = p.hasPlan ? `/images/pods/${p.slug}-plan.png` : null;
  p.index = i;
});

export const ADDONS = [
  ['Decking', 'From R700/m²'],
  ['Pergola', 'From R900/m²'],
  ['5kW complete solar system (incl. installation)', 'R63 300'],
  ['10kW complete solar system (incl. installation)', 'R92 000'],
  ['Septic tank', 'R16 000'],
  ['Back-up 2 500L water system incl. pump', 'R15 300'],
  ['Hot tub', 'R35 000'],
  ['Combustion fireplace (incl. installation)', 'R19 200'],
  ['9 000 BTU aircon (incl. installation)', 'R13 000'],
];

export const INCLUDED = [
  'Steel structure, built to specification',
  'Bathroom: sanitary fixtures & fittings, top-flush toilet, floating vanity with top-mount basin, corner shower unit, PVC wall tiling',
  'Kitchenette: prep bowl and 2-burner gas stove (gas bottle not included), fixtures & fittings',
  'Full electrical, on pods marked as such',
  'Custom design and sizes available',
];

export const EXCLUDED = [
  'VAT (all prices are quoted excl VAT)',
  'Connection to mains',
  'COC certificates',
  'Plan approval from municipalities',
  'Transport',
  'Installation',
  'Optional add-ons',
];

export const fmtPrice = (n) => 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
