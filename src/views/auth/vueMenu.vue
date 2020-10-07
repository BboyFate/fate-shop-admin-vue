<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddMenu">添加菜单</el-button>

    <el-row :gutter="20">
      <el-col :span="10">

          <el-tree
            :data="menus"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ data.name  }}</span>
              <span>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => handleEdit(data)">
                  编辑菜单
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => appendMenu(data)">
                  新增子菜单
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => handleDelete(node, data)">
                  删除
                </el-button>
              </span>
            </span>
          </el-tree>

      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑菜单':'添加菜单'">
      <el-form
        ref="menuForm"
        :model="menu"
        label-position="left"
        label-width="auto"
        :rules="menuFormRules"
      >

        <el-form-item label="标识名称" prop="name">
          <el-input v-model="menu.name" placeholder="" />
        </el-form-item>

        <el-form-item label="路径" prop="path">
          <el-input v-model="menu.path" placeholder="" />
        </el-form-item>

        <el-form-item label="Vue Component" prop="component">
          <el-input v-model="menu.component" placeholder="" />
        </el-form-item>

        <el-form-item label="标题" prop="meta">
          <el-input v-model="menu.meta.title" placeholder="" />
        </el-form-item>

        <el-form-item label="icon 图标" prop="">
          <el-input v-model="menu.meta.icon" placeholder="" />
        </el-form-item>

        <el-form-item label="排序" prop="">
          <el-input v-model="menu.sorted" placeholder="" />
        </el-form-item>

        <el-form-item label="显示隐藏">
          <el-switch
            v-model="menu.is_showed"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>

        <el-form-item label="重定向">
          <el-input v-model="menu.redirect" placeholder="" />
        </el-form-item>

      </el-form>

      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmMenu">确认</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getMenus, addMenu, updateMenu, deleteMenu } from '@/api/menu'

export default {
  data() {
    return {
      menu: {
        name: '',
        path: '',
        redirect: '',
        sorted: 0,
        is_showed: true,
        component: '',
        meta: {
          title: '',
          icon: '',
        },
      },
      menus: [],
      menuFormRules: {
        path: [{ required: true, trigger: 'blur', message: '菜单路由路径不能为空' }],
        isShowed: [{ required: true, trigger: 'change', message: '请选择是否显示菜单' }],
        component: [{ required: true, trigger: 'blur', message: 'Vue Component 名称不能为空' }],
        name: [{ required: true, trigger: 'blur', message: '唯一标识名称不能为空' }],
        meta: {
          type: 'object',
          required: true,
          fields: {
            title: { required: true, trigger: 'blur', message: '标题不能为空' },
          },
        },
      },
      clickMenu: {},  // 点击的菜单
      dialogVisible: false,
      dialogType: 'new',
    }
  },
  created() {
    this.getMenus()
  },
  methods: {
    async getMenus() {
      const res = await getMenus()
      this.menus = res.data
    },

    resetMenu() {
      this.menu = {
        name: '',
        path: '',
        redirect: '',
        sorted: 0,
        is_showed: true,
        component: '',
        meta: {
          title: '',
          icon: '',
        },
      }
    },

    appendMenu(data) {
      this.resetMenu()
      this.clickMenu = data
      this.dialogType = 'new'
      this.dialogVisible = true

      this.$nextTick(() => {
        this.$refs['menuForm'].clearValidate()
      })
    },

    handleAddMenu() {
      this.resetMenu()
      this.dialogType = 'new'
      this.dialogVisible = true

      this.$nextTick(() => {
        this.$refs['menuForm'].clearValidate()
      })
    },

    handleEdit(data) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.menu = deepClone(data)
    },

    handleDelete(node, data) {
      this.$confirm('确认删除角色？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteMenu(data.id)

          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === data.id);
          children.splice(index, 1);

          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },

    async confirmMenu() {
      const isEdit = this.dialogType === 'edit'

      this.menu.parent_id = this.clickMenu && this.clickMenu.id

      if (isEdit) {
        await updateMenu(this.menu.id, this.menu)

        for (let index = 0; index < this.menus.length; index++) {
          if (this.menus[index].id === this.menu.id) {
            this.menus.splice(index, 1, Object.assign({}, this.menu))
            break
          }
        }
      } else {
        const { data } = await addMenu(this.menu)
        this.menu.id = data.id

        if (this.clickMenu) {
          // tree 节点添加新增的菜单
          const clickMenu = this.clickMenu
          if (! clickMenu.children) {
            this.$set(clickMenu, 'children', [])
          }
          clickMenu.children.push(this.menu)
          this.clickMenu = {}
        }
      }

      const { name } = this.menu
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>菜单: ${name}</div>
          `,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
