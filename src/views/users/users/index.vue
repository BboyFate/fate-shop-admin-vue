<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="会员名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入..." clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item label="注册时间">
          <el-date-picker v-model="queryParams.created_at" size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="会员 ID" prop="id" align="center" />
      <el-table-column label="昵称" prop="nickname" align="center" />
      <el-table-column label="头像" prop="avatar" align="center">
        <template slot-scope="scope">
          <a v-if="scope.row.avatar" :href="scope.row.avatar" target="_blank">
            <img :src="scope.row.avatar" alt="点击打开" class="el-avatar">
          </a>
        </template>
      </el-table-column>
      <el-table-column label="手机号码" prop="phone" align="center" />
      <el-table-column label="注册来源" prop="registered_source" align="center" />
      <el-table-column label="注册时间" prop="created_at" align="center" width="220" />
      <el-table-column label="活动时间" prop="last_actived_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleToDetail(scope.row)" v-has-permission="['user.show']">详情</el-button>
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
  import { getUsers } from '@/api/users/user'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'DictionaryType',
    components: { Pagination },
    data() {
      return {
        list: [],
        total: 0,
        isListLoading: true,
        queryParams: {},
        // 日期范围
        dateRange: [],

        dictionaries: [],
        dictionaryOptions: {
          is_disabled: 'normal_disable',
        }
      }
    },
    created() {
      this.initQueryParams()
      this.getList()
      // this.getDictionaries()
    },
    methods: {
      /**
       * 拉取列表
       */
      async getList() {
        this.isListLoading = true
        const res = await getUsers(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.isListLoading = false
      },
      /**
       * 编辑
       */
      handleToDetail(row) {
        this.$router.push({
          path: `/users/users/${row.id}`
        })
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
