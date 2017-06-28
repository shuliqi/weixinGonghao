<template>
<div class="mainBd">
  <div class="bd_in bd_l">
    <div class="bd_l_child bd_tit bd_l_tit">
      <div></div>
      <div>品种</div>
    </div>
    <div class="bd_l_child bd_body bd_l_body">
      <ul>
        <li v-link="{ name: 'stockDP', params: { whickDemo: listObj[index].BookCode } }" v-for="(index, item) in listObj" @click="refreshData(index)">
          <div><i>{{ $index+1 }}</i></div>
          <div>
            <span>{{ item.BookName }}</span>
          </div>
          <div :class="{ 'newBook': item.IsNewBook }"></div>
        </li>
      </ul>
    </div>
  </div>
  <div class="bd_in bd_r">
    <div class="bd_r_in">
      <div class="bd_r_in_child bd_tit bd_r_tit">
        <div data-num="0" class="ministrialTxt liftIcon bd_r_in_find" :class="{ 'up': isA, 'down': !isA, 'active': !isShow }" @click="lift1()">数量</div>
        <div data-num="1" class="timeTxt liftIcon bd_r_in_find radio_progress">库龄/天</div>
      </div>
      <div class="bd_r_in_child bd_body bd_r_body">
        <ul>
          <li v-link="{ name: 'stockDP', params: { whickDemo: listObj[index].BookCode } }" v-for="(index, item) in listObj" @click="refreshData(index)">
            <div class="bd_r_in_find">{{ item.FormatCount }}</div>
            <div class="radio_progress bd_r_in_find">
              <div class="progress_in">
                <p class="rate">{{ item.FormatKl }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      isA: false,
      isB: false,
      isShow: false,
      supplierLeve: {
        1: 'gold',
        2: 'silver',
        3: 'copper'
      }
    }
  },
  route:{
  },
  props: {
    listObj: Array
  },
  methods: {
    refreshData(index) {
      this.$dispatch('showBook', index)
    },
    // 最后一个
    lift1 () {
      let isA = this.isA
      this.isA = !isA
      this.isShow = false

      let oTarget = event.target
      let num = oTarget.dataset.num

      this.$dispatch('modifyPostProps', this.isA, this.isShow)
    }
  }
}
</script>
