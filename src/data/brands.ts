/**
 * Brands shown in the homepage marquee.
 *
 * `logo` is an optional path to an image in /public/images/brands/. When a
 * brand has no logo file, the marquee falls back to a styled wordmark so the
 * row stays visually consistent. Drop a file in and add the path here to
 * upgrade any entry to a real logo without touching the component.
 */

export interface Brand {
  name: string;
  logo?: string;
}

export const brands: Brand[] = [
  { name: 'Just Dance' },
  { name: 'Sennheiser' },
  { name: 'NASA' },
  { name: 'Clio Snacks' },
  { name: 'Ayzenberg' },
  { name: 'ScholarTrip' },
  { name: 'Snapworthy' },
  { name: 'Earn Jar' },
  { name: 'Ultra AI' },
  { name: 'Vitals' },
  { name: 'SlyNumber' },
  { name: 'Zivic' },
  { name: 'Narcisa' },
  { name: 'IllPill' },
  { name: 'Resilia' },
  { name: 'Ruby Kay Consulting' },
  { name: 'Etzava' },
  { name: 'Defera' },
  { name: 'GloBLINKER' },
  { name: 'SCIRCLE' },
];
