const db = require("../config/db");

exports.getProducts = (req, res) => {
  console.log("🔍 req.user:", req.user);
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const query = "SELECT * FROM products WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener productos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    res.json(results);
  });
};

// ✅ Crear un nuevo producto
exports.createProduct = (req, res) => {
  const userId = req.user.id; // Obtener user_id del usuario autenticado
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const query =
    "INSERT INTO products (name, description, price, user_id) VALUES (?, ?, ?, ?)";
  db.query(query, [name, description, price, userId], (err, result) => {
    if (err) {
      console.error("Error al agregar producto:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    return res.status(201).json({ message: "Producto agregado correctamente" });
  });
};

// ✅ Actualizar un producto
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const query =
    "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?";

  db.query(query, [name, description, price, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar producto:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    return res.json({ message: "Producto actualizado exitosamente" });
  });
};

// ✅ Eliminar un producto
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar producto:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res
      .status(200)
      .json({ mensaje: "Producto eliminado correctamente" });
  });
};
