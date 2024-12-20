import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mssql from 'mssql';
import bodyParser from 'body-parser';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));


// Configuración de la base de datos
const dbConfig = {
    user: 'us_rob',
    password: '1234',
    server: 'localhost',
    database: 'Gestor_Casos',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};
let pool;
mssql.connect(dbConfig)
    .then((connectedPool) => {
        pool = connectedPool;
        console.log('Conexión a SQL Server exitosa');
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err.message);
        process.exit(1);
    });


// Configuración del servidor
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static(join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Rutas principales

app.get('/', (req, res) => res.render('index'));
app.get('/agregar_caso', (req, res) => res.render('Agregar_Caso'));

app.get('/mi-perfil', async (req, res) => {
    try {

        const userId = req.session.userId;
        const result = await pool.request()
            .input('userId', mssql.Int, userId)
            .query('SELECT * FROM Usuarios WHERE id_usuario = @userId');

        if (result.recordset.length > 0) {
            res.render('Perfil', { user: result.recordset[0] });
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (err) {
        console.error('Error al obtener los datos del perfil:', err.message);
        res.status(500).send('Error al obtener los datos del perfil');
    }
});




// Login
app.post('/login', async (req, res) => {
    const { nombre_usuario, password_usuario } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .input('nombre_usuario', mssql.NVarChar, nombre_usuario)
            .input('password_usuario', mssql.NVarChar, password_usuario)
            .query(
                'SELECT * FROM Usuarios WHERE nombre_usuario = @nombre_usuario AND password_usuario = @password_usuario'
            );

        if (result.recordset.length > 0) {
            res.redirect('/Tabla_Gestor');
        } else {
            res.render('index', { error: 'Usuario o contraseña incorrectos.' });
        }
    } catch (err) {
        console.error('Error en la consulta:', err.message);
        res.status(500).send('Error en la base de datos.');
    }
});
// Tabla de casos
app.get('/Tabla_Gestor', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Casos_Consulta');
        res.render('Tabla_Gestor', { consultas: result.recordset, error: null });
    } catch (err) {
        console.error('Error al obtener los casos de consulta:', err.message);
        res.status(500).send('Error al obtener los datos de la base de datos.');
    }
});

// Ruta para buscar un cliente
app.post('/buscar_caso', async (req, res) => {
    const { rut_cliente } = req.body;

    try {
        const resultado = await pool.request()
            .input('rut_cliente', rut_cliente)
            .query('SELECT * FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');

        res.render('Tabla_Gestor', { 
            consultas: resultado.recordset, 
            error: null 
        });
    } catch (err) {
        console.error(err);
        res.render('Tabla_Gestor', { 
            consultas: [], 
            error: 'Error al buscar el caso. Por favor, inténtalo nuevamente.' 
        });
    }
});

// Ruta para guardar un nuevo caso
app.post('/guardar', async (req, res) => {
    const { rut_cliente, nombre_cliente, correo_cliente, estado } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        const existingCase = await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query('SELECT * FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');

        if (existingCase.recordset.length > 0) {
            return res.render('Agregar_Caso', {
                error: `El cliente con RUT ${rut_cliente} ya existe. Para modificar los datos, utiliza la opción "Modificar" en la tabla.`,
            });
        }
        await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .input('nombre_cliente', mssql.NVarChar, nombre_cliente)
            .input('correo_cliente', mssql.NVarChar, correo_cliente)
            .input('estado', mssql.Bit, estado)
            .query(`
                INSERT INTO Casos_Consulta (rut_cliente, nombre_cliente, correo_cliente, estado)
                VALUES (@rut_cliente, @nombre_cliente, @correo_cliente, @estado)
            `);
        res.redirect('/Tabla_Gestor');
    } catch (err) {
        console.error('Error al guardar el caso:', err.message);
        res.status(500).send('Error al guardar el caso.');
    }
});

const normalizarRut = (rut) => {
    return rut.replace(/[.-]/g, ''); 
};

app.post('/buscar_modificar', async (req, res) => {
    const { rut_cliente } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query('SELECT * FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');

        if (result.recordset.length > 0) {
            res.render('Modificar_Caso', { caso: result.recordset[0] });
        } else {
            const result2 = await pool.request().query('SELECT * FROM Casos_Consulta');
            res.render('Tabla_Gestor', { consultas: result2.recordset, error: `El cliente con RUT ${rut_cliente} no existe.` });
        }
    } catch (err) {
        console.error('Error al buscar el caso:', err.message);
        res.status(500).send('Error al buscar el caso.');
    }
});
// Ruta para modificar el caso
app.post('/modificar_caso', async (req, res) => {
    const { id_consulta, nombre_cliente, correo_cliente, estado } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        const estadoBooleano = estado === '1';

        await pool.request()
            .input('id_consulta', mssql.Int, id_consulta)
            .input('nombre_cliente', mssql.NVarChar, nombre_cliente)
            .input('correo_cliente', mssql.NVarChar, correo_cliente)
            .input('estado', mssql.Bit, estadoBooleano)
            .query(`
                UPDATE Casos_Consulta
                SET nombre_cliente = @nombre_cliente,
                    correo_cliente = @correo_cliente,
                    estado = @estado
                WHERE id_consulta = @id_consulta
            `);

        res.redirect('/Tabla_Gestor');
    } catch (err) {
        console.error('Error al modificar el caso:', err.message);
        res.status(500).send('Error al modificar el caso.');
    }
});

