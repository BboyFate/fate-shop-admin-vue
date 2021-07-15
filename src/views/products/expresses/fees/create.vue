<template>
  <fee-detail :is-edit="false" />
</template>

<script>
import FeeDetail from './components/Detail'

export default {
  name: 'CreateExpressFee',
  components: { FeeDetail }
}
</script>

