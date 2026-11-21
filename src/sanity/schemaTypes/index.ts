import type { SchemaTypeDefinition } from 'sanity'

import { articleType } from './documents/article'
import { legalPageType } from './documents/legalPage'
import { pageType } from './documents/page'
import { serviceType } from './documents/service'

export const schemaTypes: SchemaTypeDefinition[] = [
  pageType,
  serviceType,
  articleType,
  legalPageType,
]
