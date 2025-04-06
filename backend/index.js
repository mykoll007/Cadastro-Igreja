const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes'); // Importando as rotas
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes); // Definindo as rotas

const PORT = 3600;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
