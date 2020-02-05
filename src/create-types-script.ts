import { writeFileSync } from 'fs'
import { join } from 'path'
import { evaluateConfig } from 'classy-ui/lib/utils'

import { transform as transformConfigToTypes } from './transform-config-to-types'

const config = evaluateConfig({
  variables: {},
  classnames: {},
  screens: {},
})

if (process.env.NODE_ENV !== 'test') {
  try {
    const types = transformConfigToTypes(config)
    const esTypesPath = join(process.cwd(), 'es', 'propy-ui.d.ts')
    const libTypesPath = join(process.cwd(), 'lib', 'propy-ui.d.ts')
    writeFileSync(esTypesPath, types)
    writeFileSync(libTypesPath, types)
  } catch {
    // Codesandbox or some other unwritable environment
  }
}
