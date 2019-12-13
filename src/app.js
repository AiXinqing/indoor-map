import 'assets/style.css'

const script = document.createElement('script')
script.onload = function () {
  const map = new AMap.Map('app', {
    center: [104.06813,30.618552],
    zoom: 20,
  })

  const points = []
  let polyline = null

  map.on('click', (event) => {
    points.push([
      event.lnglat.getLng(),
      event.lnglat.getLat(),
    ])

    if (polyline) {
      map.remove(polyline)
    }

    polyline = new AMap.Polyline({
      path: points,
      map: map,
    })
  })
}
script.charset = 'utf-8'
script.src = `https://webapi.amap.com/maps?v=2.0Beta&key=a2490b4822f42b63af8f6b5f655ad962`
document.body.appendChild(script)
