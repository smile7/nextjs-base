import 'server-only'

import { getTranslations } from 'next-intl/server'
import { VisualEditing } from 'next-sanity/visual-editing'

import { ExitPreview } from './exit-preview'

/**
 * Draft-mode only (the `[locale]` layout checks `draftMode()`): click-to-edit overlays, refresh on
 * Studio edits, and an "Exit preview" button outside Presentation.
 */
export async function PreviewTools() {
  const t = await getTranslations('Preview')
  return (
    <>
      <VisualEditing />
      <ExitPreview label={t('exit')} />
    </>
  )
}
