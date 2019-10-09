import Vue from 'vue'
import App from './App'
import VueSplit from 'vue-split-panel'
import VueMsg from 'vue-msgs'
import './assets/iconfont/iconfont.css'

Vue.use(VueSplit)
Vue.use(VueMsg, { timeout: 2000, top: 100, right: 20 })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
