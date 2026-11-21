import { ComposeIcon } from '@sanity/icons/Compose'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: ComposeIcon,
  fields: [languageField, defineField({ name: 'title', title: 'Title', type: 'string' })],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
