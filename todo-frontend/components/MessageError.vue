<template>
  <p v-if="error" class="error-message animated">{{ error }}</p>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
      default: ''
    }
  }
};
</script>

