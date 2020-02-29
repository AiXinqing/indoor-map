import 'assets/style.css'

import Vue from 'vue'
import App from './app.vue'
import axios from 'axios'
axios.defaults.baseURL = 'https://xrequest.yunzaitech.com'

document.body.addEventListener('touchmove', function (e) {
  e.preventDefault() //阻止默认的处理方式(阻止下拉滑动的效果)
}, { passive: false })

new Vue({
  el: '#app',
  render: h => h(App, {
    props: {
      storage: true,
    },
  }),
})
