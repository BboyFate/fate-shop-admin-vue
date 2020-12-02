<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="模板名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button type="primary" @click="handleAddTemplate">添加模板</el-button>
    </div>

    <el-table
      :data="list"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="listLoading"
    >
      <el-table-column align="center" label="ID">
        <template slot-scope="{ row }">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="{ row }">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="属性规格">
        <template slot-scope="{ row }">
          {{ row.attributes | attributesFilter }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditTemplate(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeleteTemplate(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getTemplates" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑模板':'添加模板'">
      <el-form ref="templateForm" :model="template" :rules="templateFormRules" label-width="80px" label-position="right">
        <el-form-item label="名称" prop="name">
          <el-input v-model="template.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="规格" prop="attributes">
          <div class="attr-container">
            <div
              class="attr-group mb10"
              v-for="(attr, attrIndex) in template.attributes"
              :key="attrIndex"
            >
              <div class="attr-name">
                <span class="label">规格名：</span>
                <el-input class="input" aria-placeholder="请输入规格名" v-model.trim="attr.name"></el-input>
                <span class="remove" @click="handleDeleteAttr(attrIndex)"> X </span>
              </div>
              <div class="attr-values">
                <span class="label">规格值：</span>
                <el-popover
                  placement="bottom"
                  width="120"
                  trigger="click"
                  v-for="(attrValue, attrValueIndex) in attr.values"
                >
                  <el-input v-model.trim="attr.values[attrValueIndex]"></el-input>
                  <div class="attr-value-item" slot="reference">
                    <span class="remove" @click.stop="handleDeleteAttrValue(attrIndex, attrValueIndex)"> X </span>
                    <div class="text">{{ attrValue }}</div>
                  </div>
                </el-popover>
                <el-input
                  class="input"
                  style="padding: 5px;"
                  suffix-icon="el-icon-plus"
                  v-model="addAttrValues[attrIndex]"
                  placeholder="多个规格值以空格隔开"
                  @keyup.native.enter='enterAddAttrValue(attrIndex)'
                  @blur='enterAddAttrValue(attrIndex)'
                ></el-input>
              </div>
            </div>
            <div class="attr-name">
              <el-button type="info" :disabled="disabled" @click="handleAddAttr">添加规格</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {
  getTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate
} from '@/api/productAttributeTemplate'
import { uniqueArray, deepClone } from '@/utils'

const defaultTemplate = {
  id: undefined,
  name: '',
  attributes: [],
}

export default {
  name: 'Template',
  components: {
    Pagination,
  },
  computed: {
    /**
     *  有一个『没有商品规格名』时，不能再新增新的规格
     */
    disabled() {
      return (
        this.template.attributes.some(attr => !attr.name)
      )
    },
  },
  data() {
    return {
      template: Object.assign({}, defaultTemplate),
      loading: false,
      list: [],
      listTotal: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        include: '',
        fields: {

        }
      },

      dialogVisible: false,
      dialogType: 'edit',
      templateFormRules: {
        name: [{ required: true, trigger: 'blur', message: '模板名称必须填写' }],
      },

      addAttrValues: [],
      templateAttributes: [],
    }
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
    },
  },
  created() {
    this.getTemplates()
  },
  methods: {
    async getTemplates() {
      this.listLoading = true
      const res = await getTemplates(this.listQuery)
      this.list = res.data
      this.listTotal = res.meta.total
      this.listLoading = false
    },
    handleAddTemplate(){
      this.template = Object.assign({}, defaultTemplate)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEditTemplate(template){
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.template = deepClone(template)
      this.$nextTick(() => {
        this.$refs['templateForm'].clearValidate()
      })
    },
    handleDeleteTemplate({ $index, row }) {
      this.$confirm('确定删除模板吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteTemplate(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
    },

    /**
     * 列表搜索
     */
    handleFilter() {
      this.listQuery.page = 1
      this.getTemplates()
    },

    /**
     * 类目表单提交
     */
    submitForm() {
      this.$refs['templateForm'].validate(async (valid) => {
        if (valid) {
          const isEdit = this.dialogType === 'edit'
          this.loading = true

          if (isEdit) {
            const result = await updateTemplate(this.template.id, this.template)
            const index = this.list.findIndex(v => v.id === this.template.id)
            this.list.splice(index, 1, Object.assign(this.template, result.data))
          } else {
            const { data } = await addTemplate(this.template)
            this.template.id = data.id
            this.list.unshift(this.template)
          }

          this.loading = false
          this.dialogVisible = false
          this.$notify({
            title: `成功`,
            dangerouslyUseHTMLString: true,
            message: `
              <div>模板名称: ${this.template.name} </div>
            `,
            type: 'success'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    handleAddAttr() {
      this.template.attributes.push({
        name: '',
        values: []
      })
    },
    handleDeleteAttr(attrIndex) {
      this.template.attributes.splice(attrIndex, 1)
    },
    enterAddAttrValue(attrIndex) {
      let str = this.addAttrValues[attrIndex] || ''
      str = str.trim()
      if (!str) {
        return
      }

      const oldAttrValues = this.template.attributes[attrIndex].values
      const newAttrValues = str
        .split(/\s+/) // 使用空格分割成数组
        .filter(newAttrValue => !oldAttrValues.some(oldAttrValue => oldAttrValue === newAttrValue)) // 过滤掉已存在的商品规格值
        .map(newProductAttrValue => newProductAttrValue)

      this.template.attributes[attrIndex].values = uniqueArray([...oldAttrValues, ...newAttrValues])
      this.$set(this.addAttrValues, attrIndex, '')
    },
    handleDeleteAttrValue(attrIndex, attrValueIndex) {
      this.template.attributes[attrIndex].values.splice(attrValueIndex, 1)
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
