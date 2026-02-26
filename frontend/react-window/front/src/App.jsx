import { useState, useEffect } from 'react'
import { List } from "react-window";


function Product({ index, products, style }) {
  const product = products[index]

  if (!product) {
    return <div style={style}>Loading...</div>;
  }

  return (
    <li style={style}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>{product.price}</p>
    </li>
  )
}


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([])

  useEffect(() => {
     async function fetchProducts(){
      try{
        setIsLoading(true)
        const response = await fetch('http://localhost:8080/')
        const data = await response.json()
        setProducts(data)
      } finally {
        setIsLoading(false)
      }
      
    }

    fetchProducts()
  }, [])

  if(isLoading){
    return <>Loading</>
  }

  return (
    <div>
      <h1>Virtualized User List</h1>
      <List
        rowComponent={Product}
        rowCount={products.length}
        rowHeight={120}
        rowProps={{ products }}
      />
    </div>
    
  )
}

export default App
