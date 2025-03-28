const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');


require('dotenv').config()

const app = express();
const port = process.env.PORT;
const host = process.env.HOST

app.use(bodyParser.json());
app.use(cors({
    origin: process.env.ORIGIN,
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: ['Content-Type'],
    credentials:true
}));

// Pasa sequelize y DataTypes al modelo
const db = require('./models');

db.sequelize.authenticate()
.then(() => {
    console.log('Conexión a la base de datos establecida');
    return db.sequelize.sync({ alter: true }); 
})
.then(() => {
    console.log('Modelos sincronizados');
})
.catch(err => {
    console.error('Error al conectar con la base de datos:', err);
});

const userRoutes = require('./controllers/userController');
app.use('/api/users', userRoutes)

app.listen(port, () =>{
    console.log(`Corriendo: http://${host}:${port}`)
})

//react-instagram-embed
//react-social-media-embed