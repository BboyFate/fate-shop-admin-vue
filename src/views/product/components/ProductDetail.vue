<template>
  <div class="createPost-container">
    <el-form
      ref="postForm"
      :model="postForm"
      :rules="rules"
      class="form-container"
      label-position="top"
      label-width="80px"
    >
      <sticky :z-index="10" :class-name="'sub-navbar'">
        <OnSaleDropdown v-model="postForm.on_sale" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          提交
        </el-button>
      </sticky>

      <div class="createPost-main-container">

        <el-form-item label="商品名称" prop="title">
          <el-input v-model="postForm.title" placeholder="" />
        </el-form-item>

        <el-form-item label="商品长标题" prop="long_title">
          <el-input v-model="postForm.long_title" placeholder="" />
        </el-form-item>

        <el-form-item label="类目" prop="category">
          <el-select
            v-model="postForm.category.full_name"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="categoriesRemote"
            @change="handleChangeCategory"
            :loading="loading">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="image" label="商品封面图">
          <el-image v-if="postForm.image" style="width: 100px; height: 100px" :src="postForm.image" @click="isSelectImageShowed=true"></el-image>
          <i v-else class="el-icon-picture" style="font-size: 100px;" @click="isSelectImageShowed=true"></i>
        </el-form-item>

        <template v-if="this.productType === 'crowdfunding'">
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

        <el-form-item prop="description" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.description" :height="400" />
        </el-form-item>

        <el-form-item prop="" label="选择规格" label-position="top">
          <el-button type="primary" size="small" @click="newSkuAttributeVisible=true">添加新规格</el-button>
          <el-button type="primary" size="small" @click="handleGenerateSkuTable">重新生成 SKU 列表</el-button>
          <div v-for="(attribute, index) in postForm.sku_attributes" :key="'attr' + index">
            <div>
              <el-tag
                type="danger"
                closable
                @close="handleCloseSkuAttr(index)">
                {{ attribute.name }}
              </el-tag>
            </div>
            <el-tag
              v-for="v in attribute.value"
              :key="v"
              closable
              :disable-transitions="false"
              @close="handleCloseSkuAttrValue(v, index)">
              {{ v }}
            </el-tag>

            <el-input
              v-show="thisCurrentSkuAttrInputIndex === index"
              ref="saveSkuAttrInput"
              v-model="attrValueInputValue"
              class="input-new-tag"
              size="small"
              @keyup.enter.native="handleAttrValueInputConfirm(index)"
              @blur="handleAttrValueInputConfirm(index)"
            >
            </el-input>
            <el-button v-show="thisCurrentSkuAttrInputIndex !== index" class="button-new-tag" size="small" @click="handleShowSkuAttrValueInput(index)">+ 添加</el-button>
          </div>
        </el-form-item>

        <el-table
          :data="postForm.skus"
        >
          <el-table-column
            label="属性">
            <template slot-scope="{ row }">
              {{ row.attributes | attrFilter }}
            </template>
          </el-table-column>

          <el-table-column
            prop="image"
            label="图片">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.image"
                style="width: 100px; height: 100px"
                :src="scope.row.image"
                @click="handleSkuAttrImage(scope.$index, scope.row)"
                fit="cover"></el-image>
              <i v-else class="el-icon-picture" style="font-size: 100px;" @click="handleSkuAttrImage(scope.$index, scope.row)"></i>
            </template>
          </el-table-column>
          <el-table-column
            label="名称">
            <template slot-scope="{ row }">
              <el-form-item prop="skus">
                <el-input v-model="row.name" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="price"
            label="价格">
            <template slot-scope="{ row }">
              <el-form-item prop="skus">
                <el-input-number v-model="row.price" :min="0"></el-input-number>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="stock"
            label="库存">
            <template slot-scope="{ row }">
              <el-form-item prop="skus">
                <el-input-number v-model="row.stock" :min="0"></el-input-number>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ $index }">
              <el-button
                size="mini"
                type="danger"
                @click="handleSkuDelete($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <el-dialog title="添加新规格" :visible.sync="newSkuAttributeVisible">
      <el-form :inline="true" :model="newSkuAttribute">
        <el-form-item label="规格名称">
          <el-input v-model="newSkuAttribute.name" placeholder="请输入规格名称"></el-input>
        </el-form-item>
        <el-form-item label="规格值">
          <el-input v-model="newSkuAttribute.value" placeholder="请输入规格名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onNewSkuAttrSubmit">确认</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <fate-image :is-showed.sync="isSelectImageShowed" @get-selected-images="handleSelectedImages" />
  </div>
