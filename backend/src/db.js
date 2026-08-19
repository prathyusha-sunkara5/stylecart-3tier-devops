import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'stylecart',
  password: process.env.DB_PASSWORD || 'stylecart_dev_password',
  database: process.env.DB_NAME || 'stylecart',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;
