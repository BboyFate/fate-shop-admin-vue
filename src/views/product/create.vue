<template>
  <product-detail :is-edit="false" :product-type="'normal'" />
</template>

<script>
import ProductDetail from './components/ProductDetail'

export default {
  name: 'CreateProduct',
  components: { ProductDetail }
}
</script>

