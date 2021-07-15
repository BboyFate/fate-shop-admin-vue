<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="商品名称" prop="search">
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['product.normal.store']">添加商品</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="商品图片" prop="image" align="center" >
        <template slot-scope="scope">
          <a :href="scope.row.image" style="color: #42b983" target="_blank">
            <img :src="scope.row.image" alt="点击打开图片" class="el-avatar">
          </a>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="title" align="center" />
      <el-table-column label="类目" align="center">
        <template slot-scope="scope">
          {{ scope.row.category.full_name }}
        </template>
      </el-table-column>
      <el-table-column label="上架" prop="on_sale" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="价格" prop="price" align="center" />
      <el-table-column label="销量" prop="sold_count" align="center" />
      <el-table-column label="评论数" prop="review_count" align="center" />
      <el-table-column label="创建时间" prop="created_at" align="center" />
      <el-table-column label="更新时间" prop="updated_at" align="center" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['product.normal.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['product.normal.destroy']">删除</el-button>
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
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'
  import {
    getProducts,
    deleteProduct
  } from '@/api/products/product'

  const defaultQueryParams = {
    page: 1,
    limit: 10,
    search: '',
  }

  export default {
    name: 'ProductNormal',
    components: { Pagination },
    data() {
      return {
        // 日期范围
        dateRange: [],
        list: [],
        // 总条数
        total: 0,
        // 表单加载
        loading: true,
        // 查询参数
        queryParams: Object.assign({}, defaultQueryParams),

        dialogVisible: false,
        dialogTitle: '',

        dictionaries: [],
        dictionaryOptions: {
          on_sale: 'product_sale',
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
        this.loading = true
        const res = await getProducts(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.loading = false
      },

      /**
       * 上架字段 转换
       */
      onSaleFormat(row, column) {
        return this.selectDictLabel(this.onSaleOptions, row.on_sale)
      },
      /**
       * 添加商品
       */
      handleAdd() {
        this.$router.push({
          path: '/products/products/create'
        })
      },
      /**
       * 编辑商品
       */
      handleEdit(scope) {
        this.$router.push({
          path: `/products/products/${scope.row.id}`
        })
      },
      /**
       * 删除字典类型
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除商品吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteProduct(row.id).then(response => {
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
        this.dateRange = []
        this.resetForm('queryForm')
        this.handleSearch()
      },

      /**
       * 获取字典
       */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'product_sale',
          ]
        }).then(response => {
          for (const index in response.data) {
            let type = response.data[index]
            this.$set(this.dictionaries, type.type, type.dictionaries)
          }
        })
      },
      /**
       * 字典转换
       */
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
