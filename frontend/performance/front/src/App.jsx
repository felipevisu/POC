import { useState, useEffect, useRef, memo } from 'react'

const Product = memo(function Product({ product }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <li>
      <p>{product.name}</p>
      <p>{product.description}</p>
      <p>{product.price}</p>
      <p>This component has rendered {renderCount.current} times</p>
    </li>
  )
})

function App() {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)

  useEffect(() => {
     async function fetchProducts(){
      const response = await fetch('http://localhost:8080/')
      const data = await response.json()
      setProducts(data)
    }

    fetchProducts()
  }, [])

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <ul>
        {products.map((product) => 
          <Product key={product.id} product={product} />
        )}
      </ul>
    </>
  )
}

export default App
