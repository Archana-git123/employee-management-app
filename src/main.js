import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/en-US'
import quasarIconSet from 'quasar/icon-set/material-icons'
import App from './App.vue'
import router from './router'

// global axios
import axios from 'axios'
import VueAxios from 'vue-axios'

import './styles/quasar.sass'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

app.use(Quasar, {
  plugins: {},
  lang: quasarLang,
  iconSet: quasarIconSet
})

app.use(router)
app.use(VueAxios, axios)

app.mount('#app')
