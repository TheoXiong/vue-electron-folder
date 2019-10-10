import Folder from './components/Folder.vue'

Folder.install = function (Vue, opt = {}) {
  if (Folder.installed) return
  Folder.installed = true
  Vue.component('Folder', Folder)
}

export default Folder

