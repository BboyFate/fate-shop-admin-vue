<template>
  <div class="app-container">
    <!-- 退款信息 -->
    <el-card shadow="always" class="card-item">
      <div slot="header">
        <span>退款信息</span>
      </div>
      <el-row>
        <el-col :span="24">用户名称：{{ form.user.nickname }}</el-col>
        <el-col :span="24">退款单号：{{ form.refund_no }}</el-col>
        <el-col :span="24">退款第三方商户单号：{{ form.thirdparty_no || '无' }}</el-col>
        <el-col :span="24">申请退款方式：{{ dictionaryFormat('refund_method', form.refund_method) }}</el-col>
        <el-col :span="24">申请数量：{{ form.apply_qty }}</el-col>
        <el-col :span="24">申请金额：{{ form.apply_total }}</el-col>
        <el-col :span="24">申请时间：{{ form.applied_at }}</el-col>
        <el-col :span="24">退款状态：
          <template v-if="form.refund_state === 'pending'">
            <el-button size="mini" type="text" @click="refundDialog=true; initRefundForm()">点击审核</el-button>
          </template>
          <template v-else>
            <span>{{ dictionaryFormat('refund_state', form.refund_state) }}</span>
          </template>
        </el-col>
        <el-col :span="24">申请退款原因：{{ form.extra ? form.extra.refund_reason : '无' }}</el-col>
        <template v-if="form.refund_state === 'disagreed'">
          <el-col :span="24">拒绝退款原因：{{ form.extra ? form.extra.disagree_reason : '无' }}</el-col>
        </template>
        <template v-if="form.refund_method == 'all'">
          <el-col :span="24">退货状态：{{ dictionaryFormat('shipment_state', form.shipment_state) }}</el-col>
          <el-col :span="24">物流单号：{{ form.express_no }}</el-col>
        </template>
      </el-row>
    </el-card>
    <!-- 物流信息 end -->

    <!-- 退款表单 -->
    <el-dialog :visible.sync="refundDialog" title="订单退款">
      <el-form ref="refundForm" :model="refundForm" :rules="refundRules" label-width="80px">
        <el-form-item label="申请原因">
          <el-input :value="form.extra ? form.extra.apply_reason : '无'" :disabled="true" type="textarea" />
        </el-form-item>
        <el-form-item label="退款金额" prop="apply_total">
          <el-input v-model="refundForm.apply_total" size="mini" />
        </el-form-item>
        <el-form-item label="同意退款">
          <el-switch v-model="refundForm.is_agree"></el-switch>
        </el-form-item>
        <template v-if="!refundForm.is_agree">
          <el-form-item label="拒绝理由" prop="disagree_reason">
            <el-input v-model="refundForm.disagree_reason" size="mini" />
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="refundDialog=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRefund">确认退款</el-button>
      </div>
    </el-dialog>
    <!-- 退款表单 end -->
  </div>
</template>

<script>
  import { getRefund, getRefundCauses, refund } from '@/api/orders/refund'
  import { getCompanies } from '@/api/systems/express'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'OrderRefundDetail',
    components: {
    },
    data() {
      return {
        form: {},

        refundForm: {},
        refundDialog: false,
        refundRules: {
          apply_total: [{ required: true, trigger: 'blur', message: '请填写退款金额' }],
          disagree_reason: [{
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!this.refundForm.is_agree && value === '') {
                callback(new Error('请填写拒绝退款理由'))
              }
              callback()
            }
          }],
        },

        expressCompanies: [],
        refundCauses: [],
        dictionaries: [],
        dictionaryByOrderType: {
          refund_method: 'order_refund_method',
          refund_state: 'order_refund_state',
          shipment_state: 'order_shipment_state',
        }
      }
    },
    created() {
      this.getDetail(this.$route.params.id)

      this.initForm()

      this.getDictionaries()
    },
    methods: {
      /**
       * 点击退款
       */
      handleConfirmRefund() {
        this.refundDialog = true

        this.$refs.refundForm.validate((valid) => {
          if (!valid) return false

          this.$confirm('确认退款吗？', 'Warning', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(async() => {
              await refund(this.refundForm.id, this.refundForm).then(response => {
                this.msgSuccess('退款已提交至服务器处理')
                this.refreshCachedView(this)
              })
            })
            .catch(err => { console.error(err) })
        })
      },

      initForm() {
        this.form = {
          user: {},
          extra: {},
        }
      },
      initRefundForm() {
        this.refundForm = {
          id: this.form.id,
          apply_total: this.form.apply_total,
          is_agree: true,
          disagree_reason: '',
        }
      },

      /**
       * 获取详情
       */
      async getDetail(id) {
        await getRefund(id).then(response => {
          this.form = response.data
        }).catch(err => {
          console.log(err)
        })
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
      dictionaryFormat(column, cellValue) {
        if (this.dictionaries[this.dictionaryByOrderType[column]]) {
          return this.selectDictLabel(this.dictionaries[this.dictionaryByOrderType[column]], cellValue)
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
</style>
