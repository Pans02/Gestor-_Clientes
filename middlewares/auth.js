// middlewares/auth.js
import { getPool, sql } from '../models/db.js';

// ----------------------------
//      REQUIRE LOGIN
// ----------------------------
export function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/');
}

// ----------------------------
//      REQUIRE ROLE
// ----------------------------
export function requireRole(roleIdRequired) {
  return function (req, res, next) {
    if (!req.session || !req.session.user)
      return res.redirect('/');

    const roleIdUser = req.session.user.rol_id;

    if (!roleIdUser)
      return res.status(403).send("Acceso denegado: usuario sin rol.");

    if (parseInt(roleIdUser) === parseInt(roleIdRequired))
      return next();

    return res.status(403).send("Acceso denegado: no tienes permisos.");
  };
}

// ----------------------------
//      REQUIRE PERMISSION
// ----------------------------
export function requirePermission(permiso) {
  return async function(req, res, next) {
    if (!req.session || !req.session.user) return res.redirect('/');

    try {
      const pool = await getPool();

      const result = await pool.request()
        .input('userId', sql.NChar(10), req.session.user.id)
        .query(`
          SELECT p.permiso
          FROM Usuarios u
          JOIN Roles r ON r.id = u.rol_id
          JOIN RolPermiso rp ON rp.rol_id = r.id
          JOIN Permisos p ON p.id = rp.permiso_id
          WHERE u.id_usuario = @userId
        `);

      const permisos = result.recordset.map(r => r.permiso);

      if (permisos.includes(permiso)) return next();

      return res.status(403).send('Acceso denegado: permiso requerido.');
    
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error en validación de permiso.');
    }
  };
}
