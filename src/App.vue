<template>
  <div class="wrap">
    <loading :show="isLoading" :text="loading" :position="absolute"></loading>
    <router-view></router-view>
    <div :show="isShow" class="footBox" v-el:footer>
      <tabbar slot="bottom">
        <tabbar-item @click="gotoPurchase" selected>
          <span slot="icon" class="icon purchases"></span>
          <span slot="label">进货</span>
        </tabbar-item>
        <tabbar-item @click="gotoSales">
          <span slot="icon" class="icon sales"></span>
          <span slot="label">销售</span>
        </tabbar-item>
        <tabbar-item @click="gotoStock">
          <span slot="icon" class="icon stock"></span>
          <span slot="label">库存</span>
        </tabbar-item>
        <tabbar-item @click="gotoSearch">
          <span slot="icon" class="icon search"></span>
          <span slot="label">搜索</span>
        </tabbar-item>
      </tabbar>
    </div>
    <div class="errorWrap" v-show="error">
      <div>
        <img src="./assets/dataError.png">
        <span>数据请求失败，请重新刷新页面</span>
        <span class="refreshBtn" @click="refresh">点击刷新</span>
      </div>
    </div>
  </div>
</template>

<script>
import TimeSelect from 'components/timeSelect'
import Tabbar from 'vuxModule/tabbar'
import TabbarItem from 'vuxModule/tabbar-item'
import Loading from 'vuxModule/loading'
import { setWechatTitle } from 'utilJs/unit'

import store from './store/store'

export default {
  components: {
    TimeSelect,
    Tabbar,
    TabbarItem,
    Loading
  },
  store,
  vuex: {
    getters: {
      hostName: (state) => state.hostName,
      isLoading: (state) =>  state.isLoading,
      promptTxt: (state) => state.promptTxt,
      error: (state) => state.error
    }
  },
  data () {
    return {
      showFoot: true,
      isShow: true
    }
  },
  created () {},
  methods: {
    gotoPurchase () {
      this.$route.router.go('/purchase/purchaseGys')
      setWechatTitle('进货状态')
      this.$broadcast('setSortTit')
    },
    gotoSales () {
      this.$route.router.go('/sales/salesMd')
      setWechatTitle('销售状态')
      this.$broadcast('showTimeModule', true)
    },
    gotoStock () {
      this.$route.router.go('/stock/stockGys')
      setWechatTitle('库存状态')
      this.$broadcast('showTimeModule', true)    
    },
    gotoSearch () {
      this.$route.router.go('/search/hot')
      setWechatTitle('搜索')
      this.$broadcast('changeScroller')      
    },
    refresh () {
      this.$route.router.go('/')
      window.location.href = 'http://qianduan.cnonixdata.com/shxhDemo'
    }
  },
  events: {
    displayFoot () {
      this.isShow = false
    },
    showFoot () {
      this.isShow = true
    }
  }
}
</script>

<style lang='scss'>
  @import './css/myMixin/reset.scss';
  @import '~vux/dist/vux.css';
  @import './css/myMixin/myFoot.scss';
  @import './css/myMixin/vars.scss';
  @import './css/myMixin/onePX.scss';

  @font-face {
    font-family: 'iconfont';  /* project id 211629 */
    src: url('http://at.alicdn.com/t/font_vxu5hysaq4asv2t9.eot');
    src: url('http://at.alicdn.com/t/font_vxu5hysaq4asv2t9.eot?#iefix') format('embedded-opentype'),
    url('http://at.alicdn.com/t/font_vxu5hysaq4asv2t9.woff') format('woff'),
    url('http://at.alicdn.com/t/font_vxu5hysaq4asv2t9.ttf') format('truetype'),
    url('http://at.alicdn.com/t/font_vxu5hysaq4asv2t9.svg#iconfont') format('svg');
  }

  html,
  body{
    height: 100%;
  }
  body{
    font-family: $ff;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  #app{
    height: 100%;
    overflow: hidden;
  }
  .wrap{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
  }
  .weui_tab_bd{
      overflow-x: hidden!important;
  }
  .rotate {
    display: inline-block;
    transform: rotate(-180deg);
  }
  .pullup-arrow {
    transition: all linear 0.2s;
    color: #666;
    font-size: 25px;
  }
  .weui_toast{
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
  // 加载动画组件
  .loadingWrap {
    width: 100%;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    position: absolute;
    z-index: 100;
  }
  .errorWrap {
    width: 100%;
    top: 0;
    left: 0;
    height: 100%;
    background-color: $fs_fff;
    position: absolute;
    z-index: 100;
    font-size: 14px;
    color: $fs_d1;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      display: block;
      margin: 0 auto 20px;
    }
  }
  /* 加载页面动画 */
  .fade-transition {
    transition: all .5s ease-out;
    background-color: rgba(0, 0, 0, .4);
    opacity: 1;
  }
  .fade-enter,
  .fade-leave {
    background-color: rgba(0, 0, 0, 0);
    opacity: 0;
  }
  .refreshBtn {
    width: 60px;
    height: 22px;
    line-height: 22px;
    border-radius: 5px;
    color: $fs_fff;
    background-color: $cor_389;
    font-size: 12px;
    display: block;
    text-align: center;
    margin: 10px auto 0;
    box-shadow: 0 0 3px rgba(0, 2px, 3px, .3);
  }
</style>
