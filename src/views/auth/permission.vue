<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddPermission">添加权限</el-button>

    <el-table
      :data="permissions"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="permissionLoading"
    >
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.updated_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditPermission(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeletePermission(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="permissionTotal>0" :total="permissionTotal" :page.sync="permissionQuery.page" :limit.sync="permissionQuery.limit" @pagination="getPermissions" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑权限':'添加权限'">
      <el-form ref="permissionForm" :model="permission" :rules="permissionFormRules" label-width="80px" label-position="left">

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permission.name" placeholder="请输入权限名称" />
        </el-form-item>

      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmPermission">确认</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import { deepClone } from '@/utils'
  import { getPermissions, updatePermission, addPermission, deletePermission } from '@/api/permission'

  const defaultPermission = {
    name: '',
  }

  export default {
    components: { Pagination },
    data() {
      return {
        permission: Object.assign({}, defaultPermission),
        permissions: [],
        permissionTotal: 0,
        permissionLoading: true,
        permissionQuery: {
          page: 1,
          limit: 10
        },
        dialogVisible: false,
        dialogType: 'new',
        loading: false,
        permissionFormRules: {
          name: [{ required: true, trigger: 'blur', message: '权限名称不能为空' }]
        },
      }
    },
    created() {
      this.getPermissions()
    },
    methods: {
      async getPermissions() {
        this.permissionLoading = true

        const res = await getPermissions(this.permissionQuery)

        this.permissions = res.data
        this.permissionTotal = res.meta.total
        this.permissionLoading = false
      },

      handleAddPermission() {
        this.permission = Object.assign({}, defaultPermission)
        this.dialogType = 'new'
        this.dialogVisible = true
      },

      handleEditPermission(scope) {
        this.dialogType = 'edit'
        this.dialogVisible = true
        this.permission = deepClone(scope.row)
      },

      handleDeletePermission({ $index, row }) {
        this.$confirm('确定删除权限吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deletePermission(row.id)
            this.permissions.splice($index, 1)
            this.$message({
              type: 'success',
              message: '删除成功'
            })
          })
          .catch(err => { console.error(err) })
      },

      async confirmPermission() {
        this.$refs.permissionForm.validate(async (valid) => {
          if (valid) {
            const isEdit = this.dialogType === 'edit'
            this.loading = true

            if (isEdit) {
              await updatePermission(this.permission.id, this.permission)
              for (let index = 0; index < this.permissions.length; index++) {
                if (this.permissions[index].id === this.permission.id) {
                  this.permissions.splice(index, 1, Object.assign({}, this.permission))
                  break
                }
              }
            } else {
              const { data } = await addPermission(this.permission)
              this.permission.id = data.id
              this.permissions.push(this.permission)
            }
            this.loading = false

            const { name } = this.permission
            this.dialogVisible = false
            this.$notify({
              title: 'Success',
              dangerouslyUseHTMLString: true,
              message: `
              <div>权限: ${name}</div>
            `,
              type: 'success'
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })

      },
    }
  }
</script>
