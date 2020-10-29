<template>
  <product-detail :is-edit="true" :product-type="'crowdfunding'" />
</template>

<script>
import ProductDetail from '../components/ProductDetail'

export default {
  name: 'EditCrowdfundingProduct',
  components: { ProductDetail }
}
</script>

