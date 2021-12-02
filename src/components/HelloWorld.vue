<template>
  <div class="hello">
    <h1>{{ msg }} - {{ info }}</h1>
    <span style="color: red;">{{ error }}</span>
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
      info: '.'
    }
  },
  mounted () {
    axios
      .get('http://localhost:8080/entities', {})
      .then(response => (this.info = response))
      .catch(error => this.error = JSON.stringify(error));
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
