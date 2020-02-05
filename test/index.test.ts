import { transformSync } from '@babel/core'

import classy from 'classy-ui/lib/plugin'
import plugin, { PluginOptions } from '../src/plugin'

export function traverse(source: string, options: PluginOptions) {
  return transformSync(source, {
    babelrc: false,
    code: true,
    ast: false,
    plugins: [
      [plugin, options],
      [classy],
    ],
    parserOpts: {
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      sourceType: 'unambiguous',
      plugins: [
        'jsx',
        'typescript',
        'doExpressions',
        'objectRestSpread',
        ['decorators', { decoratorsBeforeExport: true }],
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'numericSeparator',
        'optionalChaining',
        'importMeta',
        'bigInt',
        'optionalCatchBinding',
        'throwExpressions',
        ['pipelineOperator', { proposal: 'minimal' }],
        'nullishCoalescingOperator',
      ],
    },
  })
}

describe('test', () => {
  it('works', () => {
    const code = `
      import React from 'react'
      import { Box } from 'components/Box/Box'
      
      type TestProps = {
        children: React.ReactNode
      }
      
      function Test(props) {
        const {children} = props
        return (
          <Box color="red-500">{children}</Box>
        )
      }
    `
    const result = traverse(code, {
      components: ['Box']
    })
    expect((result || {}).code).toMatchSnapshot()
  })
})
