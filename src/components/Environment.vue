<template>
  <div>
    <h2>environment</h2>
    <input type="radio" id="local" value="local" v-model="environment" @change="changeEnv">
    <label for="local">local</label>
    <br>
    <input type="radio" id="development" value="development" v-model="environment" @change="changeEnv">
    <label for="development">development</label>
    <br>
    <input type="radio" id="staging" value="staging" v-model="environment" @change="changeEnv">
    <label for="staging">staging</label>
    <br>
    <input type="radio" id="production" value="production" v-model="environment" @change="changeEnv">
    <label for="production">production</label>
  </div>
</template>

<script>
import axios from "axios";
import { mapMutations } from 'vuex';

export default {
  name: "Environment.vue",
  data () {
    return {
      environment: null
    };
  },
  methods: {
    ...mapMutations(['flashError', 'flashMessage']),
    changeEnv() {
      this.flashMessage(`changing env to: ${this.environment}`);
      axios.put(`/environment/${this.environment}`)
          .catch(error => this.flashError(error.message));
      this.$store.commit('changeEnv', this.environment);
    },
  },
  created () {
    axios.get('/environment')
        .then(response => (this.environment = response.data.env))
        .catch(error => this.flashError(error.message));
  }
}
</script>

<style scoped>

</style>
