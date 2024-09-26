<template>
  <div class="wrapper">
    <div class="login-container">
      <h1>Welcome back</h1>
      <input v-model="username" placeholder="Username" class="input-field" />
      <input v-model="password" type="password" placeholder="Password" class="input-field" />
      <ErrorMessage :error="error" />
      <button @click="login" class="login-button">Login</button>
      <p class="link">Don't have an account? <router-link to="/register">Sign up</router-link></p>
    </div>
  </div>
</template>

<script>

import ErrorMessage from '../components/MessageError.vue';

export default {
  components: {
    ErrorMessage
  },
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await this.$axios.$post('/login', {
          username: this.username,
          password: this.password
        });
        localStorage.setItem('token', response.token);
        this.$router.push('/todolist');
      } catch (error) {
        this.error = error.response?.data?.error ;
      }
    }
  }
};
</script>
