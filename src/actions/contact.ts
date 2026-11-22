'use server'

import type { Locale } from '@/config/i18n'
import type { ContactResult } from '@/lib/forms/contact-schema'

type SubmitArgs = [locale: Locale, previous: ContactResult | null, form: FormData]

/** Not wired yet: sending arrives with T08.2. */
export async function submitContact(...args: SubmitArgs): Promise<ContactResult> {
  void args
  return { ok: false, formError: 'unavailable' }
}
