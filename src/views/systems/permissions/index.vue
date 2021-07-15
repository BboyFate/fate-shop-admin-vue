<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['system.permission.store']">添加权限</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="isListLoading" :data="list" row-key="id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="权限标识" prop="name" :show-overflow-tooltip="true" width="250"></el-table-column>
      <el-table-column label="标题名称">
        <template slot-scope="scope">
          {{ scope.row.meta.title }}
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" :formatter="dictionaryFormat" />
      <el-table-column label="图标" prop="icon" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.meta.icon" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sorted" width="60" />
      <el-table-column label="权限标识" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="组件" prop="component" :show-overflow-tooltip="true" />
      <el-table-column label="显示" prop="is_showed" align="center" :formatter="dictionaryFormat" />
      <el-table-column label="创建时间" prop="created_at"></el-table-column>
      <el-table-column label="更新时间" prop="updated_at"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['system.permission.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['system.permission.destroy']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="权限标识" prop="name">
          <el-input v-model="form.name" placeholder="请输入唯一的权限标识" />
        </el-form-item>
        <el-form-item label="标题名称" prop="meta">
          <el-input v-model="form.meta.title" placeholder="请输入标题名称" />
        </el-form-item>
        <el-form-item label="上级权限">
          <treeselect
            v-model="form.parent_id"
            :options="list"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级权限"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio
              v-for="dict in dictionaries['sys_permission_type']"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.lavel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sorted">
          <el-input-number v-model="form.sorted" controls-position="right" :min="0" />
        </el-form-item>

        <template v-if="form.type != 'btn'">
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item  label="组件" prop="component">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item label="菜单图标">
            <el-popover
              placement="bottom-start"
              width="460"
              trigger="click"
              @show="$refs['iconSelect'].reset()"
            >
              <IconSelect ref="iconSelect" @selected="handleSelectIcon" />
              <el-input slot="reference" v-model="form.meta.icon" placeholder="点击选择图标" readonly>
                <svg-icon
                  v-if="form.meta.icon"
                  slot="prefix"
                  :icon-class="form.meta.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="显示状态">
            <el-radio-group v-model="form.is_showed">
              <el-radio
                v-for="dict in dictionaries['normal_show']"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.lavel }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit" :loading="isFormLoading">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Treeselect from "@riophae/vue-treeselect"
  import "@riophae/vue-treeselect/dist/vue-treeselect.css"
  import IconSelect from "@/components/IconSelect"
  import { deepClone } from '@/utils'
  import { getPermissions, updatePermission, addPermission, deletePermission } from '@/api/systems/permission'
  import { getDictionaryTypesFilterTypes } from '@/api/systems/dictionary'

  export default {
    name: 'Permission',
    components: { Treeselect, IconSelect },
    data() {
      return {
        list: [],
        isListLoading: true,
        queryParams: {},

        dialogVisible: false,
        dialogTitle: '',
        form: {},
        isFormLoading: false,
        rules: {
          name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
          path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
          type: [{ required: true, message: "必须选择一种类型", trigger: "blur" }],
          component: [{ required: true, message: "组件不能为空", trigger: "blur" }],
          meta: {
            type: 'object',
            required: true,
            fields: {
              title: { required: true, message: "标题名称不能为空", trigger: "blur" }
            }
          }
        },

        dictionaries: [],
        dictionaryOptions: {
          is_showed: 'normal_show', // 显示状态
          type: 'sys_permission_type',  // 类型
        }
      }
    },
    created() {
      this.initForm()
      this.getList()
      this.getDictionaries()
    },
    methods: {
      async getList() {
        this.isListLoading = true
        const res = await getPermissions(this.queryParams)
        this.list = res.data
        this.isListLoading = false
      },
      /**
       * 选择图标
       */
      handleSelectIcon(name) {
        this.form.meta.icon = name
      },
      /**
       * 转换菜单数据结构用于 treeselect
       */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.id,
          label: `${node.meta.title} (${node.name})`,
          children: node.children
        }
      },

      /**
       * 添加权限
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加权限'
        this.dialogVisible = true
      },
      /**
       * 编辑权限
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑权限'
        this.dialogVisible = true
        this.form = deepClone(scope.row)
      },
      /**
       * 删除权限
       */
      handleDelete({ $index, row }) {
        this.$confirm('确定删除权限吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deletePermission(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 确认提交表单
       */
      async handleConfirmSubmit() {
        this.$refs.form.validate(async(valid) => {
          if (!valid) return false
          this.isFormLoading = true

          if (this.form.id !== undefined) {
            await updatePermission(this.form.id, this.form).then(response => {
              const index = this.list.findIndex(permission => permission.id === this.form.id)
              this.list.splice(index, 1, Object.assign({}, this.form))
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          } else {
            await addPermission(this.form).then(response => {
              this.list.push(this.form)
              this.msgSuccess('添加成功')
              this.dialogVisible = false
              this.isFormLoading = false
            }).catch(err => {
              this.isFormLoading = false
            })
          }
        })
      },

      /** 获取字典 */
      async getDictionaries() {
        await getDictionaryTypesFilterTypes({
          types: [
            'normal_show',
            'sys_permission_type',
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

      /** 表单重置 */
      initForm() {
        this.form = {
          id: undefined,
          name: undefined,
          description: undefined,
          type: undefined,
          path: undefined,
          component: undefined,
          sorted: 0,
          is_showed: true,
          meta: {
            title: undefined,
            icon: undefined,
            activeMenu: undefined,
          }
        }
      },
      /** 表单重置 */
      reset() {
        this.initForm()
        this.resetForm('form')
      },
    }
  }
</script>
