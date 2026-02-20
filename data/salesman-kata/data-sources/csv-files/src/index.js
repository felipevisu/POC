const fs = require('fs');
const path = require('path');
const mockData = require('./data');

const OUTPUT_DIR = process.env.OUTPUT_DIR || '/data/inbox';
const GENERATION_INTERVAL = parseInt(process.env.GENERATION_INTERVAL) || 10000;
const RECORDS_PER_FILE = parseInt(process.env.RECORDS_PER_FILE) || 50;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomStatus() {
  const rand = Math.random();
  if (rand < 0.7) return 'PENDING';
  if (rand < 0.95) return 'CONFIRMED';
  return 'CANCELLED';
}

function generateSaleId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = randomInt(10000, 99999);
  return `CSV${dateStr}${random}`;
}

function formatDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function formatAmount(amount) {
  return amount.toFixed(2);
}

function generateRecord() {
  const product = randomElement(mockData.products);
  const salesman = randomElement(mockData.salesmen);
  const store = randomElement(mockData.stores);
  const quantity = randomInt(1, 5);
  const unitPrice = product.price;
  const totalAmount = quantity * unitPrice;

  const date = new Date();
  date.setHours(date.getHours() - randomInt(0, 24));

  return {
    sale_id: generateSaleId(),
    product_code: product.code,
    product_name: product.name,
    category: product.category,
    brand: product.brand,
    salesman_name: salesman.name,
    salesman_email: salesman.email,
    region: salesman.region,
    store_name: store.name,
    city: store.city,
    store_type: store.type,
    quantity: quantity,
    unit_price: formatAmount(unitPrice),
    total_amount: formatAmount(totalAmount),
    status: randomStatus(),
    sale_date: formatDate(date)
  };
}

function generateCSVContent(records) {
  const header = 'sale_id,product_code,product_name,category,brand,salesman_name,salesman_email,region,store_name,city,store_type,quantity,unit_price,total_amount,status,sale_date';
  const rows = records.map(r =>
    `${r.sale_id},${r.product_code},${r.product_name},${r.category},${r.brand},${r.salesman_name},${r.salesman_email},${r.region},${r.store_name},${r.city},${r.store_type},${r.quantity},${r.unit_price},${r.total_amount},${r.status},${r.sale_date}`
  );
  return [header, ...rows].join('\n');
}

function getFileName() {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  return `sales_${timestamp}.csv`;
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

function generateAndSaveFile() {
  const records = [];
  const recordCount = randomInt(Math.floor(RECORDS_PER_FILE / 2), RECORDS_PER_FILE);

  for (let i = 0; i < recordCount; i++) {
    records.push(generateRecord());
  }

  const csvContent = generateCSVContent(records);
  const fileName = getFileName();
  const filePath = path.join(OUTPUT_DIR, fileName);

  fs.writeFileSync(filePath, csvContent);

  return { fileName, recordCount, filePath };
}

async function main() {
  ensureOutputDir();

  console.log('Generating initial CSV file');
  const initial = generateAndSaveFile();
  console.log(`Created: ${initial.fileName} (${initial.recordCount} records)`);
  console.log('Starting continuous CSV generation');

  let totalFiles = 1;
  let totalRecords = initial.recordCount;

  setInterval(() => {
    try {
      const result = generateAndSaveFile();
      totalFiles++;
      totalRecords += result.recordCount;

      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Created: ${result.fileName}`);
      console.log(`${result.recordCount} records | Total files: ${totalFiles} | Total records: ${totalRecords}`);

    } catch (err) {
      console.error('Error generating CSV:', err.message);
    }
  }, GENERATION_INTERVAL);
}

process.on('SIGINT', () => {
  console.log('\nShutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down');
  process.exit(0);
});

main();
