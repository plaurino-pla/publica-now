import * as React from 'react'
import clsx from 'clsx'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  fluid?: boolean
}

export function Container({ className, fluid = false, ...props }: ContainerProps) {
  return (
    <div
      className={clsx(
        fluid ? 'w-full' : 'mx-auto max-w-7xl',
        'px-6 lg:px-8',
        className
      )}
      {...props}
    />
  )
}
