import { getPool, sql as mssql } from "../models/db.js";

// ======================
// LISTAR TICKETS
// ======================
export async function listTickets(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        t.id_ticket,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.fecha_creacion,
        u1.nombre_usuario AS creador,
        u2.nombre_usuario AS asignado
      FROM Tickets_Soporte t
      LEFT JOIN Usuarios u1 ON u1.id_usuario = t.creado_por
      LEFT JOIN Usuarios u2 ON u2.id_usuario = t.asignado_a
      ORDER BY t.id_ticket DESC
    `);

    res.render("tickets", { tickets: result.recordset });

  } catch (err) {
    console.error("Error listando tickets:", err);
    res.status(500).send("Error al obtener tickets.");
  }
}

// ======================
// FORM NUEVO TICKET
// ======================
export function showTicketForm(req, res) {
  res.render("tickets_nuevo");
}

// ======================
// CREAR TICKET
// ======================
export async function createTicket(req, res) {
  try {
    const { titulo, descripcion, prioridad } = req.body;

    const pool = await getPool();

    await pool.request()
      .input("titulo", mssql.NVarChar(150), titulo)
      .input("descripcion", mssql.NVarChar(2000), descripcion)
      .input("prioridad", mssql.NVarChar(20), prioridad)
      .input("creado_por", mssql.NChar(10), req.session.user.id)
      .query(`
        INSERT INTO Tickets_Soporte (titulo, descripcion, prioridad, estado, creado_por)
        VALUES (@titulo, @descripcion, @prioridad, 'Abierto', @creado_por)
      `);

    res.redirect("/tickets");

  } catch (err) {
    console.error("Error creando ticket:", err);
    res.status(500).send("Error creando ticket.");
  }
}

// ======================
// DETALLE TICKET
// ======================
export async function showTicketDetalle(req, res) {
  try {
    const { id } = req.params;

    const pool = await getPool();

    const ticket = await pool.request()
      .input("id", mssql.Int, id)
      .query(`
        SELECT 
          t.*, 
          u1.nombre_usuario AS creador,
          u2.nombre_usuario AS asignado
        FROM Tickets_Soporte t
        LEFT JOIN Usuarios u1 ON u1.id_usuario = t.creado_por
        LEFT JOIN Usuarios u2 ON u2.id_usuario = t.asignado_a
        WHERE t.id_ticket = @id
      `);

    if (ticket.recordset.length === 0)
      return res.status(404).send("Ticket no encontrado.");

    res.render("tickets_detalle", { ticket: ticket.recordset[0] });

  } catch (err) {
    console.error("Error mostrando detalle:", err);
    res.status(500).send("Error mostrando ticket.");
  }
}

// ======================
// CERRAR TICKET
// ======================
export async function cerrarTicket(req, res) {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request()
      .input("id", mssql.Int, id)
      .query(`
        UPDATE Tickets_Soporte
        SET estado = 'Cerrado',
            fecha_cierre = GETDATE()
        WHERE id_ticket = @id
      `);

    res.redirect(`/tickets/detalle/${id}`);

  } catch (err) {
    console.error("Error cerrando ticket:", err);
    res.status(500).send("Error cerrando ticket.");
  }
}

// ======================
// ELIMINAR TICKET
// ======================
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;

    const pool = await getPool();

    await pool.request()
      .input("id", mssql.Int, id)
      .query(`DELETE FROM Tickets_Soporte WHERE id_ticket = @id`);

    res.redirect("/tickets");

  } catch (err) {
    console.error("Error eliminando ticket:", err);
    res.status(500).send("Error eliminando ticket.");
  }
}
