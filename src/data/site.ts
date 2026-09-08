/**
 * Global site configuration — the single source of truth for URLs, contact
 * details, navigation, CTA wording, and hero proof stats.
 * Nothing in this file should be duplicated in a component.
 */

export const site = {
  name: 'worldwidewmal',
  wordmark: 'WORLDWIDEWMAL',
  url: 'https://worldwidewmal.com',
  email: 'partnerships@worldwidewmal.com',
  tagline: 'Creator-led content production for brands.',
} as const;

/**
 * External destinations. The portfolio stays on Canva so it can be updated
 * without a site deployment.
 *
 * Portfolio links point straight at the published Canva site rather than at
 * the local /portfolio route. Routing through our own page cost a full extra
 * navigation and a loading screen before Canva even started fetching. Going
 * direct is one hop, and the browser Back button returns here normally.
 * /portfolio is kept as an instant redirect so old links and bookmarks work.
 */
export const links = {
  portfolio: 'https://worldwidewmal.my.canva.site',
  portfolioOrigin: 'https://worldwidewmal.my.canva.site',
  portfolioPath: '/portfolio',
  travel: '/travel',
  tiktok: 'https://tiktok.com/@worldwidewmal',
  instagram: 'https://instagram.com/malachi.mh',
  email: 'mailto:partnerships@worldwidewmal.com',
} as const;

/** Approved CTA wording. Components reference these rather than inventing
 *  new variants. */
export const cta = {
  start: 'Start a Project',
  viewPortfolio: 'View Portfolio',
  viewFullPortfolio: 'View Full Portfolio',
  getQuote: 'Get My Project Quote',
  fullInclusions: 'View Full Inclusions',
  askMonthly: 'Ask About Monthly Production',
  onLocationPricing: 'View On-Location Pricing',
  ugcPricing: 'View UGC Pricing',
} as const;

/** Primary navigation, in the exact required order. Travel Planning is
 *  flagged secondary so it renders visually de-emphasised. */
export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Portfolio', href: links.portfolio },
  { label: 'Travel Planning', href: links.travel, secondary: true },
] as const;

/** Hero proof stats. */
export const stats = [
  { value: '48K+', label: 'TikTok' },
  { value: '10K+', label: 'Instagram' },
  { value: '1.2M+', label: 'Top Video Views' },
  { value: '4K', label: '4K Production' },
] as const;

export const seo = {
  home: {
    title: 'Worldwidewmal | UGC & On-Location Content Production',
    description:
      'On-location and UGC content production for hospitality, travel, lifestyle, tech, wellness, and consumer brands. Explore pricing, production services, and brand partnerships.',
    h1: 'Content built for brands people actually watch.',
  },
  travel: {
    title: 'Travel Planning | Custom Trip Itineraries by Worldwidewmal',
    description:
      'Custom travel plans built from real, firsthand trips across 25+ countries: day-by-day routes, budgets, neighbourhood guidance, and vetted restaurant and activity picks.',
    h1: 'Turn Your Saved Videos Into A Real Trip.',
  },
} as const;
