require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (como imágenes)
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
app.use(express.static(path.join(basePath, 'public')));


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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
