<template>
  <div class="app-container">
    <el-card>
      <el-form ref="form" :model="form" :rules="rules" class="form-container" label-width="150px">
        <div class="createPost-main-container">
          <el-form-item label="商品名称" prop="title">
            <el-input v-model="form.title" placeholder="" clearable/>
          </el-form-item>
          <el-form-item label="商品长标题" prop="long_title">
            <el-input v-model="form.long_title" placeholder="" clearable/>
          </el-form-item>
          <el-form-item label="货号" prop="number">
            <el-input v-model="form.number" class="app-input-small" placeholder="可输入货号" clearable/>
          </el-form-item>
          <el-form-item label="商品状态">
            <el-radio-group v-model="form.on_sale">
              <el-radio :label="true">上架</el-radio>
              <el-radio :label="false">下架</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="运费模板" prop="express_fee_id">
            <el-select v-model="form.express_fee_id" placeholder="请选择运费模板" clearable>
              <el-option
                v-for="(expressFee, expressFeeIndex) in expressFees"
                :key="expressFeeIndex"
                :label="expressFee.name"
                :value="expressFee.id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="商品封面图" prop="image">
            <app-material :usedMaterials.sync="form.image" type="image" :maximum="1" :width="150" :height="150"/>
          </el-form-item>
          <el-form-item label="商品轮播图" prop="banners">
            <app-material :usedMaterials.sync="form.banners" type="image" :maximum="5" :width="150" :height="150"/>
            <div class="el-upload__tip">最多可上传 5 张</div>
          </el-form-item>
          <el-form-item label="商品类目" prop="category_id">
            <el-cascader
              v-model="form.category_id"
              :options="this.categories"
              :props="{ expandTrigger: 'hover' }"
              clearable
            />
          </el-form-item>

          <template v-if="this.productType === 'crowdfunding'">
            <h3>众筹商品参数</h3>
            <el-form-item label="众筹目标金额" prop="crowdfunding">
              <el-input-number v-model="form.crowdfunding.target_amount" :min="0.01"/>
            </el-form-item>
            <el-form-item label="众筹结束时间" prop="crowdfunding">
              <el-date-picker
                v-model="form.crowdfunding.end_at"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="yyyy-MM-dd HH:mm:ss"
                :picker-options="crowdfundingEndAtOptions"
              />
            </el-form-item>
          </template>

          <el-form-item label="商品详情" prop="description" style="margin-bottom: 30px;">
            <Tinymce ref="editor" v-model="form.description.description" :height="400"/>
          </el-form-item>

          <app-product-sku ref="productSkus" />

          <el-form-item>
            <el-button type="primary" @click="handleSubmitForm">保存</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import AppMaterial from '@/components/AppMaterial'
  import AppProductSku from '@/components/AppProductSku'
  import Tinymce from '@/components/Tinymce'
  import { generateCategorySelector } from '@/utils'
  import {
    getProductDetail,
    updateProduct,
    addProduct,
    addCrowdfundingProduct,
    updateCrowdfundingProduct
  } from '@/api/products/product'
  import { getFees } from '@/api/systems/express'

  export default {
    name: 'ProductDetail',
    components: {
      Tinymce,
      AppMaterial,
      AppProductSku
    },
    filters: {
      attrFilter(attr) {
        let str = ''
        for (const item of attr) {
          str += [item.name] + ':' + item.value + '; '
        }
        return str
      }
    },
    props: {
      isEdit: {
        type: Boolean,
        required: true
      },
      productType: {
        type: String,
        required: true,
        validator: function (value) {
          return [
            'normal',
            'crowdfunding'
          ].indexOf(value) !== -1
        }
      }
    },
    data() {
      return {
        form: {},
        categories: [], // 所有分类
        expressFees: [], // 运费模板
        loading: false,

        isSelectImageShowed: false, // 显示图片库
        imageOrigin: '',

        crowdfundingEndAtOptions: {
          shortcuts: [{
            text: '明天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: '一周后',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }],
          disabledDate(time) {
            // 此条为设置禁止用户选择今天之前的日期，包含今天。
            // return time.getTime() <= (Date.now());
            // 此条为设置禁止用户选择今天之前的日期，不包含今天。
            return time.getTime() <= (Date.now() - (24 * 60 * 60 * 1000))
          }
        },
        rules: {
          title: [
            {required: true, message: '请输入商品标题', trigger: 'blur'}
          ],
          long_title: [
            {required: true, message: '请输入商品长标题', trigger: 'blur'}
          ],
          number: [
            {required: false, message: '请输入商品货号', trigger: 'blur'}
          ],
          image: [
            { type: 'array', required: true, message: '请上传商品主图', trigger: 'change'}
          ],
          banners: [
            { type: 'array', required: true, message: '请上传商品轮播图', trigger: 'change'}
          ],
          category_id: [
            {required: true, message: '请设置商品所属类目', trigger: 'blur'}
          ],
          crowdfunding: {
            type: 'object',
            required: false,
            fields: {
              target_amount: {type: 'number', required: true, trigger: 'blur', message: '众筹金额必须填写'},
              end_at: {required: true, trigger: 'blur', message: '众筹结束日期必须填写'}
            }
          },
          description: {
            type: 'object',
            required: true,
            fields: {
              description: {required: true, message: '请输入商品详情描述', trigger: 'blur'}
            }
          }
        }
      }
    },
    watch: {
      'form.image': function(val) {
        if (val) {
          this.form.image = val
          this.$nextTick(() => {
            this.$refs.form.clearValidate('image')
          })
        }
      },
      'form.banners': function(val) {
        if (val) {
          this.form.banners = val
          this.$refs.form.clearValidate('banners')
        }
      }
    },
    created() {
      this.initForm()

      if (this.isEdit) {
        const productId = this.$route.params && this.$route.params.id
        this.getProductDetail(productId)
      }

      this.getExpressFees()
    },
    methods: {
      initForm() {
        this.form = {
          id: 0,
          title: '', // 商品名称
          long_title: '', // 商品长标题
          number: '', // 商品货号
          image: [], // 图片，提交之前需要转成字符串
          banners: [],
          on_sale: false,
          category_id: undefined,
          skus: [],
          description: {
            description: ''
          },
          crowdfunding: {
            target_amount: 0,
            end_at: undefined
          }
        }
      },
      /**
       * 获取商品详情
       */
      async getProductDetail(id) {
        await getProductDetail(id, {
          include: 'crowdfunding,category,skus,attributes,description'
        }).then(response => {
          if (response.data.product) {
            this.form = response.data.product
            this.form.image = [this.form.image]

            const skus = response.data.product.skus.map(sku => {
              sku.image = [sku.image] // 页面需要转成数组格式
              return sku
            })
            this.$refs.productSkus._setData(skus)
          }
          // 商品类目
          this.categories = generateCategorySelector(response.data.categories)
          // 商品规格模板
          this.$refs.productSkus._setProductAttrTemplates(response.data.attribute_templates)
        }).catch(err => {
          console.log(err)
        })
      },
      /**
       * 获取运费模板
       */
      async getExpressFees() {
        await getFees().then(response => {
          this.expressFees = response.data
        }).catch(err => {
          console.log(err)
        })
      },

      /**
       * 获取 SKU 列表
       */
      getSkuData() {
        return this.$refs.productSkus._getData().map(sku => {
          const {
            id,
            name,
            image,
            price,
            stock,
            weight,
            volume,
            _attributes
          } = sku

          const skuText = _attributes.reduce(
            (prev, current) => `${prev}${current.name}—${current.value} ;`,
            ''
          )

          if (!price) {
            this.$message.error(skuText + ' 未输入销售价')
            throw new Error('请输入销售价')
          } else if (!stock) {
            this.$message.error(skuText + ' 未输入库存')
            throw new Error('请输入库存')
          } else if (!image || !image.length) {
            this.$message.error(skuText + ' 未添加图片')
            throw new Error('请添加图片')
          } else if (!weight) {
            this.$message.error(skuText + ' 未设置重量')
            throw new Error('请设置重量')
          } else if (!volume) {
            this.$message.error(skuText + ' 未设置体积')
            throw new Error('请设置体积')
          }

          return {
            id,
            name,
            image: image[0],
            price,
            stock,
            weight,
            volume,
            attributes: _attributes.map(attribute => ({
              name: attribute.name,
              value: attribute.value
            }))
          }
        })
      },

      /**
       * 获取商品规格
       */
      getProductAttributes() {
        return this.$refs.productSkus._getProductAttributes().map(attr => {
          return {
            name: attr.name,
            values: attr.values.map(item => item.value)
          }
        })
      },

      /**
       * 提交表单
       */
      handleSubmitForm() {
        console.log(this.form)
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            if (this.form.category_id.length > 0) {
              this.form.category_id = this.form.category_id.pop()
            }

            const form = this.form
            const postData = {
              title: form.title,
              long_title: form.long_title,
              type: this.productType,
              image: form.image[0],
              banners: form.banners,
              on_sale: form.on_sale,
              category_id: form.category_id,
              express_fee_id: form.express_fee_id,
              skus: this.getSkuData(),
              attributes: this.getProductAttributes(),
              description: form.description.description
            }

            if (!postData.attributes || postData.attributes.length == 0) {
              this.msgError('商品规格必须填写')
              return false
            }

            this.loading = true
            // 如果是众筹商品
            if (this.productType === 'crowdfunding') {
              postData.target_amount = form.crowdfunding.target_amount
              postData.end_at = form.crowdfunding.end_at

              if (this.isEdit) {
                await updateCrowdfundingProduct(form.id, postData)
                  .then((res) => {
                    this.msgSuccess('编辑众筹商品成功')
                  })
              } else {
                await addCrowdfundingProduct(postData)
                  .then((res) => {
                    this.msgSuccess('新增众筹商品成功')
                  })
              }
            } else {
              // 普通商品
              if (this.isEdit) {
                await updateProduct(form.id, postData)
                  .then((res) => {
                    this.msgSuccess('编辑商品成功')
                  })
              } else {
                await addProduct(postData)
                  .then((res) => {
                    this.msgSuccess('新增商品成功')
                  })
              }
              // setTimeout(this.$router.back(-1), 2000)
              this.refreshCachedView(this)
            }
            this.loading = false
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
