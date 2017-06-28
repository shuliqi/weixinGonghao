<template>
<div class="mainBd">
  <div class="bd_in bd_l">
    <div class="bd_l_child bd_tit bd_l_tit">
      <div></div>
      <div>出版社</div>
    </div>
    <div class="bd_l_child bd_body bd_l_body">
      <ul v-el:list-title>
        <li v-link="{ name: 'Ppz', params: { bookCode: index + 1 } }" v-for="(index, item) in listObj" @click.stop="refreshData(index)">
          <div><i>{{ $index+1 }}</i></div>
          <div>
            <span>{{ item.Supplier }}</span>
          </div>
          <div :class="supplierLeve[item.SupplierLeve]"></div>
        </li>
      </ul>
    </div>
  </div>
  <div class="bd_in bd_r">
    <div class="bd_r_in">
      <div class="bd_r_in_child bd_tit bd_r_tit">
        <div data-num="0" class="ministrialTxt liftIcon bd_r_in_find" :class="{ 'up': isA, 'down': !isA, 'active': !isShow }" @click="lift1($event) | debounce 0">-到货时间</div>
        <div data-num="1" class="timeTxt liftIcon bd_r_in_find radio_progress" :class="{ 'up': isB, 'down': !isB, 'active': isShow }" @click="lift2($event) | debounce 0">码洋/元</div>
      </div>
      <div class="bd_r_in_child bd_body bd_r_body">
        <ul v-el:list-detail>
          <li v-link="{ name: 'Ppz', params: { bookCode: index } }" v-for="(index, item) in listObj" @click.stop="refreshData(index)">
            <div class="bd_r_in_find">{{ item.AvgDeliverTime }}</div>
            <div class="radio_progress bd_r_in_find">
              <div class="progress_in">
                <p class="rate">{{ item.FormatMy }}</p>
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
      isA: true,
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
    canReuse: false,
    data: function (transition) {
      this.$parent.$parent.Order = 1
      this.$parent.$parent.OrderParameter = 1
    }
  },
  ready () {},
  props: {
    listObj: {
        type: Array,
        default: []
    }
  },
  methods: {
    // 跳转到具体供应商
    refreshData (index) {
      this.$dispatch('getBookData', index)
    },
    // 最后一个
    lift1 (event) {
      let isA = this.isA
      this.isA = !isA
      this.isShow = false

      let oTarget = event.target
      let num = oTarget.dataset.num

      this.$dispatch('modifyPostProps', this.isA, this.isShow)
    },
    // 第二个
    lift2 (event) {
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

<style lang="scss">
@import '../css/myMixin/vars.scss';
@import '../css/myMixin/overflow_hidden.scss';
@import '../css/myMixin/onePX.scss';
.mainBd {
    display: flex;
    font-size: 14px;
    width: 100%;
    .bd_in {
        width: 50%;
        flex: 1 0 50%;
        .bd_l_child {
            div:nth-child(1) {
                flex: 0 1 1.6rem;
                text-align: center;
                color: $fs_85;
                i {
                    display: inline-block;
                    width: 18px;
                    line-height: 18px;
                    height: 18px;
                    border-radius: 3px;
                }
            }
            div:nth-child(2) {
                flex: 1 0 120px;
                color: $fs_3e;
                line-height: 1.4;
                padding: 0 0 0 0.5rem;
                @include overflow_hidden;
            }
        }
        .bd_l_child.bd_l_body {
            .copper,
            .gold,
            .newBook,
            .silver,
            .warning {
                width: 20px;
                height: 26px;
            }
            .copper,
            .gold,
            .silver {
                &:after {
                    content: '\e601';
                    font: 18px iconfont;
                    position: relative;
                    top: 3px;
                }
            }
            .gold {
                &:after {
                    color: $cor_e3b;
                }
            }
            .silver {
                &:after {
                    color: $cor_cac;
                }
            }
            .copper {
                &:after {
                    color: $cor_cc8;
                }
            }
            .warning {
                &:after {
                    content: '\e60d';
                    position: relative;
                    top: 3px;
                    font: 18px iconfont;
                }
            }
            .newBook {
                &:after {
                    content: '\e60e';
                    position: relative;
                    top: 3px;
                    font: 18px iconfont;
                    color: $fc_ff3;
                }
            }
        }
        .bd_r_in_child {
            display: flex;
            text-align: center;
            .bd_r_in_find:nth-child(1) {
                flex: 1 0 85px;
                display: flex;
                justify-content: center;
            }
            .bd_r_in_find:nth-child(2) {
                flex: 1 0 50%;
            }
            .bd_r_in_find:nth-child(2).radio_progress {
                flex: 1 0 70px;
                display: flex;
                justify-content: center;
                .progress_in {
                    width: 70px;
                    .hor {
                        width: 100%;
                        height: 8px;
                        background: $cor_eae;
                        border-radius: 6px;
                        margin-bottom: 4px;
                        .mask {
                            width: 50%;
                            height: 100%;
                            background: $cor_f5c;
                            border-radius: 6px;
                        }
                    }
                    .rate {
                        font-size: 14px;
                        line-height: 14px;
                    }
                }
            }
        }
        .bd_tit {
            height: 40px;
            align-items: center;
            display: flex;
            color: $fs_69;
            background: $cor_f8;
            border-bottom: 1px solid $bor_e0;
        }
        .bd_body {
            ul {
                width: 100%;
            }
            li {
                display: flex;
                align-items: center;
                height: 50px;
                position: relative;
                color: $fs_85;
                @include onePX($bor_e0);
            }
        }
    }
    .bd_l {
        .bd_l_tit {
            padding-left: 0.5rem;
        }
        li {
            padding-left: 0.5rem;
        }
        li:nth-child(1) {
            i {
                color: $fs_fff;
                background-color: $cor_ee3;
            }
        }
        li:nth-child(2) {
            i {
                color: $fs_fff;
                background-color: $cor_fca;
            }
        }
        li:nth-child(3) {
            i {
                color: $fs_fff;
                background-color: $cor_0ec;
            }
        }
    }
    .bd_r {
        .bd_r_tit {
            color: $fs_69;
            padding-right: 0.5rem;
            .liftIcon {
                &:after {
                    color: $cor_c5;
                    font: 14px iconfont;
                    position: relative;
                    width: 8px;
                    top: 2px;
                }
            }
            .down {
                &:after {
                    content: '\e645';
                }
            }
            .up {
                &:after {
                    content: '\e646';
                    -webkit-transform: rotateY(180deg);
                    transform: rotateY(180deg);
                    text-indent: -6px;
                }
            }
            .active {
                &:after {
                    color: $cor_0ec;
                }
            }
        }
        .bd_r_body {
            li {
                padding-right: 0.5rem;
            }
        }
    }
}
</style>
