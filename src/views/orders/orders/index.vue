<template>
  <div class="app-container">
    <el-menu :default-active="queryParams.state" mode="horizontal" clearable @select="handleSearchState">
      <el-menu-item index="all">全部订单</el-menu-item>
      <el-menu-item index="payment_pending">待付款</el-menu-item>
      <el-menu-item index="shipment_pending">待发货</el-menu-item>
      <el-menu-item index="delivered">全部发货</el-menu-item>
      <el-menu-item index="partially_delivered">部分发货</el-menu-item>
      <el-menu-item index="has_applied_refund">退款待处理</el-menu-item>
      <el-menu-item index="refunded">全部退款</el-menu-item>
      <el-menu-item index="partially_refunded">部分退款</el-menu-item>
      <el-menu-item index="completed">已完成</el-menu-item>
      <el-menu-item index="cancelled">已取消</el-menu-item>
    </el-menu>
    <br>

    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="商品名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="订单流水号|商品名称" clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="isListLoading" :data="list" border>
      <el-table-column label="订单流水号" prop="no" align="center" />
      <el-table-column label="买家" prop="nickname" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.user.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单原价" prop="original_total" align="center" />
      <el-table-column label="实际支付" prop="payment_total" align="center" />
      <el-table-column label="调整价" prop="adjustment_total" align="center" />
      <el-table-column label="运费" prop="carriage_total" align="center" />
      <el-table-column label="订单状态" prop="order_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="支付状态" prop="payment_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="运输状态" prop="shipment_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="发货状态" prop="receiving_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="退货状态" prop="shipment_refund_state" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="支付时间" prop="paid_at" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.paid_at || '无' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleToDetail(row)" v-has-permission="['order.show']">详情</el-button>
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
  import { deepClone } from '@/utils'
  import { getOrders } from '@/api/orders/order'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'OrderList',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        total: 0,
        isListLoading: true,
        queryParams: {},

        dictionaries: [],
        dictionaryByOrderType: {
          order_state: 'order_state', // 订单状态字典
          payment_state: 'order_payment_state', // 支付状态字典
          shipment_state: 'order_shipment_state', // 运输状态字典
          receiving_state: 'order_receiving_state', // 订单收货状态字典
          shipment_refund_state: 'order_shipment_refund_state', // 订单退货状态字典
          refund_state: 'order_refund_state', // 订单退款状态字典
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
        this.isListLoading = true
        const res = await getOrders(this.queryParams)
        this.list = res.data
        this.total = res.meta.total
        this.isListLoading = false
      },

      /**
       * 跳转到详情页
       */
      handleToDetail(row) {
        this.$router.push({
          path: `/orders/orders/${row.id}`
        })
      },

      /** 初始化查询参数 */
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
            'order_state',
            'order_payment_state',
            'order_shipment_state',
            'order_receiving_state',
            'order_shipment_refund_state',
            'order_refund_state',
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
