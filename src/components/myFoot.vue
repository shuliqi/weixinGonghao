<template>
  <tabbar class="footBox">
    <tabbar-item selected>
      <span slot="icon" class="icon purchases"></span>
      <span slot="label">进货</span>
    </tabbar-item>
    <!--use http link-->
    <tabbar-item>
      <span slot="icon" class="icon sales"></span>
      <span slot="label">销售</span>
    </tabbar-item>
    <!--use vue-router link-->
    <tabbar-item>
      <span slot="icon" class="icon stock"></span>
      <span slot="label">库存</span>
    </tabbar-item>
    <tabbar-item>
      <span slot="icon" class="icon search"></span>
      <span slot="label">搜索</span>
    </tabbar-item>
  </tabbar>
</template>
<script>
import Tabbar from 'vux/dist/components/tabbar'
import TabbarItem from 'vux/dist/components/tabbar-item'

export default{
    data () {
        return{

        };
    },
    ready() {
        document.querySelector('body').style.height = '100%';
        document.querySelector('html').style.height = '100%';
        document.querySelector('#app').style.height = '100%';
    },
    components: {
        Tabbar,
        TabbarItem
    }
}
</script>
<style lang="scss">
    @import '../css/myMixin/myFoot.scss';
</style>
