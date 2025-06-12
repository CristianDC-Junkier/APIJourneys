require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (como imágenes)
app.use('/public', express.static(path.join(__dirname, 'public')));


// Rutas
const statusRoutes = require('./routes/statusRoutes');
const adminRoutes = require('./routes/adminRoutes');
const travellerRoutes = require('./routes/travellerRoutes');

app.use('/status', statusRoutes);
app.use('/admins', adminRoutes);
app.use('/travellers', travellerRoutes);

// Middleware 404 personalizado
const notFoundHandler = require('./middleware/notFoundHandler');
app.use(notFoundHandler);

// Arrancar servidor
async function start() {
    try {
        await db.init();
        console.log('Base de datos inicializada correctamente.');
        const PORT = process.env.PORT || 0;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error inicializando la base de datos:', err.message);
        process.exit(1);
    }
}

start();