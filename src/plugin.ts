import { writeFileSync } from 'fs'
import { join } from 'path'
import { types as t, NodePath } from '@babel/core'
import { getUserConfig, evaluateConfig } from 'classy-ui/lib/utils'

import { transform as transformConfigToTypes } from './transform-config-to-types'

let config = evaluateConfig(getUserConfig())

if (process.env.NODE_ENV !== 'test') {
  try {
    let types = transformConfigToTypes(config)
    let esTypesPath = join(
      process.cwd(),
      'node_modules',
      'propy-ui',
      'es',
      'propy-ui.d.ts',
    )
    let libTypesPath = join(
      process.cwd(),
      'node_modules',
      'propy-ui',
      'lib',
      'propy-ui.d.ts',
    )
    writeFileSync(esTypesPath, types)
    writeFileSync(libTypesPath, types)
  } catch {
    // Codesandbox or some other unwritable environment
  }
}

function getAttributeValue(attribute: t.JSXAttribute | t.JSXSpreadAttribute) {
  if (!t.isJSXAttribute(attribute)) {
    return undefined
  }

  if (t.isStringLiteral(attribute.value)) {
    return attribute.value
  }

  if (
    t.isJSXExpressionContainer(attribute.value) &&
    !t.isJSXElement(attribute.value.expression) &&
    !t.isJSXFragment(attribute.value.expression) &&
    !t.isJSXEmptyExpression(attribute.value.expression)
  ) {
    return attribute.value.expression
  }

  return undefined
}

function generateClassNameAttribute(
  classes: Set<string>,
) {
  if (classes.size === 0) {
    return
  }

  let callExpression = t.callExpression(
    t.identifier('c'),
    Array.from(classes).map(className => t.stringLiteral(className)),
  )

  return t.jsxAttribute(
    t.jsxIdentifier('className'),
    t.jsxExpressionContainer(
      callExpression,
    ),
  )
}

function camelToDash(string: string) {
  return string
    .replace(/[\w]([A-Z])/g, function(m) {
      return m[0] + '-' + m[1]
    })
    .toLowerCase()
}

function generateClassName(classnameKey: string, variantKey?: string) {
  return `${camelToDash(classnameKey)}${variantKey ? `-${variantKey}` : ''}`
}

function handleStringLiteral(value: t.StringLiteral, values: Set<string>) {
  values.add(value.value)
}

function handleNumericLiteral(value: t.NumericLiteral, values: Set<string>) {
  values.add(String(value.value))
}

function handleValue(value: any, values: Set<string>) {
  if (t.isStringLiteral(value)) {
    handleStringLiteral(value, values)
  } else if (t.isNumericLiteral(value)) {
    handleNumericLiteral(value, values)
  } else if (t.isUnaryExpression(value)) {
    /* Maybe TODO */
  } else if (t.isConditionalExpression(value)) {
    /* Maybe TODO */
  }
}

export type PluginOptions = {
  components?: string[]
}

export default (_api: any, options: PluginOptions) => {
  let { components } = options

  let allowedComponents = new Set(components)
  let allowedAttributes = new Set(Object.keys(config.classnames))

  return {
    name: 'babel-plugin-propy-ui',
    visitor: {
      Program(path: NodePath<t.Program>) {
        let hasClassyUIImported = path.node.body.some(node => {
          return t.isImportDeclaration(node) && node.source.value === 'classy-ui'
        })

        if (!hasClassyUIImported) {
          let hasAllowedComponentImported = path.node.body.some(node => {
            return t.isImportDeclaration(node) && node.specifiers.some(specifier => {
              return t.isImportSpecifier(specifier) && allowedComponents.has(specifier.local.name)
            })
          })

          if (hasAllowedComponentImported) {
            let classyUIImport = t.importDeclaration(
              [t.importSpecifier(t.identifier('c'), t.identifier('c'))],
              t.stringLiteral('classy-ui'),
            )
            path.node.body.unshift(classyUIImport)
          }
        }

        path.traverse({
          JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
            let classes = new Set<string>()
            let nonAtomicAttributes = []

            if (
              t.isJSXIdentifier(path.node.name) &&
              allowedComponents.has(path.node.name.name)
            ) {
              for (let i = 0, l = path.node.attributes.length; i < l; i += 1) {
                let attribute = path.node.attributes[i]
                if (
                  t.isJSXAttribute(attribute) &&
                  t.isJSXIdentifier(attribute.name)
                ) {
                  if (!allowedAttributes.has(attribute.name.name)) {
                    nonAtomicAttributes.push(attribute)
                  } else {
                    let { name: propName } = attribute.name
                    let values: Set<string> = new Set()

                    if (t.isStringLiteral(attribute.value)) {
                      handleValue(attribute.value, values)
                    } else if (t.isJSXExpressionContainer(attribute.value)) {
                      handleValue(attribute.value.expression, values)
                    } else if (attribute.value === null) {
                      classes.add(generateClassName(propName))
                    }

                    let valuesArr = Array.from(values)

                    for (let ii = 0, ll = valuesArr.length; ii < ll; ii += 1) {
                      let value = valuesArr[ii]
                      classes.add(generateClassName(propName, value))
                    }
                  }
                }
              }

              path.node.attributes = nonAtomicAttributes

              let newClassNameAttribute = generateClassNameAttribute(
                classes,
              )

              if (newClassNameAttribute) {
                path.node.attributes.push(newClassNameAttribute)
              }
            }
          },
        })
      },
    },
  }
}
