import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
     async function fetchProducts(){
      const response = await fetch('http://localhost:8080/')
      const data = await response.json()
      setProducts(data)
    }

    fetchProducts()
  }, [])

  return (
    <ul>
      {products.map((product) => <li key={product.id}>{product.name}</li>)}
    </ul>
  )
}

export default App
