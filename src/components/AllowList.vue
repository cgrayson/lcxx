<template>
  <div class="row">
    <div class="col-4 nav-controls">
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

      <div>
        <h2>account lookup</h2>
        <label>
          <input type="text" v-model="account.apiKey" style="width: 90%;" placeholder="account API key"/>
        </label>
        <button @click="getAccountInfo" v-bind:disabled="!account.apiKey">search <i class="fa-wrapper fa fa-binoculars"></i></button>
        <br/>
        <div v-if="account.id">
          ID: <code>{{ account.id }}</code><br/>
          name: {{ account.name }}<br/>
          <button @click="addAccountToSelected(account.id)">add to allowlist <i class="fa-wrapper fa fa-arrow-right"></i></button>
        </div>
        <button @click="addAccountToSelected('public')">add 'public' to allowlist <i class="fa-wrapper fa fa-arrow-right"></i></button>
      </div>

      <div class="integration-list">
        <h2>integrations</h2>
        <div v-for="integration in integrations" :key="integration.id">
          <div @click="select(integration)">
            <a href="javascript:">{{ integration.id }}</a>
            ({{ integration.account_ids.length }})
          </div>
        </div>
      </div>

      <div style="padding-top: 1em;">
        <input type="text" v-model="newPackageName" style="width: 90%;"/>
        <button @click="addPackage()" class="btn-info" v-bind:disabled="newPackageName === 'leadconduit-'">add new</button><br/>
      </div>
    </div>
    <div class="col-1">

    </div>
    <div v-if="selected.id" class="col-7 view-allowlist">
      <div>
        <button @click="updatePackage()" v-bind:disabled="!selected.dirty" class="btn-info">save changes</button><br/>
        <h2>{{ selected.id }}</h2>
      </div>
      <div v-if="selected.account_ids.length">
        <table border="0">
          <thead>
            <tr><th>LC Account ID</th><th>Account Name</th><th>&nbsp;</th></tr>
          </thead>
          <tbody>
            <tr v-for="id in selected.account_ids" :key="id" v-bind:class="{ 'already-allowlisted': alreadyListed(id) }">
              <td><code class="bg-gray-200 text-gray-900">{{ id }}</code></td>
              <td>{{ lookupAccount(id) || '-- ? --' }}</td>
              <td>
                <button @click="removeAccount(id)" class="btn-xsmall text-orange-900 bg-orange-200">
                  remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-warning u-text-center">
        <h3>Warning</h3>
        <p style="font-weight: bold;">An allowlist with no accounts will make this integration inaccessible to everyone.</p>
      </div>

      <button @click="deletePackage()" class="outline btn-danger">delete</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AllowList',
  data () {
    return {
      account: {
        apiKey: '',
        id: null,
        name: null
      },
      environment: null,
      integrations: [],
      accountMap: {},
      selected: {},
      newPackageName: 'leadconduit-'
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
        .catch(error => this.flashError(error.message));
      this.loadData();
    },
    flashError(message) {
      this.flashMessage(message, true);
    },
    flashMessage(message, error = false, erase = true) {
      this.$store.commit('flashMessage', { message, error, erase });
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
            this.flashError(response.data.status === 401 ? 'Account not found' : response.data.message || 'Error getting account info');
          }
        })
        .catch(error => this.flashError(error.message));
    },
    lookupAccount(accountId = '') {
      return this.accountMap[accountId.substr(14)];
    },
    loadData() {
      this.selected.dirty = false;
      this.newPackageName = 'leadconduit-';
      axios.get('/accountMap')
          .then(response => (this.accountMap = response.data))
          .catch(error => this.flashError(error.message));

      axios.get('/allowlists', {})
          .then(response => { this.integrations = response.data; this.selected = this.integrations[0]; })
          .catch(error => this.flashError(error.message));
    },
    removeAccount(accountId) {
      this.selected.account_ids.splice(this.selected.account_ids.indexOf(accountId), 1);
      this.selected.dirty = true;
    },
    select(integration) {
      this.selected = integration;
    },
    addPackage() {
      axios.post(`/packages/${this.newPackageName}`)
          .then(response => {
            this.flashMessage(response.status === 200 ? this.newPackageName + ' created' : 'uh-oh :-(');
            this.loadData();
          })
          .catch(error => this.flashError(error.message));
    },
    deletePackage() {
      var sure = confirm('Are you sure you want to delete this allowlist completely?');
      if (sure) {
        axios.delete(`/packages/${this.selected.id}`)
            .then(response => {
              this.flashMessage(response.status === 200 ? this.selected.id + ' deleted' : 'uh-oh :-(');
              this.loadData();
            })
            .catch(error => this.flashError(error.message));
      }
    },
    updatePackage() {
      const accountIds = this.selected.account_ids;
      axios.put(`/packages/${this.selected.id}`, { accountIds: accountIds })
        .then(response => {
          this.flashMessage(response.status === 200 ? this.selected.id + ' updated' : 'uh-oh :-(');
          this.selected.dirty = false;
        })
        .catch(error => this.flashError(error.message));
    }
  },
  created () {
    axios.get('/environment')
        .then(response => (this.environment = response.data.env))
        .catch(error => this.flashError(error.message));

    this.loadData();
  }
}
</script>

<style>
table {
  border-collapse: collapse;
}
.already-allowlisted {
  background-color: palegreen;
}
.integration-list {
  text-align: left;
}
.nav-controls {
  border: solid lightblue;
  padding: 0.5em;
  text-align: left;
}
.nav-controls button {
  margin: 0.5em 0.5em 0 0;
}
.nav-controls h2 {
  margin-bottom: 0;
}
.view-allowlist {
  margin-left: 4em;
  text-align: left;
}
.view-allowlist button {
  float: right;
}
.view-allowlist td {
  padding: 4px;
}
</style>
