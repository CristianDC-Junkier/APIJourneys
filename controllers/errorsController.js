const path = require('path');

function respondWithError(req, res, statusCode, message) {
    const acceptHeader = req.headers['accept'] || '';

    // Si es navegador, redirige a una vista HTML
    if (acceptHeader.includes('text/html')) {
        return res.status(statusCode).sendFile(path.join(__dirname, '../public/pages/error.html'));
    }

    // Si es API o fetch/curl, responde con JSON
    return res.status(statusCode).json({ error: message });
}

function respondNotFound(req, res, statusCode, message) {
    const acceptHeader = req.headers['accept'] || '';

    // Si es navegador, redirige a una vista HTML
    if (acceptHeader.includes('text/html')) {
        return res.status(statusCode).sendFile(path.join(__dirname, '../public/pages/notfound.html'));
    }

    // Si es API o fetch/curl, responde con JSON
    return res.status(statusCode).json({ error: message });
}

module.exports = {
    respondWithError,
    respondNotFound
};