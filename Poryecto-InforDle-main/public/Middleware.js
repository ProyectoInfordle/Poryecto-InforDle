const express = require('express');
const app = express();

// Middleware para verificar rol
function verificarAdmin(req, res, next) {
    const user = req.user; // tu lógica para obtener el usuario logueado
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        return res.status(403).json({ 
            success: false, 
            message: 'Esta acción es solo para owners o administradores.' 
        });
    }
    next();
}

app.post('/api/admin-action', verificarAdmin, (req, res) => {
    res.json({ success: true, message: 'Acción realizada' });
});

app.listen(3000, () => console.log('Servidor corriendo'));