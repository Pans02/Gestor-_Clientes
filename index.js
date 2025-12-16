// index.js
// ==============================
//            IMPORTS
// ==============================
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mssql from 'mssql';

// 🔥 Importar correctamente desde db.js
import { getPool, sql } from './models/db.js';


// Middlewares
import { requireLogin, requireRole } from './middlewares/auth.js';

// Controladores Usuarios
import {
  listUsers,
  showCreateForm,
  createUser,
  showEditForm,
  updateUser,
  deleteUser
} from './controllers/userController.js';

// Controladores Casos
import {
  listCasos,
  showAgregarForm,
  createCaso,
  showDetalle,
  deleteCaso,
  addDetalle,
  deleteDetalle
} from './controllers/casosController.js';

// Controladores Reportes
import {
  reporteTresTablas,
  downloadReportePDF
} from './controllers/reportController.js';

// Controladores Tickets
import {
  listTickets,
  showTicketForm,
  createTicket,
  showTicketDetalle,
  cerrarTicket,
  deleteTicket
} from './controllers/ticketsController.js';


// ==============================
//       EXPRESS CONFIG
// ==============================
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use(session({
  secret: 'clave-super-secreta',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));


// ==============================
//            LOGIN
// ==============================
app.get('/', (req, res) => {
  res.render('index', { error: undefined });
});

app.post('/login', async (req, res) => {
  const { nombre_usuario, password_usuario } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('nombre_usuario', mssql.VarChar(100), nombre_usuario)
      .query('SELECT * FROM Usuarios WHERE nombre_usuario = @nombre_usuario');

    if (result.recordset.length === 0)
      return res.render('index', { error: 'Usuario o contraseña incorrectos.' });

    const user = result.recordset[0];
    const passwordMatches = await bcrypt.compare(password_usuario, user.password_usuario);

    if (!passwordMatches)
      return res.render('index', { error: 'Usuario o contraseña incorrectos.' });

    // GUARDAR SESIÓN
    req.session.user = {
      id: user.id_usuario.trim(),
      nombre: user.nombre_usuario,
      rol_id: user.rol_id
    };

    // REDIRECCIÓN SEGÚN ROL
    switch (user.rol_id) {
      case 1: return res.redirect('/panel_admin');
      case 2: return res.redirect('/panel_dev');
      case 3: return res.redirect('/Tabla_Gestor');
      default: return res.redirect('/Tabla_Gestor');
    }

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).send('Error interno en login.');
  }
});


// ==============================
//            LOGOUT
// ==============================
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});


// ==============================
//             PERFIL
// ==============================
app.get('/Perfil', requireLogin, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', mssql.NChar(10), req.session.user.id)
      .query(`
        SELECT id_usuario, nombre_usuario, correo_usuario, imagen_perfil, rol_id, activo
        FROM Usuarios WHERE id_usuario = @id
      `);

    if (result.recordset.length === 0)
      return res.status(404).send('Usuario no encontrado');

    res.render('Perfil', { user: result.recordset[0] });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener perfil.');
  }
});


// ==============================
//           USUARIOS (ADMIN)
// ==============================
app.get('/panel_admin', requireLogin, requireRole(1), listUsers);

app.get('/usuario/nuevo', requireLogin, requireRole(1), showCreateForm);
app.post('/usuario/nuevo', requireLogin, requireRole(1), createUser);

app.get('/usuario/editar/:id', requireLogin, requireRole(1), showEditForm);
app.post('/usuario/editar/:id', requireLogin, requireRole(1), updateUser);

app.get('/usuario/eliminar/:id', requireLogin, requireRole(1), deleteUser);


// ==============================
//               CASOS
// ==============================
app.get('/Tabla_Gestor', requireLogin, listCasos);

app.get('/Agregar_Caso', requireLogin, showAgregarForm);
app.post('/Agregar_Caso', requireLogin, createCaso);

app.get('/detalle/:rut', requireLogin, showDetalle);
app.post('/detalle/agregar', requireLogin, addDetalle);
app.get('/detalle/eliminar/:id', requireLogin, deleteDetalle);

app.get('/caso/eliminar/:id', requireLogin, requireRole(1), deleteCaso);


// ==============================
//            REPORTES
// ==============================
app.get('/reporte', requireLogin, requireRole(1), reporteTresTablas);
app.get('/reporte/pdf', requireLogin, requireRole(1), downloadReportePDF);


// ==============================
//           PANEL DEV
// ==============================
app.get('/panel_dev', requireLogin, requireRole(2), (req, res) => {
  res.render('panel_dev');
});


// ==============================
//            TICKETS
// ==============================
app.get('/tickets', requireLogin, listTickets);

app.get('/tickets/nuevo', requireLogin, showTicketForm);
app.post('/tickets/nuevo', requireLogin, createTicket);

app.get('/tickets/detalle/:id', requireLogin, showTicketDetalle);
app.get('/tickets/cerrar/:id', requireLogin, cerrarTicket);

app.get('/tickets/eliminar/:id', requireLogin, requireRole(1), deleteTicket);


// ==============================
//            SERVER
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App corriendo en http://localhost:${PORT}`));
