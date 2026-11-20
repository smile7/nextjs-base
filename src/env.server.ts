import 'server-only'
import { z } from 'zod'
import { TURNSTILE_TEST_SECRET_KEY } from './env'
import { createEnvReader } from './lib/env/reader'

const isDevelopment = process.env.NODE_ENV === 'development'

const serverShape = {
  SANITY_API_READ_TOKEN: z.string().min(1),
  SANITY_REVALIDATE_SECRET: z.string().min(16, 'use at least 16 characters'),
  RESEND_API_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  CONTACT_FROM_EMAIL: z.string().min(1),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_DRY_RUN: z.stringbool().default(false),
  CACHE_PURGE_API_TOKEN: z.string().min(1).optional(),
  CACHE_PURGE_ZONE_ID: z.string().min(1).optional(),
}

/**
 * Runtime secrets and vars (`wrangler secret` / wrangler `vars`, or `.env.local` in `next dev`).
 * Read at request time, never at module load, so the Worker reads the bound values.
 */
export const readServerEnv = createEnvReader('server', serverShape, () => ({
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  TURNSTILE_SECRET_KEY:
    process.env.TURNSTILE_SECRET_KEY || (isDevelopment ? TURNSTILE_TEST_SECRET_KEY : undefined),
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_DRY_RUN: process.env.CONTACT_DRY_RUN,
  CACHE_PURGE_API_TOKEN: process.env.CACHE_PURGE_API_TOKEN,
  CACHE_PURGE_ZONE_ID: process.env.CACHE_PURGE_ZONE_ID,
}))
