import React from 'react'
import BarChart from '@/components/BarChart'
import CircleChart from '@/components/CircleChart'
import AreaChart from '@/components/AreaChart'
import AnimatedCounter from '@/components/AnimatedCounter'
import AnimatedArrow from '@/components/AnimatedArrow'

function App() {
  const [count, setCount] = React.useState(0.8)
  const [data] = React.useState<number[]>([20, 40, 20, 40, 20])
  const [currentRotate, setCurrentRotate] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCount(0.4)
    }, 1200)

    return () => {
      clearTimeout(timer)
    }
  }, [])
  return (
    <div className="container">
      <div className="card">
        <div className="title">环形图</div>
        <div
          className="content"
          style={{ position: 'relative', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}
        >
          <CircleChart
            style={{ width: '150px', height: '150px' }}
            data={data}
            onSelect={(i, deg) => {
              console.log(i, deg)
              setCurrentRotate(deg)
            }}
          />
          <AnimatedArrow deg={currentRotate} />
        </div>
      </div>
      <div className="card">
        <div className="title">面积图</div>
        <div className="content">
          <AreaChart data={data} />
        </div>
      </div>
      <div className="card">
        <div className="title">面积图</div>
        <div className="content">
          <AreaChart
            data={[20, 23, 20, 78, 20]}
            strokeColor="#F32C61"
            fillColor={['rgba(243,44,97,0.4)', 'rgba(243,44,97,0)']}
          />
        </div>
      </div>
      <div className="card">
        <div className="title">面积图</div>
        <div className="content">
          <AreaChart
            data={[20, 40, 18, 60, 20]}
            strokeColor="#FFB031"
            fillColor={['rgba(255,176,49,0.4)', 'rgba(255,176,49,0)']}
          />
        </div>
      </div>
      <div className="card">
        <div className="title">数字累计</div>
        <div className="content">
          <AnimatedCounter data={currentRotate} />
        </div>
      </div>
      <div className="card">
        <div className="title">柱形图</div>
        <div className="content">
          <BarChart data={count} />
        </div>
      </div>
      <div className="card">
        <div className="title">柱形图</div>
        <div className="content">
          <BarChart data={count} foregroundColor={['#F32C61', '#FF79B0']} />
        </div>
      </div>
      <div className="card">
        <div className="title">柱形图</div>
        <div className="content">
          <BarChart data={count} foregroundColor={['#FFB031', '#FFDA80']} />
        </div>
      </div>
    </div>
  )
}

export default App

