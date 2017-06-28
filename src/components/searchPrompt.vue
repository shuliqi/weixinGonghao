<template>
<!--搜索提示内容-->
<div class="search-prompt" v-el:prompt>
  <ul>
    <li @click="setSearchVal(index)" v-link="{ name: 'result', params: { bookCode: listDetail[index].Value } }" v-for="(index, book) in listDetail">
      <dl>
        <dt class="scale-border">
            <div class="content">
              <img :src="book.Conver ? book.Conver : defaultImg">
            </div>
            <div class="border"></div>
        </dt>
        <dd>{{ book.Value }}</dd>
      </dl>
    </li>
  </ul>
</div>
</template>

<script>
import imgUrl from '../assets/default.png'

export default {
  props: {
    listDetail: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      defaultImg: imgUrl
    }
  },
  methods: {
    setSearchVal (index) {
      this.$dispatch( 'setSearchTxt', this.listDetail[index].Value )
    }
  }
}
</script>