const borderStyle = {
  stroke: '#999',
  'strokeWidth': 100,
}

export default {
  // 默认样式
  fallback: {
    fill: '#f3f3f3',
    ...borderStyle,
  },
  // 导航规划路径
  'navigatePath': {
    stroke: 'hsl(126, 95%, 33%)',
  },
  // 定位点
  'location': {
    fill: 'hsl(208, 86%, 31%)',
  },
  // 选中样式
  'selectedShape': {
    fill: 'hsl(37, 45%, 72%)',
  },
  // 目标点样式
  'target': {
    fill: 'hsl(116, 93%, 38%)',
  },

  // 导航线样式
  '导航线': {
    stroke: 'hsl(126, 95%, 33%)',
    'strokeWidth': 200,
    fill: 'transparent',
  },
  // 定位点样式
  '定位点': {
    fill: 'hsl(65, 21%, 57%)',
  },
  // 目的地定位点样式
  '目的地': {
    fill: 'hsl(126, 95%, 33%)',
  },
  // 车流线样式
  '车流线': {
    stroke: 'transparent',
  },
  '区块选中': {
    fill: 'hsl(37, 45%, 72%)',
  },
}
