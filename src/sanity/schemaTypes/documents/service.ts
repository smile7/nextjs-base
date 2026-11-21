import { CaseIcon } from '@sanity/icons/Case'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'

export const serviceType = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: CaseIcon,
  fields: [languageField, defineField({ name: 'title', title: 'Title', type: 'string' })],
  preview: { select: { title: 'title', subtitle: 'language' } },
})
