<template>
  <div v-if="error" class="error">{{ error }}</div>
  <div style="float: left; width: 25%;">
    <div style="border: dashed green; padding: 1em; text-align: left;">
      {{ actionStatus }}<br/>
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

    <div style="border: solid gold; margin-top: 1em; padding: 1em; text-align: left;">
      <label>
        <input type="text" v-model="account.apiKey" style="width: 90%;" placeholder="account API key"/>
      </label><br/>
      <button @click="getAccountInfo" style="margin-top: 0.5em;">look up account</button><br/>
      <div v-if="account.id">
        ID: <code>{{ account.id }}</code><br/>
        name: {{ account.name }}<br/>
      </div>
    </div>

    <div>
      <div v-for="integration in integrations" :key="integration.id">
        <div @click="select(integration)">{{ integration.id }} ({{ integration.account_ids.length }})</div>
      </div>
    </div>
  </div>

  <div v-if="selected">
    <h2>{{ selected.id }}</h2>
    <textarea id="story" name="story" rows="5" cols="33" v-model="selected.account_ids" />
    <button @click="updatePackage(selected)">update</button>
    <div>
      <ol>
        <li v-for="id in selected.account_ids" :key="id">{{ id }} = {{ lookupAccount(id) }}</li>
      </ol>
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
        id: null,
        name: null
      },
      environment: null,
      error: null,
      integrations: [],
      accountMap: {},
      selected: {}
    }
  },
  methods: {
    changeEnv() {
      axios
        .put(`/environment/${this.environment}`)
        .catch(error => this.error = error.message);
      this.loadData();
    },
    getAccountInfo() {
      axios
        .get(`/account/${this.account.apiKey}`)
        .then(response => {
          this.account = response.data;
          this.accountMap[this.account.id.substr(14)] = this.account.name;
        })
        .catch(error => this.error = error.message);
    },
    lookupAccount(accountId = '') {
      return this.accountMap[accountId.substr(14)];
    },
    loadData() {
      axios.get('/accountMap')
          .then(response => (this.accountMap = response.data))
          .catch(error => this.error = error.message);

      axios
          .get('/allowlists', {})
          .then(response => (this.integrations = response.data))
          .catch(error => this.error = error.message);
    },
    select(integration) {
      this.selected = integration;
    },
    updatePackage(packageObj) {
      axios
        .put(`/packages/${packageObj.id}`, { accountIds: packageObj.account_ids })
        .then(response => (this.actionStatus = response.status === 200 ? packageObj.id + ' updated' : 'uh-oh :-('))
        .catch(error => this.actionStatus = 'uh-oh! ' + error.message);
    }
  },
  mounted () {
    axios.get('/environment')
        .then(response => (this.environment = response.data.env))
        .catch(error => this.error = error.message);

    this.loadData();
  }
}
</script>
