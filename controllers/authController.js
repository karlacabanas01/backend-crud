const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    console.log("🔍 Datos recibidos en el backend:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameRegex.test(username)) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario solo debe contener letras" });
    }

    if (username.trim().length === 0) {
      return res.status(400).json({
        error:
          "El nombre de usuario no puede estar vacío o solo contener espacios",
      });
    }

    if (username.includes("@")) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario no puede contener @" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "El correo electrónico no es válido" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
      });
    }

    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    const [existingUsers] = await db.query(checkEmailQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const [result] = await db.query(insertQuery, [
      username,
      email,
      hashedPassword,
    ]);

    console.log("✅ Usuario creado con éxito:", {
      id: result.insertId,
      username,
      email,
    });

    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    console.error("❌ Error en el backend:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.login = async (req, res) => {
  console.log("Solicitud recibida: POST /api/auth/login");
  console.log("📌 Datos recibidos en el backend:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });
  }

  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("❌ Error al buscar el usuario en la BD:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "tu_secreto_jwt",
      { expiresIn: "1h" }
    );
    console.log("✅ Usuario autenticado correctamente:", {
      id: user.id,
      email: user.email,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  });
};

exports.getUsers = (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener usuarios:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(results);
  });
};
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id?.trim();

    if (!userId || isNaN(userId) || parseInt(userId, 10) <= 0) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const [results] = await db.query("SELECT * FROM users WHERE id = ?", [
      parseInt(userId, 10),
    ]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Error al obtener el usuario:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  if (!username && !email) {
    return res
      .status(400)
      .json({ error: "Debe proporcionar al menos un campo para actualizar" });
  }

  if (username !== undefined && username.length < 3) {
    return res
      .status(400)
      .json({ error: "El nombre de usuario debe tener al menos 3 caracteres" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email !== undefined && !emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "El correo electrónico no es válido" });
  }

  const checkUserQuery = "SELECT * FROM users WHERE id = ?";
  db.query(checkUserQuery, [id], (err, results) => {
    if (err) {
      console.error("❌ Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const updateFields = [];
    const updateValues = [];

    if (username !== undefined) {
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    updateValues.push(id);

    const updateQuery = `UPDATE users SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar usuario:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }

      console.log("✅ Usuario actualizado con éxito:", { id, username, email });
      res.json({
        message: "Usuario actualizado con éxito",
        id,
        username,
        email,
      });
    });
  });
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error.message);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
