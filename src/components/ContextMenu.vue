<template>
  <span class="context-menu-wrap">
    <transition
      v-if="!disabled"
      :name="transition"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave">
      <div
        class="context-menu"
        :style="{ top: y, left: x }"
        v-show="isShow.value"
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
      isShow: { value: false },
      x: '0px',
      y: '0px',
      display: null,
      emitEle: null,
      activeEle: null
    }
  },
  props: {
    transition: {
      type: String,
      default: 'slide-fade'
    },
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
            this.x = this.display.activeX + 'px'
            this.y = this.display.activeY + 'px'
          }
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

.slide-fade-enter-active {
  transition: all .3s ease-in-out;
}
.slide-fade-leave-active {
  transition: all .3s ease-in-out;
}
.slide-fade-enter, .slide-fade-leave-to{
  transform: translateX(10px);
  opacity: 0;
}
</style>
