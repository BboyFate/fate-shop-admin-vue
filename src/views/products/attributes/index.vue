<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="模板名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['product.attributeTemplate.store']">添加模板</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="名称" prop="name" align="center" />
      <el-table-column label="属性规格" align="center">
        <template slot-scope="{ row }">
          {{ row.attributes | attributesFilter }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['product.attributeTemplate.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['product.attributeTemplate.destroy']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="规格" prop="attributes">
          <div class="attr-container">
            <div
              v-for="(attr, attrIndex) in form.attributes"
              :key="attrIndex"
              class="attr-group mb10"
            >
              <div class="attr-name">
                <span class="label">规格名：</span>
                <el-input v-model.trim="attr.name" class="input" aria-placeholder="请输入规格名" />
                <span class="remove" @click="handleDeleteAttr(attrIndex)"> X </span>
              </div>
              <div class="attr-values">
                <span class="label">规格值：</span>
                <el-popover
                  v-for="(attrValue, attrValueIndex) in attr.values"
                  placement="bottom"
                  width="120"
                  trigger="click"
                >
                  <el-input v-model.trim="attr.values[attrValueIndex]" />
                  <div slot="reference" class="attr-value-item">
                    <span class="remove" @click.stop="handleDeleteAttrValue(attrIndex, attrValueIndex)"> X </span>
                    <div class="text">{{ attrValue }}</div>
                  </div>
                </el-popover>
                <el-input
                  v-model="addAttrValues[attrIndex]"
                  class="input"
                  style="padding: 5px;"
                  suffix-icon="el-icon-plus"
                  placeholder="多个规格值以空格隔开"
                  @keyup.native.enter="enterAddAttrValue(attrIndex)"
                  @blur="enterAddAttrValue(attrIndex)"
                />
              </div>
            </div>
            <div class="attr-name">
              <el-button type="info" :disabled="disabled" @click="handleAddAttr">添加规格</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit" :loading="isFormLoading">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import { uniqueArray } from '@/utils'
  import {
    getTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate
  } from '@/api/products/attribute'

  export default {
    name: 'ProductAttributeTemplate',
    components: {
      Pagination
    },
    filters: {
      attributesFilter(attributes) {
        let str = ''
        attributes.forEach(attr => {
          str += attr.name + ':'
          attr.values.forEach(value => {
            str += value += ' '
          })
          str += ' | '
        })

        return str.substr(0, str.length - 2)
      }
    },
    data() {
      return {
        list: [],
        total: 0,
        isListLoading: true,
        queryParams: {},

        dialogVisible: false,
        dialogTitle: '',
        form: {},
        isFormLoading: false,
        rules: {
          name: [
            { required: true, message: "模板名称必须填写", trigger: "blur" }
          ]
        },

        addAttrValues: [],
        templateAttributes: []
      }
    },
    computed: {
      /** 有一个『没有商品规格名』时，不能再新增新的规格 */
      disabled() {
        return (
          this.form.attributes && this.form.attributes.some(attr => !attr.name) || false
        )
      }
    },
    created() {
      this.getList()
    },
    methods: {
      /**
       * 拉取列表
       */
      async getList() {
        this.isListLoading = true
        const res = await getTemplates(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.isListLoading = false
      },
      /**
       * 添加
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加模板'
        this.dialogVisible = true
      },
      /**
       * 编辑
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑模板'
        this.dialogVisible = true
        this.form = JSON.parse(JSON.stringify(scope.row))
      },
      /**
       * 删除
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除规格模板吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteTemplate(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 确认提交表单
       */
      handleConfirmSubmit() {
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.isFormLoading = true

          if (this.form.id != undefined) {
            await updateTemplate(this.form.id, this.form).then(response => {
              const index = this.list.findIndex(role => role.id === this.form.id)
              this.list.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addTemplate(this.form).then(response => {
              this.list.push(response.data)
              this.msgSuccess('新增成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          }
        })
      },

      /**
       * 添加规格
       */
      handleAddAttr() {
        this.form.attributes.push({
          name: '',
          values: []
        })
      },
      /**
       * 删除规格
       */
      handleDeleteAttr(attrIndex) {
        this.template.attributes.splice(attrIndex, 1)
      },
      /**
       * 添加规格值
       * @param attrIndex 规格 index
       */
      enterAddAttrValue(attrIndex) {
        let str = this.addAttrValues[attrIndex] || ''
        str = str.trim()
        if (!str) {
          return
        }

        const oldAttrValues = this.form.attributes[attrIndex].values
        const newAttrValues = str
          .split(/\s+/) // 使用空格分割成数组
          .filter(newAttrValue => !oldAttrValues.some(oldAttrValue => oldAttrValue === newAttrValue)) // 过滤掉已存在的商品规格值
          .map(newProductAttrValue => newProductAttrValue)

        this.form.attributes[attrIndex].values = uniqueArray([...oldAttrValues, ...newAttrValues])
        this.$set(this.addAttrValues, attrIndex, '')
      },
      /**
       * 删除规格值
       *
       * @param attrIndex 规格 index
       * @param attrValueIndex 规格值 index
       */
      handleDeleteAttrValue(attrIndex, attrValueIndex) {
        this.form.attributes[attrIndex].values.splice(attrValueIndex, 1)
      },

      /** 表单数据重置 */
      initForm() {
        this.form = {
          id: undefined,
          name: '',
          attributes: []
        }
      },
      /** 表单重置 */
      reset() {
        this.initForm()
        this.resetForm('form')
      },
      /** 搜索 */
      handleSearch() {
        this.getList()
      },
      /**
       * 重置搜索
       */
      handleResetSearch() {
        this.initForm()
        this.resetForm('filterForm')
        this.handleSearch()
      },
    }
  }
</script>

<style lang="sass" scoped>
  .attr-container
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

    .attr-group
      margin-bottom: 10px
      &:hover
        .attr_title .remove
          display: block

    .attr-name
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

    .attr-values
      padding: 10px 10px 0
      .input
        width: 250px
      .attr-value-item
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
