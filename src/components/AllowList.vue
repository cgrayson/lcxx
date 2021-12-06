<template>
  <div v-if="error" class="error">{{ error }}</div>
  <div style="float: right; width: 35%;">
    <div style="border: solid gold; padding: 1em; text-align: left;">
      <label>
        Account API key:<br/>
        <input type="text" v-model="account.apiKey" style="width: 90%;"/>
      </label><br/>
      ID: <code>{{ account.id }}</code><br/>
      name: {{ account.name }}<br/>
      <button @click="getAccountInfo">look up account</button>
    </div>

    <div style="border: dashed green; margin-top: 2em; padding: 1em; text-align: left;">
      {{ actionStatus }}
    </div>
  </div>

  <div>
    <div>
      <div v-for="integration in integrations" :key="integration.id">
        <h2>{{ integration.id }}</h2>
        <textarea id="story" name="story" rows="5" cols="33" v-model="integration.account_ids" />
        <button @click="updatePackage(integration)">update</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AllowList',
  data () {
    return {
      actionStatus: null,
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
        .get(`/account/${this.account.apiKey}`)
        .then(response => (this.account = response.data))
        .catch(error => this.error = error.message);
    },
    updatePackage(packageObj) {
      axios
        .put(`/packages/${packageObj.id}`, { accountIds: packageObj.account_ids })
        .then(response => (this.actionStatus = response.status === 200 ? packageObj.id + ' updated' : 'uh-oh :-('))
        .catch(error => this.actionStatus = 'uh-oh! ' + error.message);
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
