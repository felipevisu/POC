import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function App() {
  const { data, error, loading } = useSWR('https://api.github.com/users/felipevisu/repos', fetcher);

  if(loading) return <div>Loading...</div>
  if(error) return <div>Something went wrong!</div>

  return (
    <ul>
      {data.map(item => 
        <li key={item.id}>
          {item.name}
        </li>
      )}
    </ul>
  )
}

export default App
