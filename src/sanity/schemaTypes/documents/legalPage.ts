import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'

export const legalPageType = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [languageField, defineField({ name: 'title', title: 'Title', type: 'string' })],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
