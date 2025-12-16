import { getPool, sql as mssql } from "../models/db.js";
import bcrypt from "bcrypt";

// ======================
// LISTAR USUARIOS
// ======================
export async function listUsers(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT u.id_usuario, u.nombre_usuario, u.correo_usuario, u.rol_id, u.activo, r.nombre AS rol
      FROM Usuarios u
      LEFT JOIN Roles r ON r.id = u.rol_id
    `);

    res.render("panel_admin", { usuarios: result.recordset });

  } catch (err) {
    console.error("Error listando usuarios:", err);
    res.status(500).send("Error listando usuarios.");
  }
}

// ======================
// MOSTRAR FORM NUEVO
// ======================
export function showCreateForm(req, res) {
  res.render("usuario_nuevo");
}

// ======================
// CREAR USUARIO
// ======================
// ======================
// CREAR USUARIO
// ======================
export async function createUser(req, res) {
  try {
    const { nombre_usuario, correo_usuario, password_usuario, rol_id } = req.body;

    const pool = await getPool();

    // 🔹 Generar nuevo ID automáticamente
    const result = await pool.request().query(`
      SELECT ISNULL(MAX(CAST(id_usuario AS INT)), 0) + 1 AS nuevo_id
      FROM Usuarios
    `);

    const nuevoId = result.recordset[0].nuevo_id.toString();

    const hash = await bcrypt.hash(password_usuario, 10);

    await pool.request()
      .input("id_usuario", mssql.NChar(10), nuevoId)
      .input("nombre_usuario", mssql.VarChar(100), nombre_usuario)
      .input("correo_usuario", mssql.VarChar(100), correo_usuario)
      .input("password_usuario", mssql.VarChar(255), hash)
      .input("rol_id", mssql.Int, rol_id)
      .input("activo", mssql.Bit, 1)
      .query(`
        INSERT INTO Usuarios
        (id_usuario, nombre_usuario, correo_usuario, password_usuario, rol_id, activo)
        VALUES
        (@id_usuario, @nombre_usuario, @correo_usuario, @password_usuario, @rol_id, @activo)
      `);

    res.redirect("/panel_admin");

  } catch (err) {
    console.error("Error creando usuario:", err);
    res.status(500).send("Error creando usuario.");
  }
}


// ======================
// MOSTRAR EDICIÓN
// ======================
export async function showEditForm(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input("id", mssql.NChar(10), req.params.id)
      .query("SELECT * FROM Usuarios WHERE id_usuario = @id");

    if (result.recordset.length === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    // 🔥 CLAVE: enviar "usuario"
    res.render("usuario_editar", {
      usuario: result.recordset[0]
    });

  } catch (err) {
    console.error("Error cargando usuario:", err);
    res.status(500).send("Error cargando formulario de edición");
  }
}



// ======================
// ACTUALIZAR
// ======================
export async function updateUser(req, res) {
  try {
    const { nombre_usuario, correo_usuario, password_usuario, rol_id, activo } = req.body;

    const pool = await getPool();

    // Comprobar si se pasa una nueva contraseña, de lo contrario, no se actualiza
    let query = `
      UPDATE Usuarios SET
        nombre_usuario = @nombre_usuario,
        correo_usuario = @correo_usuario,
        rol_id = @rol_id,
        activo = @activo
    `;

    if (password_usuario) {
      const hashedPassword = await bcrypt.hash(password_usuario, 10);
      query += ", password_usuario = @password_usuario"; // Agregar campo de contraseña solo si se pasa
    }

    query += " WHERE id_usuario = @id_usuario";

    const request = pool.request()
      .input("id_usuario", mssql.NChar(10), req.params.id)
      .input("nombre_usuario", mssql.VarChar(100), nombre_usuario)
      .input("correo_usuario", mssql.VarChar(100), correo_usuario)
      .input("rol_id", mssql.Int, rol_id)
      .input("activo", mssql.Bit, activo ? 1 : 0);

    if (password_usuario) {
      request.input("password_usuario", mssql.VarChar(255), hashedPassword);
    }

    // Ejecutar la consulta de actualización
    await request.query(query);

    res.redirect("/panel_admin");

  } catch (err) {
    console.error("Error actualizando usuario:", err);
    res.status(500).send("Error actualizando usuario.");
  }
}

// ======================
// ELIMINAR USUARIO
// ======================
export async function deleteUser(req, res) {
  try {
    const pool = await getPool();

    await pool.request()
      .input("id", mssql.NChar(10), req.params.id)
      .query(`DELETE FROM Usuarios WHERE id_usuario = @id`);

    res.redirect("/panel_admin");

  } catch (err) {
    console.error("Error eliminando usuario:", err);
    res.status(500).send("Error eliminando usuario.");
  }
}
