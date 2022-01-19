import React from 'react'
import BarChart from './components/BarChart'
import CircleChart from './components/CircleChart'
import AreaChart from './components/AreaChart'
import AnimatedCounter from './components/AnimatedCounter'
import ReportChart from './components/ReportChart'

function App() {
  const [count, setCount] = React.useState(0.8)

  const [data, setData] = React.useState<number[]>([20, 40, 20, 40, 20])

  const [currentNum, setNum] = React.useState(0)

  const add = () => {
    setCount(pre => (pre >= 0.99 ? 1 : pre + 0.1))
  }
  const decrease = () => {
    setCount(pre => (pre <= 0.1 ? 0 : pre - 0.1))
  }

  React.useEffect(() => {
    setTimeout(() => {
      setCount(0.4)
    }, 1200)
  }, [])
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
      <CircleChart
        style={{ width: '200px', height: '200px' }}
        data={data}
        onSelect={(i, deg) => {
          console.log(i, deg)
          setNum(deg)
        }}
      />
      <AreaChart data={data} />
      <AreaChart data={data} strokeColor="#F32C61" fillColor={['rgba(243,44,97,0.4)', 'rgba(243,44,97,0.2)']} />
      <AreaChart data={data} strokeColor="#FFB031" fillColor={['rgba(255,176,49,0.4)', 'rgba(255,176,49,0.2)']} />
      <BarChart data={count} />
      <BarChart data={count} foregroundColor={['#F32C61', '#FF79B0']} />
      <BarChart data={count} foregroundColor={['#FFB031', '#FFDA80']} />
      <AnimatedCounter data={currentNum} />
      <button onClick={add}>增</button>
      <button onClick={decrease}>减</button>
    </div>
  )
}

export default App
