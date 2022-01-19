import React from 'react'
import { interpolate, normalize } from '../utils'
import Animated from 'animated/lib/targets/react-dom'

/**
 * 用于填充弧形的渐变色
 */
const DefaultColors: ReadonlyArray<[string, string]> = Object.freeze([
  ['#7CF3FF', '#00B4EB'],
  ['#0066FF', '#1EA5FF'],
  ['#FFB031', '#FFDA80'],
  ['#FF5E31', '#FFA339'],
  ['#F32C61', '#FF79B0'],
])

export interface CircleChartProps {
  /**
   * 数据(数量不能超过`colors`长度)
   */
  data: number[]
  /**
   * 外圆半径
   * @default 75
   */
  outterRadius?: number
  /**
   * 内圆半径
   * @default 55
   */
  innerRadius?: number
  /**
   * 镂空裁切半径
   * @default 45
   */
  clipRadius?: number
  /**
   * 图表旋转角度
   * @default -90
   * @description 旋转角度为`0`时从`(2r,r)`位置开始顺时针绘制
   */
  rotation?: number
  /**
   * 填充渐变色集合(默认`5`组)
   */
  colors?: ReadonlyArray<[string, string]>
  /**
   * 内阴影颜色
   * @default '#ECF0F4'
   */
  innerShadowColor?: string
  /**
   * 外环底色
   * @default 'transparent'
   */
  outterRingColor?: string
  /**
   * 样式
   */
  style?: any
  /**
   * 选择事件
   */
  onSelect?: (index: number, angle: number) => void
}

/**
 * 计算镂空剪裁蒙板路径
 * @param R 外圆半径
 * @param r 内圆半径
 * @returns 路径
 */
function toClipPath(R: number, r: number) {
  return `M0 0
  h${2 * R}
  v${2 * R}
  h${-2 * R}
  z
  M${R - r} ${R}
  a${r} ${r} 0 0 0 ${2 * r} 0
  z
  M${R + r} ${R}
  a${r} ${r} 0 0 0 ${-2 * r} 0
  z`
}

interface DegreeData {
  /**
   * 起始角度
   */
  startDeg: number
  /**
   * 扫描角度
   */
  sweepDeg: number
}
/**
 * 获取角度信息
 * @param input 输入值
 * @returns 角度信息
 */
function toDegrees(input: number[]): DegreeData[] {
  let acc: number = 0
  const segs: DegreeData[] = []
  for (let i = 0; i < input.length; i++) {
    segs.push({
      startDeg: (acc / 1) * 360,
      sweepDeg: (input[i] / 1) * 360,
    })
    acc += input[i]
  }
  return segs
}

interface Point {
  x: number
  y: number
}
interface StructureData extends DegreeData {
  /**
   * 内圆控制点1
   */
  p1: Point
  /**
   * 内圆控制点2
   */
  p2: Point
  /**
   * 外圆控制点1
   */
  P1: Point
  /**
   * 外圆控制点2
   */
  P2: Point
}
/**
 * 获取结构信息
 * @param input 输入值
 * @param R 外圆半径
 * @param r 内圆半径
 * @returns 结构信息
 */
function toStructs(input: number[], R: number, r: number): StructureData[] {
  const cx = R
  const cy = R
  const degrees = toDegrees(input)
  return degrees.map(({ startDeg, sweepDeg }) => {
    const startRad = (Math.PI * startDeg) / 180
    const endRad = (Math.PI * (startDeg + sweepDeg)) / 180
    return {
      p1: { x: cx + r * Math.cos(startRad), y: cy + r * Math.sin(startRad) },
      p2: { x: cx + r * Math.cos(endRad), y: cy + r * Math.sin(endRad) },
      P1: { x: cx + R * Math.cos(startRad), y: cy + R * Math.sin(startRad) },
      P2: { x: cx + R * Math.cos(endRad), y: cy + R * Math.sin(endRad) },
      startDeg,
      sweepDeg,
    }
  })
}

function toRingPath(R: number, r: number): PathData {
  const cx = R
  const cy = R
  return {
    d: `M${cx + R} ${cy}
        a${R} ${R} 0 0 1 ${-2 * R} 0
        a${R} ${R} 0 0 1 ${2 * R} 0
        M${cx + r} ${cy}
        a${r} ${r} 0 0 1 ${-2 * r} 0
        a${r} ${r} 0 0 1 ${2 * r} 0
        z`,
  }
}

interface PathData {
  d: string
}
/**
 * 获取路径信息
 * @param strutcs 结构信息
 * @param R 外圆半径
 * @param r 内圆半径
 * @returns 路径信息
 */
