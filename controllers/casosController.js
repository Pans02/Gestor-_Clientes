import { getPool, sql as mssql } from "../models/db.js";


// ======================
// LISTAR CASOS
// ======================
export async function listCasos(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        id_consulta,
        rut_cliente,
        nombre_cliente,
        correo_cliente,
        estado,
        atendido_por
      FROM Casos_Consulta
      ORDER BY id_consulta DESC
    `);

    res.render("Tabla_Gestor", { consultas: result.recordset });

  } catch (err) {
    console.error("Error listando consultas:", err);
    res.status(500).send("Error listando consultas.");
  }
}


// ======================
// FORM AGREGAR CASO
// ======================
export function showAgregarForm(req, res) {
  res.render("Agregar_Caso");
}


// ======================
// CREAR CASO
// ======================
export async function createCaso(req, res) {
  try {
    const { rut_cliente, nombre_cliente, correo_cliente } = req.body;

    const pool = await getPool();

    await pool.request()
      .input("rut_cliente", mssql.NChar(16), rut_cliente)
      .input("nombre_cliente", mssql.NChar(50), nombre_cliente)
      .input("correo_cliente", mssql.NChar(50), correo_cliente)
      .input("estado", mssql.Bit, 0)              // Caso nuevo = no atendido
      .input("atendido_por", mssql.NChar(10), null)
      .query(`
        INSERT INTO Casos_Consulta 
        (rut_cliente, nombre_cliente, correo_cliente, estado, atendido_por)
        VALUES 
        (@rut_cliente, @nombre_cliente, @correo_cliente, @estado, @atendido_por)
      `);

    res.redirect("/Tabla_Gestor");

  } catch (err) {
    console.error("Error creando caso:", err);
    res.status(500).send("Error creando caso.");
  }
}


// ======================
// DETALLE DEL CASO
// ======================
export async function showDetalle(req, res) {
  try {
    const rut = req.params.rut;

    const pool = await getPool();

    const caso = await pool.request()
      .input("rut", mssql.NChar(16), rut)
      .query(`
        SELECT * 
        FROM Casos_Consulta 
        WHERE rut_cliente = @rut
      `);

    const detalles = await pool.request()
      .input("rut", mssql.NChar(16), rut)
      .query(`
        SELECT * 
        FROM Detalle 
        WHERE cliente_rut = @rut
        ORDER BY fecha DESC
      `);

    res.render("Detalle", {
      caso: caso.recordset[0],
      detalles: detalles.recordset
    });

  } catch (err) {
    console.error("Error mostrando detalle:", err);
    res.status(500).send("Error mostrando detalle.");
  }
}


// ======================
// AGREGAR DETALLE
// ======================
export async function addDetalle(req, res) {
  try {
    const { cliente_rut, detalle } = req.body;

    const pool = await getPool();

    await pool.request()
      .input("cliente_rut", mssql.NChar(16), cliente_rut)
      .input("detalle", mssql.NChar(2000), detalle)
      .query(`
        INSERT INTO Detalle (cliente_rut, detalle, fecha)
        VALUES (@cliente_rut, @detalle, GETDATE())
      `);

    res.redirect(`/detalle/${cliente_rut}`);

  } catch (err) {
    console.error("Error agregando detalle:", err);
    res.status(500).send("Error agregando detalle.");
  }
}


// ======================
// ELIMINAR DETALLE
// ======================
export async function deleteDetalle(req, res) {
  try {
    const id = req.params.id;

    const pool = await getPool();

    await pool.request()
      .input("id", mssql.Int, id)
      .query(`
        DELETE FROM Detalle 
        WHERE id_detalles = @id
      `);

    res.redirect("back");

  } catch (err) {
    console.error("Error eliminando detalle:", err);
    res.status(500).send("Error eliminando detalle.");
  }
}


// ======================
// ELIMINAR CASO
// ======================
export async function deleteCaso(req, res) {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request()
      .input("id", mssql.Int, id)
      .query(`
        DELETE FROM Casos_Consulta 
        WHERE id_consulta = @id
      `);

    res.redirect("/Tabla_Gestor");

  } catch (err) {
    console.error("Error eliminando caso:", err);
    res.status(500).send("Error eliminando caso.");
  }
}
