const bcrypt = require("bcrypt");
const util = require("util");
const connection = require("../config/db");

const query = util.promisify(connection.query).bind(connection);

async function hashPasswords() {
  try {
    const users = await query("SELECT id, password FROM users");

    for (const user of users) {
      if (!user.password.startsWith("$2b$")) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          user.id,
        ]);

        console.log(`✅ Contraseña de usuario ${user.id} actualizada.`);
      }
    }

    console.log("🚀 Todas las contraseñas han sido hasheadas correctamente.");
  } catch (error) {
    console.error("❌ Error al hashear las contraseñas:", error);
  } finally {
    connection.end();
  }
}

hashPasswords();
