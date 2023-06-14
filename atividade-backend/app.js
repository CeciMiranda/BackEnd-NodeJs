const express = require('express');
const mysql = require('mysql');
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Atividade-BackEnd'
});

connection.connect((err) => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados: ', err.message);
        
    } 
    else {
        console.log('Conectado ao banco de dados com sucesso!');
    }
});

app.get('/usuarios', (req, res) => {
    connection.query('SELECT * FROM usuarios', (error, rows) => {
        if (error) {
            console.log('Erro ao processar o comando SQL.', error.message);
        }
        else {
            res.json(rows);
        }
    });
});

app.get('/usuarios/:id', (req, res) => {
    const id = req.params['id'];
    connection.query('SELECT `CodUsuario`, `NomeUsuario`, `LoginNome` FROM `usuarios` WHERE CodUsuario = ?', [id], (error, rows) => {
            if (error) {
                console.log('Erro ao processar o comando SQL.', error.message);
            }
            else {
                res.json(rows);
            }
        });
    });


app.listen(3000, () => {
    console.log('Servidor de API funcionando na porta 3000');
});