<style lang="sass" scoped>
.sku_container
  margin-bottom: 30px
  font-size: 12px
  color: #666
  padding: 10px
  border: 1px solid #e5e5e5

.remove
  display: none
  position: absolute
  z-index: 2
  width: 18px
  height: 18px
  font-size: 14px
  line-height: 16px
  color: #fff
  text-align: center
  cursor: pointer
  background: rgba(0,0,0,.3)
  border-radius: 50%

.sku_group
  margin-bottom: 10px
  &:hover
    .attr_title .remove
      display: block

.attr_title
  position: relative
  padding: 7px 10px
  background-color: #f8f8f8
  line-height: 16px
  font-weight: 400

  .input
    width: 200px

  .remove
    top: 12px
    right: 10px

.group_container
  padding: 10px 10px 0

  .input
    width: 250px

  .sku_item
    background-color: #f8f8f8
    padding-left: 20px
    padding-right: 20px
    display: inline-block
    margin-right: 10px
    vertical-align: middle
    text-align: center
    position: relative
    border-radius: 2px
    cursor: pointer

    &:hover
      .remove
        display: block

    .remove
      top: -8px
      right: -8px

    .text
      display: block
      margin: 0 auto
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
</style>

<template lang="pug">
.container
  el-form-item(label="选择模板" prop="template")
    el-select(
      class="margin-right-10"
      v-model="currentProductAttrTemplateIndex"
      filterable
      placeholder="可选择一个模板生成规格"
      @change="changeProductAttrTemplate"
    )
      el-option(
        v-for="(template, templateIndex) in productAttrTemplates"
        :key="template.id"
        :label="template.name"
        :value="templateIndex"
      )
    el-button(type='info' @click='handleTemplateToAttr') 由模板生成规格
  el-form-item
      .sku_container
        .sku_group.mb10(v-for="(productAttribute, productAttributeIndex) in productAttributes" :key="productAttribute.id")
          .attr_title
            span.label 规格名：
            el-input.input(placeholder='请输入规格名' v-model.trim="productAttribute.name")
            span.remove(@click="handleDeleteProductAttributes(productAttributeIndex)") ×

          .group_container
            span.label 规格值：
            el-popover(
              placement="bottom"
              width="120"
              trigger="click"
              v-for="(productAttrValue, productAttrValueIndex) in productAttribute.values" :key="productAttrValueIndex"
            )
              el-input(v-model.trim="productAttrValue.value" style="width: 110px;")
              .sku_item(slot="reference")
                span.remove(@click.stop="handleDeleteProductAttributeValue(productAttributeIndex, productAttrValueIndex)") ×
                .text {{ productAttrValue.value }}

            el-input.input(
              suffix-icon="el-icon-plus"
              v-model="addProductAttrValues[productAttributeIndex]"
              placeholder="多个商品规格值以空格隔开"
              @keyup.native.enter='enterAddProductAttributeValue(productAttributeIndex)'
              @blur='enterAddProductAttributeValue(productAttributeIndex)'
            )
        .attr_title
          el-button(type='info' :disabled='disabled' @click='handleAddProductAttributes') 添加规格

  el-form-item
      .sku_container
        SkuTable(:productAttributes.sync="productAttributesFilter" :productSkus.sync="productSkus" ref="SkuTable")
</template>

<script>
import { generateUniqueString, uniqueArray } from '@/utils'
import SkuTable from './SkuTable'
import { generateProductSkus } from './utils'

