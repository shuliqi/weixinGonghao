<template>
  <div class="wrap-cont">
    <time-select v-show="timeShow" :time.sync="time"></time-select>
    <div v-el:scroller-wrap class="scroller-wrap">
      <scroller v-ref:scroller :bounce="false" @pullup:loading="load" :pullup-status.sync="pullupStatus" lock-x use-pullup :pullup-config="pullupConfig">
        <div>
          <div v-show="timeShow">
            <div v-el:chart id="echartsBox"></div>
            <tab class="normalTab" :animate="false">
              <tab-item v-link="{ name: 'Pgys' }" :selected="sortName === '供应商'" @click="triggleSortName('供应商')">供应商</tab-item>
              <tab-item v-link="{ name: 'Pfl' }" :selected="sortName === '分类'" @click="triggleSortName('分类')">分类</tab-item>
              <tab-item v-ref:pz v-link="{ name: 'Ppz', params: { bookCode: 0 } }" :selected="sortName === '品种'" @click="triggleSortName('品种')">品种</tab-item>
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
  import { setDate, getStartTime, getEndTime, setMd5, setWechatTitle } from 'utilJs/unit'

  import Tab from 'vux/dist/components/tab'
  import TabItem from 'vux/dist/components/tab-item'
  import Group from 'vux/dist/components/group'
  import TimeSelect from 'components/timeSelect'
  import Single from 'components/single'
  import Scroller from 'vux/src/components/scroller'
  import Spinner from 'vuxModule/spinner'

  export default {
    data () {
      return {
        PageIndex: 1,
        PageSize: 10,
        OrderParameter: 1,
        Order: 1,
        urlApi: [
          // P-01 按供应商排序 -- 0
          '/App/AppPurchase/StatisticsFacetBySupplier',
          // P-02 按分类排序 -- 1
          '/App/AppPurchase/StatisticsFacetByVariety',
          // P-03 按品种排序 -- 2
          '/App/AppPurchase/StatisticsFacetByBook',
          // P-04 折线图数据 -- 3
          '/App/AppPurchase/Trend',
          // P-06 供应商单品集合体 -- 4
          '/App/AppPurchase/SupplierStatisticsFacetByBook',
          // P-07 供应商单品折线图数据 -- 5
          '/App/AppPurchase/SupplierTrend',
          // PP-01 默认进货供应商排序 -- 6
          '/App/AppPurchase/StatisticsFacetBySupplierLoad',
          // PP-02 品种初始化 -- 7
          '/App/AppPurchase/StatisticsFacetByBookLoad',
          // PP-03 供应商跳转至品种 -- 8
          '/App/AppPurchase/StatisticsFacetBySupplierBookLoad'
        ],
        originTotalPrice: Number,
        TotalPrice: '',
        ListItem: [],
        pieData: Array,
        LineData: Array,
        myChart: Object,
        sortName: '供应商',
        sortNameGroup: ['供应商', '分类', '品种'],
        show: false,
        time: setDate(false),
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
            name: '进货码洋',
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
            name: "进货码洋",
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
    vuex: {
      getters: {
        hostName: (state) => state.hostName,
        userCode: (state) => state.userId
      }
    },
    route: {
      data ({to, from}) {
        to.router._rootView.keepAlive = false
        to.router._rootView.params.keepAlive = false
      }
    },
    watch: {
      time: function(val, oldVal) {
        // 监测时间变化，重新渲染页面
        let isGys, isFl, isPz

        isGys = this.sortName === '供应商'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'
        
        this.PageIndex = 1

        let bookCode = this.$route.params.bookCode
        let isGysToPz = bookCode !== undefined && bookCode !== '0'

        // 是否为供应商跳至品种
        if (isGysToPz) {
          this.initGysToPz( this.initGysToPzProps() )
          return false
        } else if (!isGysToPz && isPz) {
          this.initItemData( this.initItemProps() )
          return false
        }
        
        if (isGys) {
          // PP-01接口 -- 初始化进货demo
          this.initData( this.initProps() )
          return false
        }

        if (isFl) {
          // 初始化分类demo
          let whichProps = 0
          this.getSortData( this.getProps( whichProps ) )
          return false
        }

      },
      // 监测路由变化
      '$route': function (to, from) {

        let path = to.path.replace('\/', '')

        // 监测类别变化，重新渲染页面
        let isGys = /purchaseGys/.test(path)
        let isFl = /purchaseFl/.test(path)
        let isPz = /purchasePz/.test(path)
        let isGysToPz = this.$route.params.bookCode !== '0'

        let single = /\/purchase\/single/
        let whichDemo = this.$route.params.bookCode

        if ( single.test(from.path) ) {
          this.timeShow = true
          this.$els.scrollerWrap.style.top = '46px'
        }

        // 初始化页码
        this.PageIndex = 1

        if ( isGys ) {
          // 初始化供应商请求数据
          this.Order = 1
          this.OrderParameter = 1

          // 初始化供应商demo
          this.initData( this.initProps() )
          return false
        }

        if (isFl) {
          // 初始化分类请求数据
          this.Order = 0
          this.OrderParameter = 2

          // 初始化分类demo
          let whichProps = 0
          this.getSortData( this.getProps( whichProps ) )
          return false
        }

        // 品种请求数据
        if (isPz ) {
          this.Order = 0
          this.OrderParameter = 2
        }

        if ( isPz && isGysToPz ) {
          
          this.initGysToPz( this.initGysToPzProps() )
          

        } else if ( isPz && !isGysToPz ) {

          this.initItemData( this.initItemProps() )

        }

      }
    },
    computed: {
      StartTime () {
        let date = getStartTime(this.time)
        return date
      },
      EndTime () {

        let date = getEndTime(this.time)

        return date

      }
    },
    created () {
      // PP-01接口 -- 初始化进货demo
      this.$nextTick(() => {

        this.initData( this.initProps() )

      })
    },
    ready() {

      this.$set( 'myChart', echarts.init( this.$els.chart, 'macarons') )

    },
    components: {
      Tab,
      TabItem,
      Group,
      TimeSelect,
      Single,
      Scroller,
      Spinner
    },
    methods: {
      // PP-01请求参数（独享）
      initProps () {

        let pieOrderParameter, _initAllProps, pieOrder, listOrderParameter, initPageSize

        pieOrder = 0
        // 初始化饼图排序字段参数
        pieOrderParameter = 2
        // 初始供应商表格数据排序字段参数
        listOrderParameter = 1
        initPageSize = 10

        // PP-01 进货供应商初始化同时请求饼图及表格的参数
        _initAllProps = {
          "SupplierPurchaseCircularRequest": {
            "EndTime": this.EndTime,
            "Order": pieOrder,
            "OrderParameter": pieOrderParameter,
            "PageIndex": this.PageIndex,
            "PageSize": initPageSize,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          },
          "SupplierPurchaseListRequest": {
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
      // 品种参数
      initItemProps () {

        let _initAllProps, 
            pieOrder, 
            listOrderParameter, 
            initPageSize, 
            sortBy

        pieOrder = 0
        // 初始供应商表格数据排序字段参数
        listOrderParameter = 3
        initPageSize = 10
        // 按日查询
        sortBy = 4

        // PP-02 品种初始化同时请求折线图及表格的参数
        _initAllProps = {
          "BookPurchaseChartRequest": {
            "AxisUnit": sortBy,
            "EndTime": this.EndTime,
            "StartTime": this.StartTime,
            "UserCode": this.userCode
          },
          "BookPurchaseTableRequest": {
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
      // 供应商跳转至品种参数
      initGysToPzProps () {

        let _initAllProps, 
            pieOrder, 
            listOrderParameter, 
            initPageSize, 
            sortBy

        pieOrder = 0
        // 初始供应商表格数据排序字段参数
        listOrderParameter = 3
        initPageSize = 10
        // 按日查询
        sortBy = 4

        // PP-02 品种初始化同时请求折线图及表格的参数
        _initAllProps = {
          "SupplierBookLoadChartRequest": {
            "AxisUnit": sortBy,
            "EndTime": this.EndTime,
            "StartTime": this.StartTime,
            "SupplierId": this.supplierId,
            "UserCode": this.userCode
          },
          "SupplierBookLoadTableRequest": {
            "EndTime": this.EndTime,
            "Order": this.Order,
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
      // 0: _initPostProps, 1: _postProps, 2: _lineChartProps
      getProps (whichProps) {
        let initPageIndex, 
            initPageSize, 
            initOrderParameter, 
            initOrder,
            sortByTime,
            _initPostProps, 
            _postProps, 
            _lineChartProps,
            _lineChartSupplier,
            _initAllProps,
            _props

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

        _lineChartSupplier = {
          "StartTime": this.StartTime,
          "EndTime": this.EndTime,
          "AxisUnit": sortByTime,
          "UserCode": this.userCode,
          "SupplierId": this.supplierId
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
            _props = _lineChartSupplier
            break
        }

        return _props

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
        if (sort === '供应商') {
          this.sortName = '供应商'
        } else if (sort === '分类') {
          this.sortName = '分类'
        } else {
          this.sortName = '品种'
          this.indexVal = 0
        }
      },
      // PP-01 初始进货demo数据
      initData (postProps) {

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

          let chartsObj= res.SupplierPurchaseCircularResponse
          let listObj = res.SupplierPurchaseListResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          let totalNum = chartsObj.FormatSumMy.split(',').join('')
          totalNum = Math.round(totalNum / 10000)

          this.TotalPrice = `${totalNum}万`

          option.title.text = `进货码洋：${this.TotalPrice}`
          this.setPieData(option, chartsObj.List, 'isGys')

          myChart.setOption(option)

          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })
      },
      // PP-02 初始化品种demo数据
      initItemData (postProps) {
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
          
          let chartsObj= res.BookPurchaseChartRequest
          let listObj = res.BookPurchaseTableResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          let totalNum = chartsObj.FormatSumMy.split(',').join('')
          totalNum = Math.round(totalNum / 10000)

          this.TotalPrice = `${totalNum}万`

          option.title.text = `进货码洋：${chartsObj.FormatSumMy}`
          this.setLineData(option, chartsObj.List)

          myChart.setOption(option)

          this.$nextTick(() => {
            this.$refs.scroller.reset({
              top: 0
            })
          })

        })
      },
      // PP-03 初始化供应商跳转至品种数据
      initGysToPz (postProps) {
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

          let chartsObj= res.SupplierBookLoadChartResponse
          let listObj = res.SupplierBookLoadTableResponse

          this.ListItem = listObj.List

          this.originTotalPrice = chartsObj.FormatSumMy

          let totalNum = chartsObj.FormatSumMy.split(',').join('')
          totalNum = Math.round(totalNum / 10000)

          this.TotalPrice = `${totalNum}万`

          option.title.text = `进货码洋：${this.TotalPrice}`
          this.setLineData(option, chartsObj.List)

          myChart.setOption(option)

          this.$nextTick( () => {
            this.$refs.scroller.reset({
              top: 0
            })
          } )

        })
      },
      // 获取供应商、分类、品种表格数据
      getData (postProps) {

        let isGys, isFl, isPz, url

        isGys = this.sortName === '供应商'
        isFl = this.sortName === '分类'
        isPz = this.sortName === '品种'
        url = ''

        if (isGys) url = `${this.hostName}${this.urlApi[0]}`
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
      // P-02 获取分类饼图、表格数据
      getSortData (postProps) {
        let myChart = this.myChart
        let option = this.option1
        let url = `${this.hostName}${this.urlApi[1]}`

        //  md5加密
        let md5Obj = setMd5(postProps)
        let sign = md5Obj.sign
        let obj = md5Obj.obj

        myChart.clear()

        this.$http.post( `${url}?appkey=123&sign=${sign}`, obj ).then((response) => {

          let res = response.body
          this.ListItem = res.List

          this.originTotalPrice = res.FormatSumMy

          let totalNum = res.FormatSumMy.split(',').join('')
          totalNum = Math.round(totalNum / 10000)

          this.TotalPrice = `${totalNum}万`

          option.title.text = `进货码洋：${this.TotalPrice}`
          this.setPieData(option, res.List, '')

          myChart.setOption(option)

          this.$nextTick(() => {
            this.$refs.scroller.reset({
              top: 0
            })
          })

        })
      },
      // 设置折线图数据
      setLineData(option, list) {

        option.xAxis[0].data = []
        option.series[0].data = []

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
        gysIndex = [1, 2]
        flIndex = [2, 4]
        pzIndex = [2, 3]
        
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

        this.loadSortData( isGysToPz )

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
      getBookData (index) {
        this.supplierId = this.ListItem[index].SupplierId

        this.indexVal = ++index
        // --- 接下来路由会跳转 -> 会触发watch里的$route
      },
      initScroller () {
        this.$nextTick( () => {
          let _uuid = this.$refs.scroller.uuid

          setTimeout( () => {
            this.$refs.scroller.reset({
              top: 0
            })
            this.$broadcast('pullup:disable', _uuid)
          }, 50 )
        } )
      },
      initXScroller () {
        let _uuid = this.$refs.scroller.uuid
        this.$nextTick( () => {
          this.$broadcast('pullup:reset', _uuid)
          this.$broadcast('pullup:disable', _uuid)
        } )

      },
      openPullup () {
        let _uuid = this.$refs.scroller.uuid

        this.$nextTick( () => {
          this.$broadcast('pullup:enable', _uuid)
        } )

      },
      setSortTit () {
        let _uuid = this.$refs.scroller.uuid
        this.sortName = '供应商'
        this.$els.scrollerWrap.style.top = '46px'
        this.$broadcast('pullup:reset', _uuid)
      },
      showTimeModule (statu) {
        this.timeShow = statu

        let _uuid = this.$refs.scroller.uuid
        this.$broadcast('pullup:enable', _uuid)
      },
      showBook (index) {
        this.timeShow = false
      },
      // 进入单品详情页时，将scroller-wrap的top值置为0
      hideTop () {
        this.$els.scrollerWrap.style.top = 0
      }
    }
  }
</script>

<style lang="scss">
  @import '../css/myMixin/vars.scss';
  @import '../css/myMixin/overflow_hidden.scss';
  @import '../css/myMixin/onePX.scss';

  .fade-transition {
    transition: transform .3s ease;
  }
  .fade-enter, .fade-leave {
    opacity: 0;
  }
  .wrap-cont {
    position: absolute;
    width: 100%;
    height: calc(100% - 51px);
    overflow: hidden;
  }

  .range {
    width: 100%;
    height: 40px;
  }
  .dynamic{
    width: 100%;
    overflow-y: auto;
    position: absolute;
    top: 2rem;
    bottom: 51px;
  }

  #echartsBox {
    width: 100%;
    height: 220px;
    padding: 10px 0 0;
    display: flex;
    align-items: center;
    background: $cor_f8!important;
    @media screen and (min-width: 350px) and (-webkit-min-device-pixel-ratio:2) {
      height: 250px;
    }
    @media screen and (min-width: 360px) and (-webkit-min-device-pixel-ratio:2.65) {
      height: 280px;
    }
  }
  .normalTab.vux-tab{
    width: 100%;
    height: 24px;
    line-height: 24px;
    justify-content: center;
    box-sizing: content-box!important;
    background: $cor_f8;
    .vux-tab-item {
      line-height: 24px;
      background: transparent!important;
      flex: 0 1 60px;
      width: 60px;
      margin: 0 10px;
      border-radius: 20px;
      border: 1px solid transparent !important;
    }
    .vux-tab-selected {
      width: 60px;
      height: 24px!important;
      border-radius: 20px;
      color: $cor_389!important;
      border: 1px solid $cor_389!important;
    }
  }

  .vux-tab .vux-tab-item {
    border: 1px solid transparent!important;
  }

  .goIn{
    height: auto!important;
    background: $fs_fff;
    overflow-y: auto;
    -webkit-transform: translate3d(100%,0,0);
    transform: translate3d(100%,0,0);  
    -webkit-transition: all .3s ease;
    transition: all .3s ease;
  }

  // 过度动画
  .goIn-enter{
    -webkit-transform: translate3d(0,0,0);
    transform: translate3d(0,0,0); 
  }    
  .goIn-leave{
    -webkit-transform: translate3d(100%,0,0);
    transform: translate3d(100%,0,0);    
  }

  .scroller-wrap {
    position: absolute;
    top: 46px;
    left: 0;
    bottom: 0;
    width: 100%;
    >div {
      height: 100%!important;
    }
  }
  .xs-container{
    >div{
      position: relative;
    }
  }
</style>
