<template>
  <HelloWorld/>
  <AllowList/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import AllowList from './components/AllowList.vue'

export default {
  name: 'App',
  components: {
    AllowList,
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
