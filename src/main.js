import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      environment: null, // environment will be initiated by response from `/environment`
      statusMsg: '',
      statusIsError: false
    }
  },
  mutations: {
    changeEnv (state, newEnv) {
      state.environment = newEnv;
    },
    flashError (state, message) {
      state.statusIsError = true;
      store.commit('flashMessage', message);
    },
    flashMessage (state, message) {
      state.statusMsg = message;
      setTimeout(() => { state.statusMsg = ''; state.statusIsError = false }, 6000);
    }
  }
})

createApp(App).use(store).use(router).mount('#app')
