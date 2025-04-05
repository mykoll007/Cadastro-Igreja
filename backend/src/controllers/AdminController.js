const database = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

class AdminController {

     // **Login do Admin com JWT**
     async login(request, response) {
        const { email, senha } = request.body;

        database.select('*').from('admins').where('email', email).then(async (admin) => {
            if (admin.length === 0) {
                return response.status(404).json({ message: "E-mail não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senha, admin[0].senha);
            if (!senhaValida) {
                return response.status(401).json({ message: "Senha incorreta." });
            }

            const token = jwt.sign(
                { id: admin[0].id, email: admin[0].email },
                process.env.SALT, // 🔐 Chave secreta fixa por enquanto
                { expiresIn: '2h' }
            );

            response.status(200).json({ message: "Login realizado com sucesso!", token });
        }).catch(() => {
            response.status(500).json({ message: "Erro ao realizar login." });
        });
    }
    async cadastrarAdmin(request, response) {
        const { email, senha, confirmarSenha, codigoCadastro } = request.body;
    
        if (codigoCadastro !== process.env.CODIGO_CADASTRO) {
            return response.status(403).json({ message: "Código de cadastro inválido." });
        }
    
        if (senha !== confirmarSenha) {
            return response.status(400).json({ message: "As senhas não coincidem." });
        }
    
        // Validação da senha forte
        const senhaForteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    
        if (!senhaForteRegex.test(senha)) {
            return response.status(400).json({ 
                message: "A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
            });
        }
    
        const senhaSegura = await bcrypt.hash(senha, 10);
    
        database.select('*').from('admins').where('email', email).then(existeAdmin => {
            if (existeAdmin.length > 0) {
                return response.status(400).json({ message: "E-mail já cadastrado." });
            }
    
            database.insert({ email, senha: senhaSegura }).table("admins").then(() => {
                response.status(201).json({ message: "Administrador cadastrado com sucesso!" });
            }).catch(() => {
                response.status(500).json({ message: "Erro ao criar administrador." });
            });
    
        }).catch(() => {
            response.status(500).json({ message: "Erro ao verificar administrador existente." });
        });
    }
    
    async recuperarSenha(request, response) {
        const { email } = request.body;

        try {
            const admin = await database('admins').where({ email }).first();

            if (!admin) {
                return response.status(404).json({ message: "E-mail não encontrado." });
            }

            // Gera um código aleatório de 5 números
            const codigoRecuperacao = Math.floor(10000 + Math.random() * 90000); 

            // Atualiza o código de recuperação no banco de dados
            await database('admins').where({ email }).update({ codigo_recuperacao: codigoRecuperacao });

            // Configuração do Nodemailer
            const transporter = nodemailer.createTransport({
                host: process.env.DB_HOST_EMAIL,
                port: process.env.DB_PORT_EMAIL,
                secure: false, // TLS
                auth: {
                    user: process.env.DB_EMAILVIVENDO,
                    pass: process.env.DB_SENHAVIVENDO
                }
            });

            // Definição do e-mail
            const mailOptions = {
                from: process.env.DB_EMAILVIVENDO,
                to: email,
                subject: "Recuperação de Senha - Igreja Vivendo Um Novo Tempo",
                text: `Olá, seu código de recuperação da sua conta Administradora da Igreja Vivendo um Novo Tempo é:${codigoRecuperacao}`
            };

            // Enviar e-mail
            await transporter.sendMail(mailOptions);

            return response.status(200).json({ message: "Código de recuperação enviado para seu e-mail!" });

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Erro ao processar recuperação de senha." });
        }
    }
    async validarCodigoRecuperacao(request, response) {
        const { email, codigo_recuperacao } = request.body;

        database.select('*').from('admins').where('email', email).then(admin => {
            if (admin.length === 0) {
                return response.status(404).json({ message: "E-mail não encontrado." });
            }

            const adminData = admin[0];

            // Verifica se o código de recuperação bate com o que está no banco
            if (adminData.codigo_recuperacao !== codigo_recuperacao) {
                return response.status(400).json({ message: "Código incorreto. Tente novamente." });
            }

            // Se o código estiver certo, remove ele do banco (define como NULL)
            database('admins').where('email', email).update({ codigo_recuperacao: null })
                .then(() => {
                    response.status(200).json({ message: "Código correto! Você pode redefinir sua senha agora." });
                })
                .catch(() => {
                    response.status(500).json({ message: "Erro ao validar código." });
                });

        }).catch(() => {
            response.status(500).json({ message: "Erro ao verificar código." });
        });
    }
    async redefinirSenha(request, response) {
        const { email, senha, confirmarSenha } = request.body;
    
        // Validação de senha forte
        const senhaForteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    
        if (!senhaForteRegex.test(senha)) {
            return response.status(400).json({ 
                message: "A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial." 
            });
        }
    
        if (senha !== confirmarSenha) {
            return response.status(400).json({ message: "As senhas não coincidem." });
        }
    
        try {
            const senhaSegura = await bcrypt.hash(senha, 10);
            
            const resultado = await database('admins')
                .where({ email })
                .update({ senha: senhaSegura, codigo_recuperacao: null });
    
            if (resultado === 0) {
                return response.status(404).json({ message: "E-mail não encontrado." });
            }
    
            return response.status(200).json({ message: "Senha redefinida com sucesso!" });
        } catch (error) {
            return response.status(500).json({ message: "Erro ao redefinir senha." });
        }
    }
    

    //Cadastrar Usuário
    async cadastrarUsuario(request, response) {
        const { 
            nome_completo, 
            data_nascimento, 
            telefone, 
            email, 
            endereco, 
            estado_civil, 
            data_entrada, 
            batizado, 
            data_batismo 
        } = request.body;

        // Função para converter "dd/mm/yyyy" para "yyyy-mm-dd"
        function formatarDataParaBanco(data) {
            const [dia, mes, ano] = data.split('/');
            return `${ano}-${mes}-${dia}`;
        }

        if (batizado === "Sim" && !data_batismo) {
            return response.status(400).json({ message: "Por favor, preencha a data do batismo." });
        }

        const dataNascimentoFormatada = formatarDataParaBanco(data_nascimento);
        const dataEntradaFormatada = formatarDataParaBanco(data_entrada);
        const dataBatismoFormatada = batizado === "Sim" ? formatarDataParaBanco(data_batismo) : null;

        try {
            const existeUsuario = await database('usuarios').where({ email }).first();
            
            if (existeUsuario) {
                return response.status(400).json({ message: "E-mail já cadastrado." });
            }

            await database('usuarios').insert({
                nome_completo,
                data_nascimento: dataNascimentoFormatada,
                telefone,
                email,
                endereco,
                estado_civil,
                data_entrada: dataEntradaFormatada,
                batizado,
                data_batismo: dataBatismoFormatada
            });

            return response.status(201).json({ message: "Usuário cadastrado com sucesso!" });

        } catch (error) {
            return response.status(500).json({ message: "Erro ao criar usuário." });
        }
    }
}

module.exports = new AdminController();
