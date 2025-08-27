require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/dbInit'); 

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (como imágenes)
app.use('/public', express.static(path.join(__dirname, 'public')));


// Rutas
const statusRoutes = require('./routes/statusRoutes');
const workerRoutes = require('./routes/workerRoutes');
const travellerRoutes = require('./routes/travellerRoutes');
const travelRoutes = require('./routes/travelRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

app.use('/status', statusRoutes);
app.use('/workers', workerRoutes);
app.use('/travellers', travellerRoutes);
app.use('/travels', travelRoutes);
app.use('/departments', departmentRoutes);

// Middleware 404 personalizado
const notFoundHandler = require('./middleware/notFoundHandler');
app.use(notFoundHandler);

// Arrancar servidor
async function start() {
    try {
        await initDatabase();
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