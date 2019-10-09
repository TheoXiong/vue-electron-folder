<template>
  <button class="v-button"
          @click="handleClick"
          :disabled="disabled || loading"
          :type="nativeType"
          :class="[
            type ? 'v-button--' + type : '',
            size ? 'v-button--' + size : '',
            {
              'is-disabled': disabled,
              'is-loading': loading,
              'is-circle': circle,
              'is-activated': activated,
              'is-light': light
            }
  ]">
    <i :class="icon" v-if="icon"></i>
    <span v-if="$slots.default" :class="{hidden: loading, show: !loading}"><slot></slot></span>
    <div class="v-button-loading" v-if="loading">
      <i class="iconfont icon-loading2 loading-item"></i>
    </div>
  </button>
</template>
<script>
export default {
  name: 'VueButton',
  props: {
    type: { type: String, default: 'default' },
    size: { type: String, default: 'small' },
    icon: { type: String, default: '' },
    nativeType: { type: String, default: 'button' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    light: { type: Boolean, default: false }
  },
  methods: {
    handleClick (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.v-button{
    display:inline-block;
    line-height:1;
    white-space:nowrap;
    cursor:pointer;
    background:rgba(6, 88, 241, 0.1);
    border:1px solid #dcdfe6;
    color:#606266;
    -webkit-appearance:none;
    text-align:center;
    box-sizing:border-box;
    outline:0;
    margin:0;
    transition:.1s;
    font-weight:500;
    -webkit-user-select:none;
    padding:6px 12px;
    font-size:14px;
    border-radius:2px;
}
.v-button [class*=el-icon-]+span{
    margin-left:5px;
}

/* default button style*/
.v-button.is-disabled,
.v-button.is-disabled:focus,
.v-button.is-disabled:hover{
    color:#c0c4cc;
    cursor:not-allowed;
    background-image:none;
    background-color:#fff;
    border-color:#ebeef5
}
.v-button:focus,
.v-button:hover{
    color:rgba(64, 158, 255, 0.7);
    border-color:rgba(64, 158, 255, 0.7);
    outline:0;
    border-radius:2px;
}
.v-button:active{
    color:#409EFF;
    border-color: #409EFF;
    outline:0;
}

/* text button style*/
.v-button.v-button--text{
    color:#606266;
    background-color:transparent;
    border: none;
    outline: 0;
    border-radius: 2;
}
.v-button--text:hover{
    background:#e9e9f1;
    border: none;
    outline: 0;
    border-radius: 2;
}

.v-button--text.is-disabled,
.v-button--text.is-disabled:active,
.v-button--text.is-disabled:focus,
.v-button--text.is-disabled:hover{
    cursor:not-allowed;
    color: #909399;
    background-image:none;
    background-color:transparent;
    border: none;
    outline: 0;
    border-radius: 2;
}

.v-button--text.is-light{
  color:rgba(255, 255, 255, 0.8);
  background-color:transparent;
  border: none;
  outline: 0;
  border-radius: 2;
}
.v-button--text.is-light:hover{
  background-color: rgba(51, 51, 51, 0.8);
  border: none;
  outline: 0;
  border-radius: 2;
}

.v-button--text.is-activated,
.v-button--text.is-activated:active,
.v-button--text.is-activated:focus,
.v-button--text.is-activated:hover{
    background:#e9e9f1;
    border: none;
    outline: 0;
    border-radius: 2;
    font-weight: 600;
}

.v-button--text.is-light.is-activated,
.v-button--text.is-light.is-activated:active,
.v-button--text.is-light.is-activated:focus,
.v-button--text.is-light.is-activated:hover{
    background:rgba(51, 51, 51, 0.8);
    border: none;
    outline: 0;
    border-radius: 2;
    font-weight: 600;
}

/* mini button style*/
.v-button--mini{
    font-size: 12px;
    padding: 4px 8px;
}

/* medium button style*/
.v-button--medium{
    font-size: 14px;
    padding: 10px 20px;
}

/* circle button style*/
.v-button.is-circle{
    border-radius:50%;
    padding:12px;
}

/* loading style*/
.v-button.is-loading{
    position:relative;
    pointer-events:none
}
.v-button-loading{
    position:absolute;
    pointer-events:none;
    left:-1px;
    top:-1px;
    right:-1px;
    bottom:-1px;
    border-radius:inherit;
    background-color:rgba(30,30,30,0.6);
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hidden{
    opacity: 0.1;
}
.show{
    opacity: 1;
}
.loading-item{
    animation: rotate 1000ms linear infinite
}
@keyframes rotate {
    0% {transform: rotate(0deg)}
    100%  {transform: rotate(360deg)}
}
</style>
