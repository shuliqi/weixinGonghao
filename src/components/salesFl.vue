<template>
<div class="mainBd">
  <div class="bd_in bd_l">
    <div class="bd_l_child bd_tit bd_l_tit">
      <div></div>
      <div>分类</div>
    </div>
    <div class="bd_l_child bd_body bd_l_body">
      <ul>
        <li v-for="item in listObj">
          <div><i>{{ $index+1 }}</i></div>
          <div>
            <span>{{ item.Classify }}</span>
          </div>
          <div :class="supplierLeve[item.SupplierLeve]"></div>
        </li>
      </ul>
    </div>
  </div>
  <div class="bd_in bd_r">
    <div class="bd_r_in">
      <div class="bd_r_in_child bd_tit bd_r_tit">
        <div data-num="0" class="ministrialTxt liftIcon bd_r_in_find" :class="{ 'up': isA, 'down': !isA, 'active': !isShow }" @click="lift1()">码洋/元</div>
        <div data-num="1" class="timeTxt liftIcon bd_r_in_find radio_progress" :class="{ 'up': isB, 'down': !isB, 'active': isShow }" @click="lift2()">数量</div>
      </div>
      <div class="bd_r_in_child bd_body bd_r_body">
        <ul>
          <li v-for="item in listObj">
            <div class="bd_r_in_find">{{ item.FormatMy }}</div>
            <div class="radio_progress bd_r_in_find">
              <div class="progress_in">
                <!--<div class="hor">
                  <div class="mask"></div>
                </div>-->
                <p class="rate">{{ item.FormatCount }}</p>
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
      isShow: true,
      supplierLeve: {
        1: 'gold',
        2: 'silver',
        3: 'copper'
      }
    }
  },
  route:{
    canReuse: false
  },
  props: {
    listObj: {
      type: Array,
      default: []
    }
  },
  methods: {
    // 最后一个
    lift1 () {
      let isA = this.isA
      this.isA = !isA
      this.isShow = false

      let oTarget = event.target
      let num = oTarget.dataset.num

      this.$dispatch('modifyPostProps', this.isA, this.isShow)
    },
    // 第二个
    lift2 () {
      let isB = this.isB
      this.isB = !isB
      this.isShow = true
      let oTarget = event.target
      let num = oTarget.dataset.num

      this.$dispatch('modifyPostProps', this.isB, this.isShow)
    }
  }
}
</script>
