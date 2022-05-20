<template>
  <div class="row">
    <div class="col-4 nav-controls">
      <Environment />

      <div class="entity-list">

        <div :class="{ 'animated loading loading-right': loading }">
          <div style="float: right;">
            <button @click="addNewEntity()" class="btn-xsmall btn-info">add</button>
          </div>
          <h2>entities <span id="entityCount">[count: {{ entities.length }}]</span></h2>
        </div>
        <input type="text" v-model="filterTerm" placeholder="filter by name or id..."/>

        <div v-for="entity in filteredEntities" :key="entity.id">
          <div @click="select(entity)">
            <a href="javascript:">{{ entity.name }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="col-1">&nbsp;</div>

    <div v-if="selected.name" class="col-7 view-allowlist">
      <div>
        <button @click="updateEntity()" v-bind:disabled="!saveable()" class="btn-info">save changes</button><br/>
        <h2>{{ selected.name }}</h2>
      </div>
      <div>
        <p>id: <code class="bg-gray-200 text-gray-900">{{ selected.id }}</code></p>
        <p>name: <input type="text" v-model="selected.name" @change="selected.dirty = true"/></p>
        <p>source:
          <select v-model="selected.source" @change="selected.dirty = true">
            <option v-for="option in options.sources" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
        </p>
        <p>recipient:
          <select v-model="selected.recipient" @change="selected.dirty = true">
            <option v-for="option in options.recipients" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
        </p>
        <p v-if="selected.website">website: <a :href="selected.website">{{ selected.website }}</a> </p>

        <p>
          <label for="standard">standard:</label>
          <input id="standard" type="checkbox" v-model="selected.standard" @change="selected.dirty = true"/>
        </p>

        <p>module_ids:</p>
        <ol v-if="selected.module_ids.length">
          <li v-for="(moduleId, index) in selected.module_ids" v-bind:key="moduleId">
            <div style="margin: 1.5em 0;">
              <code class="bg-gray-200 text-gray-900">{{ moduleId }}</code>
              <button @click="removeModuleId(index)" class="btn-xsmall text-orange-900 bg-orange-200">remove</button>
            </div>
          </li>
        </ol>
        <p v-else style="font-style: italic;">none</p>
      </div>

      <div>
        <input type="text" v-model="newModuleId" style="width: 70%;"/>
        <button @click="addModuleId()" class="btn-xsmall btn-info" v-bind:disabled="newModuleId === 'leadconduit-'">add module</button><br/>
      </div>

      <div style="text-align: center;">
        <input id="showFull" type="checkbox" v-model="showFullRecord"/>
        <label for="showFull">show full record</label>
      </div>
      <div v-if="showFullRecord">
        <pre>{{ selected }}</pre>
      </div>

      <div style="clear: both;">
        <button @click="deleteEntity()" class="outline btn-danger">delete</button>
      </div>
    </div>
  </div>
</template>

<script>

import axios from "axios";
import { mapMutations } from 'vuex';
import Environment from '../components/Environment.vue'

export default {
  name: 'Entities',
  components: {
    Environment
  },
  data () {
    return {
      entities: [],
      filterTerm: '',
      loading: false,
      newEntity: {},
      newModuleId: 'leadconduit-',
      selected: {},
      showFullRecord: false,
      options: {
        sources: [ 'seller', 'other', 'form', null ],
        recipients: [ 'buyer', 'crm', 'analytics', 'enhancement', 'esp', 'other', null ]
      }
    }
  },
  computed: {
    filteredEntities() {
      return this.entities.filter(entity => {
        return (entity.id.toLowerCase().includes(this.filterTerm) || entity.name.toLowerCase().includes(this.filterTerm));
      });
    }
  },
  methods: {
    ...mapMutations(['flashError', 'flashMessage']),
    addNewEntity() {
      this.resetNewEntity();
      this.selected = this.newEntity;
    },
    addModuleId() {
      this.selected.module_ids.push(this.newModuleId);
      this.selected.dirty = true;
    },
    deleteEntity() {
      var sure = confirm('Are you sure you want to delete this entity?');
      if (sure) {
        axios.delete(`/entities/${this.selected.id}`)
            .then(response => {
              this.flashMessage(response.status === 200 ? this.selected.id + ' deleted' : 'uh-oh :-(');
              this.loadData();
            })
            .catch(error => this.flashError(error.message));
      }
    },
    loadData(selectEntityId) {
      this.loading = true;
      this.entities = [];
      this.select({});
      axios.get('/entities', {})
          .then(response => {
            this.entities = response.data;
            if(selectEntityId) {
              for(let i = 0; i < this.entities.length; i++) {
                if(this.entities[i].id === selectEntityId) {
                  this.selected = this.entities[i];
                  break;
                }
              }
            } else {
              // just pick one
              this.selected = this.entities[3];
            }
          })
          .catch(error => this.flashError(error.message))
          .finally(() => this.loading = false);
    },
    removeModuleId(index) {
      this.selected.module_ids.splice(index, 1);
      this.selected.dirty = true;
    },
    resetNewEntity() {
      this.newEntity = {
        name: 'New Entity', source: null, recipient: null, module_ids: [], account: false, standard: true
      };
    },
    saveable() {
      if(this.selected.id) {
        // existing entity
        return this.selected.dirty;
      } else {
        // must be a new entity
        return (
            this.selected.module_ids.length > 0 &&
            this.selected.name.length > 0 &&
            (this.selected.source !== null || this.selected.recipient != null)
        );
      }
    },
    select(item) {
      this.selected = item;
    },
    updateEntity() {
      delete this.selected.dirty;
      if (this.selected.id) {
        axios.put(`/entities/${this.selected.id}`, this.selected)
            .then(response => {
              this.flashMessage(response.status === 200 ? this.selected.name + ' updated' : 'uh-oh :-(');
            })
            .catch(error => this.flashError(error.message));
      } else {
        axios.post(`/entities`, this.selected)
            .then(response => {
              this.flashMessage(response.status === 200 ? this.selected.name + ' created' : 'uh-oh :-(');
              const newEntityId = response.data.id;
              this.loadData(newEntityId);
            })
            .catch(error => this.flashError(error.message));
      }
    }
  },
  created () {
    this.$store.subscribe((mutation) => {
      if(mutation.type === 'changeEnv') this.loadData();
    });

    axios.get('/environment')
        .then(response => (this.environment = response.data.env))
        .catch(error => this.flashError(error.message));

    this.loadData();
    this.resetNewEntity();
  }
}
</script>

<style>
#entityCount {
  font-size: small;
  color: silver;
}
</style>
