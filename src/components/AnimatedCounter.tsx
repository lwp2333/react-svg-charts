import React from 'react'
import CountUp from 'react-countup'

export interface AnimatedCounterProps {
  /**
   * 数值
   */
  data: number
  /**
   * 高亮
   */
  highlight?: boolean
  /**
   * 前缀
   */
  prefix?: string
  /**
   * 后缀
   */
  suffix?: string
  /**
   * 小数位数
   */
  decimals?: number
  /**
   * 小数位分隔符
   */
  decimal?: string
  /**
   * 动画开始事件
   */
  onStart?: () => void
  /**
   * 动画结束事件
   */
  onEnd?: () => void
}

const AnimatedCounter: React.VFC<AnimatedCounterProps> = ({ data = 0, highlight = false, ...props }) => {
  const [start, setStart] = React.useState(0)
  const [end, setEnd] = React.useState(0)
  const curData = React.useRef(data)
  const prevData = React.useRef(curData.current)

  React.useEffect(() => {
    if (curData.current !== data) {
      prevData.current = curData.current
      curData.current = data
      setStart(prevData.current)
    }
    setEnd(data)
  }, [data])

  const style = React.useMemo(() => {
    return { fontSize: '30px', fontWeight: 'bold', color: highlight ? '#0066FF' : '#141619', lineHeight: '30px' }
  }, [highlight])

  return <CountUp style={style} start={start} end={end} duration={0.35} {...props}></CountUp>
}

/**
 * 动画计数器
 */
export default React.memo(AnimatedCounter)

AnimatedCounter.defaultProps = {
  data: 0,
  highlight: true,
  prefix: '',
  suffix: '',
  decimals: 2,
  decimal: '.',
  onStart: () => console.log('Started! 💨'),
  onEnd: () => console.log('Ended! 👏'),
}
