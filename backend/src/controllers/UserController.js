const database = require('../database/connection');

class UserController {
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
            if (!data) return null;
            const [dia, mes, ano] = data.split('/');
            return `${ano}-${mes}-${dia}`;
        }
    
        // Validação simples da data de batismo se necessário
        if (batizado === "Sim" && !data_batismo) {
            return response.status(400).json({ message: "Por favor, preencha a data do batismo." });
        }
    
        // Formata datas (se necessário)
        const dataNascimentoFormatada = data_nascimento;
        const dataEntradaFormatada = data_entrada;
        const dataBatismoFormatada = batizado === "Sim" ? data_batismo : null;
    
        // Inserção direta sem checar duplicidade de e-mail
        try {
            await database("usuarios").insert({
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
    
            return response.status(201).json({ message: "Seu cadastro foi realizado com sucesso!" });
    
        } catch (err) {
            console.error("❌ Erro ao inserir usuário no banco:", err); // 👈 Vai mostrar o erro real no terminal
            return response.status(500).json({ message: "Erro ao criar usuário." });
        }
    }
    
    
    async listarUsuarios(request, response) {
        try {
            const usuarios = await database
                .select('id', 'nome_completo', 'telefone')
                .from('usuarios');
    
            return response.status(200).json(usuarios);
        } catch (error) {
            return response.status(500).json({ message: "Erro ao buscar usuários." });
        }
    }
    
    async buscarUsuarioPorId(request, response) {
        const { id } = request.params;
    
        try {
            const usuario = await database('usuarios').where({ id }).first();
    
            if (!usuario) {
                return response.status(404).json({ message: "Usuário não encontrado." });
            }
    
            return response.json(usuario);
        } catch (error) {
            return response.status(500).json({ message: "Erro ao buscar usuário." });
        }
    }
    async editarUsuario(request, response) {
        const { id } = request.params;
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
    
        try {
            // Verifica se o usuário existe
            const usuarioExiste = await database('usuarios').where({ id: id }).first();
            if (!usuarioExiste) {
                return response.status(404).json({ message: "Usuário não encontrado." });
            }
    
            // Validação: Se batizado for "Sim", a data do batismo é obrigatória
            if (batizado === "Sim" && !data_batismo) {
                return response.status(400).json({ message: "Por favor, preencha a data do batismo." });
            }
    
            // Se batizado for "Não", a data_batismo deve ser null
            const dataBatismoFinal = batizado === "Sim" && data_batismo ? data_batismo : null;
    
            // Atualiza os dados do usuário
            await database('usuarios').where({ id: id }).update({
                nome_completo,
                data_nascimento,
                telefone,
                email,
                endereco,
                estado_civil,
                data_entrada,
                batizado,
                data_batismo: dataBatismoFinal
            });
    
            return response.json({ message: "Usuário atualizado com sucesso!" });
        } catch (error) {
            return response.status(500).json({ message: "Erro ao atualizar usuário." });
        }
    }
    
async excluirUsuario(request, response) {
    const { id } = request.params;

    try {
        const usuarioExiste = await database('usuarios').where({  id }).first();
        if (!usuarioExiste) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        await database('usuarios').where({  id }).del();

        return response.json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
        return response.status(500).json({ message: "Erro ao excluir usuário." });
    }
}

    
    
    
    
}

module.exports = new UserController();
