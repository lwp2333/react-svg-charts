import React from 'react'
import BarChart from './components/BarChart'
import CircleChart from './components/CircleChart'
import AreaChart from './components/AreaChart'
import AnimatedCounter from './components/AnimatedCounter'

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
      <BarChart data={count} />

      <AnimatedCounter data={currentNum} />
      {/* 
      <button onClick={add}>增</button>
      <button onClick={decrease}>减</button> */}
    </div>
  )
}

export default App
