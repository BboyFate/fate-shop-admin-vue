<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="订单流水号|商品名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.ship_status" placeholder="物流" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in shipStatusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.refund_status" placeholder="退款状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in refundStatusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      :data="list"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="listLoading"
    >
      <el-table-column align="center" label="订单流水号">
        <template slot-scope="{ row }">
          {{ row.no }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="买家">
        <template slot-scope="{ row }">
          {{ row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="总金额">
        <template slot-scope="{ row }">
          {{ row.total_amount }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="退款状态">
        <template slot-scope="{ row }">
          <el-tag :type="row.refund_status | refundStatusStyleFilter">
            {{ row.refund_status | refundStatusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="物流">
        <template slot-scope="{ row }">
          <el-tag :type="row.ship_status | shipStatusStyleFilter">
            {{ row.ship_status | shipStatusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="支付时间">
        <template slot-scope="{ row }">
          {{ row.paid_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button size="mini" icon="el-icon-view" circle @click="hanldeOrderDetail(row)"></el-button>
          <el-button v-if="
          row.ship_status === 'pending' &&
          (row.refund_status !== 'success' && (row.type !== 'crowdfunding' || row.items[0].product.crowdfunding.status === 'success'))
          " type="primary" size="small" @click="handleShip(row)">发货</el-button>
          <el-button v-if="row.refund_status === 'applied'" type="primary" size="small" @click="handleRefund(row)">处理退款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getOrders" />

    <!-- 发货 -->
    <el-dialog :visible.sync="shipDialog" title="发货">
      <el-form ref="shipForm" :model="orderShip" :rules="shipFormRules" label-width="80px" label-position="left">
        <el-form-item label="快递公司" prop="express_company">
          <el-input v-model="orderShip.express_company" placeholder="请输入快递公司" />
        </el-form-item>
        <el-form-item label="快递单号" prop="express_no">
          <el-input v-model="orderShip.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="shipDialog=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmShip">确认</el-button>
      </div>
    </el-dialog>

    <!-- 处理退款 -->
    <el-dialog :visible.sync="refundDialog" title="处理退款" center width="20%">
      <div style="text-align:center;">
        <el-button type="danger" @click="handleDisagreeRefund">拒绝退款</el-button>
        <el-popover
          style="margin-left: 20px;"
          placement="top"
          width="160"
          v-model="agreeRefundVisible">
          <p>确认同意退款吗？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="agreeRefundVisible=false">取消</el-button>
            <el-button type="primary" size="mini" :loading="loading" @click="confirmAgreeRefund">确认退款</el-button>
          </div>
          <el-button slot="reference">同意退款</el-button>
        </el-popover>
      </div>
    </el-dialog>

    <!-- 退款表单 -->
    <el-dialog :visible.sync="disagreeRefundDialog" title="同意退款">
      <el-form ref="disagreeRefundForm" :model="orderRefund" :rules="refundFormRules" label-width="80px" label-position="left">
        <el-form-item label="拒绝理由" prop="reason">
          <el-input v-model="orderRefund.reason" placeholder="请输入拒绝的理由" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="disagreeRefundDialog=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmDisagreeRefund">拒绝退款</el-button>
      </div>
    </el-dialog>

    <!-- 订单详情 -->
    <el-dialog title="订单详情" :visible.sync="orderDetailVisible">
      <el-form v-if="orderDetailVisible==true" class="demo-table-expand" label-width="auto">
        <el-form-item label="订单流水号">
          <span>{{ order.no }}</span>
        </el-form-item>
        <el-form-item label="买家">
          <span>{{ order.user.nickname }}</span>
        </el-form-item>
        <el-form-item label="支付时间">
          <span>{{ order.paid_at }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <span>{{ order.payment_method }}</span>
        </el-form-item>
        <el-form-item label="支付渠道单号">
          <span>{{ order.payment_no }}</span>
        </el-form-item>
        <el-form-item label="订单金额">
          <span>{{ order.total_amount }}</span>
        </el-form-item>
        <el-form-item label="发货状态">
          <span>{{ order.ship_status | shipStatusFilter}}</span>
        </el-form-item>
        <div v-if="order.ship_data">
          <el-form-item label="物流公司">
            <span>{{ order.ship_data.express_company }}</span>
          </el-form-item>
          <el-form-item label="物流单号">
            <span>{{ order.ship_data.express_no }}</span>
          </el-form-item>
        </div>

        <div class="border-line"></div>

        <el-form-item label="商品列表"></el-form-item>
        <div v-for="(item, index) in order.items" :key="item.id">
          <div class="border-dashed"></div>
          <el-form-item :label="'商品 ' + (index + 1)">
            <span>{{ item.product.title }}</span>
          </el-form-item>
          <el-form-item label="单价">
            <span>{{ item.price }}</span>
          </el-form-item>
          <el-form-item label="数量">
            <span>{{ item.amount }}</span>
          </el-form-item>
        </div>

        <div class="border-line"></div>

        <el-form-item label="收货人">
          <span>{{ order.address.contact_name }}</span>
        </el-form-item>
        <el-form-item label="收货号码">
          <span>{{ order.address.contact_phone }}</span>
        </el-form-item>
        <el-form-item label="收货邮编">
          <span>{{ order.address.zip }}</span>
        </el-form-item>
        <el-form-item label="收货地址">
          <span>{{ order.address.address }}</span>
        </el-form-item>

      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import qs from 'qs'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'
import {
  refundStatusMap,
  refundStatusStyleMap,
  refundStatusOptions,
  shipStatusMap,
  shipStatusStyleMap,
  shipStatusOptions,
} from '@/utils/constants/order'
import { getOrders, ship, refund } from '@/api/order'


export default {
  components: {
    Pagination
  },
  filters: {
    shipStatusFilter(status) {
      return shipStatusMap()[status]
    },
    shipStatusStyleFilter(status) {
      return shipStatusStyleMap()[status]
    },
    refundStatusFilter(status) {
      return refundStatusMap()[status]
    },
    refundStatusStyleFilter(status) {
      return refundStatusStyleMap()[status]
    }
  },
  data() {
    return {
      order: {},
      list: [],
      listTotal: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        include: 'user,items.product.crowdfunding,items.productSku',
        fields: {
          user: 'id,nickname',
        }
      },
      orderShip: {
        express_company: '',
        express_no: '',
      },
      orderRefund: {
        reason: '', // 退款理由，当拒绝时必填。同意则忽略
      },
      shipDialog: false,
      refundDialog: false,
      agreeRefundVisible: false,
      disagreeRefundDialog: false,
      orderDetailVisible: false,
      loading: false,
      shipFormRules: {
        express_company: [{ required: true, trigger: 'blur', message: '快递公司不能为空' }],
        express_no: [{ required: true, trigger: 'blur', message: '快递单号不能为空' }]
      },
      refundFormRules: {
        reason: [{ required: true, trigger: 'blur', message: '拒绝退款理由不能为空' }],
      }
    }
  },
  computed: {
    refundStatusOptions() {
      return refundStatusOptions()
    },
    shipStatusOptions() {
      return shipStatusOptions()
    }
  },
  created() {
    this.getOrders()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getOrders()
    },

    async getOrders() {
      this.listLoading = true
      const res = await getOrders(this.listQuery)
      this.list = res.data
      this.listTotal = res.meta.total
      this.listLoading = false
    },

    handleShip(row) {
      this.shipDialog = true
      this.order = deepClone(row)
      this.$nextTick(() => {
        this.$refs['shipForm'].clearValidate()
      })
    },

    async confirmShip() {
      this.$refs['shipForm'].validate(async (valid) => {
        if (valid) {
          this.loading = true
          const res = await ship(this.order.id, this.orderShip)
          const index = this.list.findIndex(v => v.id === this.order.id)
          this.list.splice(index, 1, Object.assign(this.order, res.data))
          this.loading = false

          const { no } = this.order
          this.shipDialog = false
          this.$notify({
            title: '发货成功',
            dangerouslyUseHTMLString: true,
            message: `
              <div>订单号: ${no}</div>
            `,
            type: 'success'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    // 退款按钮
    handleRefund(row) {
      this.refundDialog = true
      this.order = deepClone(row)
    },

    // 提交同意退款
    async confirmAgreeRefund() {
      await refund(this.order.id, { agree: true })
        .then(res => {
          this.order = Object.assign(this.order, res.data)

          this.refunded(this.order)
        })
    },

    refunded(order) {
      this.loading = false
      this.agreeRefundVisible = false
      this.refundDialog = false

      this.$notify({
        title: '退款成功',
        dangerouslyUseHTMLString: true,
        message: `
              <div>订单号: ${order.no}</div>
            `,
        type: 'success'
      })
    },

    // 拒绝退款按钮
    handleDisagreeRefund(){
      this.disagreeRefundDialog = true
      this.$nextTick(() => {
        this.$refs['disagreeRefundForm'].clearValidate()
      })
    },

    // 提交拒绝退款
    confirmDisagreeRefund() {
      this.$refs['disagreeRefundForm'].validate(async (valid) => {
        if (valid) {
          await refund(this.order.id, { agree: true, reason: this.orderRefund.reason })
            .then(res => {
              this.order = Object.assign(this.order, res.data)

              this.orderRefund.reason = ''
              this.refunded(this.order)
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    hanldeOrderDetail(row) {
      this.order = row
      this.orderDetailVisible = true
    }
  }
}
</script>
<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
