<template>
  <div class="wrap-cont">
    <div class="scroller-wrap">
      <scroller v-ref:scroller :bounce="false" @pullup:loading="load" :pullup-status.sync="pullupStatus" lock-x use-pullup :pullup-config="pullupConfig">
        <div>
          <div v-show="timeShow">
            <div v-show="showChart" v-el:chart id="echartsBox"></div>
            <tab class="normalTab" :class="{ 'stockPz': !showChart }" :animate="false" >
              <tab-item v-link="{ name: 'STgys' }" :selected="sortName === '供应商'" @click="triggleSortName('供应商')">供应商</tab-item>
              <tab-item v-link="{ name: 'STfl' }" :selected="sortName === '分类'" @click="triggleSortName('分类')">分类</tab-item>
              <tab-item v-ref:pz v-link="{ name: 'STpz', params: { bookCode: 0 } }" :selected="sortName === '品种'" @click="triggleSortName('品种')">品种</tab-item>
            </tab>
          </div>
          <router-view :list-obj="ListItem" :index-val="indexVal" v-ref:list-detail></router-view>
        </div>
        <!--pullup slot-->
        <div slot="pullup" class="xs-plugin-pullup-container xs-plugin-pullup-up" style="position: absolute; width: 100%; height: 40px; bottom: -40px; text-align: center;">
          <span v-show="pullupStatus === 'default'"></span>
          <span class="pullup-arrow" v-show="pullupStatus === 'down' || pullupStatus === 'up'" :class="{'rotate': pullupStatus === 'up'}">↑</span>
          <span v-show="pullupStatus === 'loading'"><spinner type="ios-small"></spinner></span>
        </div>
      </scroller>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import macarons from 'echarts/theme/macarons'
  import { setMd5, setWechatTitle } from 'utilJs/unit'

  import tab from 'vux/dist/components/tab'
  import tabItem from 'vux/dist/components/tab-item'
  import group from 'vux/dist/components/group'
  import single from 'components/single'
  import scroller from 'vuxModule/scroller'
  import Spinner from 'vuxModule/spinner'

  export default {
    data() {
      return {
        showChart: true,
        PageIndex: 1,
        PageSize: 10,
        OrderParameter: 2,
        Order: 0,
        urlApi: [
          // SK-01 按供应商排序 -- 0
          '/App/AppStock/StatisticsFacetBySupplier',
          // SK-02 按分类排序 -- 1
          '/App/AppStock/StatisticsFacetByVariety',
          // Sk-03 按品种排序 -- 2
          '/App/AppStock/StatisticsFacetByBook',
          // SK-08 供应商单品集合 -- 3
          '/App/AppStock/SupplierStatisticsFacetByBook',
          // P-05 单本图书--各供应商 -- 4
          '/App/AppPurchase/BookPurchaseFacetBySupp'
        ],
        TotalPrice: '',
        ListItem: [],
        pieData: Array,
        LineData: Array,
        myChart: Object,
        sortName: '供应商',
        sortNameGroup: ['供应商', '分类', '品种'],
        show: false,
        pullupConfig: {
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...',
          bounce: false,
          autoRefresh: true
        },
        option1: {
          series: [{
            name: '库存码洋',
            type: 'pie',
            radius: ['50%', '80%'],
            center: ['50%', '55%'],
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
            data: []
          }],
          grid: {
            top: 0,
            bottom: -20,
            containLabel: true
          },
          title: {
            text: "",
            left: "center",
            top: "0",
            bottom: "0",
            textStyle: {
              fontSize: 16,
              color: "rgb(67, 67, 67)"
            }
          }
        },
        // 门店的index值
        supplierId: String,
        pullupStatus: 'default',
        // 判断路由返回的参数
        indexVal: 0,
        // 是否显示时间插件
        timeShow: true
      };
    },
    route: {
      data ({to, from}) {
        if (to.path === '/stock/stockPz') {
          this.showChart = false
        } else {
          this.showChart = true
        }
        to.router._rootView.keepAlive = false
        to.router._rootView.params.keepAlive = false
      }
    },
    vuex: {
      getters: {
        hostName: (state) => state.hostName,
        userCode: (state) => state.userId
      }
    },
    watch: {
      // 监测路由变化
      '$route': function (to, from) {

        let path = to.path.replace('\/', '')

        // 监测类别变化，重新渲染页面
        let isGys = /stockGys/.test(path)
        let isFl = /stockFl/.test(path)
        let isPz = /stockPz/.test(path)

        let isGysToPz = this.$route.params.bookCode !== '0'

        let single = /\/stock\/single/
        let whichDemo = this.$route.params.bookCode

        if ( single.test(from.path) ) {
          this.timeShow = true
          this.$els.scrollerWrap.style.top = '46px'
        }

        // 初始化页码
        this.PageIndex = 1

        // 供应商、分类请求参数
        if (isGys || isFl) {

          this.Order = 0
          this.OrderParameter = 2

          let postProps = this.getProps(0).props
          let _url

          if (isGys) {
            _url = `${this.hostName}${this.urlApi[0]}`
            this.get_gys_fl_Data( postProps, _url, 'isGys' )
          }
          if (isFl) {
            _url = `${this.hostName}${this.urlApi[1]}`
            this.get_gys_fl_Data( postProps, _url )
          }

          return false

        }

        // 品种请求参数
        if (isPz) {
          this.Order = 0
          this.OrderParameter = 4

          this.showChart = false
        }

        if (isPz && isGysToPz) {

          // this.getSupplierData(this.supplierId)
          this.$emit('getSupplierData')

        } else if(isPz && !isGysToPz) {

          this.renderData()

        }
      }
    },
    computed: {},
    created () {
      // SK-01接口 -- 初始化库存demo
      this.$nextTick( () => {

        let postProps = this.getProps(0).props
        let _url = `${this.hostName}${this.urlApi[0]}`
        
        this.get_gys_fl_Data( postProps, _url, 'isGys' )

      } )
    },
    ready() {

      this.$set( 'myChart', echarts.init( this.$els.chart, 'macarons') )

    },
    components: {
      tab,
      tabItem,
      group,
      single,
      scroller,
      Spinner
    },
    methods: {
      goBackFather () {},
      // 0: _initPostProps, 1: _postProps, 2: _lineChartProps
      getProps (whichProps) {
        let initPageIndex, initPageSize, initOrderParameter, initOrder, sortByTime, _initPostProps, _postProps, _props

        initPageIndex = 1
        initPageSize = 10
        // 2:码洋
        initOrderParameter = 2
        // 0:降序
        initOrder = 0

        // 初始化
        _initPostProps = {
          "PageIndex": initPageIndex,
          "PageSize": initPageSize,
          "OrderParameter": initOrderParameter,
          "Order": initOrder,
          "UserCode": this.userCode
        }

        // 正常请求接口
        _postProps = {
          "PageIndex": this.PageIndex,
          "PageSize": initPageSize,
          "OrderParameter": this.OrderParameter,
          "Order": this.Order,
          "UserCode": this.userCode
        }

        switch (whichProps) {
          case 0: 
            _props = _initPostProps
            break
          case 1:
           _props = _postProps
           break
        }

        // 判断所属模块
        let _isGys, _isFl, _isPz
        _isGys = this.sortName === '供应商'
        _isFl = this.sortName === '分类'
        _isPz = this.sortName === '品种'

        return {
          props: _props,
          isGys: _isGys,
          isFl: _isFl,
          isPz: _isPz
        }

      },
      getBookProps (whichModule, index, bookCode) {

        let _gysStock, _mdStock, _saleTrend, _props, sortByTime
        // 供应商库存
        _gysStock = {
          "BookCode": this.ListItem[index].BookCode
        }

        // 门店库存
        _mdStock = {
          "BookCode": bookCode,
          "PageIndex": this.PageIndex,
          "PageSize": this.PageSize,
          "OrderParameter": this.OrderParameter,
          "Order": this.Order,
          "UserCode": this.userCode
        }

        // 统计单位( 年: 1，月: 2，周: 3，天: 4)
        sortByTime = 4 

        // 销售码洋走势
        _saleTrend = {
          "BookCode": bookCode,
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "TimeStampUnit": sortByTime
        }

        switch (whichModule) {
          case 0:
            _props: _gysStock
            break
          case 1:
            _props: _mdStock
            break
          case 2:
            _props: _saleTrend
            break
        }

        return _props

      },
      // 获取门店下的书目详情
      getBookSupplierProps (index) {
        let _supplierBookData
        // 具体供应商单品信息
        _supplierBookData = {
          "SupplierId": this.supplierId,
          "PageIndex": this.PageIndex,
          "PageSize": 10,
          "OrderParameter": 4,
          "Order": this.Order,
          "UserCode": this.userCode
        }

        return _supplierBookData
      },
      // tab分类切换
      triggleSortName(sort) {
        if (sort === '供应商') {
          this.sortName = '供应商'
        } else if (sort === '分类') {
          this.sortName = '分类'
        } else {
          this.sortName = '品种'
          this.indexVal = 0
        }
      },
      // 获取供应商、分类、品种表格数据
      getData (postObj) {

        let url = ''

        if (postObj.isGys) url = `${this.hostName}${this.urlApi[0]}`
        if (postObj.isFl) url = `${this.hostName}${this.urlApi[1]}`
        if (postObj.isPz) url = `${this.hostName}${this.urlApi[2]}`

        //  md5加密
        let md5Obj = setMd5(postObj.props)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {

          let res = response.body

          if (this.PageIndex > 1) {
            for (var i = 0; i < res.List.length; i++) {
              this.ListItem.push(res.List[i])
            }
          } else {
            this.ListItem = res.List
          }

          this.$nextTick(() => {
            let _uuid = this.$refs.scroller.uuid 
            this.$broadcast('pullup:reset', _uuid)
          })

        })

      },
      // SK-01、SK-02 获取供应商、分类
      get_gys_fl_Data(postProps, _url, _isGys) {
        let myChart = this.myChart
        let option = this.option1
        let isGys = _isGys ? true : false
        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

        this.$http.post( `${_url}?appkey=123&sign=${sign}`, obj ).then((response) => {

          let res = response.body

          this.ListItem = this.pieData = res.List
          this.originTotalPrice = res.FormatSumMy

          let totalNum = res.FormatSumMy.split(',').join('')
          totalNum = Math.round(totalNum / 10000)

          this.TotalPrice = `${totalNum}万`

          option.title.text = `库存码洋：${this.TotalPrice}`
          this.setPieData(option, res.List, isGys)

          myChart.setOption(option)

          let _uuid = this.$refs.scroller.uuid 
          
          this.$nextTick(() => {
            this.$refs.scroller.reset({
              top: 0
            })
          })

        })
      },
      // 设置供应商、分类饼图数据
      setPieData(option, list, isGys) {
        let data = option.series[0].data
        let txt = ''
        let percent = ''
        let val = ''
        let topTenPersent = 0
        let topTenVal = 0

        for (var i = 0; i <= list.length; i++) {

          data[i] = {}

          if (i === list.length) {
            data[i].name = `其他\n\n${((100 - topTenPersent).toFixed(2))}%`
            data[i].value = parseInt( this.TotalPrice ) - topTenVal
            break
          }

          txt = isGys ? list[i].Supplier : list[i].Classify
          txt = txt.length > 5 ? `${txt.substr(0, 5)}...` : txt
          
          percent = list[i].MyRate.toFixed(2)
          val = window.parseFloat(list[i].FormatMy)
          topTenPersent += percent * 1
          topTenVal += val

          data[i].name = `${txt}\n\n${percent}%`
          data[i].value = val
        }
      },
      // 监听页面变化重新渲染页面, addData：判断是重新获取数据还是在原有基础上叠加数据
      renderData() {

        this.getData( this.getProps(1) )

      },
       // 排序字段切换触发事件
      loadSortData ( isGysToPz ) {

        if (isGysToPz) {
          this.$emit('getSupplierData')
        } else {
          this.renderData()
        }

      },
      load() {

        this.PageIndex++

        let bookCode = this.$route.params.bookCode
        let isGysToPz = bookCode !== undefined && bookCode !== '0'

        if (isGysToPz) {
          this.$emit('getSupplierData')
        } else {
          this.renderData()
        }

      }
    },
    events: {
      // 监听页面变化设置post请求排序参数(order:升／降, show: true为1，false为2)
      modifyPostProps(order, show) {
        let isGys, isFl, isPz, gysIndex, flIndex, pzIndex, indexOrder

        isGys = this.sortName === '供应商'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'

        let bookCode = this.$route.params.bookCode
        let isGysToPz = bookCode !== undefined && bookCode !== '0'

        this.Order = Number(order)
        //  平均到货时间 = 1,码洋 = 2,码洋占比=3，数量=4,库龄=5
        gysIndex = [2, 4]
        flIndex = [2, 4]
        pzIndex = [4, 5]

        if (isGysToPz) {
          indexOrder = pzIndex[Number(show)]
          this.loadSortData( isGysToPz )
          return false
        }

        if (isGys) indexOrder = gysIndex[Number(show)]
        if (isFl) indexOrder = flIndex[Number(show)]
        if (isPz) indexOrder = pzIndex[Number(show)]

        this.OrderParameter = indexOrder
        this.PageIndex = 1

        this.renderData()

      },
      // 门店单品数据获取
      getSupplierData () {
        let _props = this.getBookSupplierProps()
        let url = `${this.hostName}${this.urlApi[3]}`

        //  md5加密
        let md5Obj = setMd5(_props)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        this.$http.post(`${url}?appkey=123&sign=${sign}`, obj).then((response) => {

          let res = response.body
          this.supplier = res.Supplier

          if (this.PageIndex > 1) {
            for (var i = 0; i < res.List.length; i++) {
              this.ListItem.push(res.List[i])
            }
          } else {
            this.ListItem = res.List
          }

          this.$nextTick(() => {
            let _uuid = this.$refs.scroller.uuid
            this.$broadcast('pullup:reset', _uuid)
          })

        })
      },
      getBookData (index) {
        this.supplierId = this.ListItem[index].SupplierId
        this.indexVal = ++index
      },
      showBook (index) {
        this.timeShow = false
      },
      initScroller () {
        this.$nextTick( () => {
          let _uuid = this.$refs.scroller.uuid

         this.$broadcast('pullup:reset', _uuid)
          this.$broadcast('pullup:disable', _uuid)
        } )
      },
      initXScroller () {
        let _uuid = this.$refs.scroller.uuid
        this.$nextTick( () => {
          this.$broadcast('pullup:reset', _uuid)
          setTimeout( () => {
            this.$broadcast('pullup:disable', _uuid)
          }, 50 )
        } )

      },
      openPullup () {
        let _uuid = this.$refs.scroller.uuid

        this.$nextTick( () => {
          this.$broadcast('pullup:enable', _uuid)
        } )

      },
      showTimeModule (statu) {
        this.timeShow = statu

        let _uuid = this.$refs.scroller.uuid

        this.$broadcast('pullup:enable', _uuid)
      }
    }
  }
</script>

<style scoped lang="scss">
  .scroller-wrap {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    >div {
      height: 100%!important;
    }
  }
  .stockPz{
    padding-top: 15px;
  }
</style>
