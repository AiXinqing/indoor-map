import 'assets/style.css'

import Vue from 'vue'
import App from './app.vue'
import axios from 'axios'
import {
  Button,
  ButtonGroup,
  Icon,
  Input,
  Row,
  Col,
} from 'view-design'

Vue.component('IButton', Button)
Vue.component('ButtonGroup', ButtonGroup)
Vue.component('Icon', Icon)
Vue.component('IRow', Row)
Vue.component('ICol', Col)
Vue.component('IInput', Input)
import 'view-design/dist/styles/iview.css'
axios.defaults.baseURL = 'https://xrequest.yunzaitech.com'

document.body.addEventListener('touchmove', function (e) {
  if (e._isScroll) return true
  e.preventDefault() //阻止默认的处理方式(阻止下拉滑动的效果)
}, { passive: false })

new Vue({
  el: '#app',
  render: h => h(App),
})
