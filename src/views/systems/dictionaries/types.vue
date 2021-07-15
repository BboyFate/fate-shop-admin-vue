<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="字典名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item label="创建时间">
          <el-date-picker v-model="dateRange" size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['system.dictionaryType.store']">添加字典类型</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="字典名称" prop="name" align="center" />
      <el-table-column label="字典类型" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-link type="primary">
            <router-link :to="'/systems/dictionaries/types/' + scope.row.id" class="link-type">
              <span>{{ scope.row.type }}</span>
            </router-link>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="is_disabled" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['system.dictionaryType.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['system.dictionaryType.destroy']">删除</el-button>
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
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="is_disabled">
          <el-radio-group v-model="form.is_disabled">
            <el-radio
              v-for="dict in dictionaries['normal_disable']"
              :key="dict.value"
              :label="dict.value">
              {{ dict.lavel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
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
  import {
    getDictionaryTypes,
    addDictionaryType,
    updateDictionaryType,
    deleteDictionaryType,
    getDictionaryTypesFilterTypes
  } from '@/api/systems/dictionary'

  export default {
    name: 'DictionaryType',
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
          name: [{ required: true, message: "字典类型名称不能为空", trigger: "blur" }],
          type: [{ required: true, message: "角色类型不能为空", trigger: "blur" }]
        },
        // 日期范围
        dateRange: [],

        dictionaries: [],
        dictionaryOptions: {
          is_disabled: 'normal_disable',
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
        const res = await getDictionaryTypes(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.isListLoading = false
      },
      /**
       * 添加字典类型
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加字典'
        this.dialogVisible = true
      },
      /**
       * 编辑字典类型
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑字典'
        this.dialogVisible = true
        this.form = deepClone(scope.row)
      },
      /**
       * 删除字典类型
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除字典类型？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteDictionaryType(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 确认提交字典类型表单
       */
       handleConfirmSubmit() {
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.isFormLoading = true

          if (this.form.id != undefined) {
            await updateDictionaryType(this.form.id, this.form).then(response => {
              const index = this.list.findIndex(role => role.id === this.form.id)
              this.list.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addDictionaryType(this.form).then(response => {
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

      /** 初始化表单数据 */
      initForm() {
        this.form = {
          id: undefined,
          name: undefined,
          type: undefined,
          remark: undefined,
          is_disabled: false
        }
      },
      /** 表单重置 */
      reset() {
        this.initForm()
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
      handleSearch() {
        this.getList()
      },
      /**
       * 重置搜索
       */
      handleResetSearch() {
        this.initQueryParams()
        this.dateRange = []
        this.resetForm('filterForm')
        this.handleSearch()
      },

      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'normal_disable',
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
