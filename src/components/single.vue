<template>
  <div v-el:go-in class="goIn goIn-enter">
    <div id="single">
      <div class="single-top">
        <div @click="back" class="goBack" v-link="{ name: linkParams, params: { bookCode: indexStr ? indexStr : indexVal } }">&#xe61d;</div>
        <div class="bookShow">
          <div class="bookShowL" :style="{ backgroundImage: `url(${bookData.Conver})`, backgroundSize: '100% 100%'}">
          </div>
          <div class="bookShowR">
            <dl>
              <dt>{{ bookData.BookName }}</dt>
              <dd class="line_book">作者：{{ bookData.Author }}</dd>
              <dd class="line_book">定价：￥{{ bookData.Price }}</dd>
              <dd>{{ bookData.FirstPurchaseTime }}上架</dd>
              <dd>{{ bookData.PubDate }}出版</dd>
              <dd>{{ bookData.Publisher }}出版</dd>
              <dd>ISBN号：{{ bookData.ISBN }}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="singleTab">
        <tab :animate="false">
          <tab-item :selected="demo === '销售码洋'" @click="triggleDemoName('销售码洋')">
            <div @click="getSales">销售码洋</div>
          </tab-item>
          <tab-item :selected="demo === '库存分布'" @click="triggleDemoName('库存分布')">
            <div @click="getStock">库存分布</div>
          </tab-item>
          <tab-item :selected="demo === '供应商'" @click="triggleDemoName('供应商')">
            <div @click="getPurchase">供应商</div>
          </tab-item>
        </tab>
      </div>
      <!--echarts图-->
      <div>
        <div id="singleEcharts" v-el:echarts></div>
      </div>
      <!--<div v-else class="emptyData">暂无数据</div>-->
      <!--库存分布数据-->
      <div v-show="stockShow" class="kuCunShow">
        <table-box v-if="stockList.length" :list-obj.sync="stockList"></table-box>
        <div v-else class="emptyData">暂无数据</div>
      </div>
      <!--底部供应商信息区域      -->
      <div v-if="supplierShow">
        <div class="echartsDataBox">
          <dl>
            <dt>
                <span class="supplierColor">{{ tabClassify }}：{{ bookData.Publisher }}</span>
              </dt>
            <dd>{{ bookData.FirstPurchaseTime }}第一次入库</dd>
            <dd v-show="formatCount">进货数量：{{ formatCount }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import echarts from 'echarts'
  import macarons from 'echarts/theme/macarons'
  import tab from 'vux/dist/components/tab'
  import tabItem from 'vux/dist/components/tab-item'
  import tableBox from 'components/stockList'
  import { setMd5, setTime } from 'utilJs/unit'

  export default{
    data () {
      return {
        PageIndex: 1,
        PageSize: 10,
        OrderParameter: 4,
        Order: 0,
        bookCode: this.$route.params.whickDemo,
        startTime: this.setStartTime(),
        endTime: this.setEndTime(),
        myChart: Object,
        urlApi: [
          // BS-01 单品详情初始化 -- 0
          '/App/AppBook/BookSaleDetail',
          // P-05 供应商饼图接口 -- 1
          '/App/AppPurchase/BookPurchaseFacetBySupp',
          // S-05 销售码洋 -- 1
          '/App/AppSales/BookTrend',
          // SK-04 库存分布 -- 2
          '/App/AppStock/BookStockFacetByMd'
        ],
        demo: '销售码洋',
        tabClassify: '供应商',             
        supplierName: '上海福州出版社',             
        firstPutaway: '2016-06-02',             
        lastPutaway: '2016-11-02',             
        purchaseQuantity: '12345678', 
        // salesMinistrialShow: false,
        stockShow: false,
        supplierShow: false,
        showE: false,
        echartsShow: true,
        eTHeight: '',
        sortTit: {
          tit1: '门店',
          tit2: '级别',
          tit3: '库存'
        },
        bookData: {},
        chartData: Object,
        optionS1: {
          tooltip: {
            trigger: "axis"
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              boundaryGap: false,
              data: []
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          grid:{
            top: 15,
            bottom: 20,
            containLabel: true            
          },                    
          series: [
            {
              name: "成交",
              type: "line",
              smooth: true,
              itemStyle: {
                normal: {
                  areaStyle: {
                    type: "default"
                  }
                }
              },
              data: []
            }
          ]             
        },
        optionS2: {
          grid:{
            top: 0,
            bottom: 0
          },
          series: [
            {
              type:'pie',
              radius: ['0%', '80%'],
              center: ['50%', '50%'],                     
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '16',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data:[
                {value: 35},
                {value: 64},
                {value: 37},
                {value: 47},
                {value: 26}
              ]
            }
          ]
        },
        BookInfo: Object,
        formatCount: String,
        stockList: [],
        hasChartData: true,
        prevDemo: Number,
        linkParams: this.backLinkParams()
      }
    },
    props: {
      indexVal: {
        type: Number,
        default: 0
      },
      indexStr: String
    },
    route: {
      // canReuse: false,
      data ({to, from, next}) {
        to.router._rootView.keepAlive = false
        to.router._rootView.params.keepAlive = false
      }
    },
    vuex: {
      getters: {
        hostName: (state) => state.hostName,
        initAxisUnit: (state) => state.initAxisUnit,
        userCode: (state) => state.userId
      }
    },
    created () {
      this.$dispatch('hideTop')
      this.initData( this.initProps( this.bookCode ) )
    },
    watch: {
      chartData (val, oldVal) {
        if (!val.List.length) {
          this.formatCount = 0
          return
        }
        this.formatCount = val.List[0].FormatCount
      },
      '$route' (val, oldVal) {}
    },
    ready () {
      this.$set( 'myChart', echarts.init( this.$els.echarts, 'macarons' ) );
    },
    components: {
      tab,
      tabItem,
      tableBox
    },
    methods: {
      setStartTime () {
        let startTime = this.$parent.$parent.StartTime
        return startTime || '2016-09-01'
      },
      setEndTime () {
        let endTime = this.$parent.$parent.EndTime
        return endTime || '2016-10-01'
      },
      triggleDemoName (sort) {

        this.myChart.clear();
        if (sort === '销售码洋') {

          this.demo = '销售码洋'
          this.stockShow = false
          this.supplierShow = false
          this.showE = true

          this.$els.echarts.style.display = 'block'

          this.myChart.setOption(this.optionS1)

        } else if (sort === '库存分布') {

          this.demo = '库存分布'
          this.stockShow = true
          this.supplierShow = false

          this.$els.echarts.style.display = 'none'

        } else {
          this.demo = '供应商'
          this.stockShow = false
          this.supplierShow = true
          this.showE = false

          this.$els.echarts.style.display = 'block'

          this.myChart.setOption(this.optionS2)
        }

      },
      // 0: BP-01初始化， 1: P-05 供应商, 2: S-05 销售码洋， 3: SK-04 库存分布
      getProps (whichProps) {

        let initPageIndex, 
            initPageSize, 
            initOrder, 
            initOrderParameter,
            orderSort,
            _initProps,
            _supplierProps,
            _salesProps, 
            _stockProps,
            _props

        initPageIndex = 1
        initPageSize = 10
        initOrder = 0
        initOrderParameter = 4
        // 按天查询
        orderSort = 4

        // BP-01 图书详情、供应商饼图参数（初始化）
        _initProps = {
          "BookDetailChartRequest": {
            "BookCode": this.bookCode
          },
          "BookDetailTableRequest": {
            "BookCode": this.bookCode,
            "Order": this.Order,
            "OrderParameter": orderSort,
            "PageIndex": this.PageIndex,
            "PageSize": this.PageSize,
            "UserCode": this.userCode
          }
        }

        // P-05 供应商饼图参数
        _supplierProps = {
          "BookCode": this.bookCode,
          "Order": this.Order,
          "OrderParameter": orderSort,
          "PageIndex": this.PageIndex,
          "PageSize": this.PageSize,
          "UserCode": this.userCode
        }
        
        // S-05 销售码洋折线图参数
        _salesProps = {
          "BookCode": this.bookCode,
          "EndTime": this.endTime,
          "StartTime": this.startTime,
          "AxisUnit": this.initAxisUnit,
          "UserCode": this.userCode
        }

        // Sk-04 门店库存表格参数
        _stockProps = {
          "PageIndex": initPageIndex,
          "PageSize": initPageSize,
          "OrderParameter": initOrderParameter,
          "Order": initOrder,
          "BookCode": this.bookCode,
          "UserCode": this.userCode
        }

        switch (whichProps) {
          case 0:
            _props = _initProps
            break
          case 1:
            _props = _supplierProps
            break
          case 2:
            _props = _salesProps
            break
          case 3:
            _props = _stockProps
            break
        }

        return _props

      },
      // S-05 设置销售码洋折线图数据
      setLineData(option, list) {
        let len = list.length
        option.xAxis[0].data = []
        option.series[0].data = []

        let _xData = option.xAxis[0].data

        let itemData = option.series[0].data

        if (!len) {
          
        }

        for (let i = 0; i < len; i++) {
          _xData.push(list[i].XAxis)
          itemData.push(list[i].YAxis.toFixed(2))
        }


      },
      setChartData (option, list) {
        let len = list.length
        let arr = []
        let obj = {}

        for (let i = 0; i < len; i++) {
          obj.name = list[i].Supplier
          obj.value = list[i].FormatCount
          arr.push(obj)
        }

        if (!len) {
          arr = [0]
        }

        option.series[0].data = arr

      },
      // BS-01 初始化图书信息、供应商饼图数据
      initProps (bookCode) {

        let orderSort, _bookInfoAll
        // 以数量为排序字段请求数据
        orderSort = 4

        _bookInfoAll = {
          "BookSaleDetailTableRequest": {
            "BookCode": this.bookCode
          },
          "BookSaleDetailChartRequest": {
            "AxisUnit": this.initAxisUnit,
            "BookCode": this.bookCode,
            "EndTime": this.endTime,
            "StartTime": this.startTime,
            "UserCode": this.userCode
          }
        }

        return _bookInfoAll
      },
      initData (postObj) {

        // 请求对应的链接
        let url = `${this.hostName}${this.urlApi[0]}`

        //  BP-01 接口参数MD5加密
        let md5Obj = setMd5( postObj )
        let sign = md5Obj.sign
        let obj = JSON.stringify(md5Obj.obj)

        // BP-01请求
        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj ).then((response) => {
          let res = response.body
          this.BookInfo = res

          // let listLen = res.BookDetailTableResponse.List.length 
          this.bookData = res.BookSaleDetailTableResponse
          this.chartData = res.BookSaleDetailChartResponse

          this.$nextTick( () => {
            this.setLineData(this.optionS1, this.chartData.List)
            this.myChart.clear()
            this.myChart.setOption(this.optionS1)

            // this.$els.goIn.style.height = '790px'

            this.$dispatch('initScroller')
          })

        })

        // this.$dispatch('initScroller')

      },
      getPurchase () {
        // 请求对应的链接
        let whichModule = 1
        let url = `${this.hostName}${this.urlApi[1]}`
        let myChart = this.myChart

        //  P-05 接口参数MD5加密
        let md5Obj = setMd5( this.getProps( whichModule ) )
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj ).then((response) => {
          let list = response.body.List

          this.setChartData(this.optionS2, list)
          myChart.setOption( this.optionS2 )

          this.$dispatch('initXScroller')
        })

      },
      getSales () {
        // 销售码洋请求参数
        let whichModule = 2
        let url = `${this.hostName}${this.urlApi[2]}`
        let myChart = this.myChart

        //  S-05 接口参数MD5加密
        let md5Obj = setMd5( this.getProps( whichModule ) )
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {

          let res = response.body

          if (res.List.length === 0) {
            this.hasChartData = false
            return false
          }

          this.setLineData( this.optionS1, res.List)

          myChart.setOption( this.optionS1 )

          this.$dispatch('initXScroller')

        })
      },
      getStock () {
        // 库存分布请求参数
        let whichModule = 3
        let url = `${this.hostName}${this.urlApi[3]}`

        //  SK-04 接口参数MD5加密
        let md5Obj = setMd5( this.getProps( whichModule ) )
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {

          let res = response.body

          this.stockList = res.List
          this.$dispatch('initXScroller')

        })
      },
      backLinkParams () {
        let _name = this.$route.name
        let _linkParams

        switch (_name) {
          case 'purchaseDP':
            _linkParams = 'Ppz'
            break
          case 'salesDP':
            _linkParams = 'Spz'
            break
          case 'stockDP':
            _linkParams = 'STpz'
            break
          case 'ss':
            _linkParams = 'hot'
            break
        }

        return _linkParams

      },
      back () {
        this.$dispatch('showTimeModule', true)
      }
    }
  }
