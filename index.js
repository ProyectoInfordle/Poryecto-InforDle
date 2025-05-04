const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


const imagenes = [
  'fondo.gif',         // id = 1
  'prueba.gif',     // id = 2
  'Encontrucion.gif', // id = 3
  'descarga.png'         // id = 4
];


app.use(express.static(path.join(__dirname, 'public')));


app.use('/img', express.static(path.join(__dirname, 'img')));


app.get('/api/img/:id', (req, res) => {
  const id = parseInt(req.params.id, 10) - 1;
  const nombreImagen = imagenes[id];

  if (!nombreImagen) {
    return res.status(404).send('Imagen no encontrada');
  }

  const rutaImagen = path.join(__dirname, 'img', nombreImagen);
  res.sendFile(rutaImagen);
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});