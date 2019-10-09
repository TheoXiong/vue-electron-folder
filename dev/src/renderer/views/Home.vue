<template>
  <div class="home">
    <div class="tool">
      <vue-button @click="onOpen" size="mini" class="tool-open">Open Folder</vue-button>
      <vue-button @click="onAdd" size="mini">Add Folder</vue-button>
    </div>
    <split :gutterSize="4" class="content">
        <split-area :size="30" :minSize="80">
          <div class="content-left">
            <folder 
              :openedFolders="openedFolders"
              :icons="icons"
              :checkedFiles="checkedFiles"
              @close="onClose"
              @dblclick="onDblclick"
              @select="onSelect"
              @multi-select="onMultiSelect"
              @drag-start="onDragStart"
            >
            </folder>
          </div>
        </split-area>
        <split-area :size="70" :minSize="480">
          <div class="content-right" @dragenter="onDragenter" @dragover="onDragover">
            <div class="content-right-wrap" v-show="isDraging" @dragleave="onDragleave" @drop="onDrop"></div>
            <div v-show="dragFiles && dragFiles.length > 0" class="content-file">
              <div class="file-title">Dragged Files</div>
              <div v-for="(file, index) in dragFiles" :key="index" class="file-item">
                <span class="file-label">{{ file.label }}</span>
                <span class="file-path">{{ file.path }}</span>
              </div>
            </div>
          </div>
        </split-area>
      </split>
  </div>
</template>

<script>
import VueButton from '../components/VueButton.vue'
import Folder from '../../../../dist/folder.min.js'
const { remote } = require('electron')
const { dialog } = remote
const path = require('path')

export default {
  name: 'Home',
  data () {
    return {
      isDraging: false,
      openedFolders: [],
      checkedFiles: [],
      icons: {
        '.xlsx': { name: 'iconfile-excel-fill', color: '#56B158' },
        '.docx': { name: 'iconfile-word-fill', color: '#0A84F1' },
        '.pptx': { name: 'iconfile-ppt-fill', color: '#F12E0B' },
        '.zip': { name: 'iconfile-zip-fill', color: '#C8C800' },
        '.7z': { name: 'iconfile-zip-fill', color: '#C8C800' },
        '.pdf': { name: 'iconfile-pdf-fill', color: '#EA4DCF' },
        '.png': { name: 'iconfile-image-fill', color: '#E6880E' },
        '.jpg': { name: 'iconfile-image-fill', color: '#E6880E' },
        '.md': { name: 'iconfile-markdown-fill', color: '#844DEA' },
      },
      dragFiles: []
    }
  },
  components: {
    Folder,
    VueButton
  },
  mounted () {
  },
  methods: {
    onOpen () {
      dialog.showOpenDialog({
        title: 'Open',
        properties: ['openDirectory']
      }, filePaths => {
        if (!filePaths || !(filePaths.length > 0)) {
          this.$showMsg('info', 'Cancelled to open folder')
        } else {
          this.openedFolders = [filePaths[0]]
          this.$showMsg('success', 'Successed to open folder')
        }
      })
    },
    onAdd () {
      dialog.showOpenDialog({
        title: '添加文件夹',
        properties: ['openDirectory']
      }, filePaths => {
        if (!filePaths || !(filePaths.length > 0)) {
          this.$showMsg('info', 'Cancelled to add folder')
        } else if (this.openedFolders.includes(filePaths[0])) {
          this.$showMsg('info', 'The folder has been opened')
        } else {
          this.openedFolders.push(filePaths[0])
          this.$nextTick(() => { this.$showMsg('success', 'Successed to add folder') })
        }
      })
    },
    onClose (data) {
      console.log('onClose', data)
    },
    onDblclick (data) {
      console.log('onDblclick', data)
    },
    onSelect (data) {
      console.log('onSelect', data)
    },
    onMultiSelect (data) {
      console.log('onMultiSelect', data)
    },
    onDragStart (files, event) {
      console.log('onDragStart', files, event)
      files.forEach(f => {
        this.checkedFiles.push(f.path)
      })
      event.dataTransfer.clearData('drag-file')
      event.dataTransfer.setData('drag-file', JSON.stringify(files))
    },
    onDragenter (e) {
      if (this.isDraging) return
      this.isDraging = true
      e.preventDefault()
    },
    onDragover (e) {
      this.isDraging = true
      e.preventDefault()
    },
    onDragleave (e) {
      e.preventDefault()
      this.isDraging = false
    },
    onDrop (e) {
      this.isDraging = false
      this.dragFiles.splice(0)
      let data = e.dataTransfer.getData('drag-file')
      let files = JSON.parse(data)
      if (files && files.length > 0) {
        this.dragFiles.splice(0, this.dragFiles.length, ...files)
      }
    }
  }
}
</script>

<style scoped>
.home{
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  position: relative;
}

.tool{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}
.tool-open{
  margin-right: 20px;
}
.content{
  margin: 0;
  padding: 0;
  position: absolute;
  top: 56px;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto !important;
}
.content-left{
  height: 100%;
}

.content-right{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.content-right-wrap{
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: -1px;
  right: -1px;
  z-index: 9999;
  background-color: rgba(33,33,33,0.15);
}

.content-file{
  margin: 40px;
}
.file-title{
  color: #606266;
  font-weight: 600;
  font-size: 18px;
  padding: 10px 0;
  letter-spacing: 1px;
}
.file-item{
  height: 28px;
  display: flex;
  align-items: center;
}
.file-label{
  font-size: 14px;
  color: #606266;
  margin-right: 12px;
}
.file-path {
  font-size: 12px;
  color: #909399;
}

</style>

<style>
.content .split-horizontal{
  position: relative;
  margin: 0;
  padding: 0;
}
</style>

