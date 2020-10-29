<template>
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" @click="isSelectImageShowed=true">
      选择图片
    </el-button>

    <fate-image :is-showed.sync="isSelectImageShowed" @get-selected-images="handleSelectedImages" />
  </div>
</template>

<script>
import FateImage from '@/components/FateImage'

export default {
  name: 'EditorSlideUpload',
  components: { FateImage },
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
      isSelectImageShowed: false,
    }
  },
  methods: {
    handleSelectedImages(images) {
      this.$emit('successCBK', images)
    },
  }
}
</script>
