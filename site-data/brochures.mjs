// ONE LINE PER BROCHURE. This list builds the /brochures page.
//
// To ADD a brochure:    1) put the PDF in public/brochures/ with a permanent name,
//                       2) add one object below. That is all.
// To REMOVE a brochure: delete its line.
// To REPLACE a brochure: overwrite the PDF in public/brochures/ with the SAME file name.
//                       Do not rename it, and the link people already have keeps working.
//
// file:    the PDF name inside public/brochures/  (public link: https://asad.co.za/brochures/<file>)
// page:    the related service/pod page (leave '' if none)
// image:   a photo already on the site, shown on the card
export const BROCHURES = [
  { title: 'ASAD Living Pods Brochure', file: 'asad-living-pods-brochure.pdf', page: '/asad-pods', pageLabel: 'See all pods', image: '/images/pods/2-bedroom-v4.jpg', w: 1080, h: 1350, alt: 'ASAD steel living pod with a timber deck in a forest setting', desc: 'Our full range of steel-framed living pods, with sizes, finishes and optional extras, in one document you can save or forward.' },
  { title: '1 Bedroom Living Unit Brochure', file: 'asad-1-bedroom-living-unit-brochure.pdf', page: '/asad-pods/1-bedroom-living-unit', pageLabel: 'View the 1 Bedroom Living Unit', image: '/images/pods/1-bedroom-living-unit.jpg', w: 941, h: 941, alt: 'Render of the ASAD 1 Bedroom Living Unit', desc: 'The compact 40 m² one bedroom unit: floor plan, finishes, optional extras and what is included.' },
  { title: '2 Bedroom Living Unit Brochure (75 m²)', file: 'asad-2-bedroom-living-unit-75sqm-brochure.pdf', page: '/asad-pods/2-bedroom-living-unit', pageLabel: 'View the 2 Bedroom Living Unit', image: '/images/pods/2-bedroom-living-unit.jpg', w: 941, h: 941, alt: 'Render of the ASAD 2 Bedroom Living Unit', desc: 'The 75 m² two bedroom living unit: layout, finishes, optional extras and what is included.' },
  { title: '3 Bedroom Living Unit Brochure', file: 'asad-3-bedroom-living-unit-brochure.pdf', page: '/asad-pods/3-bedroom', pageLabel: 'View the 3 Bedroom Pod', image: '/images/pods/3-bedroom.jpg', w: 732, h: 666, alt: 'Render of the ASAD 3 Bedroom Living Unit with charcoal cladding and a timber deck', desc: 'The 100 m² three bedroom family home in light steel frame: floor plan, renders, optional carport and add-ons.' },
  { title: '3 Bedroom Pitched House Brochure', file: 'asad-3-bedroom-pitched-house-brochure.pdf', page: '/asad-pods/3-bedroom-pitched-house', pageLabel: 'View the 3 Bedroom Pitched House', image: '/images/pods/3-bedroom-pitched-house.jpg', w: 1600, h: 900, alt: 'Render of the ASAD 3 Bedroom Pitched House with a pitched metal roof and covered deck', desc: 'Our largest family home under one pitched roof, with a covered deck: floor plan, renders and specification.' },
]
