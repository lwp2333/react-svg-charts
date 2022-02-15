import tinycolor from 'tinycolor2'

export interface ColorStop {
  offset: number
  stopColor: string
  stopOpacity: number
}
/**
 * 获取渐变色点
 * @param colors 色值
 * @returns 渐变色点
 */
export function toColorStops(colors: string | Readonly<[string, string]>): ColorStop[] {
  if (typeof colors === 'string') {
    colors = [colors, colors]
  }
  return colors.map((e, i) => {
    const color = tinycolor(e)
    return {
      offset: i,
      stopColor: color.toHexString(),
      stopOpacity: color.getAlpha(),
    }
  })
}

/**
 * 线性插值
 * @param from 起始值
 * @param to 目标值
 * @param progress 进度
 * @returns 当前值
 */
export function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

/**
 * 将数据标准化为0~1范围
 * @param data 数据
 * @param model 表转化模型
 * @returns 标准化后数据
 */
export function normalize(data: number[], model: 'comparison' | 'percentage') {
  let base: number
  switch (model) {
    case 'comparison':
      base = Math.max(...data)
      break
    case 'percentage':
      base = data.reduce((p, c) => p + c, 0)
      break
    default:
      throw new Error('unknown model')
  }
  return data.map(e => (base ? e / base : 0))
}