</template>

<script>
import FateImage from '@/components/FateImage'
import Tinymce from '@/components/Tinymce'
import Sticky from '@/components/Sticky' // 粘性header组件
import {
  getProduct,
  updateProduct,
  addProduct,
  deleteProductSku,
  deleteProductSkus,
  addCrowdfundingProduct,
  updateCrowdfundingProduct,
  productSkuAttrFormat,
} from '@/api/product'
import { getSomeCategories } from '@/api/productCategory'
import { OnSaleDropdown } from './Dropdown'
import { deepClone } from '@/utils'

const defaultForm = {
  id: undefined,
  title: '', // 商品名称
  long_title: '', // 商品长标题
  description: '', // 商品描述
  image: '', // 文章图片
  banners: [],
  on_sale: false,
  category: {
    id: undefined,
    full_name: '',
  },
  type: 'normal',
  skus: [],
  sku_attributes: [],
  crowdfunding: {
    target_amount: 0,
    end_at: undefined,
  }
}

const defaultSku = {
  name: '',
  image: '',
  price: 0,
  stock: 0,
}

const ruleFieldMap =  {
  image: '商品封面图',
  title: '商品标题',
  long_title: '商品长标题',
  category: '类目',
  description: '商品详情描述',
}

export default {
  name: 'ProductDetail',
  components: { Tinymce, Sticky, FateImage, OnSaleDropdown },
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
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(ruleFieldMap[rule.field] + ' 为必填项'))
      } else {
        callback()
      }
    }

    return {
      postForm: Object.assign({}, defaultForm),
      categoryId: undefined,
      categories: [],
      loading: false,
      userListOptions: [],
      rules: {
        image: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        long_title: [{ validator: validateRequire }],
        description: [{ validator: validateRequire }],
        skus: {
          type: 'array',
          required: true,
          defaultField: {
            type: 'object', required: true,
            fields: {
              image: { type: 'url', validator: validateRequire },
              name: { required: true, trigger: 'blur', message: 'SKU 名称必须填写' },
              price: { type: 'number', required: true, trigger: 'blur', message: '价格必须填写' },
              stock: { type: 'number', required: true, trigger: 'blur', message: '库存必须填写' },
            }
          },
        },
        crowdfunding: {
          type: 'object',
          required: false,
          fields: {
            target_amount: { type: 'number', required: true, trigger: 'blur', message: '众筹金额必须填写' },
            end_at: { required: true, trigger: 'blur', message: '众筹结束日期必须填写' },
          }
        }
      },
      deleteSkus: [],

      imageOrigin: '',  // 为了判断图片来源在哪里
      changingSkuIndex: undefined, // 当前点击的某个 SKU 下标
      isSelectImageShowed: false, // 显示拉取图片列表

      newSkuAttribute: {}, // 新增 SKU 属性
      generateNewSkuAttributes: [],  // 生成新的 SKU 属性
      newSkuAttributeVisible: false,  // 显示新增 SKU 属性表单
      attrValueInputValue: '',
      thisCurrentSkuAttrInputIndex: undefined,

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
    }
  },
  created() {
    console.log('created')
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.getProduct(id)
    }
  },
  methods: {
    // 点击 SKU 列表的某个图片
    handleSkuAttrImage($index) {
      this.imageOrigin = 'skuImage'
      this.isSelectImageShowed = true
      this.changingSkuIndex = $index
    },
    // 删除某个 SKU
    handleSkuDelete($index) {
      this.$confirm('确定删除此 SKU 吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const sku = this.postForm.skus[$index]
          if (sku.id) {
            await deleteProductSku(sku.id)
          }

          this.postForm.skus.splice($index, 1)

          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    // 删除 SKU 的属性
    handleCloseSkuAttr(index) {
      if (this.postForm.sku_attributes.length === 1) {
        this.$message({
          message: 'SKU 的属性最少保留一个',
          type: 'error'
        })
        return false
      }

      const attr = this.postForm.sku_attributes[index]
      this.$confirm('SKU 相关『' + attr.name + '』的都会删除，确定吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          this.postForm.skus.forEach(({attributes, id}, skuIndex) => {
            attributes.forEach((attribute, attrIndex) => {
              if (attribute.name === attr.name) {
                this.postForm.skus[skuIndex].attributes.splice(attrIndex, 1)
              }
            })
          })

          this.postForm.sku_attributes.splice(index, 1)
        })
    },
    // 删除 SKU 的属性值
    handleCloseSkuAttrValue(value, index) {
      this.$confirm('SKU 相关『' + value + '』的都会删除，确定吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const deleteSkuIds = []
          this.postForm.skus.forEach((sku, skuIndex) => {
            sku.attributes.forEach((attribute) => {
              if (attribute.value === value) {

                if (sku.id) {
                  deleteSkuIds.push(sku.id)
                }

                this.postForm.skus.splice(skuIndex, 1)
              }
            })
          })

          if (deleteSkuIds && deleteSkuIds.length > 0) {
            await deleteProductSkus({sku_ids: deleteSkuIds})
          }

          let thisAttribute = this.postForm.sku_attributes[index].value
          thisAttribute.splice(thisAttribute.indexOf(value), 1)
        })

    },
    // 添加新 SKU 规格
    onNewSkuAttrSubmit() {
      this.postForm.sku_attributes.push({
        name: this.newSkuAttribute.name,
        value: [this.newSkuAttribute.value],
      })

      this.getProductSkuAttrFormat(this.postForm.sku_attributes)
        .then(() => {
          this.generateNewSkuAttributes.forEach((value) => {
            let attributes = []
            Object.keys(value.attribute).forEach(function(key){
              attributes.push({
                name: key,
                value: value.attribute[key],
              })
            })

            this.postForm.skus.unshift(Object.assign({
              attributes: attributes
            }, defaultSku))
          })
        })

      this.newSkuAttribute = {}
      this.newSkuAttributeVisible = false
    },
    // 显示新增 SKU 规格值的输入框
    handleShowSkuAttrValueInput(index) {
      this.thisCurrentSkuAttrInputIndex = index
      this.$nextTick(_ => {
        this.$refs.saveSkuAttrInput[index].$refs.input.focus()
      })
    },
    // 新增 SKU 规格值
    handleAttrValueInputConfirm(index) {
      let inputValue = this.attrValueInputValue;
      if (inputValue) {
        this.postForm.sku_attributes[index].value.push(inputValue)

        let attributes = deepClone(this.postForm.sku_attributes)
        attributes[index] = {
          name: this.postForm.sku_attributes[index].name,
          value: [inputValue],
        }

        this.getProductSkuAttrFormat(attributes)
          .then(() => {
            this.generateNewSkuAttributes.forEach((value) => {
              let attributes = []
              Object.keys(value.attribute).forEach(function(key){
                attributes.push({
                  name: key,
                  value: value.attribute[key],
                })
              })

              this.postForm.skus.unshift(Object.assign({
                attributes: attributes
              }, defaultSku))
            })
          })
      }

      this.thisCurrentSkuAttrInputIndex = undefined
      this.attrValueInputValue = ''
    },
    // 生成新的 SKU 列表
    handleGenerateSkuTable() {
      this.$confirm('确定重新生成 SKU 吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.postForm.sku_attributes.length === 0) {
            this.$message({
              message: '请先添加新的 SKU 规格',
              type: 'error'
            })
            return false
          }

          this.getProductSkuAttrFormat(this.postForm.sku_attributes)
            .then(() => {
              this.postForm.skus = []
              this.generateNewSkuAttributes.forEach((value) => {
                let attributes = []
                Object.keys(value.attribute).forEach(function(key){
                  attributes.push({
                    name: key,
                    value: value.attribute[key],
                  })
                })
                this.postForm.skus.push(Object.assign({
                  attributes: attributes
                }, defaultSku))
              })

              this.$message({
                type: 'success',
                message: '生成成功'
              })

              this.$nextTick(() => {
                this.$refs['postForm'].clearValidate()
              })
            })
        })
        .catch(err => { console.error(err) })
    },
    // 获取商品封面图片
    handleSelectedImages(images) {
      if (! this.imageOrigin) {
        this.postForm.image = images[0].path
      } else if (this.imageOrigin === 'skuImage') {
        this.postForm.skus[this.changingSkuIndex].image = images[0].path
      }
    },
    // 获取格式化后的 SKU 的规格属性
    async getProductSkuAttrFormat(attributes) {
      await productSkuAttrFormat({attributes: attributes}).then(response => {
        this.generateNewSkuAttributes = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    // 下拉款搜索分类
    async categoriesRemote(query) {
      if (query !== '') {
        this.loading = true;

        await getSomeCategories({ search: query}).then(response => {
          this.categories = response.data
        }).catch(err => {
          console.log(err)
        })

        this.loading = false;
      } else {
        this.categories = [];
      }
    },
    handleChangeCategory(value) {
      this.categoryId = value
    },

    async getProduct(id) {
      await getProduct(id).then(response => {
        this.postForm = response.data
      }).catch(err => {
        console.log(err)
      })
    },

    submitForm() {
      if (this.postForm.skus.length === 0) {
        this.$message({
          message: '请生成 SKU 列表并填入相关信息',
          type: 'error'
        })
        return false
      }

      this.$refs.postForm.validate(async (valid) => {
        const postForm = this.postForm
        const postData = {
          category_id: postForm.category.id || this.categoryId ,
          sku_attributes: postForm.sku_attributes,
          skus: postForm.skus,
          description: postForm.description,
          title: postForm.title,
          long_title: postForm.long_title,
          image: postForm.image,
          banners: postForm.banners,
          on_sale: postForm.on_sale,
          target_amount: postForm.crowdfunding.target_amount,
          end_at: postForm.crowdfunding.end_at,
        }

        console.log('postForm', postForm)
        console.log('postData', postData)
        if (valid) {
          const postForm = this.postForm
          const postData = {
            category_id: postForm.category.id || this.categoryId ,
            sku_attributes: postForm.sku_attributes,
            skus: postForm.skus,
            description: postForm.description,
            title: postForm.title,
            long_title: postForm.long_title,
            image: postForm.image,
            banners: postForm.banners,
            on_sale: postForm.on_sale,
            target_amount: postForm.crowdfunding.target_amount,
            end_at: postForm.crowdfunding.end_at,
          }

          console.log('postForm', postForm)
          console.log('postData', postData)

          this.loading = true

          if (this.isEdit) {

            if (this.productType === 'crowdfunding') {
              await updateCrowdfundingProduct(postForm.id, postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('编辑众筹商品成功')
                })
                .catch((err) => {
                  console.log('error')
                })
            } else {
              await updateProduct(postForm.id, postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('编辑商品成功')
                })
                .catch((err) => {
                  console.log('error')
                })
            }
          } else {
            if (this.productType === 'crowdfunding') {
              await addCrowdfundingProduct(postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('新增众筹商品成功')
                })
                .catch((err) => {
                  console.log('error')
                })
            } else {
              await addProduct(postData)
                .then((res) => {
                  this.postForm = res.data
                  this.productNotify('新增商品成功')
                })
                .catch((err) => {
                  console.log('error')
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
      padding: 40px 45px 20px 50px;

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
