<template>
  <div class="wrap-cont">
    <section class="searchBox">
      <div class="search-l scale-border">
        <div class="content">
          <div class="search-in">
            <span class="search-icon"></span>
            <input class="search" type="search" placeholder="请输入书名等关键词" v-on:compositionstart="inputStart" v-on:compositionend="inputEnd" v-on:input="inputTxt" v-on:focus="footerControl1" v-on:blur="footerControl2" v-model="searchVal">
            <span v-if="deleteShow" class="delete-icon" @click="delete"></span>  
          </div>
        </div>
        <div class="border"></div>
      </div>
      <div @click="singlePage" class="search-r">搜索</div>
    </section>
    <section class="search-body">
      <router-view :list-detail="lists" :index-str="searchVal"></router-view>
    </section>
  </div>
</template>

<script>
import echarts from 'echarts'
import { setMd5 } from 'utilJs/unit'

import Single from 'components/single'
import Scroller from 'vux/src/components/scroller'
import Spinner from 'vuxModule/spinner'

export default {
  components: {
    Single,
    Scroller,
    Spinner
  },
  data(){
    return{
      urlApi: [
        // B-02 书目查询输入提示 -- 0
        '/App/AppBook/BookInputCue',
        // B-03 书目查询（精确搜索） -- 1
        '/App/AppBook/AccurateQuery',
        // B-04 书目查询（搜索结果，具体详） -- 2
        '/App/AppBook/VaguelyQuery'
      ],
      searchShow: 1,
      deleteShow: false,
      searchVal: '',
      show: false,
      lists: [],
      bookData: Array,
      inputLock: false
    }
  },
  route: {
    data ({to, from, next}) {
      to.router._rootView.keepAlive = false
      to.router._rootView.params.keepAlive = false
    }
  },
  vuex: {
    getters: {
      hostName: (state) => state.hostName
    }
  },
  created () {
    window.onresize = this.resize;
  },
  methods: {
    // whichProps: 0(输入提示), 1(搜索提示)
    getProps (whichProps) {
      let _bookInput, _bookQuery, _props

      // B-02接口参数
      _bookInput = {
        "KeyWord": this.searchVal,
        "Count": 5
      }

      // B-03接口参数
      _bookQuery = {
        "KeyWord": this.searchVal,
        "PageIndex": 1,
        "PageSize": 10
      }

     /* _bookResult = {

      }*/

      switch (whichProps) {
        case 0: 
          _props = _bookInput
          break
        case 1:
          _props = _bookQuery
      }
      return _props

    },
    // 输入键盘顶起底部时的处理
    resize () {
      var h = document.documentElement.clientHeight;
      var u = navigator.userAgent;
      if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
          if(h <= window.screen.availHeight/2){
            this.$dispatch('display');
          }else{
            this.$dispatch('control');
          }
      }    
    },
    footerControl1 () {
      this.$dispatch('displayFoot');
    },
    footerControl2 () {
      if (!this.searchVal) {
        this.$route.router.go('/search/hot')
      }
      this.$dispatch('showFoot');
    },
    inputStart () {
      this.inputLock = true
    },
    inputEnd () {
      this.inputLock = false
      this.inputTxt()
    },
    // B-02 键盘抬起处理 -- 输入提示
    inputTxt () {
      if (this.inputLock) return

      let postProps = this.getProps(0)

      if(this.searchVal == ''){
        this.$route.router.go('/search/hot')
      }else{
        this.$route.router.go(`/search/prompt/${this.searchVal}`)

        let url = `${this.hostName}${this.urlApi[0]}`
        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {
          let res = response.body
          this.$set('lists', res.List)

        }) 
      }    
      this.$set('deleteShow', true)
    },
    delete () {
      this.searchVal = '';
      this.$route.router.go('/search/hot')
      this.$set('deleteShow', false);
    },
    // B-03 点击搜索的行为
    singlePage () {
      if (!this.searchVal) {
        this.$route.router.go('/search/hot')
        return
      }
      this.$route.router.go('/search/result/default')
      let postProps = this.getProps(1)

      let url = `${this.hostName}${this.urlApi[1]}`
      //  md5加密
      let md5Obj = setMd5(postProps)
      let sign = md5Obj.sign
      let obj = md5Obj.obj

      this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {
        let res = response.body

        this.$nextTick( () => this.lists = res.List )

      })   

      this.$set('show',false);

    },
    getFinalData () {
      // ------ 请求B-04接口 ------
      let postProps = this.getProps(1)

      let url = `${this.hostName}${this.urlApi[2]}`
      //  md5加密
      let md5Obj = setMd5(postProps)
      let sign = md5Obj.sign
      let obj = md5Obj.obj

      this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {
        let res = response.body

        this.$nextTick( () => this.lists = res.List )

      })  
    }
  },
  events: {
    finalResult (bookCode) {
      let whichProps = 1
      this.getFinalData()
    },
    setSearchTxt (bookName) {
      this.searchVal = bookName
      this.singlePage()
    }
  }
}
</script>

