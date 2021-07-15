<template>
  <div class="app-container">
    <!-- 订单进度 -->
    <el-card shadow="always">
      <div slot="header">
        <span>订单进度</span>
      </div>
      <el-steps :active="orderProgressState" align-center>
        <el-step :description="form.created_at" title="买家下单"/>
        <el-step :description="form.paid_at ? form.paid_at : ''" title="买家付款"/>
        <el-step :description="form.delivered_at ? form.delivered_at : ''" title="商家发货"/>
        <el-step :description="form.completed_at ? form.completed_at : ''" title="交易完成"/>
      </el-steps>
    </el-card>
    <!-- 订单进度 end -->

    <!-- 订单概况 -->
    <el-card shadow="always" class="card-item">
      <div slot="header">
        <span>订单概况</span>
        <div class="card-header-right">
<!--          <template v-if="form.payment_state === 'paid' && form.order_state === 'new'">-->
<!--            <el-button type="primary" @click="handleRefund()">订单退款</el-button>-->
<!--          </template>-->
        </div>
      </div>
      <el-row>
        <el-col :span="8">订单号：{{ form.no }}</el-col>
        <el-col :span="8">第三方订单号：{{ form.no }}</el-col>
        <el-col :span="8">下单时间：{{ form.created_at }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">订单原价：{{ form.original_total }}</el-col>
        <el-col :span="8">实际支付：{{ form.payment_total }}</el-col>
        <el-col :span="8">总调整价：{{ form.adjustment_total }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">支付时间：{{ form.paid_at }}</el-col>
        <el-col :span="8">完成时间：{{ form.completed_at || '无'}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">备注：{{ form.remark ? form.remark : '无' }}</el-col>
      </el-row>
    </el-card>
    <!-- 订单概况 end -->

    <!-- 物流信息 -->
    <el-card shadow="always" class="card-item">
      <div slot="header">
        <span>收货信息 & 运费</span>
      </div>
      <el-row>
        <el-col :span="24">运费：{{ form.carriage_total }} 元</el-col>
        <el-col :span="24">收货人：{{ form.address.contact_name }}</el-col>
        <el-col :span="24">联系电话：{{ form.address.contact_phone }}</el-col>
        <el-col :span="24">收货地址：{{ form.address.province + form.address.city + form.address.district + form.address.address }}</el-col>
      </el-row>
    </el-card>
    <!-- 物流信息 end -->

    <!-- 商品信息 -->
    <el-card shadow="always" class="card-item">
      <div slot="header">
        <span>商品信息</span>
        <div class="card-header-right">
          <template v-if="form.payment_state !== 'pending'">
            <el-button v-if="form.shipment_state === 'pending'" size="mini" type="text" @click="handleDeliver()">全部发货</el-button>
            <el-button v-if="form.shipment_state === 'pending' || form.shipment_state === 'partially_delivered'" size="mini" type="text" @click="handlePartiallyDeliver()">部分发货</el-button>
          </template>
        </div>
      </div>
      <el-table :data="form.items" border>
        <el-table-column label="商品图片" align="center" width="80">
          <template slot-scope="{ row }">
            <img :src="row.product.image" class="item-product-img">
          </template>
        </el-table-column>
        <el-table-column label="商品" align="left">
          <template slot-scope="{ row }">
            <span>{{ row.product.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格">
          <template slot-scope="{ row }">
            <span>{{ row.product_sku.attributes | attributesFilter}}</span>
          </template>
        </el-table-column>
        <el-table-column label="运输状态" prop="shipment_state" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="收货状态" prop="receiving_state" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="退货状态" prop="shipment_refund_state" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="退款状态" prop="refund_state" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="下单数量" prop="qty" align="center" />
        <el-table-column label="已发货" prop="delivered_qty" align="center" />
        <el-table-column label="单价" prop="price" align="center" />
        <el-table-column label="原价" prop="price_total" align="center" />
        <el-table-column label="调整价" prop="adjustment_total" align="center" />
        <el-table-column label="实付" prop="payment_total" align="center" />
        <el-table-column label="已退款" prop="refunded_total" align="center" />
        <el-table-column label="退货数量" prop="refunded_qty" align="center" />
        <el-table-column label="申请退款" prop="has_applied_refund" align="center" />
        <el-table-column align="center" label="操作">
          <template slot-scope="{ row }">
            <el-button v-if="row.has_applied_refund || row.refunded_qty" size="mini" type="text" @click="handleShowRefunds(row)">退款信息</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 商品信息 end -->

    <!-- 子订单退款信息列表 dialog -->
    <el-dialog :visible.sync="refundsDialog" title="退款信息">
      <el-table :data="refunds" border>
        <el-table-column label="单号" prop="refund_no" align="center" />
        <el-table-column label="商户单号" prop="thirdparty_no" align="center" />
        <el-table-column label="退款方式" prop="refund_method" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="退款状态" prop="refund_state" align="center" :formatter="dictionaryFormat" />
        <el-table-column label="申请数量" prop="apply_qty" align="center" />
        <el-table-column label="申请金额" prop="apply_total" align="center" />
        <el-table-column label="物流单号" prop="express_no" align="center" />
        <el-table-column label="退款理由" align="center" >
          <template slot-scope="{ row }">
            <span>{{ row.extra || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-button size="mini" type="text" @click="handleToRefundDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="refundTotal>0"
        :total="refundTotal"
        :page.sync="refundQueryParams.page"
        :limit.sync="refundQueryParams.limit"
        @pagination="getOrderItemRefunds"
      />
    </el-dialog>
    <!-- 子订单退款信息列表 dialog -->

    <!-- 部分发货 显示列表 dialog -->
    <el-dialog :visible.sync="partiallyShipmentDialog" title="商品信息">
      <el-table ref="partiallyShipment" :data="partiallyShipments" border  @selection-change="handlePartiallyShipmentsSelection">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品图片" align="center" width="80">
          <template slot-scope="{ row }">
            <img :src="row.product.image" class="item-product-img">
          </template>
        </el-table-column>
        <el-table-column label="商品" align="left">
          <template slot-scope="{ row }">
            <span>{{ row.product.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格">
          <template slot-scope="{ row }">
            <span>{{ row.product_sku.attributes | attributesFilter}}</span>
          </template>
        </el-table-column>
        <el-table-column label="发货数量" prop="qty" align="center">
          <template slot-scope="scope">
            <el-input-number :value="scope.row._delivering_qty" @change="e => changeDeliverInput(e, scope.$index)" :min="1" :max="scope.row.qty - scope.row.delivered_qty"></el-input-number>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleConfirmPartiallyDeliver">确认发货</el-button>
      </div>
    </el-dialog>
    <!-- 退款信息 dialog -->

    <!-- 退款信息 dialog -->
    <el-dialog :visible.sync="refundDialog" title="退款信息">
      <el-form class="card-item-form" ref="refundForm" :model="refundForm" :rules="refundFormRules" label-width="80px">
        <el-form-item label="申请原因">
          <el-input v-model="refundForm.applied_cause" disable />
        </el-form-item>
        <el-form-item label="申请理由">
          <el-input v-model="refundForm.applied_reason" disable />
        </el-form-item>
        <el-form-item label="拒绝理由" prop="disagree_reason">
          <el-input v-model="refundForm.disagree_reason" placeholder="请输入拒绝的理由" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="handleAgreeRefund">同意退款</el-button>
        <el-button type="primary" @click="handleDisagreeRefund">拒绝退款</el-button>
      </div>
    </el-dialog>
    <!-- 退款信息 dialog -->

    <!-- 发货 dialog -->
    <el-dialog :visible.sync="shipDialog" title="发货">
      <el-form ref="shipForm" :model="shipForm" :rules="shipFormRules" label-width="80px">
        <el-form-item label="快递公司" prop="express_company_id">
          <el-select v-model="shipForm.express_company_id" placeholder="请选择快递公司" clearable>
            <el-option
              v-for="(expressCompany, expressCompanyIndex) in expressCompanies"
              :key="expressCompanyIndex"
              :label="expressCompany.name"
              :value="expressCompany.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="express_no">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="shipDialog=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmShip">确认发货</el-button>
      </div>
    </el-dialog>
    <!-- 发货 dialog end -->
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import {
    getOrder,
    getOrderItemRefunds,
    ship,
    partiallyShip,
  } from '@/api/orders/order'
  import { getRefundCauses } from '@/api/orders/refund'
  import { getCompanies } from '@/api/systems/express'
  import { getDictionaryTypes } from '@/api/systems/dictionary'

  export default {
    name: 'OrderDetail',
    components: {
      Pagination
    },
    filters: {
      attributesFilter(attributes) {
        let str = ''
        attributes.forEach(attr => {
          str += `${attr.name} : ${attr.value} 、`
        })

        return str.substr(0, str.length - 1)
      }
    },
    data() {
      return {
        form: {
          address: {},
        },
        orderProgressState: 0,
        orderItem: {},

        shipPartiallyDialog: false,
        shipDialog: false,
        shipType: '',
        shipForm: {},
        shipFormRules: {
          express_company_id: [{ required: true, trigger: 'change', message: '请选择物流公司' }],
          express_no: [{ required: true, trigger: 'blur', message: '快递单号不能为空' }]
        },

        refundDialog: false,
        refundForm: {
            applied_cause: '',
            applied_reason: '',
        },
        refundFormRules: {
          disagree_reason: [{ required: true, trigger: 'blur', message: '拒绝退款理由不能为空' }]
        },

        refundsDialog: false,
        refunds: [],
        refundTotal: 0,
        refundQueryParams: {},

        partiallyShipmentQty: 1,
        partiallyShipmentDialog: false,
        partiallyShipments: [],
        partiallyShipmentSelections: [],

        expressCompanies: [],
        refundCauses: [],
        dictionaries: [],
        dictionaryByOrderType: {
          shipment_state: 'order_shipment_state',
          receiving_state: 'order_receiving_state',
          shipment_refund_state: 'order_shipment_refund_state',
          refund_state: 'order_refund_state',
          refund_method: 'order_refund_method',
        }
      }
    },
    created() {
      this.getDetail(this.$route.params.id)

      this.getDictionaries()

      this.initShipForm()
    },
    methods: {
      /**
       * 部分发货 全选商品
       */
      handlePartiallyShipmentsSelection(selection) {
        console.log('部分发货')
        this.partiallyShipmentSelections = selection
      },

      /**
       * 部分发货 修改发货数量
       */
      changeDeliverInput(value, index) {
        console.log(this.partiallyShipmentSelections)
        this.partiallyShipments[index]._delivering_qty = value
        this.partiallyShipments = JSON.parse(JSON.stringify(this.partiallyShipments))
        console.log(this.partiallyShipmentSelections)
      },

      /**
       * 显示订单的退款记录
       */
      handleShowRefunds(item) {
        this.refundsDialog = true
        this.getOrderItemRefunds(item.order_id, item.id)
        console.log(this.refunds)
      },
      /**
       * 跳转到订单的某个退款详情
       */
      handleToRefundDetail(refund) {
        this.$router.push({
          path: `/orders/refunds/${refund.id}`
        })
      },

      /**
       * 全部发货按钮
       */
      handleDeliver() {
        this.getExpressCompanies()
        this.shipDialog = true
        this.shipType = 'all'
        this.$nextTick(() => {
          this.$refs['shipForm'].clearValidate()
        })
      },
      /**
       * 部分发货按钮
       */
      handlePartiallyDeliver() {
        this.partiallyShipmentDialog = true

        this.partiallyShipments = this.form.items.filter(item => item.qty != item.delivered_qty).map(function (item) {
          item._delivering_qty = item.qty - item.delivered_qty
          return item
        })
      },
      /**
       * 确认部分发货按钮
       */
      handleConfirmPartiallyDeliver() {
        if (this.partiallyShipmentSelections.length < 1) {
          this.msgError('请选择发货的商品')
          return
        }

        this.getExpressCompanies()
        this.shipDialog = true
        this.shipType = 'partially'
        this.$nextTick(() => {
          this.$refs['shipForm'].clearValidate()
        })
      },
      /**
       * 确认发货按钮
       */
      handleConfirmShip() {
        this.$refs['shipForm'].validate(async(valid) => {
          if (!valid) {
            console.log('error submit!!')
            return false
          }

          if (this.shipType == 'all') {
            this.$confirm('确认全部发货吗？', 'Warning', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(async() => {
                await ship(this.form.id, this.shipForm).then(response => {
                  this.msgSuccess('发货成功')
                  this.refreshCachedView(this)
                  this.initShipForm()
                })
              })
              .catch(err => { console.error(err) })
          } else {
            this.$confirm('确认发货吗？', 'Warning', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(async() => {
                const delivers = this.partiallyShipmentSelections.map(function (item) {
                  return {
                    item_id: item.id,
                    delivering_qty: item._delivering_qty
                  }
                })
                const formData = {
                  delivers: delivers,
                  express_company_id: this.shipForm.express_company_id,
                  express_no: this.shipForm.express_no,
                }

                await partiallyShip(this.form.id, formData).then(response => {
                  this.msgSuccess('发货成功')
                  this.refreshCachedView(this)
                  this.initShipForm()
                })
              })
              .catch(err => { console.error(err) })
          }
        })
      },
      /**
       * 初始化发货表单
       */
      initShipForm() {
        this.shipForm = {
          express_company_id: '',
          express_no: ''
        }
      },
      /**
       * 初始化退款表单
       */
      initRefundForm() {
        this.refundForm = {
          applied_cause: '',
          applied_reason: '',
          disagree_reason: '',
        }
      },
      /**
       * 查看某个订单退款信息
       */
      handleShowRefund() {
        this.initRefundForm()
        this.getRefundCauses()
        this.refundDialog = true
      },
      /**
       * 同意订单退款
       */
      handleAgreeRefund() {

      },
      /**
       * 不同意订单退款
       */
      handleDisagreeRefund() {

      },

      /**
       * 获取详情
       */
      async getDetail(id) {
        await getOrder(id).then(response => {
          this.form = response.data

          // 订单进度
          if (response.data.order_state === 'pending') {
            this.orderProgressState = 1
          }
          if (response.data.order_state === 'new') {
            this.orderProgressState = 2
          }
          if (!['pending', 'ready'].includes(response.data.shipment_state)) {
            this.orderProgressState = 3
          }
          if (response.data.order_state === 'completed') {
            this.orderProgressState = 4
          }
        }).catch(err => {
          console.log(err)
        })
      },
      /**
       * 获取退款列表
       */
      async getOrderItemRefunds(orderId, itemId) {
        const res = await getOrderItemRefunds(orderId, itemId, this.refundQueryParams)
        this.refunds = res.data
        this.refundTotal = res.meta.total
      },
      /**
       * 获取物流公司
       */
      async getExpressCompanies() {
        if (this.expressCompanies.length > 0) return

        await getCompanies().then(response => {
          this.expressCompanies = response.data
        }).catch(err => {
          console.log(err)
        })
      },
      /**
       * 获取退款原因
       */
      async getRefundCauses() {
        if (this.refundCauses.length > 0) return

        await getRefundCauses().then(response => {
          this.refundCauses = response.data
        }).catch(err => {
          console.log(err)
        })
      },
      /**
       * 获取字典
       */
      async getDictionaries() {
        await getDictionaryTypes({
          types: [
            'order_shipment_state',
            'order_receiving_state',
            'order_shipment_refund_state',
            'order_refund_state',
            'order_refund_method',
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

<style lang="scss" scoped>
  .card-item {
    margin-top: 25px;
    .card-header-right {
      float: right;
    }
    .card-item-form {
      width: 50%;
    }
    .el-row .el-col{
      font-size: 13px;
      color: #333;
      margin-bottom: 15px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .item-product-img {
    width:45px;
    height:45px;
  }
</style>
