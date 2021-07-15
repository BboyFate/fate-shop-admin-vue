<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="字典名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleFilter" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleFilter">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['product.category.store']">添加类目</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="名称" prop="name" align="center" />
      <el-table-column label="关联名称" prop="full_name" align="center" />
      <el-table-column label="层级" prop="level" align="center" />
      <el-table-column label="图片" align="center">
        <template slot-scope="{ row }">
          <img v-if="row.image" :src="row.image" style="width:80px;height:80px;">
          <el-tag v-else type="warning">无图片</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sorted" align="center" />
      <el-table-column label="显示状态" prop="is_showed" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['product.category.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['product.category.destroy']">删除</el-button>
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
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类目名称" />
        </el-form-item>
        <el-form-item label="上级类目" prop="parent_id">
          <el-cascader
            v-model="form.parent_id"
            :options="categoriesTree"
            :props="{ checkStrictly: true }"
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="类目图片" prop="image">
          <app-material :usedMaterials.sync="form.image" type="image" :maximum="1" :width="150" :height="150"/>
        </el-form-item>
        <el-form-item label="排序" prop="sorted">
          <el-input-number v-model="form.sorted" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="显示" prop="is_showed">
          <el-switch v-model="form.is_showed" />
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
  import AppMaterial from '@/components/AppMaterial'
  import { generateCategorySelector } from '@/utils'
  import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
  } from '@/api/products/category'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'ProductCategory',
    components: {
      Pagination,
      AppMaterial
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
          name: [{ required: true, message: "类目名称不能为空", trigger: "blur" }],
          sorted: [{ required: true, trigger: 'blur', message: '类目排序必须填写' }],
          parent_id: [
            {
              required: true,
              trigger: 'blur',
              validator: (rule, value, callback) => {
                if (value === '') {
                  callback(new Error('请选择一个上级类目'))
                } else {
                  callback()
                }
              }
            }
          ]
        },

        categoriesTree: [],

        dictionaries: [],
        dictionaryOptions: {
          is_showed: 'normal_show', // 显示状态
        }
      }
    },
    created() {
      this.getList()
      this.getDictionaries()
    },
    methods: {
      /**
       * 拉取列表
       */
      async getList() {
        this.isListLoading = true

        const res = await getCategories(this.queryParams)
        this.list = res.data.data
        this.total = res.meta.total

        this.isListLoading = false

        this.categoriesTree = generateCategorySelector(res.data.categoriesTree)
        this.categoriesTree.unshift({
          value: 0,
          label: '顶级类目'
        })
      },
      /** 添加 */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加类目'
        this.dialogVisible = true
      },
      /** 编辑 */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑类目'
        this.dialogVisible = true

        const form = JSON.parse(JSON.stringify(scope.row))
        form.image = [form.image]
        this.form = form
      },
      /** * 删除 */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除类目吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
            await deleteCategory(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          }).catch(err => { console.error(err) })
      },
      /** 确认提交表单 */
      handleConfirmSubmit() {
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.isFormLoading = true

          // 取出 parent_id
          if (this.form.parent_id.length > 0) {
            this.form.parent_id = this.form.parent_id.pop()
          }

          const formData = JSON.parse(JSON.stringify(this.form))
          formData.image = formData.image[0]

          if (this.form.id != undefined) {
            await updateCategory(this.form.id, formData).then(response => {
              const index = this.list.findIndex(role => role.id === this.form.id)
              this.list.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addCategory(formData).then(response => {
              this.list.push(response.data)
              this.msgSuccess('新增成功')
              this.isFormLoading = false
              this.dialogVisible = false
            }).catch(err => {
              this.isFormLoading = false
            })
          }
        })
      },

      /** 表单重置 */
      reset() {
        this.form = {
          id: undefined,
          name: '',
          level: 0,
          parent_id: 0,
          image: [],
          sorted: '',
          is_showed: true
        }

        this.resetForm('form')
      },

      /** 初始化查询参数 */
      initQueryParams() {
        this.queryParams = {
          page: 1,
          limit: 10,
          search: '',
        }
      },
      /** 搜索 */
      handleFilter() {
        this.getList()
      },
      /** 重置搜索 */
      handleResetSearch() {
        this.initQueryParams()
        this.resetForm('filterForm')
        this.handleFilter()
      },
      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'normal_show',
          ]
        }).then(response => {
          for (const index in response.data) {
            let type = response.data[index]
            this.$set(this.dictionaries, type.type, type.dictionaries)
          }
        })
      },
      /** 字典转换 */
      dictionaryFormat(row, column, cellValue) {
        if (this.dictionaries[this.dictionaryOptions[column.property]]) {
          return this.selectDictLabel(this.dictionaries[this.dictionaryOptions[column.property]], cellValue)
        }
        return cellValue
      },
    }
  }
</script>

<style lang="scss" scoped>
</style>
