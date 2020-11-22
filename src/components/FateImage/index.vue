<template>
  <el-dialog
    title="选择图片"
    :visible="isShowed"
    @open="$_fateImages_dialogOpen"
    @close="$_fateImages_dialogClosed"
    center
  >
    <el-table
      isShowed="true"
      ref="imageTable"
      :data="list"
      tooltip-effect="dark"
      style="width: 100%"
      max-height="500"
      @selection-change="$_fateImages_handleSelectionChangeImages">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="name"
        label="图片"
        width="">
      </el-table-column>
      <el-table-column
        label="图片名称"
        width="">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.path"
            fit="contain"></el-image>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listTotal>0" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="$_fateImages_getImages" />

    <div slot="footer" class="dialog-footer">
      <el-button @click="$_fateImages_toggleImages()">取消选择</el-button>
      <el-button type="danger" @click="$_fateImages_handleDeleteImages">删除图片</el-button>
      <el-button type="primary" @click="$_fateImages_handleUseImages">使用选中的图片</el-button>
      <el-upload
        style="display: inline-block;margin-left: 10px;"
        :data="requestImageData"
        :headers="imageHeaders"
        :action="actionUrl"
        :multiple="false"
        :on-success="$_fateImages_handleImageSuccess"
        name="image"
      >
        <el-button type="primary" >上传图片</el-button>
      </el-upload>
    </div>
  </el-dialog>

</template>

<script>
  import Pagination from '@/components/Pagination'
  import { getImages, deleteImages } from '@/api/image'
  import { getToken } from '@/utils/auth'

  export default {
    name: 'FateImage',
    components: { Pagination },
    props: {
      // 显示该控件与否
      isShowed: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        actionUrl: process.env.VUE_APP_BASE_API + '/images',
        imageHeaders: {
          Authorization: getToken()
        },
        requestImageData: {},
        list: [],
        listTotal: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10
        },
        imageSelection: [],
      }
    },
    created() {
      this.$_fateImages_getImages()
    },
    methods: {
      async $_fateImages_getImages() {
        this.listLoading = true
        const res = await getImages(this.listQuery)
        this.list = res.data
        this.listTotal = res.meta.total
        this.listLoading = false
      },

      $_fateImages_toggleImages(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.imageTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.imageTable.clearSelection();
        }
      },

      $_fateImages_handleSelectionChangeImages(val) {
        this.imageSelection = val;
      },

      $_fateImages_handleImageSuccess(response) {
        this.list.unshift(response.data)
      },

      $_fateImages_handleDeleteImages() {
        this.$confirm('确定删除所选的图片吗？', 'Warning', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async() => {
            const imageIds = this.imageSelection.map(v => v.id)

            await deleteImages({ image_ids: imageIds })

            imageIds.map(v => {
              for (let index = 0; index < this.list.length; index++) {
                if (this.list[index].id === v) {
                  this.list.splice(index, 1)
                  break
                }
              }
            })

            this.$message({
              type: 'success',
              message: '删除成功'
            })

            this.getImages()
          })
          .catch(err => { console.error(err) })
      },

      $_fateImages_handleUseImages() {
        this.$emit('get-selected-images', this.imageSelection);
        this.$_fateImages_emitDialogVisible(false)
      },

      $_fateImages_dialogClosed() {
        this.$_fateImages_emitDialogVisible(false)
      },

      $_fateImages_dialogOpen() {
        this.$_fateImages_emitDialogVisible(true)
      },

      $_fateImages_emitDialogVisible(isVisible) {
        this.$emit('update:is-showed', isVisible);
      },
    },
  }
</script>

<style lang="scss" scoped>

</style>
