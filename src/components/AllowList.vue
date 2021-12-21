<template>
  <div v-if="error" class="error">{{ error }}</div>
  <div class="nav-controls">
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
      <button @click="getAccountInfo" v-bind:disabled="!account.apiKey">look up account</button>
      <br/>
      <div v-if="account.error" class="error">{{ account.error }}</div>
      <div v-else-if="account.id">
        ID: <code>{{ account.id }}</code><br/>
        name: {{ account.name }}<br/>
        <button @click="addAccountToSelected(account.id)">add to allowlist</button>
      </div>
    </div>

    <div class="integration-list">
      <div v-for="integration in integrations" :key="integration.id">
        <div @click="select(integration)">{{ integration.id }} ({{ integration.account_ids.length }})</div>
      </div>
    </div>
  </div>

  <div v-if="selected.id" class="view-allowlist">
    <div>
      <button @click="updatePackage()" v-bind:disabled="!selected.dirty">save changes</button>
      <h2>{{ selected.id }}</h2>
    </div>
    <table>
      <thead>
        <tr><th>LC Account ID</th><th>Account Name</th><th>&nbsp;</th></tr>
      </thead>
      <tbody>
        <tr v-for="id in selected.account_ids" :key="id" v-bind:class="{ 'already-allowlisted': alreadyListed(id) }">
          <td><code>{{ id }}</code></td>
          <td>{{ lookupAccount(id) || '-- ? --' }}</td>
          <td> &nbsp; </td>
        </tr>
      </tbody>
    </table>
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
        apiKey: '5771bbd5fc4aae6796b8d14f85fe6a71',
        id: null,
        name: null,
        error: null
      },
      environment: null,
      error: null,
      integrations: [],
      accountMap: {},
      selected: {}
    }
  },
  methods: {
    alreadyListed(id) {
      return this.account && id === this.account.id;
    },
    addAccountToSelected(accountId) {
      if(this.selected.account_ids && !this.selected.account_ids.includes(accountId)) {
        this.selected.account_ids.push(accountId);
        this.selected.dirty = true;
      }
    },
    changeEnv() {
      axios.put(`/environment/${this.environment}`)
        .catch(error => this.error = error.message);
      this.loadData();
    },
    getAccountInfo() {
      axios.get(`/account/${this.account.apiKey}`)
        .then(response => {
          this.account.id = null;
          if (response.data.id) {
            this.account = response.data;
            this.accountMap[this.account.id.substr(14)] = this.account.name;
          }
          else {
            this.account.error = response.data.message || 'Error getting account info';
          }
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

      axios.get('/allowlists', {})
          .then(response => { this.integrations = response.data; this.selected = this.integrations[1]; })
          .catch(error => this.error = error.message);
    },
    select(integration) {
      this.selected = integration;
    },
    updatePackage() {
      const accountIds = this.selected.account_ids;
      axios.put(`/packages/${this.selected.id}`, { accountIds: accountIds })
        .then(response => {
          this.actionStatus = response.status === 200 ? this.selected.id + ' updated' : 'uh-oh :-(';
          this.selected.dirty = false;
        })
        .catch(error => this.actionStatus = 'uh-oh! ' + error.message);
    }
  },
  created () {
    axios.get('/environment')
        .then(response => (this.environment = response.data.env))
        .catch(error => this.error = error.message);

    this.loadData();
  }
}
</script>

<style>
.already-allowlisted {
  background-color: palegreen;
}
.integration-list {
  text-align: left;
}
.nav-controls {
  float: left;
  width: 25%;
}
.nav-controls button {
  margin: 0.5em 0.5em 0 0;
}
.view-allowlist {
  float: left;
  margin-left: 4em;
  text-align: left;
  width: 40%;
}
.view-allowlist button {
  float: right;
}
.view-allowlist td {
  padding: 4px;
}
</style>
