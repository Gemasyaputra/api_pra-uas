// const express = require('express');
// const app = express();

// //Dummy data produk
// const products = [
//     { id: 1, name: 'Iphone 17', price: 100, Description: 'This is Iphone 17' },
//     { id: 2, name: 'Microwave', price: 150, Description: 'This is Microwave' },
//     { id: 3, name: 'Laptop Macbook', price: 200, Description: 'This is Laptop Macbook' }
// ];

// //Endpoit untuk menddapatkan daftar produk
// app.get('/products', (req, res) => {
//     res.json(products);
// });

// //Endpoint untuk mendapatkan detail produk berdasarkan id
// app.get('/products/:id', (req, res) => {
//     const productId = parseInt(req.params.id);
//     const product = products.find(p => p.id === productId);
//     if (product) {
//         res.json(product);
//     } else {
//         res.status(404).send('Product not found');
//     }
// });

// //Menjalankan server pada port 3000
// const PORT = process.env.PORT || 3000; // <--- BENAR
// app.listen(PORT, () => {
//     console.log(`Product service is running on port ${PORT}`);
// });

// //cara kedua
// // app.listen(3000, () => console.log('Product service running on port 3000'));\

const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ================= MODEL =================
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

// ================= RESPONSE HELPER =================
const success = (res, message, data = null) =>
  res.status(200).json({ success: true, message, data });

const error = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ================= ROUTES =================
app.get('/products', async (req, res) => {
  try {
    const data = await Product.findAll();
    success(res, 'Products retrieved successfully', data);
  } catch (err) {
    error(res, 500, err.message);
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');
    success(res, 'Product retrieved successfully', product);
  } catch (err) {
    error(res, 500, err.message);
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price) return error(res, 400, 'Name and price are required');

    const product = await Product.create({ name, price, description });
    success(res, 'Product created successfully', product);
  } catch (err) {
    error(res, 500, err.message);
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');

    await product.update(req.body);
    success(res, 'Product updated successfully', product);
  } catch (err) {
    error(res, 500, err.message);
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');

    await product.destroy();
    success(res, 'Product deleted successfully');
  } catch (err) {
    error(res, 500, err.message);
  }
});

// ================= START SERVER =================
const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Product service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
