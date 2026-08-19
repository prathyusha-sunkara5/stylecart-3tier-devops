import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'UP', service: 'stylecart-backend', database: 'UP' });
  } catch {
    res.status(503).json({ status: 'DOWN', service: 'stylecart-backend', database: 'DOWN' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT id, name, category, price, description, image_url AS imageUrl FROM products';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, category, price, description, image_url AS imageUrl FROM products WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Unable to load product' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, customerEmail, items } = req.body;

  if (!customerName || !customerEmail || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer details and cart items are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;
    const normalized = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Invalid quantity');
      }

      const [rows] = await connection.query(
        'SELECT id, price FROM products WHERE id = ?',
        [item.productId]
      );

      if (!rows.length) throw new Error(`Product ${item.productId} not found`);

      const unitPrice = Number(rows[0].price);
      total += unitPrice * quantity;
      normalized.push({ productId: rows[0].id, quantity, unitPrice });
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_name, customer_email, total) VALUES (?, ?, ?)',
      [customerName, customerEmail, total.toFixed(2)]
    );

    for (const item of normalized) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.productId, item.quantity, item.unitPrice]
      );
    }

    await connection.commit();
    res.status(201).json({
      orderId: orderResult.insertId,
      total: Number(total.toFixed(2)),
      message: 'Order placed successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(400).json({ message: error.message || 'Unable to place order' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT id, customer_name AS customerName, customer_email AS customerEmail, total, created_at AS createdAt FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!orders.length) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.product_id AS productId, p.name, oi.quantity, oi.unit_price AS unitPrice
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...orders[0], items });
  } catch {
    res.status(500).json({ message: 'Unable to load order' });
  }
});

app.listen(PORT, () => {
  console.log(`StyleCart API listening on port ${PORT}`);
});
