export type AnalyticsEvent =
  'call_click' | 'directions_click' | 'booking_click' | 'form_submit_success'

export type AnalyticsProps = Record<string, string | number | boolean>

/** Analytics entry point (PRD F-11). No provider until Phase 09: logs in dev, otherwise a no-op. */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (process.env.NODE_ENV === 'development') console.debug('[track]', event, props ?? {})
}
