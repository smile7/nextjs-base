import { DocumentIcon } from '@sanity/icons/Document'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [languageField, defineField({ name: 'title', title: 'Title', type: 'string' })],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
