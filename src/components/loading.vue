<template>
    <div class="loadingBox">
        <img src="../assets/loader.gif" alt="">
    </div>
</template>

<script>
  export default {
    route: {
      canReuse: false
    }
  }
</script>

<style lang="scss">
  .loadingBox {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
</style>