<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddAdmin">添加管理员</el-button>

    <el-table
      :data="admins"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="adminLoading"
    >
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名" width="220">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="允许登录" width="220">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_enabled | isEnabledFilter">
            {{ scope.row.is_enabled == true ? '允许' : '禁止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色" width="220">
        <template slot-scope="scope">
          {{ scope.row.roles }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="220">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间" width="220">
        <template slot-scope="scope">
          {{ scope.row.updated_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditAdmin(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeleteAdmin(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="adminTotal>0" :total="adminTotal" :page.sync="adminQuery.page" :limit.sync="adminQuery.limit" @pagination="getAdmins" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑管理员':'添加管理员'">
      <el-form ref="adminForm" :model="admin" :rules="adminFormRules" label-width="80px" label-position="left">

        <el-form-item label="登录账号" prop="username">
          <el-input v-model="admin.username" auto-complete="new-username" placeholder="请输入管理员名称" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="admin.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="admin.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="账号开关" prop="is_disabled">
          <el-switch
            v-model="admin.is_disabled"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="selectedRole" clearable filterable placeholder="请选择角色">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="admin.password" type="password" show-password auto-complete="new-password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="password_confirmation">
          <el-input v-model="admin.password_confirmation" type="password" show-password placeholder="请输入确认密码" />
        </el-form-item>

      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmAdmin">确认</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'
import { validPhone } from '@/utils/validate'
import { getAdmins, updateAdmin, addAdmin, deleteAdmin } from '@/api/admin'
import { getRoles } from '@/api/role'

const defaultAdmin = {
  username: '',
  password: '',
  password_confirmation: '',
  nickname: '',
  phone: '',
  avatar_image_id: '',
  is_disabled: false,
  roles: []
}

export default {
  components: { Pagination },
  filters: {
    isEnabledFilter(status) {
      const isEnabledMap = {
        'true': 'success',
        'false': 'danger'
      }
      return isEnabledMap[status]
    }
  },
  data() {
    const validatePhone = (rule, value, callback) => {
        if (! validPhone(value)) {
          callback(new Error('手机格式不正确'))
        } else {
          callback()
        }
    }
    const validatePassword = (rule, value, callback) => {
        if (this.admin.password !== this.admin.password_confirmation) {
          callback(new Error('确认密码需要一致'))
        } else {
          callback()
        }
    }
    return {
      admin: Object.assign({}, defaultAdmin),
      admins: [],
      adminTotal: 0,
      adminLoading: true,
      adminQuery: {
        page: 1,
        limit: 10
      },
      roles: [],
      selectedRole: '',
      dialogVisible: false,
      dialogType: 'new',
      loading: false,
      adminFormRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        nickname: [{ required: true, trigger: 'blur', message: '昵称不能为空' }],
        is_disabled: [{ required: true, trigger: 'change', message: '账号状态需选择' }],
        phone: [
            { required: true, trigger: 'blur', message: '手机不能为空' },
            { trigger: 'blur', validator: validatePhone }
          ],
        password: [
          { trigger: 'blur', min: 6, message: '密码不能小于 6 位数' },
          { trigger: 'blur', validator: validatePassword }
        ],
        password_confirmation: [
          { trigger: 'blur', min: 6, message: '确认密码不能小于 6 位数' },
          { trigger: 'blur', validator: validatePassword }
        ]
      },
    }
  },
  created() {
    this.getAdmins()
    this.getRoles()
  },
  methods: {
    async getAdmins() {
      this.adminLoading = true

      const res = await getAdmins(this.adminQuery)

      this.admins = res.data
      this.adminTotal = res.meta.total
      this.adminLoading = false
    },

    // 拉取角色列表
    async getRoles() {
      const res = await getRoles()
      this.roles = res.data
    },

    handleAddAdmin() {
      this.admin = Object.assign({}, defaultAdmin)
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    handleEditAdmin(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.admin = deepClone(scope.row)
      this.$nextTick(() => {
        this.selectedRole = this.admin.roles[0] // 编辑时默认选中角色
      })
    },

    handleDeleteAdmin({ $index, row }) {
      this.$confirm('确定删除管理员吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteAdmin(row.id)
          this.admins.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },

    async confirmAdmin() {
      this.$refs.adminForm.validate(async (valid) => {
        if (valid) {
          const isEdit = this.dialogType === 'edit'
          this.loading = true

          if (isEdit) {
            await updateAdmin(this.admin.id, this.admin)
            for (let index = 0; index < this.admins.length; index++) {
              if (this.admins[index].id === this.admin.id) {
                this.admins.splice(index, 1, Object.assign({}, this.admin))
                break
              }
            }
          } else {
            const { data } = await addAdmin(this.admin)
            this.admin.id = data.id
            this.admins.push(this.admin)
          }
          this.loading = false

          const { username, nickname } = this.admin
          this.dialogVisible = false
          this.$notify({
            title: 'Success',
            dangerouslyUseHTMLString: true,
            message: `
              <div>登录账号: ${username}</div>
              <div>管理员昵称: ${nickname}</div>
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
