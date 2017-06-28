<template>
  <div class="TimeSelectProcess">
      <group class="dateMadel">
      <i>起始:</i>
      <calendar :value.sync="time1" :weeks-list="weeksList" :highlight-weekend="true" start-date="2015-01-01" end-date="2016-12-31" title=""></calendar>
    </group>——
    <group class="dateMadel">
      <i>结束:</i>
      <calendar :value.sync="time2" :weeks-list="weeksList" :highlight-weekend="true" start-date="2015-01-01" end-date="2016-12-31" title=""></calendar>
    </group>
  </div>
</template>
<script>
  import Calendar from 'vux/dist/components/calendar'
  import InlineCalendar from 'vux/dist/components/inline-calendar'
  import Group from 'vux/dist/components/group'
  import XButton from 'vux/dist/components/x-button'

  export default {
    components: {
      Calendar,
      InlineCalendar,
      Group,
      XButton
    },
    data () {
      return {
        weeksList: ['日', '一', '二', '三', '四', '五', '六']
      }
    },
    props: {
      time1: String,
      time2: String
    }
  }
</script>

<style lang="scss">
  @import '../css/myMixin/vars.scss';
  @import '../css/myMixin/onePX.scss';

  .TimeSelectProcess {
    @include onePX($bor_e0);
    bottom: 1px;
    position: relative;
    height: 47px;
    line-height: 47px;
    padding: 0 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: $cor_f7;
    font-size: 12px;
    i {
      font-size: 14px;
      display: inline-block;
      height: 1.9rem;
      line-height: 1.9rem;
      position: absolute;
    }
    .weui_cell {
      padding: 0 0 0 30px;
      font-size: 14px;
    }
    .weui_cell_ft.with_arrow {
      height: 1.9rem;
      line-height: 1.9rem;
      font-size: 14px;
      width: 80px;
    }
    .weui_btn {
      height: 24px;
      width: 40px;
      line-height: 24px;
      font-size: 12px;
      padding: 0;
    }
    .dateMadel {
      flex: 1;
      justify-content: center;
      display: flex;
    }
    .OkBtn {
      flex: 0 0 3rem;
    }
  }
</style>
