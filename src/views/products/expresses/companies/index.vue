<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="物流公司" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['express.company.store']">添加物流公司</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="物流公司" prop="name" align="center" />
      <el-table-column label="排序" prop="sorted" align="center" />
      <el-table-column label="是否默认" prop="is_default" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="是否显示" prop="is_showed" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['express.company.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['express.company.destroy']">删除</el-button>
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
        <el-form-item label="公司名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物流公司名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sorted">
          <el-input-number v-model="form.sorted" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="是否默认" prop="is_default">
          <el-radio-group v-model="form.is_default">
            <el-radio
              v-for="dict in dictionaries['normal_default']"
              :key="dict.value"
              :label="dict.value">
              {{ dict.lavel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示" prop="is_showed">
          <el-radio-group v-model="form.is_showed">
            <el-radio
              v-for="dict in dictionaries['normal_show']"
              :key="dict.value"
              :label="dict.value">
              {{ dict.lavel }}
            </el-radio>
          </el-radio-group>
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
  import { deepClone } from '@/utils'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'
  import {
    getCompanies,
    addCompany,
    updateCompany,
    deleteCompany
  } from '@/api/products/express'

  export default {
    name: 'ExpressCompany',
    components: { Pagination },
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
          name: [{ required: true, message: "物流公司名称必须填写", trigger: "blur" }]
        },

        dictionaries: [],
        dictionaryOptions: {
          is_default: 'normal_default',
          is_showed: 'normal_show',
        }
      }
    },
    created() {
      this.initForm()
      this.initQueryParams()

      this.getList()
      this.getDictionaries()
    },
    methods: {
      /**
       * 拉取列表
       */
      async getList() {
        this.isListLoading = true
        const res = await getCompanies(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.isListLoading = false
      },
      /**
       * 添加
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加字典'
        this.dialogVisible = true
      },
      /**
       * 编辑
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑字典'
        this.dialogVisible = true
        this.form = deepClone(scope.row)
      },
      /**
       * 删除
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除物流公司吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteCompany(row.id).then(response => {
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
            await updateCompany(this.form.id, this.form).then(response => {
              const index = this.list.findIndex(role => role.id === this.form.id)
              this.list.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addCompany(this.form).then(response => {
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

      /** 初始化搜索参数 */
      initQueryParams() {
        this.queryParams = {
          page: 1,
          limit: 10,
          search: '',
        }
      },
      /** 初始化表单数据 */
      initForm() {
        this.form = {
          id: undefined,
          name: undefined,
          sorted: 0,
          is_default: false,
          is_showed: true,
        }
      },
      /** 表单重置 */
      reset() {
        this.initForm()
        this.resetForm('form')
      },
      /**
       * 搜索
       */
      handleSearch() {
        this.getList()
      },
      /** 重置搜索 */
      handleResetSearch() {
        this.initQueryParams()
        this.resetForm('filterForm')
        this.handleSearch()
      },

      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'normal_default',
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
