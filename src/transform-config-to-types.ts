import { IEvaluatedConfig } from 'classy-ui/lib/types'

let NUMBER_REGEXP = /^\d+$/

function variantsToTypes(variants: string[]) {
  return variants
    .map(variant => {
      if (variant === '') {
        return 'boolean'
      }
      return NUMBER_REGEXP.test(variant)
        ? `'${variant}' | ${variant}`
        : `'${variant}'`
    })
    .join(' | ')
}

export function transform(config: IEvaluatedConfig) {
  let typedProps = Array.from(Object.entries(config.classnames))
    .map(([classname, value]) => {
      if (typeof value === 'function') {
        return `  '${classname}'?: boolean`
      }
      let variants = Object.keys(value.variants)
      return `  '${classname}'?: ${variantsToTypes(variants)}`
    })
  return `export interface Props {\n${typedProps.join('\n')}\n}`
}
