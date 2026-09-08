/**
 * Pricing — the single source of truth for every package, rate, and add-on
 * shown on the site. Change a number here and it changes everywhere.
 */

export interface Package {
  id: string;
  label: string;
  title: string;
  price: string;
  summary: string;
  /** 5-6 headline inclusions shown by default on the card. */
  visible: string[];
  /** Detail revealed by "View Full Inclusions". */
  full: string[];
}

export const onLocation: Package[] = [
  {
    id: 'loc-single',
    label: 'Single Production',
    title: 'On-Location Single Video',
    price: '$525',
    summary: 'A focused shoot built around one polished vertical video.',
    visible: [
      '1 vertical video',
      '20 to 60 seconds',
      'Creative planning',
      'On-location production',
      'Professional edit + color',
      '1 revision',
    ],
    full: [
      'Pre-production planning and shot direction',
      'Cinematic property, venue, product, or experience footage',
      'Lifestyle footage when applicable',
      'Sound design, on-screen text, and subtitles when appropriate',
      '2 opening-hook options',
      '12 months of organic usage on the brand’s owned social-media channels',
      'Starting price; final scope depends on location, travel, and production requirements',
    ],
  },
  {
    id: 'loc-campaign',
    label: 'Campaign',
    title: 'On-Location Campaign Package',
    price: '$1,150',
    summary: 'A multi-video content package built for a larger campaign or experience.',
    visible: [
      'Multiple vertical videos',
      'Creative planning',
      'On-location production',
      'Professional editing',
      'Campaign-ready delivery',
      'Revisions included',
    ],
    full: [
      '3 professionally produced vertical videos, 20 to 60 seconds each',
      '3 custom concepts or campaign angles',
      'Multiple scenes throughout the property, venue, business, or experience',
      'Professional 4K footage',
      'Cinematic location, product, and lifestyle B-roll',
      '1 tailored hook and call to action per video',
      '1 revision per video',
      'Selected organized B-roll clips',
      '12 months of organic usage on the brand’s owned social-media channels',
    ],
  },
  {
    id: 'loc-day',
    label: 'Full Production',
    title: 'Full Video Production Day',
    price: '$1,750',
    summary: 'A dedicated production day designed to capture a larger library of campaign assets.',
    visible: [
      'Full production session',
      'Multiple content concepts',
      'Expanded asset capture',
      'Professional editing',
      'Campaign-ready delivery',
      'Priority production scope',
    ],
    full: [
      '5 professionally produced vertical videos, 20 to 60 seconds each',
      '5 custom concepts or campaign angles',
      'Comprehensive coverage of the property, venue, product, business, or experience',
      'Professional 4K footage',
      'Cinematic location, product, and lifestyle B-roll',
      'Multiple scenes and storytelling angles',
      '2 hook variations for selected videos',
      '1 revision per video',
      'Organized raw-footage library',
      'Priority production scheduling',
      '12 months of organic usage on the brand’s owned social-media channels',
    ],
  },
];

export const ugcProduct: Package[] = [
  {
    id: 'ugc-single',
    label: 'Single Video',
    title: 'Single Brand Video',
    price: '$400',
    summary: 'One polished short-form video built around your product, service, or platform.',
    visible: [
      '1 vertical video',
      'Creative concept',
      'Script or talking points',
      'Professional production',
      'Editing + captions',
      '1 revision',
    ],
    full: [
      'Choice of product demonstration, testimonial, review, tutorial, unboxing, app walkthrough, problem-solution, or lifestyle format',
      'Talking-head, voiceover, screen-recording, or hands-only filming',
      'Product and lifestyle B-roll when applicable',
      'On-screen text and subtitles',
      '12 months of organic usage on the brand’s owned social-media channels',
    ],
  },
  {
    id: 'ugc-bundle',
    label: 'Content Bundle',
    title: 'Three-Video Content Bundle',
    price: '$1,050',
    summary: 'Three distinct videos built for testing, organic content, or campaign variation.',
    visible: [
      '3 vertical videos',
      'Multiple creative angles',
      'Concept development',
      'Professional production',
      'Editing + captions',
      'Revisions included',
    ],
    full: [
      '3 different concepts or creative angles',
      'Multiple content formats available',
      '1 tailored hook and call to action per video',
      'Product and lifestyle B-roll when applicable',
      '1 revision per video',
      '12 months of organic usage on the brand’s owned social-media channels',
    ],
  },
  {
    id: 'ugc-suite',
    label: 'Campaign Suite',
    title: 'Five-Video Campaign Suite',
    price: '$1,650',
    summary: 'A larger short-form package built for ongoing campaigns and creative testing.',
    visible: [
      '5 vertical videos',
      'Multiple concepts',
      'Creative planning',
      'Professional production',
      'Editing + captions',
      'Campaign-ready delivery',
    ],
    full: [
      'Multiple demonstrations, testimonials, reviews, tutorials, app walkthroughs, and lifestyle angles',
      '1 tailored hook and call to action per video',
      'Additional ad-ready cutdowns',
      'Campaign strategy and creative planning',
      'Priority turnaround',
      '2 revisions per video',
      '12 months of organic usage on the brand’s owned social-media channels',
    ],
  },
];

/** Commercial terms — named only, priced on scope (progressive disclosure). */
export const usageAddOns = [
  'Paid Usage',
  'Whitelisting',
  'Raw Footage',
  'Secondary Editing Rights',
  'Exclusivity',
  'Rush Turnaround',
] as const;

export const usageNote =
  'Final pricing depends on scope, usage period, campaign needs, and deliverables.';

/** Drone + photography options. */
export const droneOptions = [
  'Drone video',
  'Aerial photography',
  'Property photography',
  'Lifestyle photography',
  'Product photography',
  'Raw asset delivery',
] as const;

/** Creator posting rates, shown inside the Social Campaigns add-on. */
export const postingRates = [
  { label: 'TikTok Post', price: '$450' },
  { label: 'Instagram Reel', price: '$350' },
  { label: 'TikTok + Instagram', price: '$700' },
] as const;

/** Monthly retainers, demoted into pricing rather than a standalone section. */
export const monthly = {
  label: 'Ongoing Content',
  title: 'Need content every month?',
  copy: 'Custom monthly production is available for brands that need consistent short-form creative or recurring on-location content.',
  detail: [
    'Agreed monthly deliverables and production schedule',
    'Recurring concept development and creative planning',
    'Consistent production and editing style across campaigns',
    'Priority scheduling and reliable turnaround',
    'Structured around Brand Product Video Production, On-Location Media Production, or a combination of both',
    'Retainers begin with a three-month commitment and are scoped to deliverable volume, locations, and usage requirements',
  ],
} as const;

/** Inquiry form dropdown options. */
export const serviceOptions = [
  'On-Location Content',
  'UGC + Product Content',
  'On-Location + UGC',
  'Not Sure Yet',
] as const;

export const budgetOptions = [
  'Under $500',
  '$500 to $1,000',
  '$1,000 to $2,500',
  '$2,500 to $5,000',
  '$5,000+',
  'Not Sure Yet',
] as const;
