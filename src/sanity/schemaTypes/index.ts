import type { SchemaTypeDefinition } from 'sanity'

import { articleType } from './documents/article'
import { legalPageType } from './documents/legalPage'
import { pageType } from './documents/page'
import { serviceType } from './documents/service'
import { bookingConfigType, legalEntityType } from './objects/business'
import {
  openingHoursSpecType,
  phoneType,
  socialLinkType,
  specialHoursType,
} from './objects/contact'
import { ctaI18nType, ctaInlineType, ctaType } from './objects/cta'
import { imageWithAltType } from './objects/imageWithAlt'
import { linkType } from './objects/link'
import { addressType, geoType } from './objects/location'
import { calloutType, richTextSimpleType, richTextType } from './objects/richText'
import { seoType } from './objects/seo'

const objects = [
  imageWithAltType,
  richTextType,
  richTextSimpleType,
  calloutType,
  linkType,
  ctaType,
  ctaI18nType,
  ctaInlineType,
  seoType,
  addressType,
  geoType,
  phoneType,
  openingHoursSpecType,
  specialHoursType,
  socialLinkType,
  legalEntityType,
  bookingConfigType,
]

const documents = [pageType, serviceType, articleType, legalPageType]

export const schemaTypes: SchemaTypeDefinition[] = [...documents, ...objects]
