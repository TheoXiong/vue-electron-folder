<template>
  <div id="app">
    <home></home>
  </div>
</template>

<script>
import Home from './views/Home.vue'

export default {
  name: 'App',
  components: { Home }
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0px;
  padding: 0px;
  font-family: Helvetica, Arial, 'Microsoft YaHei';
  box-sizing: border-box;
  overflow: hidden;
}

#app {
  height: 100%;
  font-family: inherit;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}
</style>
