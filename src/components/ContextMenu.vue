<template>
  <span class="context-menu-wrap">
    <transition
      v-if="!disabled"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave">
      <div
        class="context-menu"
        :style="{ top: y, left: x, opacity: opacity }"
        v-show="showMenu"
        ref="context">
        <slot name="context"></slot>
      </div>
    </transition>
    <slot name="reference"></slot>
  </span>
</template>
<script>
import Display from '../lib/display.js'

export default {
  name: 'ContextMenu',
  data () {
    return {
      showMenu: true,
      opacity: 0,
      isShow: { value: false },
      x: '99999px',
      y: '99999px',
      display: null,
      emitEle: null,
      activeEle: null
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isShow: {
      handler (obj) {
        if (obj.value) {
          if (this.display && this.display.activeX && this.display.activeY) {
            let coord = this.getContextCoordinate(this.display.activeX, this.display.activeY)
            this.x = coord[0] + 'px'
            this.y = coord[1] + 'px'
            this.opacity = 1
          } 
        } else {
          this.opacity = 0
          this.x = '99999px'
          this.y = '99999px'
        }
      },
      deep: true
    },
    disabled (value) {
      value ? '' : this.init()
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    if (this.display && this.display.unBind) {
      this.display.unBind()
      setTimeout(() => {
        this.display.clear()
        this.display = null
      }, 10)
    }
  },
  methods: {
    init () {
      setTimeout(() => {
        if (this.display || this.disabled) {
          return
        }

        let emitEle = this.emitEle = this.$slots.reference[0].elm
        let activeEle = this.activeEle = this.$refs.context
        this.display = new Display('context-click', this.isShow, activeEle, emitEle, document)
        this.display.doBind()
      }, 100)
    },
    handleAfterEnter () {
      this.$emit('after-enter')
    },
    handleAfterLeave () {
      this.$emit('after-leave')
    },
    getContextCoordinate (activeX, activeY) {
      let coord = [activeX, activeY]
      if (!(this.activeEle && this.activeEle.offsetHeight && this.activeEle.offsetWidth)) return coord
      let viewportHeight = window.innerHeight
      let viewportWidth = window.innerWidth
      let targetHeight = this.activeEle.offsetHeight
      let targetWidth = this.activeEle.offsetWidth
      
      if ((targetWidth + activeX + 8) > viewportWidth) {
        coord[0] = activeX - targetWidth
        coord[0] < 0 ? coord[0] = 0 : ''
      }
      if ((targetHeight + activeY + 8) > viewportHeight) {
        coord[1] = activeY - targetHeight
        coord[1] < 0 ? coord[1] = 0 : ''
      }
      return coord
    }
  }
}
</script>
<style scoped>
.context-menu-wrap{
  display: flex;
  flex: 1
}
.context-menu {
  background: #fff;
  position: fixed;
  padding: 0;
  border: 1px solid rgba(0,0,0,.1);
  box-shadow: 0px 1px 6px 1px rgba(0,0,0,.1);
  border-radius: 2px;
  z-index: 10000;
}
</style>
