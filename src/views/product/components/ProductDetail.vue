<template>
  <div class="createPost-container">
    <el-form
      ref="postForm"
      :model="postForm"
      :rules="rules"
      class="form-container"
      label-width="150px"
    >
      <sticky :z-index="10" :class-name="'sub-navbar'">
        <OnSaleDropdown v-model="postForm.on_sale" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          提交
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <h3>基本信息</h3>
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="postForm.title" placeholder="" clearable />
        </el-form-item>
        <el-form-item label="商品长标题" prop="long_title">
          <el-input v-model="postForm.long_title" placeholder="" clearable />
        </el-form-item>
        <el-form-item label="货号" prop="number">
          <el-input class="app-input-small" v-model="postForm.number" placeholder="可输入货号" clearable />
        </el-form-item>
        <el-form-item label="商品封面图" prop="image">
          <el-image v-if="postForm.image" style="width: 100px; height: 100px" :src="postForm.image" @click="isSelectImageShowed=true"></el-image>
          <i v-else class="el-icon-picture" style="font-size: 100px;" @click="isSelectImageShowed=true"></i>
        </el-form-item>

        <h3>商品类目</h3>
        <el-form-item label="类目" prop="category_id">
          <el-cascader
            v-model="postForm.category_id"
            :options="this.categories"
            :props="{ expandTrigger: 'hover' }"
            @change="handleCategory"
            clearable
          />
        </el-form-item>

        <template v-if="this.productType === 'crowdfunding'">
          <h3>众筹商品参数</h3>
          <el-form-item label="众筹目标金额" prop="crowdfunding">
            <el-input-number v-model="postForm.crowdfunding.target_amount" :min="0.01"></el-input-number>
          </el-form-item>

          <el-form-item label="众筹结束时间" prop="crowdfunding">
            <el-date-picker
              v-model="postForm.crowdfunding.end_at"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              value-format="yyyy-MM-dd HH:mm:ss"
              :picker-options="crowdfundingEndAtOptions">
            </el-date-picker>
          </el-form-item>
        </template>

        <h3>商品详情</h3>
        <el-form-item prop="description" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.description.description" :height="400" />
        </el-form-item>

        <product-sku ref="productSkus"/>
      </div>
    </el-form>

    <fate-image :is-showed.sync="isSelectImageShowed" @get-selected-images="handleSelectedImages" />
  </div>
</template>

<script>
import FateImage from '@/components/FateImage'
import Tinymce from '@/components/Tinymce'
import Sticky from '@/components/Sticky' // 粘性header组件
import ProductSku from '@/components/ProductSku'
import { OnSaleDropdown } from './Dropdown'
import {
  getProductDetail,
  updateProduct,
  addProduct,
  addCrowdfundingProduct,
  updateCrowdfundingProduct,
} from '@/api/product'

const defaultForm = {
  id: 0,
  title: '', // 商品名称
  long_title: '', // 商品长标题
  number: '', // 商品货号
  image: '', // 图片
  banners: [],
  on_sale: false,
  category_id: undefined,
  skus: [],
  description: {
    description: '',
  },
  crowdfunding: {
    target_amount: 0,
    end_at: undefined,
  }
}

