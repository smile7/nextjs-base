'use client'

import { defineConfig } from 'sanity'

import { dataset, projectId, studioBasePath } from './src/sanity/env'
import { isRoutableType } from './src/sanity/i18n'
import { plugins } from './src/sanity/plugins'
import { schemaTypes } from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Site Studio',
  basePath: studioBasePath,
  projectId,
  dataset,
  plugins,
  schema: {
    types: schemaTypes,
    // Routable documents are created only through the per-language templates
    // ("Български Page", "English Page"), so `language` is always set.
    templates: (prev) => prev.filter((template) => !isRoutableType(template.id)),
  },
})
