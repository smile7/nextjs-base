import type { PluginOptions } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion } from './env'

// Dynamic import so production builds drop Vision: a static import adds ~13 MiB to the Worker
// even when the plugin is disabled.
const devPlugins: PluginOptions[] =
  process.env.NODE_ENV === 'development'
    ? [(await import('@sanity/vision')).visionTool({ defaultApiVersion: apiVersion })]
    : []

export const plugins: PluginOptions[] = [structureTool(), ...devPlugins]
