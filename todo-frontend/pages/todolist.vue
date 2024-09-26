<template>
  <div class="container" style="margin-top: 5%;">
    <h1>To-do List</h1>
    <ErrorMessage :error="error" />
    <input
      v-model="newTask"
      @keyup.enter="addTask"
      placeholder="Add a new task..."
      class="task-input"
    />
    <button @click="logout" class="logout-button">Logout</button>
    <ul class="todo-list">
      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <input type="checkbox" v-model="todo.completed" @change="updateCompleted(todo)" />
        {{ todo.task }}
        <button @click="deleteTask(todo.id)" class="delete-button">Delete</button>
      </li>
    </ul>
    <div class="empty-state">
      <p v-if="todos.length === 0" class="fade-in">There are no task yet</p>
      <img v-if="todos.length === 0" src="../assets/list.gif" alt="No events" class="empty-gif"/>
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
      todos: [],
      newTask: '',
      error: ''
    };
  },
  async fetch() {
    const token = localStorage.getItem('token');
    const response = await this.$axios.$get('/todos', {
      headers: {
        Authorization: token
      }
    });
    this.todos = response;
  },
  methods: {
    async addTask() {
      try {
        if (!this.newTask) return;
        const token = localStorage.getItem('token');
        const response = await this.$axios.$post('/todos', { task: this.newTask }, {
          headers: {
            Authorization: token
          }
        });

        this.todos.push(response);
        this.newTask = '';
        this.error = '';
      } catch (error) {
        this.error = error.response?.data?.error;
      }
    },
    async updateCompleted(todo) {
      const token = localStorage.getItem('token');
      await this.$axios.$patch(`/todos/${todo.id}`, { completed: todo.completed }, {
        headers: {
          Authorization: token
        }
      });
    },
    async deleteTask(id) {
      const token = localStorage.getItem('token');
      await this.$axios.$delete(`/todos/${id}`, {
        headers: {
          Authorization: token
        }
      });
      this.todos = this.todos.filter(todo => todo.id !== id);
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
};
</script>
