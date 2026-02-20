import * as React from 'react'
import clsx from 'clsx'
import { Container } from './container'

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  bleed?: boolean
  background?: 'default' | 'muted' | 'brand' | 'white'
  innerClassName?: string
}

export function PageSection({
  className,
  innerClassName,
  background = 'default',
  bleed = false,
  children,
  ...props
}: PageSectionProps) {
  const bg =
    background === 'muted'
      ? 'bg-gray-50'
      : background === 'brand'
      ? 'bg-brand-600'
      : background === 'white'
      ? 'bg-white'
      : ''

  return (
    <section className={clsx('py-16 sm:py-20', bg, className)} {...props}>
      <Container className={innerClassName} fluid={bleed}>
        {children}
      </Container>
    </section>
  )
}
