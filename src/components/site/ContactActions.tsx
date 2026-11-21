import { getTranslations } from 'next-intl/server'

import { buttonVariants } from '@/components/ui/button'
import type { SiteSettings } from '@/lib/content'
import { primaryPhone } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

type ContactActionsProps = {
  settings: Pick<SiteSettings, 'phones' | 'socials'>
}

const messengers = ['viber', 'whatsapp'] as const

/** The contact page's primary actions: a full-width call button, then Viber / WhatsApp. */
export async function ContactActions({ settings }: ContactActionsProps) {
  const t = await getTranslations('ActionBar')
  const phone = primaryPhone(settings)
  const chats = messengers.flatMap((platform) => {
    const social = settings.socials.find((s) => s.platform === platform)
    return social ? [{ platform, url: social.url }] : []
  })
  if (!phone && chats.length === 0) return null

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {phone ? (
        <a href={phone.href} className={cn(buttonVariants({ variant: 'call', size: 'lg' }))}>
          {t('call')}: {phone.display}
        </a>
      ) : null}
      {chats.map((chat) => (
        <a
          key={chat.platform}
          href={chat.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          {t(chat.platform)}
          <span className="sr-only"> {t('opensInNewTab')}</span>
        </a>
      ))}
    </div>
  )
}
