<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="运费模版名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['express.fee.store']">添加运费模板</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="运费模板名称" prop="name" align="center" />
      <el-table-column label="是否默认" prop="is_default" align="center" :formatter="isDefaultFormat" />
      <el-table-column label="计费方式" prop="name" align="center" :formatter="feeTypeFormat" />
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['express.fee.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['express.fee.destroy']">删除</el-button>
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
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import {
    getDictionaryByType,
  } from '@/api/systems/dictionary'
  import {
    getFees,
    deleteFee
  } from '@/api/products/express'

  const defaultQueryParams = {
    page: 1,
    limit: 10,
    search: '',
  }

  export default {
    name: 'ExpressFee',
    components: { Pagination },
    data() {
      return {
        // 表单数据
        form: {},
        // 表单校验
        rules: {
          name: [
            { required: true, message: "物流公司名称必须填写", trigger: "blur" }
          ]
        },

        list: [],
        // 总条数
        total: 0,
        // 表单加载
        loading: true,
        // 查询参数
        queryParams: Object.assign({}, defaultQueryParams),

        dialogVisible: false,
        dialogTitle: '',

        // 字段 数据字典
        isDefaultOptions: [],
        feeTypeOptions: [],
      }
    },
    created() {
      this.getList()

      getDictionaryByType('normal_default').then(response => {
        this.isDefaultOptions = response.data.dictionaries
      })
      getDictionaryByType('express_fee_type').then(response => {
        this.feeTypeOptions = response.data.dictionaries
      })
    },
    methods: {
      /**
       * 拉取列表
       */
      async getList() {
        this.loading = true
        const res = await getFees(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.loading = false
      },

      /**
       * 字段转换
       */
      // 是否默认
      isDefaultFormat(row, column) {
        return this.selectDictLabel(this.isDefaultOptions, row.is_default)
      },
      // 计费类型
      feeTypeFormat(row, column) {
        return this.selectDictLabel(this.feeTypeOptions, row.fee_type)
      },
      /**
       * 添加
       */
      handleAdd() {
        this.$router.push({
          path: '/products/settings/expresses/fees/create'
        })
      },
      /**
       * 编辑
       */
      handleEdit(scope) {
        this.$router.push({
          path: `/products/settings/expresses/fees/${scope.row.id}`
        })
      },
      /**
       * 删除
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除运费模板吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteFee(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 搜索
       */
      handleSearch() {
        this.getList()
      },
      /**
       * 重置搜索
       */
      handleResetSearch() {
        this.queryParams = Object.assign({}, defaultQueryParams)
        this.resetForm('queryForm')
        this.handleSearch()
      },
    }
  }
</script>

<style lang="scss" scoped>
</style>
