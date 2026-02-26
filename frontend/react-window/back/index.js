const express = require('express')
const { faker } = require('@faker-js/faker')
const cors = require('cors');

const app = express()
app.use(cors());


const items = Array.from({length: 10000 }, (_, i) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
  image: faker.image.urlPicsumPhotos(),
  description: faker.commerce.productDescription()
}))

app.get('/', (req, res) => {
  res.send(items)
})

app.listen(8080, () => {
  console.log(`Example app listening on port 8080`)
})