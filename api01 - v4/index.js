const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;
app.use(express.json());

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbbiblioteca',
});

con.connect((erroConexao) => {
  if (erroConexao) {
    throw erroConexao;
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/alunos', (req, res) => {
  res.send('{"nome":"Marcelo"}');
});

app.post('/alunos', (req, res) => {
  res.send('Executou um post');
});

app.get('/alunos/:id', (req, res) => {
  const id = req.params.id;
  if (id <= 10) {
    res.status(200).send('Aluno localizado com sucesso');
  } else {
    res.status(404).send('Aluno não encontrado');
  }
});

app.get('/autor', (req, res) => {
  con.query('SELECT * FROM tbAutor', (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    }
    res.status(200).send(result);
  });
});

app.get('/autor/:id', (req, res) => {
  const idAutor = req.params.id;
  const sql = 'SELECT * FROM tbAutor WHERE IdAutor = ?';
  con.query(sql, [idAutor], (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    }
    
    if (result.length > 0) {
      res.status(200).send(result);
    }
    else {
      res.status(404).send('Não encontrado');
    }
  });
});

app.delete('/autor/:id', (req, res) => {
  const idAutor = req.params.id;
  const sql = 'DELETE FROM tbAutor WHERE IdAutor = ?';
  con.query(sql, [idAutor], (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    }
    
    if (result.affectedRows > 0) {
      res.status(200).send('Registro excluído com sucesso');
    }
    else {
      res.status(404).send('Não encontrado');
    }
  });
});

app.post('/autor', (req, res) => {
  const noautor = req.body.noautor;
  const idnacionalidade = req.body.idnacionalidade;

  const sql = `INSERT INTO tbAutor (NoAutor, IdNacionalidade) VALUES (?, ?)`;
  con.query(sql, [noautor, idnacionalidade], (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    }
    
    if (result.affectedRows > 0) {
      res.status(200).send('Registro incluído com sucesso');
    }
    else {
      res.status(400).send('Erro ao incluir o registro');
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
