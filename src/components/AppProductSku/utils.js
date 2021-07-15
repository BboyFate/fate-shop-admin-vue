import {
  generateUniqueString
} from '@/utils'

// skuAttribute: [{"nameId":1,"name":"颜色","valueId":11,"value":"红色"},{"nameId":2,"name":"尺寸","valueId":22,"value":"小"}],
// output：1-11_2-22
export const generateSkuAttrId = skuAttribute => {
  return skuAttribute.reduce((total, currentValue, index) => {
    return `${total}${currentValue.nameId}-${currentValue.valueId}${index === skuAttribute.length - 1 ? '' : '_'}`
  }, '')
}

// 计算每个sku后面有多少项
export function getLevels(tree) {
  const level = []
  for (let i = tree.length - 1; i >= 0; i--) {
    if (tree[i + 1] && tree[i + 1].values) {
      level[i] = tree[i + 1].values.length * level[i + 1] || 1
    } else {
      level[i] = 1
    }
  }
  return level
}

/**
 * 笛卡尔积运算
 * @param  {[type]} tree   [description]
 * @param  {Array}  stocks [description]
 * @return {[type]}        [description]
 */
export function flatten(productAttributes, stocks = [], options) {
  const { optionValue = 'id', optionText = 'value' } = options || {}
  const productSkusResult = []
  let skuLength = 0
  const stockMap = {} // 记录已存在的stock的数据
  const level = getLevels(productAttributes)

  if (productAttributes.length === 0) {
    return productSkusResult
  }

  productAttributes.forEach(productAttribute => {
    const { values } = productAttribute
    if (!values || values.length === 0) {
      return true
    }
    skuLength = (skuLength || 1) * values.length
  })

  // 根据已有的 stocks 生成一个 map
  stocks.forEach(stock => {
    const { _attributes, ...attr } = stock
    stockMap[_attributes.map(skuAttribute => `${skuAttribute.nameId}_${skuAttribute.valueId}`).join('|')] = attr
  })

  // console.log('stockMap', stockMap)

  for (let i = 0; i < skuLength; i++) {
    const skuAttributes = []
    const skuAttributeMapKey = []

    productAttributes.forEach((productAttribute, column) => {
      const { values } = productAttribute
      if (!values || values.length === 0) {
        return true
      }

      let item = {}

      if (values.length > 1) {
        const row = parseInt(i / level[column], 10) % values.length
        item = productAttributes[column].values[row]
      } else {
        item = productAttributes[column].values[0]
      }

      if (!productAttribute[optionValue] || !item[optionValue]) {
        return
      }

      skuAttributeMapKey.push(`${productAttribute[optionValue]}_${item[optionValue]}`)

      skuAttributes.push({
        name: productAttribute.name,
        nameId: productAttribute[optionValue],
        value: item[optionText],
        valueId: item[optionValue]
      })
    })

    const { ...data } = stockMap[skuAttributeMapKey.join('|')] || {}

    // 从map中找出存在的sku并保留其值
    productSkusResult.push({ ...data, skuAttributes })
  }

  return productSkusResult
}

/**
 * 格式化 API 传过来的商品 SKU
 * @param productSkus 商品 SKU
 */
export function generateProductSkus(productSkus) {
  if (!productSkus || !productSkus.length) {
    return
  }
  const productAttributes = {}

  // 储存所有 spec 的随机生成的 id
  const productAttrNameIdsDict = {
    // '颜色': 'xxxid',
    // '皮质': 'xxxid',
  }

  // 储存所有 option 的随机生成的 id
  const productAttrValueIdsDict = {
    // '红色': 'xxxid',
    // '绿色': 'xxxid',
    // '蓝色': 'xxxid',
    // '一级皮': 'xxxid',
    // '二级皮': 'xxxid',
    // '三级皮': 'xxxid',
  }

  const productSkusResult = productSkus.map(productSku => {
    const skuObj = {
      ...productSku,
      _attributes: productSku.attributes.map(skuAttribute => {
        // 加上 if ，防止 dict 里的 id 被覆盖，每次只记录第一次生成的 id
        if (!productAttrNameIdsDict[skuAttribute.name]) {
          productAttrNameIdsDict[skuAttribute.name] = generateUniqueString() + '_id'
        }
        if (!productAttrValueIdsDict[skuAttribute.value]) {
          productAttrValueIdsDict[skuAttribute.value] = generateUniqueString() + '_id'
        }

        const productAttrNameId = productAttrNameIdsDict[skuAttribute.name]
        const productAttrValueId = productAttrValueIdsDict[skuAttribute.value]

        productAttributes[skuAttribute.name] = {
          id: productAttrNameId,
          name: skuAttribute.name,
          values: {
            ...(productAttributes[skuAttribute.name] ? productAttributes[skuAttribute.name].values : {}),
            [skuAttribute.value]: {
              id: productAttrValueId,
              value: skuAttribute.value
            }
          }
        }

        return {
          name: skuAttribute.name,
          nameId: productAttrNameId,
          value: skuAttribute.value,
          valueId: productAttrValueId
        }
      })
    }

    return {
      ...skuObj,
      _id: generateSkuAttrId(skuObj._attributes)
    }
  })

  const productAttributesResult = Object.values(productAttributes).map(productAttribute => ({
    ...productAttribute,
    values: Object.values(productAttribute.values)
  }))

  return {
    productSkusResult,
    productAttributesResult
  }
}

/**
 * 判断两个sku是否相同
 * @param  {[type]}  prevSKU [description]
 * @param  {[type]}  nextSKU [description]
 * @return {Boolean}         [description]
 */
export function isEqual(prevSKU, nextSKU, options) {
  const { optionValue = 'id' } = options || {}
  return (
    nextSKU.length === prevSKU.length &&
    nextSKU.every(({ leaf = [] }, index) => {
      const prevLeaf = prevSKU[index].leaf || []
      return (
        prevSKU[index][optionValue] === nextSKU[index][optionValue] &&
        leaf.length === prevLeaf.length &&
        leaf.map(item => item[optionValue]).join(',') ===
          prevLeaf.map(item => item[optionValue]).join(',')
      )
    })
  )
}