<style lang="scss">
  @import '../css/myMixin/vars.scss';
  @import '../css/myMixin/overflow_hidden.scss';
  @import '../css/myMixin/onePX.scss';
  @import '../css/myMixin/_onePXBorder.scss';

  .searchBox{
    @include onePXBorder ('.scale-border','.content','.border',10px,$bor_bbb,$bgc_f4);
    @include onePX ($bor_e0);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    background: #fff;

    height: 50px;
    padding: 0 0.75rem; 
    display: flex;
    align-items: center;
    .content{
      width: 100%;
    }
    .search-l{
      position: relative;
      flex: 1 1 86%;
      height: 34px;
      width: 86%;
      line-height: 32px;
      .search-in{
        display: flex;
        width: 100%;
        justify-content: space-between;
        .search-icon{
          flex: 0 1 20px;
          height: 32px;
          line-height: 35px;
          text-align: center;
          &:after{
            content: '\e608';
            font: 16px iconfont;
            color: $fs_a5;
          }
        }
        .search{
          display: flex;
          flex: 1 1 208px;
          color: $fs_54;
          background-color: $bgc_f4;
          font-size: 14px;
          margin: 5px 0;
          height: 22px;      
          line-height: 22px;
          width: 80%;
        }
        .delete-icon{
          flex: 0 1 30px;
          text-align: center;
          line-height: 34px;
          height: 32px;
          width: 30px;
          &:after{
            content: '\e606';
            font: 18px iconfont;
            color: $fs_a5;
          }
        }
      }
    }
    .search-r{
      flex: 1 1 14%;
      text-align: center;
      font-size: 16px;
      color: $cor_389;
    }
  }
  .search-body{
    position: absolute;
    top: 50px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    .hot{
      @include onePXBorder ('.scale-border','.content','.border',5px,$bor_bbb,$bgc_f4);
      padding: 0 0.75rem; 
      h3{
        font-weight: normal;
        color: #858585; 
        margin-bottom: 10px; 
        margin-top: 10px; 
        font-size: 14px;   
      }
      .hot-layout{
        display: flex;
        justify-content: space-between;
      }
      a{
        padding: 5px 10px;
        font-size: 12px;
        color: $fs_45;
      }
    }
    .search-prompt{
      padding: 20px 0;
      width: 100%;
      ul{
        width: 100%;
        overflow: hidden;
        padding: 0 0.75rem;        
        color: #545454;
        font-size: 14px;
        li{
          @include onePXBorder ('.scale-border','.content','.border', 5px,$bor_bbb,$bgc_f4);
          @include onePX($bor_e0);
          line-height: 1.5;
          margin-bottom: 10px;
          dl{
            display: flex;
            height: 70px;
            dt{
              flex: 0 0 46px;
              width: 46px;
              height: 60px;
              overflow-y: hidden; 
              margin-right: 20px;   
              img{
                width: 100%;
                height: auto;
              }
            }
            dd{
              align-items: center;
              display: flex; 
              font-size: 16px; 
              height: 60px;
              width: 80%;        
            }
          }
        }
        & b{
          color: $fs_fa2;
        }
      }
    }
    .result{
      li{
        display: flex;
        background-color: $bgc_f8;
        padding: 10px 1rem;
        @include onePX ($bor_e0);
        @include onePXBorder ('.scale-border','.content','.border',5px,$bor_bbb,#fff);
        .bookShowL{
            width: 63px;
            flex: 0 0 63px;
            height: 85px;
            display: flex;
            align-items: center;
            justify-content: center;
            img{
                width: 100%;
                max-height: 85px;
            }
        }
        .bookShowR{
            margin-left: 0.5rem;
            .line_book{
                display: inline-block;
            }
            .line_book:nth-of-type(1){
                margin-right: 0.5rem;
            }
            dt{
                color: #232021;
                font-size: 16px;
                margin-bottom: 6px;
                height: 28px;
                @include overflow_hidden1;
            }
            dd{
                color: #5d5c5c;
                font-size: 12px;
            }
        }
      }
    }
  }
</style>
