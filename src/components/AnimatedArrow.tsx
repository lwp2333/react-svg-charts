import React from 'react'
import Animated from 'animated/lib/targets/react-dom'

interface AnimatedArrowProps {
  /**
   * @default 0 (0-360)
   */
  deg: number
}

const AnimatedArrow: React.FC<AnimatedArrowProps> = props => {
  const [currentDeg, setCurrentDeg] = React.useState<string>('0deg')
  const progress = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    const anim = Animated.spring(progress.current, {
      toValue: props.deg,
      tension: 3,
      friction: 4,
    })
    anim.start()
    return () => anim.stop()
  }, [props.deg])

  React.useEffect(() => {
    const anim = progress.current
    const interpolate = anim.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    })
    interpolate.addListener(({ value }: { value: string }) => {
      setCurrentDeg(value)
    })
    return () => anim.removeAllListeners()
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '105px',
        height: '105px',
        marginTop: '-52.5px',
        marginLeft: '-52.5px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        transform: `rotate(${currentDeg})`,
      }}
    >
      <svg viewBox="0 0 4 8" style={{ width: '4px', height: '8px' }}>
        <polygon points="0 0 4 4 0 8" fill="#0066FF" />
      </svg>
    </div>
  )
}

export default React.memo(AnimatedArrow)
