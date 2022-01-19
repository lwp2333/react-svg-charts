import React from 'react'
import { interpolate, normalize, toColorStops } from '../utils'
import Animated from 'animated/lib/targets/react-dom'

const DefaultFillColor = Object.freeze<[string, string]>(['rgba(0, 153, 255, 0.4)', 'rgba(0, 102, 255, 0)'])
export interface AreaChartProps {
  /**
   * 数据
   */
  data: number[]
  /**
   * 宽度
   * @default 140
   */
  width?: number
  /**
   * 高度
   * @default 60
   */
  height?: number
  /**
   * 水平线占总体高度的比例(0~1)
   * @default 0.4
   */
  horizon?: number
  /**
   * 曲线颜色
   * @default '#0066FF'
   */
  strokeColor?: string
  /**
   * 线条粗细
   * @default 2
   */
  thickness?: number
  /**
   * 填充色
   */
  fillColor?: string | Readonly<[string, string]>
  /**
   * 是否平滑
   * @default true
   */
  smooth?: boolean
}

interface Point {
  x: number
  y: number
}

/**
 * 将标准输入转为点集合
 * @param input 标准输入
 * @param width 图表宽度
 * @param height 图表高度
 * @param horizon 水平线
 * @param padding 顶部边距
 * @returns 点集合
 */
function toPoints(input: number[], width: number, height: number, horizon: number, padding: number): Point[] {
  const count = input.length - 1
  const base = height * horizon
  const h = height - base
  return input.map((e, i) => ({
    x: (i / count) * width,
    y: (1 - e) * h + padding,
  }))
}

interface LineData {
  length: number
  angle: number
}
/**
 * 获取两点间的线信息
 * @param p1 起始点
 * @param p2 结束点
 * @returns 线数据
 */
function getLine(p1: Point, p2: Point): LineData {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return {
    length: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)),
    angle: Math.atan2(dy, dx),
  }
}

/**
 * 获取贝塞尔曲线控制点
 * @param cur 当前点
 * @param prev 前一个点
 * @param next 后一个点
 * @param reverse 是否反转
 * @returns 控制点
 */
function getControlPoint(cur: Point, prev?: Point, next?: Point, reverse?: boolean): Point {
  const p = prev || cur
  const n = next || cur
  const smoothing = 0.2
  const o = getLine(p, n)
  const angle = o.angle + (reverse ? Math.PI : 0)
  const length = o.length * smoothing
  const x = cur.x + Math.cos(angle) * length
  const y = cur.y + Math.sin(angle) * length
  return {
    x,
    y,
  }
}

/**
 * 获取贝塞尔曲线路径
 * @param p 当前点
 * @param i 当前点索引
 * @param a 全部点
 * @returns 路径
 */
function getBezier(p: Point, i: number, a: Point[]) {
  const cps = getControlPoint(a[i - 1], a[i - 2], p)
  const cpe = getControlPoint(p, a[i - 1], a[i + 1], true)
  return `C ${cps.x} ${cps.y} ${cpe.x} ${cpe.y} ${p.x} ${p.y}`
}

/**
 * 获取曲线路径
 * @param points 点集合
 * @returns 曲线路径
 */
function toCurvePath(points: Point[]) {
  return points.reduce((p, c, i) => {
    if (!p) {
      return `M${c.x} ${c.y}`
    }
    return `${p} ${getBezier(c, i, points)}`
  }, '')
}

/**
 * 获取折线路径
 * @param points 点集合
 * @returns 折线路径
 */
function toLinePath(points: Point[]) {
  return points.reduce((p, { x, y }) => {
    if (!p) {
      return `M${x} ${y}`
    }
    return `${p} L${x} ${y}`
  }, '')
}

/**
 * 获取关闭路径
 * @param line 线路径
 * @param width 宽度
 * @param height 高度
 * @returns 关闭路径
 */
function toClosedPath(line: string, width: number, height: number) {
  return `${line} L${width} ${height} L0 ${height} Z`
}

const AreaChart: React.VFC<AreaChartProps> = ({
  data,
  width = 140,
  height = 60,
  horizon = 0.4,
  strokeColor = '#0066FF',
  fillColor = DefaultFillColor,
  smooth = true,
  thickness = 2,
}) => {
  const [lineFill, setLineFill] = React.useState<string>()
  const [shapeFill, setShapeFill] = React.useState<string>()
  const curData = React.useRef<number[]>([])
  const prevData = React.useRef(curData.current)
  const progress = React.useRef(new Animated.Value(0))
  const viewBox = React.useMemo(() => `0 0 ${width} ${height}`, [width, height])
  const stops = React.useMemo(() => toColorStops(fillColor), [fillColor])

  const id = React.useMemo(() => {
    return Array.isArray(fillColor) ? `fillId_${fillColor.join('_')}` : `fillId_${fillColor}`
  }, [fillColor])

  const update = React.useCallback(
    (value: number) => {
      const input = curData.current.map((e, i) => interpolate(prevData.current[i], e, value))
      const points = toPoints(input, width, height, horizon, thickness * 2)
      const stroke = smooth ? toCurvePath(points) : toLinePath(points)
      const fill = toClosedPath(stroke, width, height)
      setLineFill(stroke)
      setShapeFill(fill)
    },
    [height, horizon, smooth, thickness, width]
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
    prevData.current = curData.current
    curData.current = normalize(data, 'comparison')
    if (prevData.current.length !== curData.current.length) {
      prevData.current = curData.current.map(() => 0)
    }
    animate()
  }, [animate, data])

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
        <linearGradient id={stops[0].stopColor} x1="0%" y1="0%" x2="0%" y2="100%">
          {stops.map((e, i) => (
            <stop key={i} {...e} />
          ))}
        </linearGradient>
      </defs>
      <path d={shapeFill} fill={`url(#${stops[0].stopColor})`} />
      <path d={lineFill} strokeWidth={thickness} stroke={strokeColor} strokeLinecap={smooth ? 'round' : 'square'} fill="none" />
    </svg>
  )
}

AreaChart.defaultProps = {
  width: 140,
  height: 60,
  horizon: 0.4,
  strokeColor: '#0066FF',
  fillColor: DefaultFillColor,
  smooth: true,
  thickness: 2,
}

/**
 * 面积图表
 */
export default React.memo(AreaChart)
