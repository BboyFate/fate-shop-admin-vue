<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="商品名称" style="width: 200px;" class="" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.on_sale" placeholder="已上架" clearable class="margin-right-10" style="width: 130px">
        <el-option v-for="item in onSaleOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="margin-right-10" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <router-link :to="'/product/crowdfunding/create'">
        <el-button type="primary">
          新增
        </el-button>
      </router-link>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      style="width: 100%;margin-top:30px;"
      border
    >
      <el-table-column align="center" label="ID">
        <template slot-scope="{ row }">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品名称">
        <template slot-scope="{ row }">
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="类目">
        <template slot-scope="{ row }">
          {{ row.category.full_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="已上架">
        <template slot-scope="{ row }">
          <el-tag :type="row.on_sale | onSaleStyleFilter">
            {{ row.on_sale | onSaleFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格">
        <template slot-scope="{ row }">
          {{ row.price }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="目前金额">
        <template slot-scope="{ row }">
          {{ row.crowdfunding.total_amount }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="目标金额">
        <template slot-scope="{ row }">
          {{ row.crowdfunding.target_amount }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="结束时间">
        <template slot-scope="{ row }">
          {{ row.crowdfunding.end_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="销量">
        <template slot-scope="{ row }">
          {{ row.sold_count }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="评论数">
        <template slot-scope="{ row }">
          {{ row.review_count }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <router-link :to="'/product/crowdfunding/edit/'+scope.row.id">
            <el-button type="primary" size="small" class="margin-right-10">
              编辑
            </el-button>
          </router-link>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getProducts" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {
  getCrowdfundingProducts,
  deleteProduct
} from '@/api/products/product'

export default {
  name: 'CrowdfundingProduct',
  components: {
    Pagination
  },
  filters: {
    onSaleFilter(status) {
      return onSaleMap()[status]
    },
    onSaleStyleFilter(status) {
      return onSaleStyleMap()[status]
    }
  },
  data() {
    return {
      list: [],
      listTotal: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        include: 'crowdfunding,category',
        fields: {
        }
      }
    }
  },
  computed: {
    onSaleOptions() {
      return onSaleOptions()
    }
  },
  created() {
    this.getProducts()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getProducts()
    },

    async getProducts() {
      this.listLoading = true
      const res = await getCrowdfundingProducts(this.listQuery)
      this.list = res.data
      this.listTotal = res.meta.total
      this.listLoading = false
    },

    handleDelete({ $index, row }) {
      this.$confirm('确定删除商品吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteProduct(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>
