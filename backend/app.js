const express = require('express');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('./config/config.json').development

const app = express();
const port = process.env.PORT;


const sequelize = new Sequelize(dbConfig.database, 
    dbConfig.username, 
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect
    }
);

sequelize.sync().then(()=>{
    console.log('Tablas creadas');
})