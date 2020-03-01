const borderStyle = {
  stroke: '#999',
  'stroke-width': 100,
}

export default {
  fallback: { fill: '#f3f3f3' },
  0: {
    fill: '#f3f3f3',
    ...borderStyle,
  },
  1: {
    stroke: '#f3f3f3',
    fill: '#e6e6e6',
    'stroke-width': 50,
  },
  2: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  3: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  4: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  5: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  6: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  7: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  8: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  9: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  10: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  11: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  12: {
    fill: 'hsl(38, 92%, 95%)',
    ...borderStyle,
  },
  // 导航线样式
  '-1': {
    stroke: 'hsl(126, 95%, 33%)',
    'stroke-width': 200,
  },
  // 定位点样式
  '-2': {
    fill: 'hsl(65, 21%, 57%)',
  },
  // 目的地定位点样式
  '-3': {
    fill: 'hsl(126, 95%, 33%)',
  },
  // 车流线样式
  '-4': {
    stroke: '#c6c6c6',
  },
}
