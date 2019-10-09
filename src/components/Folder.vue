<template>
  <div class="folder">
    <vuescroll :ops="scrollBarOpts" ref="vuescroll">
      <div class="folder-head">
        <el-tooltip placement="right" effect="light" :content="tipReloadAll" :open-delay="tipDelay" :disabled="isDraging" popper-class="folder-tooltip">
          <span class="folder-refresh folder-refresh-all" v-if="enableReloadAll" @click.stop="onRefreshAllFolder">
            <i class="iconfont iconreload"></i>
          </span>
        </el-tooltip>
        <div class="folder-head-search">
          <search-input v-model="searchValue"></search-input>
        </div>
      </div>
      <el-tree
        empty-text=""
        node-key="path"
        :data="folderData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-expand="onNodeExpand"
        ref="elTree"
      >
        <span
          class="folder-outer"
          slot-scope="{ node, data }"
          draggable="true"
          @dragstart="onDragStart(node, data, $event)"
          @drag="onDrag(node, data, $event)"
          @dragend="onDragEnd(node, data, $event)"
          @click.exact="onClick(node, data, $event)"
          @click.ctrl.stop="onCtrlClick(node, data, $event)"
        >
          <span
            v-if="data.type === defines.TYPE_DIRECTORY"
            class="folder-inner"
            @mouseenter="onMouseenter(node, data)"
            @mouseleave="onMouseleave(node, data)"
          >
            <span class="folder-item-left">
              <span class="folder-item-icon">
                <i v-if="node.expanded" class="iconfont iconfolder-open-fill"></i>
                <i v-else class="iconfont iconfolder-fill"></i>
              </span>
              <el-tooltip placement="right" effect="light" :content="data.path" :open-delay="tipDelay" :disabled="isDraging" popper-class="folder-tooltip">
                <span class="folder-item-label">{{ truncateName(data.label) }}</span>
              </el-tooltip>
            </span>
            <span class="folder-item-right">
              <el-tooltip placement="right" effect="light" :content="tipReload" :open-delay="tipDelay" :disabled="isDraging" popper-class="folder-tooltip">
                <span class="folder-refresh" v-show="enableReload && node.level === 1 && data.hovering" @click.stop="onRefreshFolder(node, data)">
                  <i class="iconfont iconreload"></i>
                </span>
              </el-tooltip>
              <el-tooltip placement="right" effect="light" :content="tipClose" :open-delay="tipDelay" :disabled="isDraging" popper-class="folder-tooltip">
                <span class="folder-close" v-show="enableClose && node.level === 1 && data.hovering" @click.stop="onCloseFolder(node, data)">
                  <i class="iconfont iconclose"></i>
                </span>
              </el-tooltip>
            </span>
          </span>
          <span v-else class="folder-inner" @dblclick.exact.stop="onDblclick(node, data, $event)">
            <span class="file-item-left">
              <span class="file-item-icon">
                <i :class="[data.icon.name, 'iconfont']" :style="{ color: data.icon.color }"></i>
              </span>
              <el-tooltip placement="right" effect="light" :content="data.path" :open-delay="tipDelay" :disabled="isDraging" popper-class="folder-tooltip">
                <span class="file-item-label">{{ truncateName(data.label) }}</span>
              </el-tooltip>
            </span>
            <span class="file-item-right">
              <i v-if="checkedFiles && checkedFiles.includes(data.path)" class="iconfont iconcheck"></i>
            </span>
          </span>
        </span>
      </el-tree>
    </vuescroll>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tree, Input, Tooltip } from 'element-ui'
import vuescroll from 'vuescroll'
import SearchInput from './SearchInput.vue'
import { isInArray, truncateText } from '../lib/util.js'
import { listDir, getExtname } from '../lib/file.js'
import { defaultIcon, DEF } from '../lib/consts.js'
import throttle from 'lodash/throttle'
import path from 'path'
import '../assets/iconfont/iconfont.css'

Vue.use(Tree)
Vue.use(Input)
Vue.use(Tooltip)

