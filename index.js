const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "paginas",)));

const img = [
    { id: 1, imagenes1: 'img/descarga.png' },
    { id: 2, imagenes1: 'img/fondo.gif' },
    { id:  3, imagenes1: 'img/img2.png'},
];

app.get('/img/:id', (req, res) => {
    const id = Number(req.params.id);
    const imagen = img.find(i => i.id === id);
    if (imagen) {
        res.sendFile(path.join(__dirname, 'paginas', imagen.imagenes1));
    } else {
        res.status(404).send('Imagen no encontrada');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


