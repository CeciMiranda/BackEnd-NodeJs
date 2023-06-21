const express = require('express');
const mysql = require('mysql');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const senhaToken = "Cecili@2003"

app.use(cors());
app.use(bodyParser.json());

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


function gerarToken(payload){
    return jwt.sign(payload, senhaToken, {expiresIn: 20});
}

function encriptarSenha(senha){
    const hash = crypto.createHash('sha256');
    hash.update(senha + senhaToken);
    const senhaencriptada = hash.digest('hex');
    return senhaencriptada
}

app.post('/login', (req, res) => {
    const LoginNome = req.body.LoginNome;
    const senha = encriptarSenha(req.body.senha);
    connection.query('SELECT NomeUsuario from usuarios where LoginNome = ? AND senha = ? ',[LoginNome, senha], (error, rows) => {
        if(error) {
            console.log('Erro ao processar o comando SQL.', error.message);
        }
        else {
            if (rows.length > 0) {
                const payload = {nomeUsuario: rows[0].NomeUsuario};
                const token = gerarToken(payload);
                res.json({acessToken: token});
            } else {
                res.status(403).json({messageErro: "Login invalido! "})
            }
        }
    });
});


app.post('/usuarios', (req, res) => {
    const NomeUsuario = req.body.nomeUsuario;
    const LoginNome = req.body.LoginNome;
    const senha = encriptarSenha(req.body.senha);
    connection.query('INSERT INTO usuarios (NomeUsuario, LoginNome, senha) VALUES (?,?,?)',[NomeUsuario, LoginNome, senha], (error, rows) => {
        if(error) {
            console.log('Erro ao processar o comando SQL.', error.message);
        }
        else
             {
                res.status(403).json({messageErro: "Cadastrado com sucesso!"})
            }
    });
});

app.listen(3000, () => {
    console.log('Servidor de API funcionando na porta 3000');
});