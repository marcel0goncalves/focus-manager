require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// === SERVIR O FRONT-END ===
app.use(express.static(path.join(__dirname, "../Front-end")));

// Rota principal → abre o index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Front-end/index.html"));
});

// === CONEXÃO BANCO ===
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "focus_manager"
});

db.connect(err => {
    if (err) {
        console.log("Erro ao conectar MySQL:", err);
        return;
    }
    console.log("Conectado ao MySQL!");
});

// Rota para checar conexão com DB
app.get('/api/dbcheck', (req, res) => {
    db.query('SELECT 1+1 AS result', (err, rows) => {
        if (err) {
            console.error('DB check error:', err);
            return res.status(500).json({ status: 'error', msg: 'Erro no banco de dados', detail: err.message });
        }
        res.json({ status: 'ok', result: rows[0].result });
    });
});

// === ROTAS DE AUTENTICAÇÃO (usa tabela `users` com coluna `password`)
app.post('/login', (req, res) => {
    const { username, senha } = req.body;

    if (!username || !senha) return res.status(400).json({ status: 'error', msg: 'Campos inválidos' });

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('SQL error (login):', err);
            return res.status(500).json({ status: 'error', msg: 'Erro no servidor' });
        }

        if (results.length === 0) {
            console.log(`Login attempt: user="${username}" — user not found`);
            return res.json({ status: 'error', msg: 'Usuário ou senha incorretos!' });
        }

        const user = results[0];
        console.log(`Login attempt: user="${username}" — user found (id=${user.id}) — comparing password`);
        // comparar hash
        bcrypt.compare(senha, user.password, (err, same) => {
            if (err) {
                console.error('Bcrypt compare error:', err);
                return res.status(500).json({ status: 'error', msg: 'Erro no servidor' });
            }
            console.log(`Password compare result for user="${username}": ${same}`);
            if (same) return res.json({ status: 'ok', msg: 'Login realizado com sucesso!' });
            return res.json({ status: 'error', msg: 'Usuário ou senha incorretos!' });
        });
    });
});

// Endpoint de debug (local) — mostra se usuário existe e o hash (apenas para dev)
app.get('/api/debug/user/:username', (req, res) => {
    const username = req.params.username;
    db.query('SELECT id, username, password FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('SQL error (debug user):', err);
            return res.status(500).json({ status: 'error', msg: 'Erro no servidor', detail: err.message });
        }
        if (results.length === 0) return res.status(404).json({ status: 'not_found' });
        const u = results[0];
        return res.json({ status: 'ok', user: { id: u.id, username: u.username, passwordHash: u.password } });
    });
});

// === ROTA CADASTRO === (hash da senha antes de inserir)
app.post('/register', (req, res) => {
    const { username, senha } = req.body;

    if (!username || !senha) return res.status(400).json({ status: 'error', msg: 'Campos inválidos' });

    // Verificar se usuário já existe
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) {
            console.error('SQL error (check user):', err);
            return res.status(500).json({ status: 'error', msg: 'Erro no servidor' });
        }

        if (result.length > 0) {
            return res.json({ status: 'error', msg: 'Usuário já existe!' });
        }

        // Inserir novo usuário com hash
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) {
                console.error('Bcrypt hash error:', err);
                return res.status(500).json({ status: 'error', msg: 'Erro ao cadastrar usuário' });
            }

            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err2, result2) => {
                if (err2) {
                    console.error('SQL error (insert user):', err2);
                    return res.status(500).json({ status: 'error', msg: 'Erro ao cadastrar usuário' });
                }
                return res.json({ status: 'ok', msg: 'Cadastro realizado com sucesso!' });
            });
        });
    });
});

// === ENDPOINT ADMIN: resetar senha (somente com chave admin local)
app.post('/api/admin/reset-password', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ status: 'error', msg: 'Forbidden' });
    }

    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ status: 'error', msg: 'Campos inválidos' });

    // gerar hash e atualizar
    bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
            console.error('Bcrypt hash error (admin reset):', err);
            return res.status(500).json({ status: 'error', msg: 'Erro interno' });
        }

        db.query('UPDATE users SET password = ? WHERE username = ?', [hash, username], (err2, result) => {
            if (err2) {
                console.error('SQL error (admin reset):', err2);
                return res.status(500).json({ status: 'error', msg: 'Erro ao atualizar senha' });
            }
            if (result.affectedRows === 0) return res.status(404).json({ status: 'error', msg: 'Usuário não encontrado' });
            return res.json({ status: 'ok', msg: 'Senha atualizada com sucesso' });
        });
    });
});

// === INICIAR SERVER ===
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
