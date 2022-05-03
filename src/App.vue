<template>
  <div id="statusMsg" :class="{ error: statusIsError }">{{ statusMsg }}</div>
  <div id="nav" class="tab-container tabs-classic">
    <ul>
      <li class="tab-item-content">
        <router-link to="/">AllowLists</router-link>
      </li>
      <li class="tab-item-content">
        <router-link to="/entities">Entities</router-link>
      </li>
    </ul>
  </div>
  <router-view/>
</template>

<script>
export default {
  computed: {
    statusMsg () { return this.$store.state.statusMsg; },
    statusIsError () { return this.$store.state.statusIsError; }
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
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#statusMsg {
  color: green;
  float: right;
  font-weight: bold;
  margin: 1em 2em 0 0;
  padding: 5px 2em;
}

#statusMsg.error {
  color: red;
}
</style>
