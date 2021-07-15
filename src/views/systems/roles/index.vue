<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="filterForm" :inline="true">
      <el-form-item label="角色名称" prop="search">
        <el-input v-model="queryParams.search" placeholder="请输入角色名称" clearable size="small" @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item label="创建时间">
          <el-date-picker v-model="dateRange" size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="handleResetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['system:role:store']">添加角色</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="listLoading" :data="list" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="标识" width="220">
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
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope)" v-has-permission="['system.rule.update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope)" v-has-permission="['system.rule.destroy']">删除</el-button>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色标识" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色标识：如 Admin" />
        </el-form-item>
        <el-form-item label="角色备注" prop="description">
          <el-input v-model="form.description" placeholder="请输入角色备注" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="permissionTree"
            :check-strictly="isCheckStrictly"
            :data="permissions"
            :props="permissionDefaultProps"
            show-checkbox
            default-expand-all
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit" :loading="formLoading">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import path from 'path'
  import Pagination from '@/components/Pagination'
  import { deepClone } from '@/utils'
  import { getRoles, addRole, deleteRole, updateRole } from '@/api/systems/role'
  import { getPermissions } from '@/api/systems/permission'

  export default {
    name: 'Role',
    components: { Pagination },
    data() {
      return {
        list: [],
        total: 0,
        listLoading: true,
        queryParams: {},

        dialogVisible: false,
        dialogTitle: '',
        form: {},
        formLoading: false,
        rules: {
          name: [{ required: true, message: "角色标识不能为空", trigger: "blur" }],
          description: [{ required: true, message: "角色备注不能为空", trigger: "blur" }]
        },
        // 日期范围
        dateRange: [],

        permissions: [],
        servicePermissions: [],
        permissionDefaultProps: {
          children: 'children',
          label: 'title'
        },
        isCheckStrictly: false,
      }
    },
    created() {
      this.getList()
      this.getPermissions()
    },
    methods: {
      /**
       * 拉取菜单列表
       */
      async getList() {
        this.listLoading = true

        const res = await getRoles(this.queryParams)
        this.list = res.data
        this.total = res.meta.total

        this.listLoading = false
      },
      /**
       * 拉取菜单列表
       */
      async getPermissions() {
        const res = await getPermissions()
        this.servicePermissions = res.data
        this.permissions = this.generateMenus(res.data)
      },
      /**
       * 添加角色
       */
      handleAdd() {
        this.reset()
        this.dialogTitle = '添加角色'
        this.dialogVisible = true
      },
      /**
       * 编辑角色
       */
      handleEdit(scope) {
        this.reset()
        this.dialogTitle = '编辑角色'
        this.dialogVisible = true
        this.isCheckStrictly = true
        this.form = deepClone(scope.row)
        this.$nextTick(() => {
          this.$refs.permissionTree.setCheckedKeys(this.form.permission_ids)
          // 设置节点的检查状态，不影响其父节点和子节点
          this.isCheckStrictly = false
        })
      },
      /**
       * 删除角色
       */
      handleDelete({ $index, row }) {
        this.$confirm('确认删除角色？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            await deleteRole(row.id).then(response => {
              this.list.splice($index, 1)
              this.msgSuccess('删除成功')
            })
          })
          .catch(err => { console.error(err) })
      },
      /**
       * 确认提交表单
       */
       handleConfirmSubmit() {
        this.form.permissions = this.$refs.permissionTree.getCheckedKeys()
        console.log(this.form)
        this.$refs.form.validate(async valid => {
          if (!valid) return
          this.formLoading = true

          if (this.form.id != undefined) {
            await updateRole(this.form.id, this.form).then(response => {
              this.refreshCachedView(this)
              this.msgSuccess('修改成功')
              this.dialogVisible = false
              this.formLoading = false
            }).catch(err => {
              this.formLoading = false
            })
          } else {
            await addRole(this.form).then(response => {
              this.refreshCachedView(this)
              this.msgSuccess('新增成功')
              this.dialogVisible = false
              this.formLoading = false
            }).catch(err => {
              this.formLoading = false
            })
          }
        })
      },
      /** 表单重置 */
      reset() {
        if (this.$refs.permissionTree != undefined) {
          this.$refs.permissionTree.setCheckedKeys([])
        }

        this.form = {
          id: undefined,
          name: undefined,
          description: undefined,
        }

        this.resetForm('form')
      },
      /** 初始化查询参数 */
      initQueryParams() {
        this.queryParams = {
          page: 1,
          limit: 10,
          search: '',
        }
      },
      /** 搜索 */
      handleSearch() {
        this.getList()
      },
      /** 重置搜索 */
      handleResetSearch() {
        this.initQueryParams()
        this.dateRange = []
        this.resetForm('filterForm')
        this.handleSearch()
      },
      /**
       * 重新映射路由结构，使其看起来与边栏相同
       */
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
