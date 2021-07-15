<template>
  <fee-detail :is-edit="true" />
</template>

<script>
import FeeDetail from './components/Detail'

export default {
  name: 'EditExpressFee',
  components: { FeeDetail }
}
</script>

