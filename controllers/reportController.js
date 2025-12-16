import { getPool, sql as mssql } from '../models/db.js';
import PDFDocument from 'pdfkit';

export async function reporteTresTablas(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT c.id_consulta, c.rut_cliente, c.nombre_cliente, c.correo_cliente, c.estado,
             d.fecha AS ultima_fecha, d.detalle AS ultimo_detalle
      FROM Casos_Consulta c
      LEFT JOIN (
        SELECT cliente_rut, MAX(fecha) AS fecha
        FROM Detalle GROUP BY cliente_rut
      ) md ON md.cliente_rut = c.rut_cliente
      LEFT JOIN Detalle d ON d.cliente_rut = md.cliente_rut AND d.fecha = md.fecha
      ORDER BY c.id_consulta DESC
    `);

    res.render("reporte_table", { rows: result.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando reporte.");
  }
}

export async function downloadReportePDF(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT c.id_consulta, c.rut_cliente, c.nombre_cliente, c.correo_cliente, c.estado,
             d.fecha AS ultima_fecha, d.detalle AS ultimo_detalle
      FROM Casos_Consulta c
      LEFT JOIN (
        SELECT cliente_rut, MAX(fecha) AS fecha
        FROM Detalle GROUP BY cliente_rut
      ) md ON md.cliente_rut = c.rut_cliente
      LEFT JOIN Detalle d ON d.cliente_rut = md.cliente_rut AND d.fecha = md.fecha
      ORDER BY c.id_consulta
    `);

    const rows = result.recordset;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Reporte_Casos.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Reporte de Casos - Sentinel", { align: "center" });
    doc.moveDown();

    rows.forEach((r, i) => {
      doc.fontSize(12).text(`${i + 1}. ID: ${r.id_consulta} | RUT: ${r.rut_cliente}`);
      doc.fontSize(10).text(`Nombre: ${r.nombre_cliente}`);
      doc.fontSize(10).text(`Correo: ${r.correo_cliente} | Estado: ${r.estado ? "Activo" : "Inactivo"}`);
      doc.fontSize(10).text(`Último detalle (${r.ultima_fecha || "N/A"}): ${r.ultimo_detalle || "-"}`);
      doc.moveDown();
    });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando PDF.");
  }
}
