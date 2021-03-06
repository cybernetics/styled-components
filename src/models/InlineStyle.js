// @flow
import hashStr from 'glamor/lib/hash'
/* eslint-disable import/no-unresolved */
import { StyleSheet } from 'react-native'
import transformDeclPairs from 'css-to-react-native'

import type { RuleSet } from '../types'
import flatten from '../utils/flatten'
import parse from '../vendor/postcss-safe-parser/parse'

const generated = {}

/*
 InlineStyle takes arbitrary CSS and generates a flat object
 */
export default class InlineStyle {
  rules: RuleSet

  constructor(rules: RuleSet) {
    this.rules = rules
  }

  generateStyleObject(executionContext: Object) {
    const flatCSS = flatten(this.rules, executionContext).join('')
    const hash = hashStr(flatCSS)
    if (!generated[hash]) {
      const root = parse(flatCSS)
      const declPairs = []
      root.each(node => {
        if (node.type === 'decl') {
          declPairs.push([node.prop, node.value])
        } else {
          /* eslint-disable no-console */
          console.warn(`Node of type ${node.type} not supported as an inline style`)
        }
      })
      const styleObject = transformDeclPairs(declPairs)
      const styles = StyleSheet.create({
        generated: styleObject,
      })
      generated[hash] = styles.generated
    }
    return generated[hash]
  }
}
