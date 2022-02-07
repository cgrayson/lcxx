<template>
  <div class="hello">
    <h1>Hello, {{ msg }}</h1>
    <div v-if="error" style="color: red;">{{ error }}</div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      error: null
    }
  }
}
</script>
