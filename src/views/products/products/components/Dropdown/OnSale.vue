<template>
  <el-dropdown :show-timeout="100" trigger="click">
    <el-button plain>
      {{ !onSale?'上架':'下架' }}
      <i class="el-icon-caret-bottom el-icon--right" />
    </el-button>
    <el-dropdown-menu slot="dropdown" class="no-padding">
      <el-dropdown-item>
        <el-radio-group v-model="onSale" style="padding: 10px;">
          <el-radio :label="true">
            上架
          </el-radio>
          <el-radio :label="false">
            下架
          </el-radio>
        </el-radio-group>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    onSale: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
