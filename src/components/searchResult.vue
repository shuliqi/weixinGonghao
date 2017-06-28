<template>
<!--搜索结果内容-->
<div class="result" v-el:result>
  <ul>
    <li v-link="{ name: 'ss', params: { whickDemo: list.BookCode } }" v-for="(index, list) in listDetail">
      <div class="bookShowL scale-border"  :style="{ backgroundImage: `url(${list.Conver})`, backgroundSize: '100% 100%'}">
      </div>
      <div class="bookShowR">
        <dl>
          <dt>{{ list.BookName }}</dt>
          <dd class="line_book">作者:{{ list.Author }}</dd>
          <dd class="line_book">定价:￥{{ list.Price }}</dd>
          <dd>{{ list.Publisher }}出版</dd>
          <dd>ISBN:{{ list.ISBN }}</dd>
        </dl>
      </div>
    </li>
  </ul>
</div>
</template>

<script>
  export default {
    props: {
      listDetail: {
        type: Array,
        default: []
      }
    }
  }
</script>