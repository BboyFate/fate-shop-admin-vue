<template>
  <div class="app-container">
    <el-alert
      title="注意！ 商品默认发全国，如果对应的地区没有设置运费，那么此地区将会使用默认运费。"
      type="warning"
      show-icon>
    </el-alert>
    <div class="createPost-container">
      <el-form ref="form" :model="form" :rules="rules" class="form-container" label-width="150px">
        <div class="createPost-main-container">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="form.name" placeholder="" clearable />
          </el-form-item>
          <el-form-item label="计价方式" prop="fee_type">
            <el-radio-group v-model="form.fee_type">
              <el-radio
                v-for="dict in dictionaries['express_fee_type']"
                :key="dict.value"
                :label="dict.value">
                {{ dict.lavel }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否默认" prop="is_default">
            <el-switch v-model="form.is_default" />
          </el-form-item>
          <el-form-item label="不包邮区域">
            <el-table :data="form.items" border>
              <el-table-column label="不包邮区域" width="180">
                <template slot-scope="scope">
                  <span>{{ scope.row.provinces.join(",") }}</span>
                </template>
              </el-table-column>
              <el-table-column label="首件(重量按 kg 计算)">
                <template slot-scope="scope">
                  {{ scope.row.fees.first }}
                </template>
              </el-table-column>
              <el-table-column label="首费">
                <template slot-scope="scope">
                  {{ scope.row.fees.first_fee }}
                </template>
              </el-table-column>
              <el-table-column label="续费">
                <template slot-scope="scope">
                  {{ scope.row.fees.renew_fee }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEditArea(scope)" v-has-permission="['express.fee.update']">编辑</el-button>
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDeleteArea(scope)" v-has-permission="['express.fee.destroy']">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="warning" style="margin-top: 10px;" round @click="handleAddArea()">添加配送区域和运费</el-button>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="handleConfirmSubmit" :loading="isFormLoading">提交</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--添加派送区域和运费-->
    <el-dialog :visible.sync="dialogVisible" title="派送区域和运费">
      <el-form ref="areaForm" :model="areaForm" :rules="areaRules" label-width="80px">
        <el-form-item label="配送区域" prop="provinces">
          <el-tag
            v-for="(item, index) in provinces"
            :key="item.province_code"
            v-if="!item.is_hide || item.is_itself"
            :effect="item.is_on ? 'dark' : 'plain'"
            class="area-province-tags"
            @click="handleSetAreaProvince(index)">
            {{ item.name }}
          </el-tag>
        </el-form-item>
        <el-form-item label="首件数" prop="fees.first" class="area-fees-item">
          <el-input type="number" v-model="areaForm.fees.first" min="0" maxlength="11"/>
        </el-form-item>
        <el-form-item label="首费" prop="fees.first_fee" class="area-fees-item">
          <el-input type="number" v-model="areaForm.fees.first_fee" min="0.01" maxlength="11"/>
        </el-form-item>
        <el-form-item label="续费" prop="fees.renew_fee" class="area-fees-item">
          <el-input type="number" v-model="areaForm.fees.renew_fee" min="0.01" maxlength="11"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="handleCancelSubmitArea">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmitArea" :loading="isAreaFormLoading">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { validFloat } from '@/utils/validate'
  import { getProvinces } from '@/api/systems/area'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'
  import { getFee, addFee, updateFee } from '@/api/products/express'

  export default {
    name: "FeeDetail",
    components: {
    },
    props: {
      isEdit: {
        type: Boolean,
        required: true
      }
    },
    data() {
      const validateFeeFirst = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('首件数不能为空'))
        }
        if (!Number.isInteger(Number(value))) {
          callback(new Error('请输入整数'))
        }
        callback()
      }
      const validateFeeFloat = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('首费必须填写'))
        }
        if (!validFloat(value)) {
          callback(new Error('请输入小数点两位'))
        }
        callback()
      }
      const validateFeeRenew = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('续费必须填写'))
        }
        if (!validFloat(value)) {
          callback(new Error('请输入小数点两位'))
        }
        callback()
      }

      return {
        form: {},
        isFormLoading: false,
        dialogVisible: false,
        rules: {
          name: [{ required: true, message: '运费模板名称必须填写', trigger: 'blur' }],
          fee_type: [{ required: true, message: '计价类型必须选择', trigger: 'blur' }],
        },

        areaForm: {},
        areaRules: {
          provinces: [
            { required: true, trigger: 'blur', message: '请选择省份' }
          ],
          'fees.first': {
            // transform(value) { return Number(value) },
            validator: validateFeeFirst,
            trigger: 'blur'
          },
          'fees.first_fee': {
            validator: validateFeeFloat,
            trigger: 'blur'
          },
          'fees.renew_fee': {
            validator: validateFeeRenew,
            trigger: 'blur'
          },
        },

        isAreaFormLoading: false,

        provinces: [],
        indexOfFormArea: 0,

        dictionaries: [],
        dictionaryOptions: {
          fee_type: 'express_fee_type',
        }
      }
    },
    created() {
      this.initAreaForm()
      this.initProvinces()

      if (this.isEdit) {
        this.form.id = this.$route.params && this.$route.params.id
        this.getDetail(this.form.id)
      }

      this.getDictionaries()

      console.log(this.dictionaries)
    },
    methods: {
      /**
       * 获取详情
       */
      async getDetail(id) {
        await getFee(id).then(response => {
          this.form = response.data

          for (const index in this.provinces) {
            this.form.items.forEach(item => {
              item.provinces.forEach(province => {
                if (this.provinces[index].name === province) {
                  this.provinces[index].is_hide = true
                  this.$set(this.provinces, index, this.provinces[index])
                }
              })
            })
          }
        }).catch(err => {
          console.log(err)
        })
      },

      /**
       * 选择省份
       */
      handleSetAreaProvince(index) {
        const provinces = this.provinces
        if (provinces[index].is_on && provinces[index].is_hide) {
          provinces[index].is_hide = false
        }
        provinces[index].is_on = !provinces[index].is_on
        this.provinces = Object.assign([], provinces)
      },

      /**
       * 添加区域运费
       */
      handleAddArea() {
        this.dialogVisible = true
        this.initAreaForm()
        this.resetProvincesByOn()
        this.indexOfFormArea = this.form.items.length
      },
      /**
       * 编辑区域运费
       */
      handleEditArea({ $index, row }) {
        this.dialogVisible = true
        this.initAreaForm()
        this.resetProvincesByOn()

        for (const index in this.provinces) {
          if (row.provinces.indexOf(this.provinces[index].name) !== -1) {
            this.provinces[index].is_itself = true
            this.provinces[index].is_on = true
          }
        }

        this.areaForm = Object.assign({}, row)
        this.indexOfFormArea = $index
      },
      /**
       * 删除区域运费
       */
      handleDeleteArea({ $index }) {
        // 取出要删除的省份
        const provinces = this.form.items[$index].provinces

        this.provinces.map(sourceProvince => {
          provinces.forEach(province => {
            if (province === sourceProvince.name) {
              sourceProvince.is_on = false
              sourceProvince.is_hide = false
              sourceProvince.is_itself = false
            }
          })
        })

        this.form.items.splice($index, 1)
      },
      /**
       * 确认提交区域运费
       */
      handleConfirmSubmitArea() {
        const selectedOfProvinces = []
        for (const index in this.provinces) {
          if (this.provinces[index].is_on) {
            selectedOfProvinces.push(this.provinces[index].name)
          }
        }
        this.areaForm.provinces = selectedOfProvinces

        this.$refs.areaForm.validate((valid) => {
          if (!valid) return
          this.isAreaFormLoading = true

          for (const index in this.provinces) {
            if (this.provinces[index].is_on) {
              this.provinces[index].is_hide = true
              this.$set(this.provinces, index, this.provinces[index])
            }
          }

          this.$set(this.form.items, this.indexOfFormArea, this.areaForm)
          this.dialogVisible = false
          this.initAreaForm()
          this.isAreaFormLoading = false
        })
      },
      /**
       * 取消提交区域运费
       */
      handleCancelSubmitArea() {
        this.dialogVisible = false
        this.initAreaForm()
      },

      /**
       * 提交表单
       */
      handleConfirmSubmit() {
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.isFormLoading = true

          if (this.form.id != undefined) {
            await updateFee(this.form.id, this.form).then(response => {
              this.refreshCachedView(this)

              this.msgSuccess('修改成功')
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addFee(this.form).then(response => {
              this.msgSuccess('新增成功')
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          }
        })
      },

      /**
       * 初始化省份
       */
      async initProvinces() {
        await getProvinces().then(response => {
          this.provinces = response.data

          for (const index in this.provinces) {
            this.provinces[index].is_hide = false
            this.provinces[index].is_on = false
            this.provinces[index].is_itself = false
          }
        })
      },
      /** 初始化表单 */
      initForm() {
        this.form = {
          fees: {
            first: 0,
            first_fee: 0,
            renew_fee: 0
          },
          provinces: []
        }
      },
      /** 初始化区域运费表单 */
      initAreaForm() {
        this.areaForm = {
          fees: {
            first: 0,
            first_fee: 0,
            renew_fee: 0
          },
          provinces: []
        }
      },
      /** 重置选择的省份 */
      resetProvincesByOn() {
        for (const index in this.provinces) {
          this.provinces[index].is_on = false
          this.provinces[index].is_itself = false
        }
      },

      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'express_fee_type',
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
  .createPost-container {
    margin-top: 20px;
  }

  .area-province-tags {
    margin: 0 3px;
  }
  .area-fees-item {
    display: inline-block;
  }
</style>
