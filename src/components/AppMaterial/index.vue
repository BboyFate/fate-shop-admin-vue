<template>
  <div v-if="type == 'image'">
    <!-- 已选择的素材 -->
    <ul v-for="(usedMaterial, usedMaterialsIndex) in usedMaterials" :key="index" class="el-upload-list el-upload-list--picture-card">
      <li tabindex="0" class="el-upload-list__item is-ready" :style="'width: '+width+'px;height: '+height+'px'">
        <div>
          <img :src="usedMaterial" alt="" class="el-upload-list__item-thumbnail">
          <span class="el-upload-list__item-actions">
            <span v-if="usedMaterialsIndex != 0" class="el-upload-list__item-preview" @click="handleMoveUsedMaterial(usedMaterialsIndex, 'up')">
              <i class="el-icon-back"/>
            </span>
            <span class="el-upload-list__item-preview" @click="handleZoomUsedMaterial(usedMaterialsIndex)">
              <i class="el-icon-view"/>
            </span>
            <span class="el-upload-list__item-delete" @click="handleDeleteUsedMaterial(usedMaterialsIndex)">
              <i class="el-icon-delete"/>
            </span>
            <span v-if="usedMaterialsIndex != usedMaterials.length - 1" class="el-upload-list__item-preview"
                  @click="handleMoveUsedMaterial(usedMaterialsIndex, 'down')">
              <i class="el-icon-right"/>
            </span>
          </span>
        </div>
      </li>
    </ul>
    <!-- 不超过最大限制数量 -->
    <div v-if="maximum > usedMaterials.length" tabindex="0" class="el-upload el-upload--picture-card"
         :style="'width: '+width+'px;height: '+height+'px;'+'line-height:'+height+'px;'" @click="handleShowMaterials">
      <i class="el-icon-plus"/>
    </div>

    <!-- 展示图片 -->
    <el-dialog append-to-body :visible.sync="imageDialogVisible" width="35%">
      <img :src="url" alt="" style="width: 100%">
    </el-dialog>
    <!-- 展示图片结束 -->

    <el-dialog title="图片素材库" append-to-body :visible.sync="materialsDialogVisible" width="70%">
      <el-container>
        <el-aside width="unset">
          <div style="margin-bottom: 10px">
            <el-button class="el-icon-plus" size="small" @click="handleAddMaterialGroup()">添加分组</el-button>
          </div>
          <el-tabs :value="currentMaterialGroup.name" v-loading="isMaterialGroupLoading" tab-position="left" @tab-click="handleMaterialGroup">
            <el-tab-pane
              v-for="(materialGroup, materialGroupIndex) in materialGroups"
              :key="materialGroupIndex"
              :name="materialGroup.name"
            >
              <span slot="label">{{ materialGroup.name }}</span>
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main>
          <el-card>
            <div slot="header">
              <el-row>
                <el-col :span="12">
                  <span>{{ currentMaterialGroup.name }}</span>
                  <span v-if="currentMaterialGroup.id != '0'">
                    <el-button size="small" type="text" class="el-icon-edit" style="margin-left: 10px;" @click="handleEditMaterialGroup(currentMaterialGroup)">重命名分组</el-button>
                    <el-button size="small" type="text" class="el-icon-delete" style="margin-left: 10px;color: red" @click="handleDeleteMaterialGroup(currentMaterialGroup)">删除分组</el-button>
                  </span>
                </el-col>
                <el-col :span="12" style="text-align: right;">
                  <el-upload
                    :action="addMaterialUrl"
                    :headers="addMaterialHeaders"
                    :data="addMaterialData"
                    :file-list="[]"
                    :on-progress="handleProgress"
                    :before-upload="beforeAddMaterial"
                    :on-success="handleSuccess"
                    multiple
                  >
                    <el-button size="small" type="primary">批量上传</el-button>
                  </el-upload>
                </el-col>
              </el-row>
            </div>
            <div v-loading="isGetMaterialsLoading">
              <el-alert v-if="materials.length <= 0" title="暂无数据" type="info" :closable="false" center show-icon/>
              <el-row :gutter="5">
                <el-checkbox-group v-model="urls" :max="maximum - usedMaterials.length">
                  <el-col v-for="(material, materialIndex) in materials" :key="materialIndex" :span="4">
                    <el-card :body-style="{ padding: '5px' }">
                      <el-image
                        style="width: 100%;height: 100px"
                        :src="material.path"
                        fit="contain"
                        :preview-src-list="[material.path]"
                        :z-index="999"
                      />
                      <div>
                        <el-checkbox class="material-name" :label="material.path">选择</el-checkbox>
                        <el-row>
                          <el-col :span="24" class="col-do">
                            <el-button type="text" size="medium" @click="handleDeleteMaterial(material)">删除</el-button>
                          </el-col>
                        </el-row>
                      </div>
                    </el-card>
                  </el-col>
                </el-checkbox-group>
              </el-row>
              <pagination
                v-show="materialsTotal>0"
                :total="materialsTotal"
                :page.sync="materialQueryParams.page"
                :limit.sync="materialQueryParams.limit"
                @pagination="getMaterials"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button @click="materialsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmSelectUrls">确认素材</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  import Pagination from '@/components/Pagination'
  import {
    getMaterials,
    updateMaterial,
    deleteMaterial,
    getMaterialGroups,
    addMaterialGroup,
    updateMaterialGroup,
    deleteMaterialGroup,
  } from '@/api/systems/material'
  import { getToken } from '@/utils/auth'
  import { mapGetters } from 'vuex'

  export default {
    name: 'AppMaterial',
    props: {
      // 已选择使用的素材数据
      usedMaterials: {
        type: Array,
        default() {
          return []
        }
      },
      // 素材类型
      type: {
        type: String
      },
      // 素材限制数量，默认 5 个
      maximum: {
        type: Number,
        default() {
          return 5
        }
      },
      // 宽度
      width: {
        type: Number,
        default() {
          return 148
        }
      },
      // 高度
      height: {
        type: Number,
        default() {
          return 148
        }
      }
    },
    components: {
      Pagination
    },
    computed: {
      ...mapGetters({
        addMaterialUrl: 'api/addMaterial'
      })
    },
    data() {
      return {
        index: '',  // 不定义会报错，暂不明
        addMaterialHeaders: {
          Authorization: getToken(),
        },
        addMaterialData: {},

        materialsDialogVisible: false,
        materials: [],
        materialsTotal: 0,
        materialQueryParams: {},
        isGetMaterialsLoading: false,

        materialGroups: [],
        currentMaterialGroup: {},
        isMaterialGroupLoading: false,


        imageDialogVisible: false,
        addMaterialsSucceedNumber: 0,
        url: '',
        urls: []
      }
    },
    methods: {
      /** 移动已选择使用的素材 **/
      handleMoveUsedMaterial(index, type) {
        if (type === 'up') {
          const temp = this.usedMaterials[index - 1]
          this.$set(this.usedMaterials, index - 1, this.usedMaterials[index])
          this.$set(this.usedMaterials, index, temp)
        }
        if (type === 'down') {
          const temp = this.usedMaterials[index + 1]
          this.$set(this.usedMaterials, index + 1, this.usedMaterials[index])
          this.$set(this.usedMaterials, index, temp)
        }
      },
      /** 聚焦已选择使用的素材 **/
      handleZoomUsedMaterial(index) {
        this.imageDialogVisible = true
        this.url = this.usedMaterials[index]
      },
      /** 删除已选择使用的素材 **/
      handleDeleteUsedMaterial(index) {
        const _this = this
        this.$confirm('是否确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.usedMaterials.splice(index, 1)
          _this.urls = []
        })
      },

      /**
       * 显示素材
       */
      handleShowMaterials() {
        this.materialsDialogVisible = true
        if (this.materials.length <= 0) {
          this.getMaterialGroups()
        }
      },
      /**
       * 获取素材分组列表
       */
      async getMaterialGroups() {
        this.isMaterialGroupLoading = true

        await getMaterialGroups().then(response => {
          this.isMaterialGroupLoading = false
          this.materialGroups = response.data
          this.materialGroups.unshift({
            id: '0',
            name: '全部分组'
          })
          this.handleMaterialGroup({ index: 0 })
        })
      },
      /**
       * 删除素材分组
       */
      handleDeleteMaterialGroup(currentMaterialGroup) {
        const _this = this
        this.$confirm('是否确认删除该分组？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          deleteMaterialGroup(currentMaterialGroup.id).then(() => {
            _this.$delete(_this.materialGroups, currentMaterialGroup.index)
            _this.handleMaterialGroup({index: 0})
          })
        })
      },
      /**
       * 编辑素材分组
       */
      handleEditMaterialGroup(currentMaterialGroup) {
        const _this = this
        this.$prompt('请输入分组名', '编辑素材分组', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: currentMaterialGroup.name
        }).then(({value}) => {
          updateMaterialGroup(currentMaterialGroup.id, {name: value}).then(() => {
            currentMaterialGroup.name = value
            _this.$set(_this.materialGroups, currentMaterialGroup.index, currentMaterialGroup)
          })
        }).catch(() => {

        })
      },
      /**
       * 添加素材分组
       */
      handleAddMaterialGroup() {
        const _this = this
        this.$prompt('请输入分组名', '添加素材分组', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({value}) => {
          addMaterialGroup({name: value}).then(() => {
            _this.getMaterialGroups()
          })
        }).catch(() => {

        })
      },
      /**
       * 点击素材分组
       * @param tab 选择的标签实例
       */
      handleMaterialGroup(tab) {
        this.currentMaterialGroup = this.materialGroups[tab.index]

        // 重新获取素材
        this.initMaterialQueryParams()
        this.getMaterials()
      },

      /**
       * 初始化 素材 查询参数
       */
      initMaterialQueryParams() {
        this.materialQueryParams = {
          page: 1,
          limit: 10,
          group_id: 0,
        }
      },
      /**
       * 获取素材列表
       */
      getMaterials() {
        this.isGetMaterialsLoading = true
        this.materialQueryParams.group_id = this.currentMaterialGroup.id || 0

        getMaterials(this.materialQueryParams).then(response => {
          this.materials = response.data
          this.materialsTotal = response.meta.total

          this.isGetMaterialsLoading = false
        }).catch(() => {
          this.isGetMaterialsLoading = false
        })
      },
      /**
       * 修改素材
       */
      handleEditMaterial(item) {
        const _this = this
        this.$prompt('请输入素材名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: item.name
        }).then(({value}) => {
          updateMaterial(item.id, {name: value}).then((response) => {
            const materialIndex = _this.materials.findIndex(material => material.id === item.id)
            this._this.splice(materialIndex, 1, Object.assign({}, response.data))
            this.msgSuccess('修改成功')
          })
        }).catch(() => {

        })
      },
      /**
       * 删除素材
       */
      handleDeleteMaterial(item) {
        const _this = this
        this.$confirm('是否确认删除该素材？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteMaterial(item.id).then(() => {
            const materialIndex = _this.materials.findIndex(material => material.id === item.id)
            this.materials.splice(materialIndex, 1)
            this.msgSuccess('删除成功')
          })
        })
      },


      materialUrl(item) {
        const that = this
        this.$prompt('素材链接', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: item.url
        }).then(({value}) => {

        }).catch(() => {

        })
      },

      handleProgress(event, file, fileList) {
        console.log(event)
        // let uploadProgress = file.percentage.toFixed(0)
        // this.uploadProgress = uploadProgress
      },
      /**
       * 添加素材成功后自动调用
       */
      handleSuccess(response, file, fileList) {
        console.log(response)
        console.log(file)
        console.log(fileList)

        this.addMaterialsSucceedNumber++
        if (fileList.length === this.addMaterialsSucceedNumber) {
          this.addMaterialsSucceedNumber = 0
          this.getMaterials()
        }
      },
      /**
       * 添加素材之前自动调用
       */
      beforeAddMaterial(file) {
        const isPic =
          file.type === 'image/jpeg' ||
          file.type === 'image/png' ||
          file.type === 'image/gif' ||
          file.type === 'image/jpg'
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isPic) {
          this.$message.error('上传图片只能是 JPG、JPEG、PNG、GIF 格式!')
          return false
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!')
        }

        this.addMaterialData.group_id = this.currentMaterialGroup.id || 0
        this.addMaterialData.type = 'image'

        return isPic && isLt2M
      },

      /**
       * 确认选择的素材
       */
      handleConfirmSelectUrls() {
        this.urls.forEach(url => {
          this.$set(this.usedMaterials, this.usedMaterials.length, url)
        })
        this.materialsDialogVisible = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  /*/deep/ .el-icon-circle-close{*/
  /*  color: red;*/
  /*}*/
  .material-name {
    padding: 8px 0px;
  }

  .col-do {
    text-align: center;
  }

  .button-do {
    padding: unset !important;
    font-size: 12px;
  }
</style>

