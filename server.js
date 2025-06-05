require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const statusRoutes = require('./routes/statusRoutes');
const adminRoutes = require('./routes/adminRoutes');
const travellerRoutes = require('./routes/travellerRoutes');

app.use('/status', statusRoutes);
app.use('/admins', adminRoutes);
app.use('/travellers', travellerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
