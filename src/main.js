import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      environment: null,
      statusMsg: '',
      statusIsError: false
    }
  },
  mutations: {
    changeEnv (state, newEnv) {
      state.environment = newEnv;
    },
    flashMessage (state, { message, error, erase }) {
      state.statusMsg = message;
      state.statusIsError = error;
      if (erase) {
        setTimeout(() => { state.statusMsg = '' }, 6000);
      }
    }
  }
})

createApp(App).use(store).use(router).mount('#app')
