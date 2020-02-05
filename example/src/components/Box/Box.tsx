import React from 'react'
import { Props } from 'propy-ui'

type BoxProps = Props & {
  children: React.ReactNode
  className?: string
}

export function Box(props: BoxProps) {
  const { children, className } = props
  return <div className={className}>{children}</div>
}
