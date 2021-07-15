<template>
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" >
      选择图片
    </el-button>
  </div>
</template>

<script>

export default {
  name: 'EditorSlideUpload',
  components: {

  },
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
    }
  },
  methods: {
    handleSelectedImages(images) {
      this.$emit('successCBK', images)
    }
  }
}
</script>
