const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createPool({
  host: process.env.DB_HOST, // Asegúrate de que NO sea localhost
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // 3307 para MySQL en AWS
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones simultáneas
  queueLimit: 0,
});

const db = connection.promise();

db.getConnection()
  .then((conn) => {
    console.log("✅ Conectado a la base de datos MySQL");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
  });

module.exports = db;
