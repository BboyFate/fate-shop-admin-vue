<template>
  <product-detail :is-edit="false" :product-type="'crowdfunding'" />
</template>

<script>
import ProductDetail from '../components/ProductDetail'

export default {
  name: 'CreateCrowdfundingProduct',
  components: { ProductDetail }
}
</script>

