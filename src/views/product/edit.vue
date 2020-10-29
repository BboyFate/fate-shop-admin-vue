<template>
  <product-detail :is-edit="true" :product-type="'normal'" />
</template>

<script>
import ProductDetail from './components/ProductDetail'

export default {
  name: 'EditProduct',
  components: { ProductDetail }
}
</script>

