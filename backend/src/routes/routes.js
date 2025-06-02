const express = require('express');
const UserController = require('../controllers/UserController');
const AdminController = require('../controllers/AdminController');
const RelatorioController = require('../controllers/RelatorioController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para cadastrar usuário
router.post('/usuario/cadastrar', UserController.cadastrarUsuario);

// Rota para cadastrar administrador
router.post('/admin/login', AdminController.login);
router.post('/admin/cadastrar', AdminController.cadastrarAdmin);
router.post('/admin/recuperar', AdminController.recuperarSenha);
router.put('/admin/validar', AdminController.validarCodigoRecuperacao);
router.put('/admin/redefinir', AdminController.redefinirSenha);

// Cadastro e consulta principal
router.post('/relatorio/cadastrar', authMiddleware, RelatorioController.cadastrarRelatorio);
router.get('/nomes-livres', authMiddleware, RelatorioController.consultarNomesLivres);
router.get('/dizimistas', authMiddleware, RelatorioController.consultarDizimistas);
router.get('/relatorios', authMiddleware, RelatorioController.consultarRelatorios);
router.get('/relatorios/periodo', authMiddleware, RelatorioController.consultarRelatoriosPorPeriodo);
router.put('/relatorios/:id', authMiddleware, RelatorioController.editarRelatorio);



// Detalhes de dizimistas
router.get('/dizimistas/usuario/:id', authMiddleware, RelatorioController.detalhesDizimistaUsuario);
router.get('/dizimistas/livre/:nome', authMiddleware, RelatorioController.detalhesDizimistaLivre);

// Rota protegida para listar usuários (somente admin logado)
router.get('/usuarios', authMiddleware, UserController.listarUsuarios);
router.get('/usuario/:id', authMiddleware, UserController.buscarUsuarioPorId);
router.put('/usuario/:id', authMiddleware, UserController.editarUsuario);
router.delete('/usuario/:id', authMiddleware, UserController.excluirUsuario);
router.post('/admin/usuario/cadastrar', authMiddleware, AdminController.cadastrarUsuario);



module.exports = router;
