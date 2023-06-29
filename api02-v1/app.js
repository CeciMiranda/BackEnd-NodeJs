const express = require('express');
const mysql = require('mysql');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const senhaToken = "Cecili@2003";
const {decode} = require('punycode');
const formidable = require('formidable');
const fs = require('fs');

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

app.get('/usuarios', verficarToken, (req, res) => {
    connection.query('SELECT * FROM usuarios', (error, rows) => {
        if (error) {
            console.log('Erro ao processar o comando SQL.', error.message);
        }
        else {
            res.json(rows);
        }
    });
});

app.get('/usuarios/:id', verficarToken, (req, res) => {
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

function verficarToken(req, res, next){
    const token = req.headers['x-access-token'];
    if(!token){
        return res.status(401).json({messageErro: 'Usuario não autenticado! Faça login antes de chamar este recurso.'});

    } else {
        jwt.verify(token, senhaToken, (error, decoded) => {
            if(error){
                return res.status(403).json({messageErro: 'Token inválido. Faça login novamente.'})
            } 
            else {
                const nomeUsuario = decoded.nomeUsuario;
                console.log(`Usuario ${nomeUsuario} autenticado com sucesso!`);
                next();
            }
        });
    }
};

function encriptarSenha(senha){
    const hash = crypto.createHash('sha256');
    hash.update(senha + senhaToken);
    const senhaencriptada = hash.digest('hex');
    return senhaencriptada
}

app.put('/foto/:id', (req, res) => {
    const id = req.params['id'];
    const formulario = new formidable.IncomingForm();
    formulario.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
      } else {
        const caminhoOriginal = files.arquivo[0].filepath;
        console.log(caminhoOriginal);
        const imagem = fs.readFileSync(caminhoOriginal);
        const sql = 'UPDATE usuarios SET foto = ? WHERE codusuario = ?';
        connection.query(sql, [imagem, id], (err, result) => {
          if (err) {
            res
              .status(400)
              .json({
                mensagem: `Erro ao gravar mensagem. Erro: ${err.message}`,
              });
            throw err;
          } else {
            console.log('Imagem gravada com sucesso!');
            res.status(200).json({ mensagem: 'Imagem gravada com sucesso.' });
          }
        });
      }
    });
  });

  app.get('/foto/:id', (req, res) => {
    const id = req.params['id'];
    const sql = 'SELECT foto FROM usuarios WHERE codusuario = ?';
    connection.query(sql, [id], (err, result) => {
      if (err) {
        throw err;
      }
  
      if (result.length > 0) {
        const foto = result[0].foto;
        const fs = require('fs');
        fs.writeFileSync('foto.jpg', foto);
        //console.log('Imagem recuperada e salva com sucesso!');
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(foto, 'binary');
      } else {
        console.log('Nenhuma imagem encontrada com o ID fornecido.');
      }
    });
  });
  

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


app.listen(3000, () => {
    console.log('Servidor de API funcionando na porta 3000');
});