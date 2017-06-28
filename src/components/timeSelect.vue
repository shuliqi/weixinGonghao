<template>
	<div class="timeSelect">
		<div class="fixedBox">
			<p class="prev" @click="prev">
				<i class="icon-prev"></i>
				<span>上一月</span>
			</p>
			<group class="dateMadel">
				<i class="icon-date"></i>
				<datetime title="" :value.sync="time" format="YYYY-MM" v-ref:dataTime1 confirm-text="确认" cancel-text="取消" :max-year="new Date().getFullYear() - 1" :min-year="2015"></datetime>
				<i class="icon-arrow"></i>
			</group>
			<p class="next" @click="next">
				<span>下一月</span>
				<i class="icon-next"></i>
			</p>
		</div>
	</div>
</template>

<script>
import Datetime from 'vux/dist/components/datetime'
import Group from 'vux/dist/components/group'
import { setTimePoint } from 'utilJs/unit'

export default {
  components: {
    Datetime,
    Group
  },
  props: {
    time: String
  },
  methods: {
    prev () {
			setTimePoint({
				self: this,
				timePoint: this.time,
				isPrev: true,
				minYear: 2015
			})
    },
    next () {
			setTimePoint({
				self: this,
				timePoint: this.time,
				isPrev: false,
				maxYear: 2016
			})
    }
  }
}
</script>

 <style lang="scss">
    @import '../css/myMixin/vars.scss';
    @import '../css/myMixin/onePX.scss';

    .timeSelect{
        position: relative;
        height: 46px;
        line-height: 46px;
        .fixedBox{
            @include onePX($bor_e0);
            height: 46px;
            line-height: 46px;
            padding: 0 0.75rem;
            display: flex;
            justify-content: space-between;
            background-color: $cor_f7;
            font-size: 14px;
        }
        .prev,
        .next{
            height: 46px;
            line-height: 46px;
            color: $fs_444;
            i:before{
                font: 16px iconfont;
                vertical-align: middle;
            }
            span{
                display: inline-block;
                vertical-align: middle;
            }
        }
        .prev{
            i:before{
                content: '\e61d';
            }
        }
        .next{
            i:before{
                content: '\e636';
            }
        }
        .dateMadel{
            height: 45px;
            line-height: 45px;
            display: flex;
            .icon-date{
                position: relative;
                color: $fs_444;
            }
            .icon-date{
                left: 26px;
                line-height: 45px;
            }
            .icon-date:before{
                display: inline-block;
                content: '\e62e';
                font: 18px/36px iconfont;
            }
            .icon-date + a{
              z-index: 5;
            }
            .icon-arrow{
                position: relative;
                right: 24px;
                line-height: 45px;
            }
            .icon-arrow:before{
                display: inline-block;
                margin-top: -2px;
                content: '\e644';
                font: 14px iconfont;
            }
        }
    }
    .weui_cells:before,
    .weui_cell:before,
    .weui_cells:after{
        display: none!important;
    }
   .dateMadel .vux-no-group-title{
        margin-top: 0!important;
        display: flex;
    }
    .weui_cell_ft.with_arrow{
        text-align: center!important;
        font-size: 14px;
        color: $fs_444;
    }
   .weui_cell_ft.with_arrow:after{
    display: none!important;
  }
  .weui_cell{
      padding: 0 30px;
  }
  .weui_cells{
    background-color:$cor_f7!important;
  }
</style>
