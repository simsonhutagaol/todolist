<template>
  <div class="home-wrapper">
    <div class="home-container">
      <h1 class="h1-home">Your Tasks, Your Future</h1>
      <p class="p-home">Organize your life and achieve your goals, one task at a time.</p>
      <button @click="goToLogin" class="home-button">Get Started</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