export default {
  name: 'Folder',
  data () {
    return {
      scrollBarOpts: {
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: '#DFDFDF',
          opacity: 0.8
        }
      },
      folderData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      defines: DEF,
      tipDelay: 400,
      isDraging: false,
      searchValue: ''
    }
  },
  props: {
    openedFolders: {
      type: Array,
      default: () => []
    },
    checkedFiles: {
      type: Array,
      default: () => []
    },
    includes: {
      type: Array,
      default: () => []
    },
    icons: {
      type: Object,
      default: () => { return null }
    },
    maxLevel: {
      type: Number,
      default: 3,
      validator: value => value >= 2
    },
    enableClose: {
      type: Boolean,
      default: true
    },
    enableReload: {
      type: Boolean,
      default: true
    },
    enableReloadAll: {
      type: Boolean,
      default: true
    },
    tipClose: {
      type: String,
      default: 'Close Folder'
    },
    tipReload: {
      type: String,
      default: 'Reload Folder'
    },
    tipReloadAll: {
      type: String,
      default: 'Reload All Folders'
    },
    multiSelection: {
      type: Boolean,
      default: true
    },
    multiSelectionBlacklist: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    fileIcons () {
      if (this.icons && Object.keys(this.icons).length > 0) {
        return { ...defaultIcon, ...this.icons }
      } else {
        return defaultIcon
      }
    }
  },
  watch: {
    openedFolders: {
      handler (f) {
        if (f && f.length > 0) {
          this.render(f)
        } else {
          this.searchValue = ''
        }
      },
      deep: true,
      immediate: true
    },
    searchValue (v) {
      if (this.$refs && this.$refs.elTree && this.folderData.length > 0) {
        this.$refs.elTree.filter(v)
      }
    }
  },
  created () {
    this.dblclick = throttle((...args) => {
      this.$emit('dblclick', ...args)
    }, 200)
    this.closeFolder = throttle((...args) => {
      this.$emit('close', ...args)
    }, 200)
  },
  beforeDestroy () {
    this.dblclick = null
    this.closeFolder = null
    this.folderData = []
  },
  methods: {
    // 已打开的文件夹保持不变，对新添加的文件夹渲染到视图，对关闭的文件夹移出视图
    async render (openedFolders) {
      for (let i = 0; i < openedFolders.length; i++) {
        let f = openedFolders[i]
        if (!isInArray(this.folderData, 'path', path.resolve(f))) {
          let res = await listDir(f, this.fileIcons, { include: this.includes, maxLevel: this.maxLevel })
            .catch(err => { throw err })
          this.folderData.push(res)
        }
      }

      if (this.folderData.length > openedFolders.length) {
        this.folderData.sort((f1, f2) => {
          return !openedFolders.includes(f1.path) && openedFolders.includes(f2.path)
        })
        this.folderData.splice(openedFolders.length)
      }
    },
    appendFiles (data, selectedFiles, isMultiSelection = false) {
      if (data && data.type === DEF.TYPE_FILE && !(isMultiSelection && !this.checkMultiSelection(data.path))) {
        isInArray(selectedFiles, 'path', data.path) ? '' : selectedFiles.push(data)
      } else if (data && data.type === DEF.TYPE_DIRECTORY && data.children.length > 0) {
        data.children.forEach(c => {
          if (c && c.type === DEF.TYPE_FILE && this.checkMultiSelection(c.path) && !isInArray(selectedFiles, 'path', c.path)) {
            selectedFiles.push(c)
          }
        })
      }
    },
    onDragStart (node, data, e) {
      this.isDraging = true
      let selectedFiles = []
      if (node && !node.checked) {
        this.appendFiles(data, selectedFiles)
      } else {
        let selected = this.$refs.elTree.getCheckedNodes()
        if (Array.isArray(selected) && selected.length > 1) {
          selected.forEach(item => {
            this.appendFiles(item, selectedFiles, true)
          })
        } else if (Array.isArray(selected) && selected.length === 1) {
          this.appendFiles(selected[0], selectedFiles)
        }
      }

      this.$emit('drag-start', selectedFiles, e)
    },
    onDrag (node, data, e) {
      this.isDraging = true
    },
    onDragEnd (node, data, e) {
      this.isDraging = false
      this.$emit('drag-end', e)
    },
    onClick (node, data, e) {
      if (!node.checked) {
        this.$emit('click', data)
        this.$emit('select', data)
      }
      this.$refs.elTree.setCheckedKeys([])
      this.$nextTick(() => { node.checked = true })

      if (data.type === DEF.TYPE_DIRECTORY && data.children.length === 0) {
        this.onRefreshFolder(node, data)
          .then(() => { node.expanded = true })
      }
    },
    onCtrlClick (node, data, e) {
      if (!this.multiSelection) return
      if (!this.checkMultiSelection(data.path)) return

      let selected = this.$refs.elTree.getCheckedNodes()
      if (Array.isArray(selected) && selected.length === 1) {
        if (!this.checkMultiSelection(selected[0].path)) return
      }

      node.checked = !node.checked
      this.$nextTick(() => {
        this.$emit('multi-select', this.$refs.elTree.getCheckedNodes())
      })
    },
    onDblclick (node, data, e) {
      this.dblclick(data)
    },
    onMouseenter (node, data) {
      if (data.type !== DEF.TYPE_DIRECTORY) return
      if (!(node && node.level === 1)) return
      data.hovering = true
    },
    onMouseleave (node, data) {
      if (data.type !== DEF.TYPE_DIRECTORY) return
      if (!(node && node.level === 1)) return
      data.hovering = false
    },
    onCloseFolder (node, data) {
      this.enableClose ? this.closeFolder(data) : ''
    },
    onRefreshFolder (node, data) {
      return new Promise((resolve, reject) => {
        listDir(data.path, this.fileIcons, {
          include: this.includes,
          maxLevel: data.level + this.maxLevel - 1,
          currLevel: data.level
        })
          .then(res => {
            data.lastExpandable = res.lastExpandable
            data.children.splice(0, data.children.length, ...res.children)
            resolve(res)
          })
          .catch(err => { reject(err) })
      })
    },
    onRefreshAllFolder () {
      this.folderData.splice(0)
      this.render(this.openedFolders)
    },
    // 每次只读取文件夹maxExpandLevel层。当展开lastExpandable层时，再读取该层文件夹下maxExpandLevel层内容
    onNodeExpand (data, node) {
      if (data && data.path && data.lastExpandable) {
        this.onRefreshFolder(node, data)
      }
    },
    truncateName (src) {
      return truncateText(src, 32)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.label.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
    },
    checkMultiSelection (filePath) {
      if (!(this.multiSelectionBlacklist && this.multiSelectionBlacklist.length > 0)) return true
      return !this.multiSelectionBlacklist.includes(getExtname(filePath))
    }
  },
  components: { SearchInput, vuescroll }
}
</script>

