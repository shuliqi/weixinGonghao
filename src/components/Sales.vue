<template>
  <div class="wrap-cont">
    <time-select v-if="timeShow" :time1.sync="StartTime" :time2.sync="EndTime"></time-select>
    <div v-el:scroller-wrap class="scroller-wrap">
      <scroller v-ref:scroller :bounce="false" @pullup:loading="load" :pullup-status.sync="pullupStatus" lock-x use-pullup :pullup-config="pullupConfig">
        <div>
          <div v-show="timeShow">
            <div v-el:chart id="echartsBox"></div>
            <tab class="normalTab" :animate="false">
              <tab-item v-link="{ name: 'Smd' }" :selected="sortName === '门店'" @click="triggleSortName('门店')">门店</tab-item>
              <tab-item v-link="{ name: 'Sfl' }" :selected="sortName === '分类'" @click="triggleSortName('分类')">分类</tab-item>
              <tab-item v-ref:pz v-link="{ name: 'Spz', params: { bookCode: 0 } }" :selected="sortName === '品种'" @click="triggleSortName('品种')">品种</tab-item>
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
  import { setDate, setOriginDate, getStartTime, getEndTime, setMd5, setWechatTitle } from 'utilJs/unit'

  import tab from 'vux/dist/components/tab'
  import tabItem from 'vux/dist/components/tab-item'
  import group from 'vux/dist/components/group'
  import TimeSelect from 'components/TimeSelectProcess'
  import single from 'components/single'
  import scroller from 'vuxModule/scroller'
  import Spinner from 'vuxModule/spinner'

  export default {
    data() {
      return {
        PageIndex: 1,
        PageSize: 10,
        OrderParameter: 1,
        Order: 1,
        StartTime: setDate(true),
        EndTime: setOriginDate(true),
        urlApi: [
          // S_01 (门店) -- 0
          '/App/AppSales/StatisticsFacetBySupplier',
          // S_02 (分类) -- 1
          '/App/AppSales/StatisticsFacetByVariety',
          // S_03 (品种) -- 2
          '/App/AppSales/StatisticsFacetByBook',
          // S_04（品种折线图数据）-- 3
          '/App/AppSales/Trend',
          // S_09 (门店单品集合) -- 4
          '/App/AppSales/SupplierStatisticsFacetByBook',
          // S_10 （门店折线图数据）-- 5
          '/App/AppSales/SupplierTrend',
          // SS-01 分类饼图、表格数据（初始化）-- 6
          '/App/AppSales/StatisticsFacetByKindLoad',
          // SS-02 品种折线图、表格数据（初始化）-- 7
          '/App/AppSales/StatisticsFacetByBookLoad',
          // SS-03 门店跳转至品种折线图、表格数据（初始化）-- 8
          '/App/AppSales/StatisticsFacetBySupplierBookLoad'
        ],
        // 总码洋
        TotalPrice: '',
        originTotalPrice: '',
        ListItem: [],
        // 书目详情
        BookInfo: [],
        // 拼接饼图数据
        pieData: Array,
        // 拼接折线图数据
        LineData: Array,
        myChart: Object,
        sortName: '门店',
        // 上拉组件配置
        pullupConfig: {
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...',
          bounce: false,
          autoRefresh: true
        },
        // 饼图基础配置
        option1: {
          series: [{
            name: '销售码洋',
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
        // 折线图基础配置
        option2: {
          title: {
            text: "",
            left: "center",
            top: "0",
            bottom: "0",
            textStyle: {
              fontSize: 16,
              color: "rgb(67, 67, 67)"
            }
          },
          tooltip: {
            trigger: "axis"
          },
          toolbox: {
            show: false,
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: true
              },
              magicType: {
                show: false,
                type: ["line", "bar", "stack", "tiled"]
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          calculable: true,
          xAxis: [{
            type: "category",
            boundaryGap: false,
            data: []
          }],
          yAxis: [{
            type: "value"
          }],
          grid: {
            top: 25,
            bottom: 20,
            containLabel: true
          },
          series: [{
            name: "销售码洋",
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
          }]
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
      data ({to, from, next}) {
        to.router._rootView.keepAlive = false
        to.router._rootView.params.keepAlive = false

        let single = /\/sales\/single/
        if ( single.test(from.path) ) {
          this.timeShow = true
          this.$els.scrollerWrap.style.top = '46px'
        }
      }
    },
    vuex: {
      getters: {
        hostName: (state) => state.hostName,
        userCode: (state) => state.userId
      }
    },
    watch: {
      StartTime: function (val, oldVal) {
        
        if (val !== oldVal) {
          this.renderTime()
        }

      },
      EndTime: function (val, oldVal) {
        
        if (val !== oldVal) {
          this.renderTime()
        }

      },
      // 监测路由变化
      '$route': function (to, from) {

        let path = to.path.replace('\/', '')
        // 监测类别变化，重新渲染页面
        let isMd = /salesMd/.test(path)
        let isFl = /salesFl/.test(path)
        let isPz = /salesPz/.test(path)
        let isGysToPz = this.$route.params.bookCode !== '0'

        let single = /\/sales\/single/
        let whichDemo = this.$route.params.bookCode

        if ( single.test(from.path) ) {
          this.timeShow = true
          this.$els.scrollerWrap.style.top = '46px'
        }

        // 初始化页码
        this.PageIndex = 1

        // 门店请求数据
        if (isMd) {
          this.Order = 0
          this.OrderParameter = 2

          let whichProps = 0
          this.getStoreData( this.getProps( whichProps ) )
          return false

        }
        
        // 分类请求数据
        if (isFl) {

          this.Order = 0
          this.OrderParameter = 4

          this.getSortData( this.initSortProps() )
          return false

        }
        // 品种请求数据
        if (isPz) {
          this.Order = 0
          this.OrderParameter = 3
        }

        if ( isPz && isGysToPz ) {

          this.getMdToItemData( this.initMdToItemProps() )

        }
        if ( isPz && !isGysToPz ) {

          this.getItemData( this.initItemProps() )

        }

      }
    },
    computed: {
    },
    created () {
      // S-01接口 -- 初始化销售demo
      this.$nextTick ( () => {
        let whichProps = 0
        this.getStoreData( this.getProps( whichProps ) )
      } )
    },
    ready() {

      let self = this

      this.$set( 'myChart', echarts.init( this.$els.chart, 'macarons') )
      this.setTouchEnd()

    },
    components: {
      tab,
      tabItem,
      group,
      TimeSelect,
      single,
      scroller,
      Spinner
    },
    methods: {
      // 0: _initPostProps, 1: _postProps, 2: _lineChartProps, 3: _lineChartSupplierProps
      getProps (whichProps) {
        let initPageIndex, initPageSize, initOrderParameter, initOrder, sortByTime, _initPostProps, _postProps, _lineChartProps, _lineChartSupplierProps, _props

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
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "UserCode": this.userCode
        }

        // 正常请求接口
        _postProps = {
          "PageIndex": this.PageIndex,
          "PageSize": initPageSize,
          "OrderParameter": this.OrderParameter,
          "Order": this.Order,
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "UserCode": this.userCode
        }

        // 统计单位( 年: 1，月: 2，周: 3，天: 4)
        sortByTime = 4

        // 折线图数据请求接口
        _lineChartProps = {
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "AxisUnit": sortByTime,
          "UserCode": this.userCode
        }

        // 门店品种数据请求接口
        _lineChartSupplierProps = {
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "AxisUnit": sortByTime,
          "SupplierId": this.supplierId,
          "UserCode": this.userCode
        }

        switch (whichProps) {
          case 0: 
            _props = _initPostProps
            break
          case 1:
            _props = _postProps
            break
          case 2:
            _props = _lineChartProps
            break
          case 3:
            _props = _lineChartSupplierProps
            break
        }

        return _props

      },
      // SS-01 分类demo初始化参数（独有）
      initSortProps () {
        let pieOrderParameter, _initAllProps, pieOrder, listOrderParameter, initPageSize

        pieOrder = 0
        // 初始化饼图排序字段参数（码洋）
        pieOrderParameter = 2
        // 初始分类表格数据排序字段参数
        listOrderParameter = 4
        initPageSize = 10

        // SS-01 进货分类初始化同时请求饼图及表格的参数
        _initAllProps = {
          "BookSaleCircularRequest": {
            "EndTime": this.EndTime,
            "Order": pieOrder,
            "OrderParameter": pieOrderParameter,
            "PageIndex": this.PageIndex,
            "PageSize": initPageSize,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          },
          "SupplierSaleListRequest": {
            "EndTime": this.EndTime,
            "Order": this.Order,
            "OrderParameter": listOrderParameter,
            "PageIndex": this.PageIndex,
            "PageSize": initPageSize,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          }
        }

        return _initAllProps
      },
      // SS-02 品种demo初始化参数（独有）
      initItemProps () {
        let _initAllProps, listOrderParameter,  listOrder, initPageSize, orderBy

        listOrder = 0
        // 初始化表格排序字段参数（码洋占比）
        listOrderParameter = 3
        initPageSize = 10

        orderBy = 4

        // SS-02 品种demo初始化同时请求饼图及表格的参数
        _initAllProps = {
          "BookSaleChartRequest": {
            "AxisUnit": orderBy,
            "EndTime": this.EndTime,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          },
          "BookSaleTableRequest": {
            "EndTime": this.EndTime,
            "Order": listOrder,
            "OrderParameter": listOrderParameter,
            "PageIndex": this.PageIndex,
            "PageSize": initPageSize,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          }
        }

        return _initAllProps
      },
      // SS-03 门店跳转至品种demo初始化数据（独有）
      initMdToItemProps () {
        let _initAllProps, listOrderParameter,  listOrder, initPageSize, orderBy

        listOrder = 0
        // 初始化表格排序字段参数（码洋占比）
        listOrderParameter = 3
        initPageSize = 10

        orderBy = 4

        // SS-03 进货供应商初始化同时请求饼图及表格的参数
        _initAllProps = {

          "BookSaleChartRequest": {
            "AxisUnit": orderBy,
            "EndTime": this.EndTime,
            "StartTime": this.StartTime,
            "SupplierId": this.supplierId,
            "UserCode": this.userCode
          },
          "BookSaleTableRequest": {
            "EndTime": this.EndTime,
            "Order": listOrder,
            "OrderParameter": listOrderParameter,
            "PageIndex": this.PageIndex,
            "PageSize": initPageSize,
            "StartTime": this.StartTime,
            "SupplierId": this.supplierId,
            "UserCode": this.userCode
          }

        }

        return _initAllProps
      },
      // 获取门店下的书目详情
      getBookSupplierProps () {
        let _supplierBookData
        // 具体供应商单品信息
        _supplierBookData = {
          "SupplierId": this.supplierId,
          "PageIndex": this.PageIndex,
          "PageSize": 10,
          "OrderParameter": 3,
          "Order": this.Order,
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "UserCode": this.userCode
        }

        return _supplierBookData
      },
      // tab分类切换
      triggleSortName(sort) {
        if (sort === '门店') {
          this.sortName = '门店'
        } else if (sort === '分类') {
          this.sortName = '分类'
        } else {
          this.sortName = '品种'
          this.indexVal = 0
        }
      },
      // 获取供应商、分类、品种表格数据
      getData (postProps) {

        let isMd, isFl, isPz, url

        isMd = this.sortName === '门店'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'
        url = ''

        if (isMd) url = `${this.hostName}${this.urlApi[0]}`
        if (isFl) url = `${this.hostName}${this.urlApi[1]}`
        if (isPz) url = `${this.hostName}${this.urlApi[2]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
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
      // S-01 获取门店饼图、表格数据（初始化）
      getStoreData (postProps) {
        let myChart = this.myChart
        let option = this.option1
        let url = `${this.hostName}${this.urlApi[0]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

        this.$http.post( `${url}?appkey=123&sign=${sign}`, obj ).then((response) => {

          let res = response.body
          this.ListItem = res.List

          this.originTotalPrice = res.FormatSumMy
          this.TotalPrice = res.FormatSumMy

          option.title.text = `销售码洋：${this.TotalPrice}`
          this.setPieData(option, res.List, 'gys')

          myChart.setOption(option)
          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })
      },
      // SS-01 获取分类饼图、表格数据（初始化）
      getSortData (postProps) {

        let myChart = this.myChart
        let option = this.option1
        let url = `${this.hostName}${this.urlApi[6]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

        this.$http.post( `${url}?appkey=123&sign=${sign}`, JSON.stringify(obj) ).then((response) => {

          let res = response.body
          
          let chartsObj= res.BookSaleCircularResponse
          let listObj = res.SupplierSaleListResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          this.TotalPrice = chartsObj.FormatSumMy

          option.title.text = `销售码洋：${this.TotalPrice}`
          this.setPieData(option, chartsObj.List)

          myChart.setOption(option)

          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })

      },
      // SS-02 获取品种折线图、表格数据
      getItemData (postProps) {
        let myChart = this.myChart
        let option = this.option2
        let url = `${this.hostName}${this.urlApi[7]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

         this.$http.post( `${url}?appkey=123&sign=${sign}`, JSON.stringify(obj) ).then((response) => {

          let res = response.body

          // SS-02 
          let chartsObj= res.BookSaleChartResponse
          let listObj = res.BookSaleTableResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          this.TotalPrice = chartsObj.FormatSumMy

          option.title.text = `销售码洋：${this.TotalPrice}`
          this.setLineData(option, chartsObj.List)

          myChart.setOption(option)

          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })
      },
      // SS-03 获取门店跳转至品种折线图、表格数据
      getMdToItemData (postProps) {
        let myChart = this.myChart
        let option = this.option2
        let url = `${this.hostName}${this.urlApi[8]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

         this.$http.post( `${url}?appkey=123&sign=${sign}`, JSON.stringify(obj) ).then((response) => {
            

          let res = response.body
          
          // SS-03 
          let chartsObj= res.BookSaleChartRequest
          let listObj = res.BookSaleTableResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          this.TotalPrice = chartsObj.FormatSumMy

          option.title.text = `销售码洋：${this.TotalPrice}`
          this.setLineData(option, chartsObj.List)

          myChart.setOption(option)

          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })
      },
      // 设置折线图数据
      setLineData(option, list) {
        let _xData = option.xAxis[0].data
        let itemData = option.series[0].data

        let sTime = ''
        let val = null

        for (var i = 0; i < list.length; i++) {
          _xData.push(list[i].XAxis)
          itemData.push(list[i].YAxis.toFixed(2))
        }
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
      renderTime () {
        // 监测时间变化，重新渲染页面
        let isMd, isFl, isPz

        isMd = this.sortName === '门店'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'
        
        this.PageIndex = 1

        let bookCode = this.$route.params.bookCode
        let isGysToPz = bookCode !== undefined && bookCode !== '0'

        // 是否为供应商跳至品种
        if (isGysToPz) {
          this.getMdToItemData( this.initMdToItemProps() )
          return false
        } else if (!isGysToPz && isPz) {
          this.getItemData( this.initItemProps() )
          return false
        }

        if (isMd) {
          let whichProps = 0
          this.getStoreData( this.getProps( whichProps ) )
          return false
        }

        if (isFl) {
          this.getSortData( this.initSortProps() )
          return false
        }
      },
      // 监听页面变化重新渲染页面, addData：判断是重新获取数据还是在原有基础上叠加数据
      renderData() {

        this.getData( this.getProps(1) )

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

      },
      loadSortData (isGysToPz) {
        if (isGysToPz) {
          this.$emit('getSupplierData')
        } else {
          this.renderData()
        }
      },
      setTouchEnd () {
        let xsObj = document.querySelector('.xs-container')
        xsObj.addEventListener('touchmove', function (e) {
          if (e.changedTouches[0].pageY <= 0) {
            
          }
        }, false)
      }
    },
    events: {
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
      getBookData (index) {
        this.supplierId = this.ListItem[index].SupplierId
        this.indexVal = ++index
        // --- 接下来路由会跳转 -> 会触发watch里的$route
      },
      // 监听页面变化设置post请求排序参数(order:升／降, show: true为1，false为2)
      modifyPostProps (order, show) {
        let isMd, isFl, isPz, gysIndex, flIndex, pzIndex, indexOrder

        isMd = this.sortName === '门店'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'

        let bookCode = this.$route.params.bookCode
        let isGysToPz = bookCode !== undefined && bookCode !== '0'

        this.Order = Number(order)
        // 平均到货时间 = 1,码洋 = 2,码洋占比=3，数量=4,库龄=5
        gysIndex = [2, 4]
        flIndex = [2, 4]
        pzIndex = [2, 3]

        if (isGysToPz) {
          indexOrder = pzIndex[Number(show)]
          this.loadSortData( isGysToPz )
          return false
        }

        if (isMd) indexOrder = gysIndex[Number(show)]
        if (isFl) indexOrder = flIndex[Number(show)]
        if (isPz) indexOrder = pzIndex[Number(show)]

        this.OrderParameter = indexOrder
        this.PageIndex = 1

        this.renderData()
      },
      // 门店单品数据获取
      getSupplierData () {
        let _props = this.getBookSupplierProps()
        let url = `${this.hostName}${this.urlApi[4]}`

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
      // 请求单品页面初始化数据
      showBook (index) {
        this.timeShow = false
      },
      setSortTit () {
        this.sortName = '门店'
        this.$els.scrollerWrap.style.top = '46px'
      },
      showTimeModule (statu) {
        this.timeShow = statu

        let _uuid = this.$refs.scroller.uuid

        this.$broadcast('pullup:enable', _uuid)
      },
      // 进入单品详情页时，将scroller-wrap的top值置为0
      hideTop () {
        this.$els.scrollerWrap.style.top = 0
      }
    }
  }
</script>

