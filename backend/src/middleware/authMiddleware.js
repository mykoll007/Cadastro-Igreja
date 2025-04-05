const jwt = require('jsonwebtoken');

function authMiddleware(request, response, next) {
    const token = request.headers.authorization;

    if (!token) {
        return response.status(403).json({ message: "Acesso negado! Token não fornecido." });
    }

    const tokenFormatado = token.split(" ")[1];

    jwt.verify(tokenFormatado, process.env.SALT, (err, decoded) => {
        if (err) {
            return response.status(401).json({ message: "Token inválido ou expirado." });
        }

        request.adminId = decoded.id;
        next();
    });
}

module.exports = authMiddleware;
