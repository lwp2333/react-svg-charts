import React from 'react'
import { interpolate, toColorStops } from '../utils'
import Animated from 'animated/lib/targets/react-dom'
export interface BarChartProps {
  /**
   * 数值(0~1)
   */
  data?: number
  /**
   * 宽度
   * @default 24
   */
  width?: number
  /**
   * 高度
   * @default 100
   */
  height?: number
  /**
   * 背景充色
   */
  backgroundColor?: string | Readonly<[string, string]>
  /**
   * 前景填充色
   */
  foregroundColor?: string | Readonly<[string, string]>
}

/**
 * 获取柱形路径
 * @param width 宽度
 * @param height 高度
 * @returns 柱形路径
 */
function toPath(width: number, height: number) {
  if (!height) {
    return ''
  }
  const r = width / 2
  const h = height - width
  if (h < 0) {
    const dy = -h / 2
    const dx = r - Math.sqrt(Math.pow(r, 2) - Math.pow(dy, 2))
    return `M${dx} ${dy}
    a${r} ${r} 0 0 0 ${2 * (r - dx)} 0
    a${r} ${r} 0 0 0 ${2 * (dx - r)} 0
    z
    `
  }
  return `M0 0
  a${r} ${r} 0 0 0 ${width} 0
  v${-h}
  a${r} ${r} 0 0 0 ${-width} 0
  z`
}

const DefaultForegroundColor = Object.freeze<[string, string]>(['#647DF8', '#72F3FD'])

const BarChart: React.VFC<BarChartProps> = ({
  data = 0,
  width = 24,
  height = 100,
  backgroundColor = '#F6F8FD',
  foregroundColor = DefaultForegroundColor,
}) => {
  const [dataFill, setDataFill] = React.useState<string>()
  const curData = React.useRef(data)
  const prevData = React.useRef(curData.current)
  const progress = React.useRef(new Animated.Value(0))
  const viewBox = React.useMemo(() => `0 0 ${width} ${height}`, [height, width])
  const background = React.useMemo(() => toColorStops(backgroundColor), [backgroundColor])
  const foreground = React.useMemo(() => toColorStops(foregroundColor), [foregroundColor])
  const shape = React.useMemo(() => toPath(width, height), [height, width])
  const transform = React.useMemo(() => `translate(0, ${height - width / 2})`, [height, width])

  const sync = React.useCallback(
    (input: number) => {
      const fill = toPath(width, height * input)
      setDataFill(fill)
    },
    [height, width]
  )

  const update = React.useCallback(
    (value: number) => {
      const input = interpolate(prevData.current, curData.current, value)
      sync(input)
    },
    [sync]
  )

  const animate = React.useCallback(() => {
    progress.current.setValue(0)
    const anim = Animated.timing(progress.current, {
      toValue: 1,
      duration: 350,
    })
    anim.start()
    return () => anim.stop()
  }, [])

  React.useEffect(() => {
    const anim = progress.current
    anim.addListener(({ value }: { value: number }) => {
      update(value)
    })
    return () => anim.removeAllListeners()
  }, [update])

  React.useEffect(() => {
    if (curData.current === data) {
      sync(data)
    } else {
      prevData.current = curData.current
      curData.current = data
      return animate()
    }
  }, [animate, data, sync])

  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <linearGradient id="bg" x1="0%" y1="100%" x2="0%" y2="0%">
          {background.map((e, i) => (
            <stop key={i} {...e} />
          ))}
        </linearGradient>
        <linearGradient id="fg" x1="0%" y1="100%" x2="0%" y2="0%">
          {foreground.map((e, i) => (
            <stop key={i} {...e} />
          ))}
        </linearGradient>
      </defs>
      <g transform={transform}>
        <path d={shape} fill="url(#bg)" />
        <path id="dataFillTarget" d={dataFill} fill="url(#fg)" />
      </g>
    </svg>
  )
}

BarChart.defaultProps = {
  width: 24,
  height: 100,
  backgroundColor: '#F6F8FD',
  foregroundColor: DefaultForegroundColor,
}

/**
 * 柱形图表
 */
export default React.memo(BarChart)