export default {
  name: 'AppProductSku',
  components: {
    SkuTable
  },
  props: {

  },
  data() {
    return {
      addProductAttrValues: [], // 用来存储某个规格添加的所有规格值
      productSkus: [],
      productAttributes: [],

      currentProductAttrTemplateIndex: '', // 当前选择的模板
      productAttrTemplates: [] // 商品规格模板
    }
  },
  computed: {
    /**
     *  有一个『没有商品规格名』时，不能再新增新的规格
     */
    disabled() {
      return (
        this.productAttributes.some(productAttribute => !productAttribute.name)
      )
    },

    /**
     * 过滤掉『没有商品规格名』和『没有商品规格值』
     */
    productAttributesFilter() {
      return this.productAttributes.filter(productAttribute => productAttribute.name && productAttribute.values.length)
    }
  },
  methods: {
    /**
     * 父组件调用，初始化数据
     */
    _setData(data) {
      if (!data || !data.length) {
        return
      }

      const { productSkusResult, productAttributesResult } = generateProductSkus(data)

      this.productAttributes = productAttributesResult
      this.productSkus = Object.freeze(productSkusResult)
    },

    /**
     * 父组件调用，获取 sku-table 的数据
     */
    _getData() {
      return this.$refs.SkuTable.data
    },

    /**
     * 父组件调用，获取 sku-table 的数据
     */
    _getProductAttributes() {
      return this.productAttributes
    },

    /**
     * 添加新的商品规格
     */
    handleAddProductAttributes() {
      this.productAttributes.push({
        id: generateUniqueString() + '_id',
        name: '',
        values: []
      })
    },

    /**
     * 删除商品的某个规格
     */
    handleDeleteProductAttributes(productAttributeIndex) {
      this.productAttributes.splice(productAttributeIndex, 1)
    },

    /**
     * 添加商品规格值
     */
    enterAddProductAttributeValue(productAttributeIndex) {
      let str = this.addProductAttrValues[productAttributeIndex] || ''
      str = str.trim()
      if (!str) {
        return
      }

      const oldProductAttrValues = this.productAttributes[productAttributeIndex].values
      const newProductAttrValues = str
        .split(/\s+/) // 使用空格分割成数组
        .filter(newProductAttrValue => !oldProductAttrValues.some(oldProductAttrValue => oldProductAttrValue.value === newProductAttrValue)) // 过滤掉已存在的商品规格值
        .map(newProductAttrValue => ({
          id: generateUniqueString() + '_id',
          value: newProductAttrValue
        }))

      this.productAttributes[productAttributeIndex].values = uniqueArray([...oldProductAttrValues, ...newProductAttrValues])
      this.$set(this.addProductAttrValues, productAttributeIndex, '')
    },

    /**
     * 删除商品规格的某个规格值
     */
    handleDeleteProductAttributeValue(productAttrIndex, productAttrValueIndex) {
      this.productAttributes[productAttrIndex].values.splice(productAttrValueIndex, 1)
    },

    /**
     * 父组件调用
     * 初始化商品规格模板
     */
    _setProductAttrTemplates(data) {
      if (!data || !data.length) {
        return
      }

      this.productAttrTemplates = Object.freeze(data)
    },

    /**
     * 商品规格模板选择
     */
    changeProductAttrTemplate(currentTemplate) {
      this.currentProductAttrTemplateIndex = currentTemplate
    },

    /**
     * 规格模板生成商品规格
     */
    handleTemplateToAttr() {
      if (!this.productAttrTemplates.length) {
        this.$message.error('没有选择模板')
        return false
      }

      const newProductAttributes = []
      this.productAttrTemplates[this.currentProductAttrTemplateIndex].attributes.forEach(newProductAttr => {
        const oldProductAttr = this.productAttributes.find(oldProductAttribute => oldProductAttribute.name === newProductAttr.name)

        // 旧规格里有模板的里的规格
        if (oldProductAttr) {
          const newProductAttrValues = []
          // 取出有模板里的规格值的旧规格值
          newProductAttr.values.forEach(newValue => {
            const item = oldProductAttr.values.find(oldValue => oldValue.value === newValue)
            if (item) {
              newProductAttrValues.push({ ...item })
            } else {
              newProductAttrValues.push({
                id: generateUniqueString(newValue),
                value: newValue
              })
            }
          })

          const newProductAttrResult = {
            id: oldProductAttr.id,
            name: oldProductAttr.name,
            values: newProductAttrValues
          }

          newProductAttributes.push(newProductAttrResult)
        } else {
          // 现在的规格里不存在 模板的规格
          const newProductAttrValues = newProductAttr.values.map(newValue => ({
            id: generateUniqueString(newValue),
            value: newValue
          }))

          const newProductAttrResult = {
            id: generateUniqueString() + '_id',
            name: newProductAttr.name,
            values: newProductAttrValues
          }

          // 取出模板新的规格
          newProductAttributes.push(newProductAttrResult)
        }
      })

      this.productAttributes = newProductAttributes
    }
  }
}
</script>
