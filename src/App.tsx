import React from 'react'
import BarChart from './components/BarChart'
import CircleChart from './components/CircleChart'
import AreaChart from './components/AreaChart'
function App() {
  const [count, setCount] = React.useState(0.8)

  const [data, setData] = React.useState<number[]>([2, 80, 2, 80, 4])

  const add = () => {
    setCount(pre => (pre >= 0.99 ? 1 : pre + 0.1))
  }
  const decrease = () => {
    setCount(pre => (pre <= 0.1 ? 0 : pre - 0.1))
  }
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
      <CircleChart style={{ width: '200px', height: '200px' }} data={data} />
      <AreaChart data={data} />
      <BarChart data={count} />
      {/* 
      <button onClick={add}>增</button>
      <button onClick={decrease}>减</button> */}
    </div>
  )
}

export default App
