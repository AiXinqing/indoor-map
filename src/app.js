import 'assets/style.css';

const script = document.createElement('script')
script.onload = function () {
  new AMap.Map('app')
}
script.charset = 'utf-8'
script.src = `https://webapi.amap.com/maps?v=1.4.15&key=a2490b4822f42b63af8f6b5f655ad962`
document.body.appendChild(script)
