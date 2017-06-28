import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Purchase from './components/Purchase'
import Sales from './components/Sales'
import Stock from './components/Stock'
import Search from './components/Search'
import Single from './components/single'
import purchaseGys from './components/purchaseGys'
import purchaseFl from './components/purchaseFl'
import purchasePz from './components/purchasePz'
import salesMd from './components/salesMd'
import salesFl from './components/salesFl'
import salesPz from './components/salesPz'
import stockGys from './components/stockGys'
import stockFl from './components/stockFl'
import stockPz from './components/stockPz'
import SearchPrompt from './components/searchPrompt'
import SearchResult from './components/searchResult'
import SearchHot from './components/searchHot'
import { setMd5, GetQueryString } from 'utilJs/unit'

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.config.devtools = true

/* eslint-disable no-new */
Vue.use(VueRouter)
Vue.use(VueResource)

/*----- vuex start -----*/
import store from './store/store'

const commit = store.commit || store.dispatch
/* ------ vuex end ------*/

/* ----- vue http inteceptor start ------*/
Vue.http.interceptors.push(( request, next) => {
  commit('UPDATE_LOADING', true)
  next((Response) => {
    setTimeout(function () {
      commit('UPDATE_LOADING', false)
    }, 600)
    if (!Response.ok || Response.body.code === 500 || Response.body === '12') {
      setTimeout(function () {
        commit('ERROR', true)
      }, 50)
    }
  })
})
/* ----- vue http inteceptor end ------*/

Vue.http.options.xhr = { withCredentials: true }
// 不发送options预请求
Vue.http.options.emulateJSON = true
Vue.http.headers.common["Content-Type"] = 'text/json; charset=UTF-8'
Vue.http.options.emulateHTTP = true

const router = new VueRouter({
  transitionOnLoad: false,
  suppressTransitionError: true
})

router.beforeEach(({ to, from, next }) => {

  let userId = window.localStorage.getItem('userId')
  if (/*userId === '0' ||*/ userId === 'undefined' || userId === null) {
    window.location.href = 'http://qianduan.cnonixdata.com/shxh'
  } else {
    next()
  }
  
} )

router.afterEach( () => {
  // commit('UPDATE_LOADING', false)
} )

router.redirect({
  '/': 'purchase/purchaseGys',
  '/sales': 'sales/salesMd',
  '/stock': 'stock/stockGys',
  '/search': 'search/hot'
})

router.map({
  // P 代表purchase进货
  '/purchase': {
    component: Purchase,
    subRoutes: {
      'purchaseGys': {
        name: 'Pgys',
        component: purchaseGys
      },
      'purchaseFl': {
        name: 'Pfl',
        component: purchaseFl
      },
      'purchasePz/:bookCode': {
        name: 'Ppz',
        component: purchasePz
      },
      'single/:whickDemo': {
        name: 'purchaseDP',
        component: Single
      }
    }
  },
  // S 代表sales 销售
  '/sales': {
    component: Sales,
    subRoutes: {
      'salesMd': {
        name: 'Smd',
        component: salesMd
      },
      'salesFl': {
        name: 'Sfl',
        component: salesFl
      },
      'salesPz/:bookCode': {
        name: 'Spz',
        component: salesPz
      },
      'single/:whickDemo': {
        name: 'salesDP',
        component: Single
      }
    }
  },
  // ST 代表stock 库存
  '/stock': {
    component: Stock,
    subRoutes: {
      'stockGys': {
        name: 'STgys',
        component: stockGys
      },
      'stockFl:/bookCode': {
        name: 'STfl',
        component: stockFl
      },
      'stockPz/:bookCode': {
        name: 'STpz',
        component: stockPz
      },
      'single/:whickDemo': {
        name: 'stockDP',
        component: Single
      }
    }
  },
  '/search': {
    component: Search,
    subRoutes: {
      'hot': {
        name: 'hot',
        component: SearchHot,
        meta: {
          keepAlive: true
        }
      },
      'prompt/:val': {
        'name': 'prompt',
        component: SearchPrompt,
        meta: {
          keepAlive: false
        }
      },
      'result/:bookCode': {
        name: 'result',
        component: SearchResult,
        meta: {
          keepAlive: false
        }
      },
      'single/:whickDemo': {
        name: 'ss',
        component: Single,
        meta: {
          keepAlive: false
        }
      }
    }
  }
})

router.start(App, '#app')