//Ruta para buscar el caso a eliminar
app.post('/buscar_eliminar', async (req, res) => {
    const { rut_cliente } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query('SELECT * FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');

        if (result.recordset.length > 0) {
            res.render('Eliminar_Caso', { caso: result.recordset[0] });
        } else {
            const result2 = await pool.request().query('SELECT * FROM Casos_Consulta');
            res.render('Tabla_Gestor', { consultas: result2.recordset, error: `El cliente con RUT ${rut_cliente} no existe.` });
        }
    } catch (err) {
        console.error('Error al buscar el caso:', err.message);
        res.status(500).send('Error al buscar el caso.');
    }
});


// Ruta para eliminar un caso
app.post('/eliminar_caso', async (req, res) => {
    const { rut_cliente } = req.body;

    try {
        const pool = await mssql.connect(dbConfig);
        await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query(`
                DELETE FROM Casos_Consulta
                WHERE rut_cliente = @rut_cliente
            `);
        res.redirect('/Tabla_Gestor');
    } catch (err) {
        console.error('Error al eliminar el caso:', err.message);
        res.status(500).send('Error al eliminar el caso.');
    }
});


// Ruta para ver los detalles de un cliente
app.get('/detalle/:rut_cliente', async (req, res) => {
    const { rut_cliente } = req.params;

    try {
        const pool = await mssql.connect(dbConfig);
        const clienteResult = await pool.request()
        .input('rut_cliente', mssql.NVarChar, rut_cliente)
        .query('SELECT nombre_cliente FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');
        const nombre_cliente = clienteResult.recordset.length > 0 ? clienteResult.recordset[0].nombre_cliente : 'Cliente no encontrado';
        const detallesResult = await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query('SELECT * FROM Detalle WHERE cliente_rut = @rut_cliente');
        
        const detalles = detallesResult.recordset || [];
        const mensaje = detalles.length === 0
            ? 'No hay detalles ingresados. ¿Deseas agregar el primero?'
            : '';
        res.render('Detalles', { detalles, rut_cliente, nombre_cliente, mensaje });
    } catch (err) {
        console.error('Error al obtener los detalles:', err.message);
        res.status(500).render('Detalles', { 
            detalles: [], 
            rut_cliente, 
            nombre_cliente: 'Error al obtener el nombre del cliente',
            mensaje: 'Ocurrió un error al obtener los detalles.' 
        });
    }
});
//Ruta para agregar un detalle
app.post('/agregar_detalle', async (req, res) => {
    const { rut_cliente, detalle } = req.body;

    if (!rut_cliente || !detalle) {
        return res.status(400).send('Faltan datos requeridos.');
    }

    try {
        const pool = await mssql.connect(dbConfig);
        const clienteResult = await pool.request()
            .input('rut_cliente', mssql.NVarChar, rut_cliente)
            .query('SELECT * FROM Casos_Consulta WHERE rut_cliente = @rut_cliente');
        
        if (clienteResult.recordset.length === 0) {
            return res.status(400).send('El cliente no existe.');
        }
        await pool.request()
            .input('cliente_rut', mssql.NVarChar, rut_cliente)
            .input('detalle', mssql.NVarChar, detalle)
            .query(`INSERT INTO Detalle (cliente_rut, fecha, detalle) 
                    VALUES (@cliente_rut, GETDATE(), @detalle)`);
        res.redirect(`/detalle/${rut_cliente}`);
    } catch (err) {
        console.error('Error al agregar el detalle:', err.message);
        res.status(500).send('Error al agregar el detalle.');
    }
});
//Ruta para modifcar un detalle
app.post('/modificar_detalle', async (req, res) => {
    const { id_detalles, rut_cliente, detalle } = req.body;
    if (!id_detalles || !rut_cliente || !detalle) {
        return res.status(400).send('Faltan datos requeridos.');
    }

    try {
        const pool = await mssql.connect(dbConfig);
        const detalleResult = await pool.request()
            .input('id_detalles', mssql.Int, id_detalles)
            .query('SELECT * FROM Detalle WHERE id_detalles = @id_detalles');

        if (detalleResult.recordset.length === 0) {
            return res.status(400).send('El detalle no existe.');
        }
        await pool.request()
            .input('id_detalles', mssql.Int, id_detalles)
            .input('detalle', mssql.NVarChar, detalle)
            .query(`
                UPDATE Detalle
                SET detalle = @detalle
                WHERE id_detalles = @id_detalles
            `);
        res.redirect(`/detalle/${rut_cliente}`);
    } catch (err) {
        console.error('Error al modificar el detalle:', err.message);
        res.status(500).send('Error al modificar el detalle.');
    }
});
//Ruta para eliminar un detalle
app.post('/eliminar_detalle', async (req, res) => {
    const { id_detalles, rut_cliente } = req.body;

    if (!id_detalles || !rut_cliente) {
        console.log('Faltan datos:', { id_detalles, rut_cliente });
        return res.status(400).send('Faltan datos requeridos.');
    }

    try {
        const pool = await mssql.connect(dbConfig);
        const detalleResult = await pool.request()
        .input('id_detalles', mssql.Int, id_detalles)
        .query('SELECT * FROM Detalle WHERE id_detalles = @id_detalles');

        if (detalleResult.recordset.length === 0) {
            return res.status(400).send('El detalle no existe.');
        }
        await pool.request()
            .input('id_detalles', mssql.Int, id_detalles)
            .query(`
                DELETE FROM Detalle
                WHERE id_detalles = @id_detalles
            `);
        res.redirect(`/detalle/${rut_cliente}`);
    } catch (err) {
        console.error('Error al eliminar el detalle:', err.message);
        res.status(500).send('Error al eliminar el detalle.');
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
