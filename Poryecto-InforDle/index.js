const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB max
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // cambia si tienes password
  database: 'infordle',
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('MySQL conectado');
});

// Variable para usuario "logueado" (simulación simple)
let loggedUser = null;

// Registro usuario
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ success: false, message: 'Faltan datos' });

  const sqlInsertUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(sqlInsertUser, [username, email, password], (err) => {
    if (err) {
      console.error('Error registrando usuario:', err);
      return res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }

    // Crear perfil vacío
    const sqlCreateProfile = 'INSERT INTO perfiles_usuario (username) VALUES (?)';
    connection.query(sqlCreateProfile, [username], (err2) => {
      if (err2 && err2.code !== 'ER_DUP_ENTRY') {
        console.error('Error creando perfil:', err2);
        return res.status(500).json({ success: false, message: 'Error creando perfil' });
      }
      res.json({ success: true, message: 'Usuario registrado correctamente' });
    });
  });
});

// Login usuario
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Faltan datos' });

  const sqlLogin = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sqlLogin, [username, password], (err, results) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ success: false, message: 'Error en login' });
    }
    if (results.length > 0) {
      loggedUser = username;
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });
});

// Obtener usuario logueado (simulado)
app.get('/api/auth/user', (req, res) => {
  if (!loggedUser)
    return res.status(401).json({ success: false, message: 'No hay usuario logueado' });
  res.json({ success: true, username: loggedUser });
});

// Obtener perfil
app.get('/api/profile/:username', (req, res) => {
  const username = req.params.username;
  const sql = 'SELECT username, description, avatar FROM perfiles_usuario WHERE username = ?';

  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error obteniendo perfil:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    }
    const user = results[0];
    let avatarBase64 = null;
    if (user.avatar) {
      avatarBase64 = `data:image/png;base64,${user.avatar.toString('base64')}`;
    }
    res.json({
      success: true,
      username: user.username,
      description: user.description,
      avatar: avatarBase64,
    });
  });
});

// Actualizar perfil
app.post('/api/profile/:username', upload.single('avatar'), (req, res) => {
  const username = req.params.username;
  const description = req.body.description || 'Bienvenido a tu perfil';
  const avatarBuffer = req.file ? req.file.buffer : null;

  const sqlCheck = 'SELECT id FROM perfiles_usuario WHERE username = ?';
  connection.query(sqlCheck, [username], (err, results) => {
    if (err) {
      console.error('Error verificando perfil:', err);
      return res.status(500).json({ success: false, message: 'Error interno' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    }

    let sqlUpdate, params;
    if (avatarBuffer) {
      sqlUpdate = 'UPDATE perfiles_usuario SET description = ?, avatar = ? WHERE username = ?';
      params = [description, avatarBuffer, username];
    } else {
      sqlUpdate = 'UPDATE perfiles_usuario SET description = ? WHERE username = ?';
      params = [description, username];
    }

    connection.query(sqlUpdate, params, (err) => {
      if (err) {
        console.error('Error actualizando perfil:', err);
        return res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
      }
      res.json({ success: true, message: 'Perfil actualizado correctamente' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
