import { icons, type LucideIcon } from 'lucide-react'

import type { ContentIcon as ContentIconName } from '@/config/icons'

import { Icon } from './Icon'

function lucideFor(name: ContentIconName): LucideIcon | null {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return (icons as Record<string, LucideIcon | undefined>)[pascal] ?? null
}

type ContentIconProps = {
  name: ContentIconName
  className?: string
}

export function ContentIcon({ name, className }: ContentIconProps) {
  const lucide = lucideFor(name)
  if (!lucide) return null
  return <Icon icon={lucide} className={className} />
}