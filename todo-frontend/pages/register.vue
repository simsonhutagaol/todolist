<template>
  <div class="wrapper">
    <div class="register-container">
      <h1>Register Now and Start Organizing Your Life!</h1>
      <input v-model="username" placeholder="Username" class="input-field" />
      <input v-model="password" type="password" placeholder="Password" class="input-field" />
      <ErrorMessage :error="error" />
      <button @click="register" class="register-button">Register</button>
      <p class="link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
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
    async register() {
      try {
        const { data } = await this.$axios.$post('/register', {
          username: this.username,
          password: this.password
        });
        console.log('ini adalah balikan dari backend',data)


        this.error = '';
        alert('Registration successful');
        this.$router.push('/login');
      } catch (error) {
        this.error = error.response.data.error || 'An error occurred';
      }
    }
  }
};
</script>