function toPaths(strutcs: StructureData[], R: number, r: number): PathData[] {
  const dr = (R - r) / 2
  const cx = R
  const cy = R
  return strutcs.map(({ p1, p2, P1, P2, sweepDeg }) => {
    if (!sweepDeg) {
      return {
        d: '',
      }
    }
    const flag = sweepDeg > 180 ? 1 : 0
    if (sweepDeg >= 360) {
      return {
        d: `M${cx + R} ${cy}
        a${R} ${R} 0 0 1 ${-2 * R} 0
        a${R} ${R} 0 0 1 ${2 * R} 0
        M${cx + r} ${cy}
        a${r} ${r} 0 0 1 ${-2 * r} 0
        a${r} ${r} 0 0 1 ${2 * r} 0
        z`,
      }
    }
    return {
      d: `M${p1.x} ${p1.y}
      A${r} ${r} 0 ${flag} 1 ${p2.x} ${p2.y}
      A${dr} ${dr} 0 0 0 ${P2.x} ${P2.y}
      A${R} ${R} 0 ${flag} 0 ${P1.x} ${P1.y}
      A${dr} ${dr} 0 0 1 ${p1.x} ${p1.y}
      Z`,
    }
  })
}

interface GradientData {
  x1: number
  y1: number
  x2: number
  y2: number
}
/**
 * 转为渐变信息
 * @param strutcs 结构信息
 * @returns 渐变信息
 */
function toGradients(strutcs: StructureData[]): GradientData[] {
  return strutcs.map(({ p1, p2 }) => ({
    x1: p1.x < p2.x ? 0 : 1,
    y1: p1.y < p2.y ? 0 : 1,
    x2: p1.x < p2.x ? 1 : 0,
    y2: p1.y < p2.y ? 1 : 0,
  }))
}

const DoughnutChart: React.VFC<CircleChartProps> = ({
  data,
  outterRadius: R = 75,
  innerRadius: r = 55,
  clipRadius: cr = 45,
  rotation = -90,
  colors = DefaultColors,
  innerShadowColor = '#ECF0F4',
  outterRingColor = 'transparent',
  style,
  onSelect,
}) => {
  if (data?.length > colors?.length) {
    throw new Error('Maximum segments exceeded')
  }
  const seed = React.useMemo(() => Array(data.length).fill(undefined), [data.length])
  const curData = React.useRef<number[]>([])
  const prevData = React.useRef(curData.current)
  const progress = React.useRef(new Animated.Value(0))
  const [paths, setPaths] = React.useState<{ d: string }[]>(Array(data.length).fill(undefined))
  const [gradients, setGradients] = React.useState<any[]>(Array(data.length).fill(undefined))
  const hits = React.useRef<DegreeData[]>([])
  const ring = React.useMemo(() => toRingPath(R, r), [R, r])
  const clipPath = React.useMemo(() => toClipPath(R, cr), [R, cr])
  const viewBox = React.useMemo(() => `0 0 ${2 * R} ${2 * R}`, [R])
  const transform = React.useMemo(() => `translate(${R},${R}) rotate(${rotation}) translate(${-R},${-R})`, [R, rotation])

  const update = React.useCallback(
    (value: number) => {
      const input = curData.current.map((e, i) => interpolate(prevData.current[i], e, value))
      const structs = toStructs(input, R, r)
      const rings = toPaths(structs, R, r)
      const fills = toGradients(structs)
      setPaths(rings)
      setGradients(fills)
    },
    [R, r]
  )
  const animate = React.useCallback(() => {
    progress.current.setValue(0)
    const anim = Animated.timing(progress.current, {
      toValue: 1,
      duration: 350,
    })
    anim.start()
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
    curData.current = normalize(data, 'percentage')
    if (prevData.current.length !== curData.current.length) {
      prevData.current = curData.current.map(() => 0)
    }
    hits.current = toDegrees(curData.current)
    return animate()
  }, [data, animate])

  return (
    <svg viewBox={viewBox} style={style} xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
        <radialGradient id="shadow">
          <stop offset="0%" stopColor={innerShadowColor} stopOpacity="0.8" />
          <stop offset={cr / r} stopColor={innerShadowColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={innerShadowColor} stopOpacity="0" />
        </radialGradient>
        {seed.map((_, i) => (
          <linearGradient key={i} {...gradients[i]} id={`linear-${i}`}>
            <stop offset="0%" stopColor={colors[i][0]} />
            <stop offset="100%" stopColor={colors[i][1]} />
          </linearGradient>
        ))}
        <clipPath id="clip">
          <path d={clipPath} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g>
        <circle cx={R} cy={R} r={r} fill="url(#shadow)" clipPath="url(#clip)" />
      </g>
      <g>
        <path {...ring} fill={outterRingColor} fillRule="evenodd" />
      </g>
      <g transform={transform}>
        {seed.map((_, i) => (
          <path
            key={i}
            fillRule="evenodd"
            fill={`url(#linear-${i})`}
            d={paths[i]?.d}
            onClick={() => {
              if (onSelect) {
                const { startDeg, sweepDeg } = hits.current[i]
                let angle: number
                if (sweepDeg === 360) {
                  angle = 0
                } else {
                  angle = startDeg + sweepDeg / 2 + rotation
                }
                if (angle < 0) {
                  angle += 360
                }
                onSelect(i, angle)
              }
            }}
          />
        ))}
      </g>
    </svg>
  )
}

DoughnutChart.defaultProps = {
  outterRadius: 75,
  innerRadius: 55,
  clipRadius: 45,
  rotation: -90,
  colors: DefaultColors,
  innerShadowColor: '#ECF0F4',
}

/**
 * 环形图表
 */
export default React.memo(DoughnutChart)
