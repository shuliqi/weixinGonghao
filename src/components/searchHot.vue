<template>
<!--热门搜索-->
<div class="hot" v-el:hot>
  <h3>热门搜索</h3>
  <div class="hot-layout">
    <div class="scale-border" v-link="{ name: 'ss', params: { whickDemo: '1000401161' } }">
      <div class="content">
        <a href="javascript:;">平凡的世界</a>
      </div>
      <div class="border border-color"></div>
    </div>
    <div class="scale-border" v-link="{ name: 'ss', params: { whickDemo: '1000731185' } }">
      <div class="content">
        <a href="javascript:;">追风筝的人</a>
      </div>
      <div class="border border-color"></div>
    </div>
    <div class="scale-border" v-link="{ name: 'ss', params: { whickDemo: '1102755023' } }">
      <div class="content">
        <a href="javascript:;">余生，请多指教</a>
      </div>
      <div class="border border-color"></div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  created () {}
}
</script>