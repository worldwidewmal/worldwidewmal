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
      '3 vertical videos',
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
      '5 vertical videos',
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

/**
 * A single priced row inside an add-on accordion.
 *
 * `price: null` means the rate has not been set yet. The row still renders so
 * the layout is final, but the price column shows a "Rate on request" slot
 * rather than a number. Nothing here is ever invented — every figure below is
 * carried over from the existing published rate card.
 */
export interface AddOnRow {
  label: string;
  /** Optional qualifier shown under the label. */
  note?: string;
  price: string | null;
}

export interface AddOnGroup {
  id: string;
  title: string;
  /** Parenthetical scope shown beside the title. */
  scope?: string;
  rows: AddOnRow[];
  /** Explanatory copy shown under the rows when expanded. */
  footnote?: string;
}

export const productionAddOns: AddOnGroup = {
  id: 'production',
  title: 'Production Add-Ons',
  rows: [
    {
      label: 'Edited short-form cutdown',
      note: '15 to 30 second alternate edit created from footage captured for the project',
      price: '$125',
    },
    { label: 'Additional hook variation', price: '$75' },
    {
      label: 'Raw footage access',
      note: 'Per video, on packages that do not already include it',
      price: '$125',
    },
    { label: 'Additional video added to an existing production package', price: '$325' },
    { label: 'Secondary editing rights', note: 'Per video', price: '$150' },
    // Drone and photography are production add-ons, not a service category of
    // their own. No rate exists for either in the current rate card, so the
    // slot is held open rather than filled with a guess.
    { label: 'Drone footage', note: 'When legally permitted and operationally appropriate', price: null },
    { label: 'Photography', note: 'Property, product, or lifestyle stills', price: null },
  ],
  footnote:
    'Secondary editing rights allow the brand to create alternate edits, cutdowns, crops, hook and call-to-action variations, and derivative versions from the delivered content. They do not extend the original usage term and do not include raw footage unless raw footage is purchased separately.',
};

/** Usage and licensing terms — one collapsible row each. */
export const licensingAddOns: AddOnGroup[] = [
  {
    id: 'paid-ad-usage',
    title: 'Paid Ad Usage',
    scope: 'Run as paid ads, per video',
    rows: [
      { label: '30 days', price: '$175' },
      { label: '3 months', price: '$300' },
      { label: '6 months', price: '$450' },
      { label: '12 months', price: '$650' },
      { label: 'Perpetual paid-social buyout', price: 'Starting at $1,000' },
    ],
    footnote:
      'Paid Ad Usage covers advertising from the brand’s own advertising accounts on agreed social platforms. It does not include advertising through the creator’s handle, broadcast, print, out-of-home media, unrestricted all-media ownership, or raw footage.',
  },
  {
    id: 'whitelisting',
    title: 'Whitelisting / Spark Ads',
    scope: 'Ads through my handle, per video, per platform',
    rows: [
      { label: '30 days', price: '$200' },
      { label: '60 days', price: '$350' },
      { label: '90 days', price: '$450' },
      { label: '6 months', price: '$700' },
    ],
    footnote:
      'Whitelisting, Spark Ads, and partnership ads allow approved advertising to run through the creator’s social identity or handle. These rights are separate from standard paid usage through the brand’s own account.',
  },
  {
    id: 'exclusivity',
    title: 'Brand Exclusivity',
    scope: '% of package, no direct competitors',
    rows: [
      { label: '30 days', price: '25%' },
      { label: '60 days', price: '40%' },
      { label: '90 days', price: '60%' },
      { label: '6 months', price: '90%' },
      { label: '12 months', price: '150%' },
    ],
  },
  {
    id: 'business-licensing',
    title: 'Business Licensing',
    scope: 'Commercial use beyond paid social',
    rows: [
      {
        label: 'Website, email, in-store, sales decks, and other non-social owned channels',
        price: '$250',
      },
      {
        label:
          'Full commercial all-media buyout — broadcast, print, out-of-home advertising, and other agreed commercial media',
        price: 'Starting at $1,000',
      },
    ],
  },
  {
    id: 'rush',
    title: 'Rush Turnaround',
    scope: '% of project',
    rows: [
      { label: '48 to 72 hours', price: '20%' },
      { label: '24 hours', price: '35%' },
    ],
  },
];

export const usageNote =
  'Every add-on is optional. Usage and licensing are per video unless a written package or campaign agreement states otherwise.';

/**
 * Creator posting rates — a standalone section, not an accordion. Posting is
 * access to my audience, which is a different product from content delivery.
 */
export interface PostingCard {
  id: string;
  title: string;
  price: string;
  includes: string[];
}

export const postingRates: PostingCard[] = [
  {
    id: 'tiktok',
    title: 'TikTok Posting',
    price: '$450',
    includes: ['1 cinematic 4K video posted to my audience'],
  },
  {
    id: 'instagram',
    title: 'Instagram Reel Posting',
    price: '$350',
    includes: [
      '1 cinematic 4K video posted to my audience',
      'Invited as collaborator on the final post',
    ],
  },
  {
    id: 'cross-post',
    title: 'TikTok + Instagram Cross-Post',
    price: '$700',
    includes: [
      'The same approved campaign video posted across both TikTok and Instagram',
      'Invited as collaborator on the Instagram post',
    ],
  },
];

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
