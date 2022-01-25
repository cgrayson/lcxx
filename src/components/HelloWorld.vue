<template>
  <div class="hello">
    <h1>Hello, {{ msg }}</h1>
    <div v-if="error" style="color: red;">{{ error }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      error: null,
      entities: []
    }
  },
  mounted () {
    axios
      .get('/entities', {})
      .then(response => (this.entities = response.data))
      .catch(error => this.error = JSON.stringify(error));
  }
}
</script>
