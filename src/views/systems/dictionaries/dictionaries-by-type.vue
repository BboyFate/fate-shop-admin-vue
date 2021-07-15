<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['system.dictionary.store']">添加字典</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="dictionaryType.dictionaries" border>
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="字典标签" prop="lavel" align="center" />
      <el-table-column label="字典值" align="center">
        <template slot-scope="scope">
          {{ scope.row.value }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="is_disabled" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="排序" prop="sorted" align="center" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="创建时间" prop="created_at" align="center" width="220" />
      <el-table-column label="更新时间" prop="updated_at" align="center" width="220" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['system.dictionary.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['system.dictionary.destroy']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典类型">
          <el-input v-model="dictionaryType.type" disabled />
        </el-form-item>
        <el-form-item label="字典标签" prop="lavel">
          <el-input v-model="form.lavel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="form.value" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="字典值类型" prop="value_type">
          <el-select v-model="form.value_type" placeholder="请选择字典值的类型">
            <el-option
              v-for="item in dictionaries['sys_dict_value_type']"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字典排序" prop="sorted">
          <el-input-number v-model="form.sorted" controls-position="right" :min="0" />
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
        <el-button type="primary" @click="handleConfirmSubmit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import { deepClone } from '@/utils'
  import {
    getDictionaryByType,
    getDictionaryType,
    addDictionary,
    updateDictionary,
    deleteDictionary,
    getDictionaryTypesFilterTypes
  } from '@/api/systems/dictionary'

  export default {
    name: 'DictionariesByType',
    components: { Pagination },
    data() {
      return {
        isListLoading: true,
        dictionaryType: [],

        dialogVisible: false,
        dialogTitle: '',
        form: {},
        formLoading: true,
        rules: {
          lavel: [
            { required: true, message: "字典标签不能为空", trigger: "blur" }
          ],
          value: [
            { required: true, message: "字典值不能为空", trigger: "blur" }
          ],
          value_type: [
            { required: true }
          ]
        },

        dictionaries: [],
        dictionaryOptions: {
          is_disabled: 'normal_disable',
          value_type: 'sys_dict_value_type',
        }
      }
    },
    created() {
      this.initForm()

      const typeId = this.$route.params && this.$route.params.id
      this.getDictionaryType(typeId)
      this.getDictionaries()
    },
    methods: {
      /**
       * 根据字典类型 ID 查询字典
       */
      async getDictionaryType(typeId) {
        this.isListLoading = true
        const res = await getDictionaryType(typeId)
        this.dictionaryType = res.data
        this.isListLoading = false
      },
      /**
       * 添加字典
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加字典'
        this.dialogVisible = true
      },
      /**
       * 编辑字典
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑字典'
        this.dialogVisible = true
        this.form = deepClone(scope.row)
        // 后台可能返回 Boolean; Input 标签不支持这种类型
        this.form.value = this.form.value.toString()
      },
      /**
       * 删除字典
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除字典？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteDictionary(row.id).then(response => {
              this.dictionaryType.dictionaries.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 确认提交表单
       */
       handleConfirmSubmit() {
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.isFormLoading = true

          if (this.form.id != undefined) {
            await updateDictionary(this.form.id, this.form).then(response => {
              const index = this.dictionaryType.dictionaries.findIndex(v => v.id === this.form.id)
              this.dictionaryType.dictionaries.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            this.form.type_id = this.dictionaryType.id

            await addDictionary(this.form).then(response => {
              this.dictionaryType.dictionaries.push(response.data)
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
          lavel: undefined,
          value: undefined,
          value_type: undefined,
          remark: undefined,
          sorted: 0,
          is_disabled: false,
          is_default: false,
        }
      },
      /** 表单重置 */
      reset() {
        this.initForm()
        this.resetForm('form')
      },

      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'normal_disable',
            'sys_dict_value_type',
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
