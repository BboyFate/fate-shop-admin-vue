<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">添加角色</el-button>

    <el-table
      :data="rolesList"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="roleLoading"
    >
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注">
        <template slot-scope="scope">
          {{ scope.row.description }}
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
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="roleTotal>0" :total="roleTotal" :page.sync="roleQuery.page" :limit.sync="roleQuery.limit" @pagination="getRoles" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'添加角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="menusData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="permissionTree"
            :check-strictly="checkStrictly"
            :data="permissionsData"
            :props="permissionDefaultProps"
            show-checkbox
            node-key="name"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'
import { getRoles, addRole, deleteRole, updateRole } from '@/api/role'
import { getPermissions } from '@/api/permission'
import { getMenus } from '@/api/menu'

const defaultRole = {
  name: '',
  menus: [],
  permissions: [],
}

export default {
  components: { Pagination },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      rolesList: [],
      roleTotal: 0,
      roleLoading: true,
      roleQuery: {
        page: 1,
        limit: 10,
        include: 'permissions,vueMenus',
        fields: {
        }
      },
      menus: [],
      serviceMenus: [],
      permissions: [],
      servicePermissions: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      permissionDefaultProps: {
        label: 'name'
      }
    }
  },
  computed: {
    menusData() {
      return this.menus
    },
      permissionsData() {
      return this.permissions
    }
  },
  created() {
    this.getMenus()
    this.getRoles()
    this.getPermissions()
  },
  methods: {
    // 拉取菜单列表
    async getMenus() {
      const res = await getMenus()
      this.serviceMenus = res.data
      this.menus = this.generateMenus(res.data)
    },
    // 拉取角色列表
    async getRoles() {
      this.roleLoading = true

      const res = await getRoles(this.roleQuery)
      this.rolesList = res.data

      this.roleTotal = res.meta.total
      this.roleLoading = false
    },
    // 拉取权限列表
    async getPermissions() {
      const res = await getPermissions()
      this.servicePermissions = res.data
      this.permissions = res.data
    },
    // 重新映射路由结构，使其看起来与边栏相同
    generateMenus(menus, basePath = '/') {
      const res = []

      for (let menu of menus) {

        const onlyOneShowingChild = this.onlyOneShowingChild(menu.children, menu)

        if (menu.children && menu.children.length > 1 && onlyOneShowingChild) {
          menu = onlyOneShowingChild
        }

        const data = {
          id: menu.id,
          path: path.resolve(basePath, menu.path),
          title: menu.meta && menu.meta.title
        }

        // 递归路由
        if (menu.children) {
          data.children = this.generateMenus(menu.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    // 菜单 生成树状
    generateTree(menus, checkedKeys) {
      const res = []

      for (const menu of menus) {
        if (menu.children) {
          menu.children = this.generateTree(menu.children, checkedKeys)
        }

        if (checkedKeys.includes(menu.id) || (menu.children && menu.children.length >= 1)) {
          res.push(menu)
        }
      }
      return res
    },
    // 权限 生成树状
    permissionGenerateTree(permissions, checkedKeys) {
      const res = []

      for (const permission of permissions) {
        if (checkedKeys.includes(permission.name)) {
          res.push(permission)
        }
      }
      return res
    },
    // 添加角色
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
        this.$refs.permissionTree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    // 编辑角色
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        const menus = this.generateMenus(this.role.vue_menus)
        this.$refs.tree.setCheckedNodes(this.generateArr(menus))
        this.$refs.permissionTree.setCheckedNodes(this.role.permissions)
        // 设置节点的检查状态，不影响其父节点和子节点
        this.checkStrictly = false
      })
    },
    // 删除角色
    handleDelete({ $index, row }) {
      this.$confirm('确认删除角色？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    // 确认按钮
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      const menu_ids = this.$refs.tree.getCheckedKeys()
      const permissions = this.$refs.permissionTree.getCheckedKeys()

      this.role.vue_menus = this.generateTree(deepClone(this.serviceMenus), menu_ids)
      this.role.permissions = this.permissionGenerateTree(deepClone(this.servicePermissions), permissions)
      const editOrStoreData = {
          name: this.role.name,
          menu_ids: menu_ids,
          permissions: permissions,
      }
      if (isEdit) {
        await updateRole(this.role.id, editOrStoreData)

        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].id === this.role.id) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await addRole(editOrStoreData)
        this.role.id = data.id
        this.role.created_at = data.created_at
        this.role.updated_at = data.updated_at
        this.rolesList.push(this.role)
      }

      const { id, name } = this.role
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色 ID: ${id}</div>
            <div>角色名称: ${name}</div>
          `,
        type: 'success'
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null

      // 当只有一个子路由时，默认显示子路由
      if (children.length === 1) {
        onlyOneChild = children[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // 如果没有子路由显示，则显示父路由
      if (children.length === 0) {
        onlyOneChild = { ... parent, path: '' }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
