import Folder from './components/Folder.vue'

Folder.install = function (Vue, opt = {}) {
  if (install.installed) return
  install.installed = true
  Vue.component('Folder', Folder)
}

export default Folder