</script>

<style lang='scss'>
  @import '../css/myMixin/reset.scss';
  @import '~vux/dist/vux.css';
  @import '../css/myMixin/vars.scss';
  @import '../css/myMixin/overflow_hidden.scss';
  @import '../css/myMixin/onePX.scss';
  @font-face {
    font-family: 'iconfont';  /* project id 211629 */
    src: url('http://at.alicdn.com/t/font_zl13l2bpgr9newmi.eot');
    src: url('http://at.alicdn.com/t/font_zl13l2bpgr9newmi.eot?#iefix') format('embedded-opentype'),
    url('http://at.alicdn.com/t/font_zl13l2bpgr9newmi.woff') format('woff'),
    url('http://at.alicdn.com/t/font_zl13l2bpgr9newmi.ttf') format('truetype'),
    url('http://at.alicdn.com/t/font_zl13l2bpgr9newmi.svg#iconfont') format('svg');
  }  

  body{
    overflow: hidden;
  }
  .single-top{
    position: relative;
  }
  .goBack{
    position: absolute;
    top: 5px;
    left: 5px;
    width: 35px;
    height: 35px;
    font: 18px/35px iconfont;       
    text-align: center;
    color: #666;
    background-color: rgba(0, 0, 0, .2);
    border-radius: 50%;
  }
  .weui_tab_bd{
    overflow-x: hidden!important;
  }
  #single{
    height: auto!important;
    position: relative;
    .bookShow{
      display: flex;
      padding: 0.95rem 0.5rem 0.95rem 1.5rem; 
      background: $cor_dad;           
      .bookShowL{
        flex: 0 0 95px;
        width: 95px;
        height: 135px;
        border-radius: 5px;
        background: $fs_fff;
        display: flex;
        align-items: center;
        justify-content: center;
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
          margin-bottom: 10px;
          @include overflow_hidden;
        }
        dd{
          color: #5d5c5c;
          font-size: 13px;
        }
      }
    }
    .singleTab{
      padding: 0 1.4rem;
      position: relative;
      background: $fs_fff;
      @include onePX($cor_ccc);
    }
    .vux-tab .vux-tab-item.vux-tab-selected{
      color:  $cor_389!important;
      border-bottom: 1.5px solid $cor_389!important;
    }
    .vux-tab .vux-tab-item{
      background:  transparent!important;
      font-size: 16px;
    }
    #singleEcharts{
      width: 100%;
      height: 220px;
      position: relative;
      background: #f8f8f8 !important;
      @media screen and (min-width: 350px) and (-webkit-min-device-pixel-ratio:2){
        height: 250px;
      }        
      @media screen and (min-width: 360px) and (-webkit-min-device-pixel-ratio:2.65){
        height: 280px;
      }
      // @include onePX($cor_ccc);  
      >div{
        margin: 0px auto!important;
      }    
    }
    .kuCunShow{
      position: relative;
      width: 100%;
    }
    .echartsDataBox{
      display: flex;
      justify-content: center;
      height: 90px;
      background: #f8f8f8;
      .supplierColor{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        position: relative; 
        font-size: 16px; 
        color: $fs_444;              
        &:before{
          content: '';
          width: 14px;
          height: 14px;
          display: inline-flex;
          background-color: #00dadd;
          border-radius: 4px;
          position: absolute;
          top: 4px;
          left: -22px;
        }
      }
      dt{
        margin-top: 10px;
      }
      dd{
        color: $fs_666;
        font-size: 16px;
      }
    }
  }
  .vux-tab-ink-bar.vux-tab-ink-bar-transition-backward{
    background-color: $cor_389!important;
  }
  .emptyData{
    font: 16px/68px $ff;
    text-align: center;
  }
</style>
