const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = 3000;


app.use(cors({
  origin: 'http://localhost:3000', // ajusta según frontend
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: '9b1d62c3e0b4f157d6a8e9a23c2f9a9a776b5a0ef6f4e91c5b6c0a9a1d2e3f4a',  // cambia a un string seguro
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // si usas https aquí va true
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', 
  database: 'infordle',
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('MySQL conectado');
});

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
 
      req.session.user = username;
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });
});


app.post('/api/users/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error cerrando sesión:', err);
      return res.status(500).json({ success: false, message: 'Error cerrando sesión' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: 'No hay usuario logueado' });
  res.json({ success: true, username: req.session.user });
});

app.get('/api/profile/:username', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const username = req.params.username;

  if (username !== req.session.user) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }

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

app.post('/api/profile/:username', upload.single('avatar'), (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const username = req.params.username;
  if (username !== req.session.user) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }

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
