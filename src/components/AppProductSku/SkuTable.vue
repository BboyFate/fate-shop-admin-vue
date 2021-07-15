<template>
  <div class="container">
    <el-table :data="data" v-bind="$attrs" style="width: 100%" border v-on="$listeners" size="small">
      <el-table-column
        v-for="(productAttr, productAttrIndex) in productAttrColumns"
        :key="productAttrIndex"
        :label="productAttr.label"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row._attributes[productAttrIndex].value }}
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="image">
        <template slot-scope="scope">
          <el-form :model="scope.row">
<!--            <el-form-item prop="image">-->
<!--              <el-image v-if="scope.row.image" style="width: 60px; height: 60px" :src="scope.row.image" fit="cover" @click="handleSkuImage(scope.$index, scope.row)"/>-->
<!--              <i v-else class="el-icon-picture" style="font-size: 60px;" @click="handleSkuImage(scope.$index, scope.row)" />-->
<!--            </el-form-item>-->

            <el-form-item prop="image">
              <app-material :usedMaterials.sync="scope.row.image" type="image" :maximum="1" :width="60" :height="60"/>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name">
        <template slot-scope="scope">
          <el-form :model="scope.row">
            <el-form-item prop="price">
              <el-input v-model="scope.row.name" size="mini" placeholder="SKU 名称" clearable @input="e => updateInput(e, scope.$index, 'name')" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="销售价(元)" prop="price">
        <template slot-scope="scope">
          <el-form :model="scope.row">
            <el-form-item prop="price">
              <el-input v-model="scope.row.price" size="mini" placeholder="销售价" min="0.01" type="number" @input="e => updateInput(e, scope.$index, 'price')" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock">
        <template slot-scope="scope">
          <el-form :model="scope.row">
            <el-form-item prop="stock">
              <el-input v-model="scope.row.stock" size="mini" placeholder="库存" min="0" type="number" @input="e => updateInput(e, scope.$index, 'stock')" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="重量(kg)" prop="weight">
        <template slot-scope="scope">
          <el-form :model="scope.row">
            <el-form-item prop="stock">
              <el-input v-model="scope.row.weight" size="mini" placeholder="重量" min="0.01" type="number" @input="e => updateInput(e, scope.$index, 'weight')" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="体积(m³)" prop="volume">
        <template slot-scope="scope">
          <el-form :model="scope.row">
            <el-form-item prop="stock">
              <el-input v-model="scope.row.volume" size="mini" placeholder="体积" min="0.01" type="number" @input="e => updateInput(e, scope.$index, 'volume')" />
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import AppMaterial from '@/components/AppMaterial'
import { diffArrays, eqArrays } from '@/utils'
import { flatten, generateSkuAttrId } from './utils'

export default {
  name: 'AppSkuTable',
  components: {
    AppMaterial,
  },
  props: {
    productAttributes: {
      type: Array,
      default() {
        return []
      }
    },
    productSkus: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isSelectImageShowed: false,
      data: [],
      oldData: []
    }
  },
  computed: {
    /**
     * 商品 SKU 列表，由商品规格用笛卡尔积运算出来
     */
    skusList() {
      return flatten(this.productAttributes).map(productSku => ({
        _attributes: productSku.skuAttributes,
        _id: generateSkuAttrId(productSku.skuAttributes),
        image: [],  // 初始化 sku 的 image，素材组件用的是 Array 格式
      }))
    },

    productAttrColumns() {
      return this.productAttributes.map(productAttribute => ({
        label: productAttribute.name,
        formater(row) {
          const skuAttribute = row._attributes.find(skuAttribute => skuAttribute.name === productAttribute.name)
          return skuAttribute.value
        }
      }))
    }
  },
  watch: {
    skusList: {
      deep: true,
      immediate: true,
      handler(newSkus, oldSkus) {
        if (!newSkus.length) {
          return (this.data = [])
        }

        // 没有旧的 SKU，说明没更改过数据。直接返回原始的 SKU
        if (!oldSkus || !oldSkus.length) {
          return this.initData(newSkus)
        }

        const eqIds = this.eqIds(newSkus, oldSkus)

        // 商品 SKU 数量不变
        // SKU 随机 ID 已更改，说明有新增规格且只有一个规格值
        if (newSkus.length === oldSkus.length && eqIds.length === 0) {
          return (this.data = newSkus.map((item, index) => ({
            ...this.data[index], // 叠加的原因是有可能『规格名和规格值数量』变化
            ...item
          })))
        }

        // 当商品规格数量变化，重新初始化 SKU 列表
        if (newSkus[0]._attributes.length !== oldSkus[0]._attributes.length) {
          return this.initData(newSkus)
        }

        const data = []
        newSkus.forEach(newSku => {
          const sku = this.data.find(item => item._id === newSku._id)
          if (sku) {
            // 原有的 SKU 重新放回去
            data.push(sku)
          } else {
            // 新的 SKU
            data.push({
              ...newSku
            })
          }
        })
        this.data = data
      }
    }
  },
  methods: {
    updateInput(e, skuIndex, name) {
      this.data[skuIndex][name] = e
      this.data = JSON.parse(JSON.stringify(this.data))
    },

    /**
     * 点击 SKU 列表的某个图片
     */
    handleSkuImage(skuIndex) {
      this.isSelectImageShowed = true
      this.changingSkuIndex = skuIndex
    },

    /**
     * 获取图片
     */
    handleSelectedImages(images) {
      this.data[this.changingSkuIndex].image = images[0].path
      this.data = JSON.parse(JSON.stringify(this.data))
    },

    diffIds(newSkus, oldSkus) {
      newSkus = newSkus.map(item => item._id)
      oldSkus = oldSkus.map(item => item._id)
      return diffArrays(newSkus, oldSkus)
    },

    eqIds(newSkus, oldSkus) {
      newSkus = newSkus.map(item => item._id)
      oldSkus = oldSkus.map(item => item._id)
      return eqArrays(newSkus, oldSkus)
    },

    initData(skusList) {
      if (this.productSkus && this.productSkus.length) {
        // 初始化数据
        this.data = this.productSkus
        this.$emit('update:productSkus', [])
        return
      }

      this.data = skusList.map(sku => ({
        ...sku
      }))
    }
  }
}
</script>

