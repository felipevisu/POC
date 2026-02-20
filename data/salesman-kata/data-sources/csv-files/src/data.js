const mockData = {
  products: [
    { name: 'iPhone 15 Pro 256GB', code: 'IPHONE15PRO256', category: 'SMARTPHONE', brand: 'Apple', price: 8999.00 },
    { name: 'iPhone 15 128GB', code: 'IPHONE15128', category: 'SMARTPHONE', brand: 'Apple', price: 6499.00 },
    { name: 'Galaxy S24 Ultra', code: 'GALAXYS24ULTRA', category: 'SMARTPHONE', brand: 'Samsung', price: 7999.00 },
    { name: 'Galaxy S24', code: 'GALAXYS24', category: 'SMARTPHONE', brand: 'Samsung', price: 5499.00 },
    { name: 'Motorola Edge 40', code: 'MOTOEDGE40', category: 'SMARTPHONE', brand: 'Motorola', price: 3299.00 },
    { name: 'Xiaomi 14', code: 'XIAOMI14', category: 'SMARTPHONE', brand: 'Xiaomi', price: 4599.00 },
    { name: 'MacBook Pro 14"', code: 'MACBOOKPRO14', category: 'LAPTOP', brand: 'Apple', price: 18999.00 },
    { name: 'MacBook Air M3', code: 'MACBOOKAIRM3', category: 'LAPTOP', brand: 'Apple', price: 12999.00 },
    { name: 'Dell Inspiron 15', code: 'DELLINSP15', category: 'LAPTOP', brand: 'Dell', price: 4299.00 },
    { name: 'Positivo Motion', code: 'POSMOTION', category: 'LAPTOP', brand: 'Positivo', price: 2199.00 },
    { name: 'iPad Pro 12.9"', code: 'IPADPRO12', category: 'TABLET', brand: 'Apple', price: 10999.00 },
    { name: 'Galaxy Tab S9', code: 'GALAXYTABS9', category: 'TABLET', brand: 'Samsung', price: 6499.00 },
    { name: 'Sony WH-1000XM5', code: 'SONYXM5', category: 'AUDIO', brand: 'Sony', price: 2299.00 },
    { name: 'AirPods Pro 2', code: 'AIRPODSPRO2', category: 'AUDIO', brand: 'Apple', price: 1899.00 },
    { name: 'JBL Tune 520BT', code: 'JBLTUNE520', category: 'AUDIO', brand: 'JBL', price: 299.00 },
    { name: 'LG OLED C3 55"', code: 'LGOLEDC3', category: 'TV', brand: 'LG', price: 7999.00 },
    { name: 'Samsung Neo QLED 55"', code: 'SAMSUNGQLED55', category: 'TV', brand: 'Samsung', price: 6499.00 },
    { name: 'Sony Bravia XR 65"', code: 'SONYBRAVIAXR65', category: 'TV', brand: 'Sony', price: 9999.00 },
    { name: 'PlayStation 5', code: 'PS5CONSOLE', category: 'GAMING', brand: 'Sony', price: 4499.00 },
    { name: 'Xbox Series X', code: 'XBOXSERIESX', category: 'GAMING', brand: 'Microsoft', price: 4299.00 },
    { name: 'Apple Watch Series 9', code: 'APPLEWATCHS9', category: 'WEARABLE', brand: 'Apple', price: 3999.00 },
    { name: 'Galaxy Watch 6', code: 'GALAXYWATCH6', category: 'WEARABLE', brand: 'Samsung', price: 2499.00 }
  ],

  salesmen: [
    { name: 'João Silva', email: 'joao.silva@electromart.com.br', region: 'São Paulo' },
    { name: 'Maria Oliveira', email: 'maria.oliveira@electromart.com.br', region: 'São Paulo' },
    { name: 'Pedro Santos', email: 'pedro.santos@electromart.com.br', region: 'Rio de Janeiro' },
    { name: 'Ana Costa', email: 'ana.costa@electromart.com.br', region: 'Rio de Janeiro' },
    { name: 'Lucas Ferreira', email: 'lucas.ferreira@electromart.com.br', region: 'Minas Gerais' },
    { name: 'Juliana Souza', email: 'juliana.souza@electromart.com.br', region: 'Paraná' },
    { name: 'Rafael Almeida', email: 'rafael.almeida@electromart.com.br', region: 'Rio Grande do Sul' },
    { name: 'Camila Rodrigues', email: 'camila.rodrigues@electromart.com.br', region: 'Distrito Federal' },
    { name: 'Bruno Carvalho', email: 'bruno.carvalho@electromart.com.br', region: 'Bahia' },
    { name: 'Fernanda Lima', email: 'fernanda.lima@electromart.com.br', region: 'Pernambuco' },
    { name: 'Thiago Mendes', email: 'thiago.mendes@electromart.com.br', region: 'Ceará' },
    { name: 'Larissa Pereira', email: 'larissa.pereira@electromart.com.br', region: 'Pará' },
    { name: 'Gustavo Ribeiro', email: 'gustavo.ribeiro@electromart.com.br', region: 'Santa Catarina' },
    { name: 'Isabela Martins', email: 'isabela.martins@electromart.com.br', region: 'Goiás' },
    { name: 'Felipe Gomes', email: 'felipe.gomes@electromart.com.br', region: 'Amazonas' }
  ],

  stores: [
    { name: 'Magazine Luiza Paulista', city: 'São Paulo', type: 'RETAIL' },
    { name: 'Casas Bahia Centro SP', city: 'São Paulo', type: 'RETAIL' },
    { name: 'Fast Shop Morumbi', city: 'São Paulo', type: 'RETAIL' },
    { name: 'Magazine Luiza Copacabana', city: 'Rio de Janeiro', type: 'RETAIL' },
    { name: 'Casas Bahia Madureira', city: 'Rio de Janeiro', type: 'RETAIL' },
    { name: 'Fast Shop Savassi', city: 'Belo Horizonte', type: 'RETAIL' },
    { name: 'Magazine Luiza Centro BH', city: 'Belo Horizonte', type: 'RETAIL' },
    { name: 'Casas Bahia Curitiba', city: 'Curitiba', type: 'RETAIL' },
    { name: 'Magazine Luiza Porto Alegre', city: 'Porto Alegre', type: 'RETAIL' },
    { name: 'Fast Shop Brasília', city: 'Brasília', type: 'RETAIL' },
    { name: 'Magazine Luiza Salvador', city: 'Salvador', type: 'RETAIL' },
    { name: 'Casas Bahia Recife', city: 'Recife', type: 'RETAIL' },
    { name: 'Magazine Luiza Fortaleza', city: 'Fortaleza', type: 'RETAIL' },
    { name: 'Fast Shop Belém', city: 'Belém', type: 'RETAIL' },
    { name: 'Magazine Luiza Manaus', city: 'Manaus', type: 'RETAIL' },
    { name: 'Casas Bahia Florianópolis', city: 'Florianópolis', type: 'RETAIL' },
    { name: 'Magazine Luiza Goiânia', city: 'Goiânia', type: 'RETAIL' },
    { name: 'ElectroMart Online', city: 'São Paulo', type: 'ONLINE' }
  ]
};

module.exports = mockData;
