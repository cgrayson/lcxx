<template>
  <div v-if="error" class="error">{{ error }}</div>
  <div style="float: right; width: 35%; border: solid gold; padding: 1em; text-align: left;">
    <label>
      Account API key:<br/>
      <input type="text" v-model="account.apiKey" style="width: 90%;"/>
    </label><br/>
    ID: <code>{{ account.id }}</code><br/>
    name: {{ account.name }}<br/>
    <button @click="getAccountInfo">look up account</button>
  </div>

  <div>
    <div>
      <div v-for="integration in integrations" :key="integration.id">
        <h2>{{ integration.id }}</h2>
        <textarea id="story" name="story" rows="5" cols="33" v-model="integration.account_ids" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AllowList',
  props: {
    msg: String
  },
  data () {
    return {
      account: {
        apiKey: null,
        id: '-',
        name: '-'
      },
      error: null,
      integrations: []
    }
  },
  methods: {
    getAccountInfo() {
      axios
        .get(`/account/${this.account.apiKey}`, { params: { apiKey: this.account.apiKey } } )
        .then(response => (this.account = response.data))
        .catch(error => this.error = error.message);
    }
  },
  mounted () {
    axios
      .get('/allowlists', {})
      .then(response => (this.integrations = response.data))
      .catch(error => this.error = error.message);
  }
}
</script>
