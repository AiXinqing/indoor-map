function reducePoints (points, offset) {
  const [offsetX, offsetY] = offset
  return points.filter(item => item).reduce((acc, current, index, arr) => {
    const [x, y] = current
    acc.push([x - offsetX, -y - offsetY])
    return acc
  }, [])
}

function getRange (point, range = {}) {
  const [x, y] = point
  if (range.hasOwnProperty('Xmin')) {
    range.Xmin = Math.min(range.Xmin, x)
    range.Xmax = Math.max(range.Xmax, x)
    range.Ymin = Math.min(range.Ymin, y)
    range.Ymax = Math.max(range.Ymax, y)
  } else {
    range.Xmin = x
    range.Xmax = x
    range.Ymin = y
    range.Ymax = y
  }
  return range
}

export function reduceData(geojson, offset) {
  if (geojson.type === 'FeatureCollection') {
    return {
      ...geojson,
      features: geojson.features.map(item => reduceData(item, offset)),
    }
  }
  const { type } = geojson.type === 'Feature' ? geojson.geometry : geojson
  const { coordinates } = geojson.type === 'Feature' ? geojson.geometry : geojson
  switch (type) {
    case 'MultiLineString':
    case 'Polygon':
      return {
        ...geojson,
        geometry: {
          ...geojson.geometry,
          coordinates: coordinates.map(points => reducePoints(points, offset)),
        },
      }
    case 'MultiPolygon':
      return {
        ...geojson,
        geometry: {
          ...geojson.geometry,
          coordinates: coordinates.map(polygon => {
            return polygon.map(points => reducePoints(points, offset))
          })
        },
      }
    case 'LineString':
    case 'MultiPoint':
      return {
        ...geojson,
        geometry: {
          ...geojson.geometry,
          coordinates: reducePoints(coordinates, offset),
        },
      }
    default:
      return {
        ...geojson,
        geometry: {
          ...geojson.geometry,
          coordinates: reducePoints([coordinates], offset)[0],
        },
      }
  }
}

export function getGeojsonRange (geojson) {
  if (geojson.type === 'FeatureCollection') {
    const ranges = geojson.features.map(feature => getGeojsonRange(feature))
    return {
      Xmin: Math.min(...ranges.map(range => range.Xmin)),
      Xmax: Math.max(...ranges.map(range => range.Xmax)),
      Ymin: Math.min(...ranges.map(range => range.Ymin)),
      Ymax: Math.max(...ranges.map(range => range.Ymax)),
    }
  }
  const { type } = geojson.type === 'Feature' ? geojson.geometry : geojson
  const { coordinates } = geojson.type === 'Feature' ? geojson.geometry : geojson
  let range = {}
  switch (type) {
    case 'MultiLineString':
    case 'Polygon':
      coordinates.forEach((points) => {
        points.forEach((point) => {
          range = getRange(point, range)
        })
      })
      break
    case 'MultiPolygon':
      coordinates.forEach((polygon) => {
        polygon.forEach((points) => {
          points.forEach((point) => {
            range = getRange(point, range)
          })
        })
      })
      break
    case 'LineString':
    case 'MultiPoint':
      coordinates.forEach((point) => {
        if (point) {
          range = getRange(point, range)
        }
      })
      break
    default:
      range = getRange(coordinates, range)
  }
  return range
}

export default function reduceFloorData (data) {
  const { Xmin = 0, Xmax = 1, Ymin = 0, Ymax = 1 } = getGeojsonRange(data)
  const offset = [Xmin, -Ymax]
  const reducedData = reduceData(data, offset)
  return {
    range: {
      Xmax: Xmax - Xmin,
      Xmin: 0,
      Ymax: Ymax - Ymin,
      Ymin: 0,
    },
    offset,
    reducedData: reducedData,
  }
}