export default {
  name: 'ProductDetail',
  components: {
    Tinymce,
    Sticky,
    FateImage,
    ProductSku,
    OnSaleDropdown
  },
  filters: {
    attrFilter(attr) {
      let str = ''
      for (let item of attr) {
        str += [item.name] + ':' + item.value + '; '
      }
      return str
    },
  },
  props: {
    isEdit: {
      type: Boolean,
      required: true,
    },
    productType: {
      type: String,
      required: true,
      validator: function (value) {
        return [
          'normal',
          'crowdfunding',
        ].indexOf(value) !== -1
      }
    },
  },
  data() {
    return {
      postForm: Object.assign({}, defaultForm),
      isSelectImageShowed: false, // 显示图片库
      categories: [], // 所有分类
      loading: false,
      crowdfundingEndAtOptions: {
        shortcuts: [{
          text: '明天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }],
        disabledDate(time) {
          //此条为设置禁止用户选择今天之前的日期，包含今天。
          // return time.getTime() <= (Date.now());
          //此条为设置禁止用户选择今天之前的日期，不包含今天。
          return time.getTime() <= (Date.now()-(24 * 60 * 60 * 1000));
        }
      },
      rules: {
        title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
        long_title: [{ required: true, message: '请输入商品长标题', trigger: 'blur' }],
        number: [{ required: false, message: '请输入商品货号', trigger: 'blur' }],
        image: [{ required: true, message: '请请上传商品主图', trigger: 'change' }],
        category_id: [{ required: true, message: '请设置商品所属类目', trigger: 'blur' }],
        crowdfunding: {
          type: 'object',
          required: false,
          fields: {
            target_amount: { type: 'number', required: true, trigger: 'blur', message: '众筹金额必须填写' },
            end_at: { required: true, trigger: 'blur', message: '众筹结束日期必须填写' },
          }
        },
        description: {
          type: 'object',
          required: true,
          fields: {
            description: { required: true, message: '请输入商品详情描述', trigger: 'blur' },
          }
        },
      },
    }
  },
  created() {
    if (this.isEdit) {
      this.postForm.id = this.$route.params && this.$route.params.id
    }
    this.getProductDetail(this.postForm.id)
  },
  methods: {
    /**
     * 选择图片库的图片，保存到商品主图
     */
    handleSelectedImages(images) {
      this.postForm.image = images[0].path
    },

    /**
     * 获取商品详情
     */
    async getProductDetail(id) {
      await getProductDetail(id, {
        include: 'crowdfunding,category,skus,attributes,description',
      }).then(response => {
        console.log('response.data', response.data)
        if (response.data.product) {
          this.postForm = response.data.product
          this.$refs.productSkus._setData(response.data.product.skus)
        }
        this.categories = this.formatCategoryTree(response.data.categories)
        this.$refs.productSkus._setProductAttrTemplates(response.data.attribute_templates)
      }).catch(err => {
        console.log(err)
      })
    },

    /**
     * 格式化类目
     * @param categories 所有商品分类
     */
    formatCategoryTree(categories) {
      return categories.map(category => {
        let data = {
          'value': category.id,
          'label': category.name
        }
        if (category.children) {
          data.children = this.formatCategoryTree(category.children)
        }
        return data
      })
    },

    /**
     * 格式化类目
     * @param categories 所有商品分类
     */
    /**
     * 选择一个类目
     * @param categoryIds 选择的类目 ID 包括所有父 ID
     */
    handleCategory(categoryIds) {
      if (this.postForm.category_id.length) {
        this.postForm.category_id = this.postForm.category_id.[this.postForm.category_id.length - 1]
      }
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
          _attributes,
        } = sku

        const skuText = _attributes.reduce(
          (prev, current) => `${prev}${current.name}—${current.value} ;`,
          '',
        )

        if (!price) {
          this.$message.error(skuText + ' 未输入销售价')
          throw new Error('请输入销售价')
        } else if (!stock) {
          this.$message.error(skuText + ' 未输入库存')
          throw new Error('请输入库存')
        } else if (!image) {
          this.$message.error(skuText + ' 未添加图片')
          throw new Error('请添加图片')
        }

        return {
          id,
          name,
          image,
          price,
          stock,
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
          values: attr.values.map(item => item.value),
        }
      })
    },

    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.postForm.validate(async (valid) => {
        if (valid) {
          const postForm = this.postForm
          const postData = {
            title: postForm.title,
            long_title: postForm.long_title,
            type: this.productType,
            image: postForm.image,
            banners: postForm.banners,
            on_sale: postForm.on_sale,
            category_id: postForm.category_id,
            skus: this.getSkuData(),
            attributes: this.getProductAttributes(),
            description: postForm.description.description,
          }

          this.loading = true
          // 如果是众筹商品
          if (this.productType === 'crowdfunding') {
            postData.target_amount = postForm.crowdfunding.target_amount
            postData.end_at = postForm.crowdfunding.end_at

            if (this.isEdit) {
              await updateCrowdfundingProduct(postForm.id, postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('编辑众筹商品成功')
                })
            } else {
              await addCrowdfundingProduct(postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('新增众筹商品成功')
                })
            }
          } else {
            // 普通商品
            if (this.isEdit) {
              await updateProduct(postForm.id, postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('编辑商品成功')
                })
            } else {
              await addProduct(postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('新增商品成功')
                })
            }
          }
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    productNotify(message) {
      this.$notify({
        title: '成功',
        message: message,
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .createPost-container {
    position: relative;

    .createPost-main-container {
      padding: 20px 80px 20px 80px;

      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;

        .postInfo-container-item {
          float: left;
        }
      }
    }

    .word-counter {
      width: 40px;
      position: absolute;
      right: 10px;
      top: 0px;
    }
  }

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