<style scoped>
.folder{
  padding: 8px 0px;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  font-size: 13px;
  box-sizing: border-box;
  height: 100%;
  font-family: Helvetica, Arial, 'Microsoft YaHei';
}

.folder-head{
  display: flex;
  align-items: center;
  padding: 4px 0;
}
.folder-head-search{
  flex: 1;
  box-sizing: border-box;
  margin: 0px 6px;
}

.folder-outer{
  cursor: pointer;
  flex: 1
}
.folder-inner{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.folder-outer:hover{
  color: #409EFF;
}

.folder .folder-item-icon{
  margin-right: 4px;
  color: rgba(189,157,34,0.95);
}
.folder .file-item-icon{
  margin-right: 4px;
}

.file-item-left,
.file-item-right,
.folder-item-left,
.folder-item-right,
.folder-refresh,
.folder-close{
  display: flex;
  align-items: center;
}

.folder-refresh,
.folder-close{
  padding: 0 4px;
}
.folder-refresh .iconreload{
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}
.folder-refresh-all{
  margin-left: 4px;
  cursor: pointer;
}
.folder-refresh-all .iconreload{
  font-size: 16px;
  font-weight: 500;
}

.folder-close .iconclose{
  font-size: 14px;
  font-weight: 600;
  color: #FF0000;
}

.file-item-right{
  margin-right: 4px;
  color: #409EFF;
  cursor: auto;
}
.file-item-right .iconcheck{
  font-size: 14px;
}

.folder-item-label,
.file-item-label{
  outline: 0;
}

</style>

<style>
.folder .el-tree{
  background-color: transparent;
}
.folder .el-tree-node__content{
  cursor: auto !important;
}
.folder .el-tree-node.is-checked>.el-tree-node__content{
  background-color: #E9EAEE !important;
}

.folder-tooltip.el-tooltip__popper{
  border-radius: 0px;
  line-height: 1;
  padding: 4px;
}
.folder-tooltip .popper__arrow{
  top: 4px !important;
}
</style>

