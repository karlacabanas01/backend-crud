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

    if (username.length < 3) {
      return res.status(400).json({
        error: "El nombre de usuario debe tener al menos 3 caracteres",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "El correo electrónico no es válido" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Contraseña no cumple los requisitos" });
    }

    // ✅ Verificar si el correo ya existe
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // ✅ Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insertar usuario
    const [result] = await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    return res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Solicitud recibida: POST /api/auth/login", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

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

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { username, email } = req.body;

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    if (!username && !email) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar al menos un campo para actualizar" });
    }

    const updateFields = [];
    const updateValues = [];

    if (username) {
      if (username.length < 3) {
        return res.status(400).json({
          error: "El nombre de usuario debe tener al menos 3 caracteres",
        });
      }
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ error: "El correo electrónico no es válido" });
      }
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    updateValues.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;

    await db.query(updateQuery, updateValues);
    return res.json({ message: "Usuario actualizado con éxito" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.deleteUserById = async (req, res) => {
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

    return res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM users"); // ✅ Usando await
    res.json(results);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const [results] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(results[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};
