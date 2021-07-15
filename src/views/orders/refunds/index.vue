<template>
  <div class="app-container">
    <el-menu :default-active="queryParams.state" mode="horizontal" clearable @select="handleSearchState">
      <el-menu-item index="all">全部</el-menu-item>
      <el-menu-item index="refund_pending">待审核</el-menu-item>
      <el-menu-item index="refund_succeed">退款成功</el-menu-item>
      <el-menu-item index="refund_disagreed">拒绝退款</el-menu-item>
      <el-menu-item index="refund_cancelled">取消申请</el-menu-item>
    </el-menu>
    <br>

    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="搜索单号" prop="search">
        <el-input v-model="queryParams.search" placeholder="单号|商户单号" clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border>
      <el-table-column label="单号" prop="refund_no" align="center" />
      <el-table-column label="商户单号" prop="thirdparty_no" align="center">
        <template slot-scope="{ row }">
          <span>{{row.thirdparty_no || '无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" prop="nickname" align="center">
        <template slot-scope="{ row }">
          <span>{{row.user.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退款方式" prop="refund_method" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="退款状态" prop="refund_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="申请数量" prop="apply_qty" align="center" />
      <el-table-column label="申请金额" prop="apply_total" align="center" />
      <el-table-column label="退货状态" prop="shipment_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="物流单号" prop="express_no" align="center">
        <template slot-scope="{ row }">
          <span>{{row.express_no || '无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="applied_at" align="center" />
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleToDetail(row)" v-has-permission="['order.refund.show']">详情</el-button>
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
  import { getRefunds } from '@/api/orders/refund'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'OrderRefundList',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        total: 0,
        listLoading: true,
        queryParams: {},

        dictionaries: [],
        dictionaryByOrderType: {
          refund_method: 'order_refund_method',
          refund_state: 'order_refund_state',
          shipment_state: 'order_shipment_state',
        }
      }
    },
    created() {
      this.initQueryParams()

      this.getList()
      this.getDictionaries()
    },
    methods: {
      handleSearchState(key, keyPath) {
        this.queryParams.state = key
        this.handleSearch()
      },
      async getList() {
        this.listLoading = true
        const res = await getRefunds(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.listLoading = false
      },
      /**
       * 跳转到详情页
       */
      handleToDetail(row) {
        this.$router.push({
          path: `/orders/refunds/${row.id}`
        })
      },

      /** 初始化搜索参数 */
      initQueryParams() {
        this.queryParams = {
          page: 1,
          limit: 10,
          search: '',
          state: 'all',
        }
      },
      /** 搜索 */
      handleSearch() {
        this.getList()
      },
      /** 重置搜索 */
      handleResetSearch() {
        this.initQueryParams()
        this.resetForm('filterForm')
        this.handleSearch()
      },

      /**
       * 获取字典
       */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'order_refund_method',
            'order_refund_state',
            'order_shipment_state',
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
        if (this.dictionaries[this.dictionaryByOrderType[column.property]]) {
          return this.selectDictLabel(this.dictionaries[this.dictionaryByOrderType[column.property]], cellValue)
        }
        return cellValue
      },
    }
  }
</script>
<style>

</style>
