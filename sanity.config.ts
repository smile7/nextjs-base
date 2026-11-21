'use client'

import { defineConfig } from 'sanity'

import { dataset, projectId, studioBasePath } from './src/sanity/env'
import { plugins } from './src/sanity/plugins'
import { schemaTypes } from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Site Studio',
  basePath: studioBasePath,
  projectId,
  dataset,
  plugins,
  schema: { types: schemaTypes },
})
