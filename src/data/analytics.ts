/**
 * Analytics configuration.
 *
 * `measurementId` is the one value that cannot be derived from the codebase —
 * it identifies a specific GA4 property. Leave it empty and the site ships
 * genuinely cookieless: no gtag script is loaded, no cookies are set, and no
 * consent banner appears, because there is nothing to consent to. Events are
 * still wired and simply no-op, so filling this in is the only step needed to
 * turn measurement on.
 *
 * To enable: paste the GA4 Measurement ID (looks like "G-XXXXXXXXXX").
 */
export const analytics = {
  measurementId: '',
} as const;

/**
 * The commercial funnel. Kept here so event names are declared once and cannot
 * drift between the tracking helper and whatever reads the reports.
 */
export const trackedEvents = [
  'portfolio_click',
  'service_on_location_click',
  'service_ugc_click',
  'pricing_expand',
  'package_add',
  'addon_add',
  'posting_add',
  'project_builder_open',
  'project_builder_complete',
  'project_form_start',
  'project_form_submit',
  'travel_planning_click',
] as const;

export type TrackedEvent = (typeof trackedEvents)[number];
