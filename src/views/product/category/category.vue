<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="类目名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button type="primary" @click="handleAddCategory">添加类目</el-button>
    </div>

    <el-table
      :data="list"
      style="width: 100%;margin-top:30px;"
      border
      v-loading="listLoading"
    >
      <el-table-column align="center" label="ID">
        <template slot-scope="{ row }">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="{ row }">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="关联名称">
        <template slot-scope="{ row }">
          {{ row.full_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="层级">
        <template slot-scope="{ row }">
          {{ row.level }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="图片">
        <template slot-scope="{ row }">
          <img v-if="row.image" :src="row.image" style="width:80px;height:80px;">
          <el-tag v-else type="warning">无图片</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="{ row }">
          {{ row.sorted }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="显示状态">
        <template slot-scope="{ row }">
          <el-tag :type="row.is_showed | isShowedStyleFilter">
            {{ row.is_showed | isShowedFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditCategory(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeleteCategory(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getCategories" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑类目':'添加类目'">
      <el-form ref="categoryForm" :model="category" :rules="categoryFormRules" label-width="80px" label-position="right">
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="category.name" placeholder="请输入类目名称" />
        </el-form-item>
        <el-form-item label="上级类目" prop="parent_id">
          <el-cascader
            v-model="category.parent_id"
            :options="categoriesTree"
            :props="{ checkStrictly: true }"
            filterable
            clearable
          />
        </el-form-item>

        <el-form-item label="上级类目" prop="parent_id">
          <el-cascader
            v-model="category.parent_id"
            :options="categoriesTree"
            :props="{ checkStrictly: true }"
            filterable
            clearable
            style="top:-4px"/>
        </el-form-item>

        <el-form-item label="类目图片" prop="image">
          <el-image v-if="category.image" :src="category.image" @click="isSelectImageShowed=true" class="app-form-image"></el-image>
          <i v-else class="el-icon-picture app-form-image-place" @click="isSelectImageShowed=true"></i>
        </el-form-item>
        <el-form-item label="排序" prop="sorted">
          <el-input v-model="category.sorted" size="mini" placeholder="请输入类目排序" min="0" type="number" />
        </el-form-item>
        <el-form-item label="显示" prop="is_showed">
          <el-switch v-model="category.is_showed"></el-switch>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>

    <fate-image :is-showed.sync="isSelectImageShowed" @get-selected-images="handleSelectedImages" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import FateImage from '@/components/FateImage'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '@/api/productCategory'
import { generateCategorySelector } from '@/utils'

const defaultCategory = {
  id: undefined,
  name: '',
  level: 0,
  parent_id: 0,
  image: '',
  sorted: '',
  is_showed: true
}

export default {
  name: 'Category',
  components: {
    Pagination,
    FateImage,
  },
  filters: {
    isShowedFilter(status) {
      const statusMap = {
        true: '显示',
        false: '隐藏'
      }
      return statusMap[status]
    },
    isShowedStyleFilter(status) {
      const statusMap = {
        true: 'success',
        false: 'warning'
      }
      return statusMap[status]
    }
  },
  data() {
    const validateParentId = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择一个上级类目'))
      } else {
        callback()
      }
    }

    return {
      category: Object.assign({}, defaultCategory),
      loading: false,
      list: [],
      listTotal: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        include: '',
        fields: {

        }
      },

      categoriesTree: [],

      dialogVisible: false,
      dialogType: 'edit',
      categoryFormRules: {
        name: [{ required: true, trigger: 'blur', message: '类目名称必须填写' }],
        sorted: [{ required: true, trigger: 'blur', message: '类目排序必须填写' }],
        parent_id: [{ required: true, trigger: 'blur', validator: validateParentId }],
      },

      isSelectImageShowed: false, // 显示图片库
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getCategories()
    },

    async getCategories() {
      this.listLoading = true
      const res = await getCategories(this.listQuery)
      this.list = res.data.data
      this.listTotal = res.meta.total
      this.listLoading = false

      this.categoriesTree = generateCategorySelector(res.data.categoriesTree)
      this.categoriesTree.unshift({
        'value': 0,
        'label': '顶级类目',
      })
    },

    /**
     * 添加类目
     */
    handleAddCategory(){
      this.category = Object.assign({}, defaultCategory)
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    /**
     * 编辑类目
     */
    handleEditCategory(category){
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.category = category
      this.$nextTick(() => {
        this.$refs['categoryForm'].clearValidate()
      })
    },

    /**
     * 删除类目
     */
    handleDeleteCategory({ $index, row }) {
      this.$confirm('关联的下级类目都会删除，确定删除类目吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteCategory(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
    },

    /**
     * 类目表单提交
     */
    submitForm() {
      this.$refs['categoryForm'].validate(async (valid) => {
        if (valid) {
          const isEdit = this.dialogType === 'edit'
          this.loading = true

          if (this.category.parent_id.length > 0) {
            this.category.parent_id = this.category.parent_id.pop()
          }

          if (isEdit) {
            const result = await updateCategory(this.category.id, this.category)
            const index = this.list.findIndex(v => v.id === this.category.id)
            this.list.splice(index, 1, Object.assign(this.category, result.data))
          } else {
            const { data } = await addCategory(this.category)
            this.category.id = data.id
            this.list.unshift(this.category)
          }

          this.loading = false
          this.dialogVisible = false
          this.$notify({
            title: `成功`,
            dangerouslyUseHTMLString: true,
            message: `
              <div>类目名称: ${this.category.name} </div>
            `,
            type: 'success'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    /**
     * 选择图片库的图片，保存到商品主图
     */
    handleSelectedImages(images) {
      this.category.image = images[0].path
    },
  }
}
</script>
<style>

</style>
