const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');


require('dotenv').config()

const app = express();
const port = process.env.PORT;
const host = process.env.HOST

app.use(cors({
    origin: process.env.ORIGIN,
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.options('*', cors());


// Pasa sequelize y DataTypes al modelo
const db = require('./models');

db.sequelize.authenticate()
.then(() => {
    console.log('Conexión a la base de datos establecida');
    return db.sequelize.sync({ alter: true }); // 👈 ¡Agrega esto!
})
.then(() => {
    console.log('Modelos sincronizados');
})
.catch(err => {
    console.error('Error al conectar con la base de datos:', err);
});



const userRoutes = require('./controllers/userController');
app.use('/api/users', userRoutes)

const contactoRoutes = require('./controllers/contactoControllers');
app.use('/api/contacto', contactoRoutes);

const adminRoutes = require('./controllers/adminController');
app.use('/api/admin', adminRoutes);

const agendarRoutes = require('./controllers/agendarControllers');
app.use('/api/agendar', agendarRoutes);

app.listen(port, () =>{
    console.log(`Corriendo: http://${host}:${port}`)
})

//react-instagram-embed
//react-social-media-embed