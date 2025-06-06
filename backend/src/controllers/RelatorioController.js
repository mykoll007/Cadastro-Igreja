const database = require('../database/connection');

class RelatorioController {
  async cadastrarRelatorio(request, response) {
    const {
      dia_semana,
      data_culto,
      visitantes,
      total_presentes,
      oferta_geral,
      oferta_social,
      dizimos = [],
      outras_ofertas = []
    } = request.body;

    // Validações básicas (podem ser ampliadas conforme necessidade)
    if (!data_culto || visitantes == null || total_presentes == null) {
      return response.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const trx = await database.transaction();

    try {
      // Inserir o relatório de culto
      const [relatorioId] = await trx('relatorios_culto').insert({
        dia_semana,
        data_culto,
        visitantes,
        total_presentes,
        oferta_geral: oferta_geral || 0,
        oferta_social: oferta_social || 0
      });

      // Inserir dízimos vinculados (usuário cadastrado ou nome livre)
      for (const dizimo of dizimos) {
        await trx('dizimos').insert({
          relatorio_id: relatorioId,
          usuario_id: dizimo.usuario_id || null,
          nome_livre: dizimo.nome_livre || null,
          valor: dizimo.valor
        });
      }

      // Inserir outras ofertas personalizadas (se houver)
      for (const oferta of outras_ofertas) {
        await trx('outras_ofertas').insert({
          relatorio_id: relatorioId,
          descricao: oferta.descricao,
          valor: oferta.valor
        });
      }

      await trx.commit();

      return response.status(201).json({ message: 'Relatório cadastrado com sucesso.' });
    } catch (error) {
      await trx.rollback();
      console.error('Erro ao cadastrar relatório:', error);
      return response.status(500).json({ error: 'Erro ao cadastrar relatório.' });
    }
  }
  // Buscar todos os dizimistas (usuário_id e nome_livre)
  async consultarDizimistas(request, response) {
    try {
      const dizimistas = await database('dizimos')
        .leftJoin('usuarios', 'dizimos.usuario_id', 'usuarios.id')
        .select(
          'dizimos.usuario_id',
          'dizimos.nome_livre',
          'usuarios.nome_completo',
          database.raw(`COALESCE(usuarios.nome_completo, dizimos.nome_livre) as nome_ordenado`)
        )
        .groupBy('dizimos.usuario_id', 'dizimos.nome_livre', 'usuarios.nome_completo')
        .orderBy('nome_ordenado', 'asc');


      return response.json(dizimistas);
    } catch (error) {
      console.error('Erro ao consultar dizimistas:', error);
      return response.status(500).json({ error: 'Erro ao buscar dizimistas.' });
    }
  }
  // Buscar detalhes dos dízimos por usuário_id
  async detalhesDizimistaUsuario(request, response) {
    const { id } = request.params;

    try {
      const dados = await database('dizimos')
        .join('relatorios_culto', 'dizimos.relatorio_id', 'relatorios_culto.id')
        .where('dizimos.usuario_id', id)
        .select('relatorios_culto.data_culto', 'dizimos.valor')
        .orderBy('relatorios_culto.data_culto', 'desc');

      return response.json(dados);
    } catch (error) {
      console.error('Erro ao buscar detalhes do dizimista (usuário):', error);
      return response.status(500).json({ error: 'Erro ao buscar detalhes do dizimista.' });
    }
  }

  // Buscar detalhes dos dízimos por nome_livre
  async detalhesDizimistaLivre(request, response) {
    const { nome } = request.params;

    try {
      const dados = await database('dizimos')
        .join('relatorios_culto', 'dizimos.relatorio_id', 'relatorios_culto.id')
        .where('dizimos.nome_livre', nome)
        .select('relatorios_culto.data_culto', 'dizimos.valor')
        .orderBy('relatorios_culto.data_culto', 'desc');

      return response.json(dados);
    } catch (error) {
      console.error('Erro ao buscar detalhes do dizimista (livre):', error);
      return response.status(500).json({ error: 'Erro ao buscar detalhes do dizimista livre.' });
    }
  }
  async consultarRelatorios(request, response) {
    const { mes, ano, data_inicio, data_fim } = request.query;

    try {
      let relatorios = [];

      if (mes && ano) {
        // --- Consulta por mês e ano ---
        const meses = {
          janeiro: '01', fevereiro: '02', março: '03', abril: '04',
          maio: '05', junho: '06', julho: '07', agosto: '08',
          setembro: '09', outubro: '10', novembro: '11', dezembro: '12'
        };
        const mesNumero = meses[mes.toLowerCase()];
        if (!mesNumero) {
          return response.status(400).json({ error: 'Mês inválido.' });
        }

        relatorios = await database('relatorios_culto')
          .whereRaw('MONTH(data_culto) = ? AND YEAR(data_culto) = ?', [mesNumero, ano])
          .select('id', 'data_culto', 'oferta_geral', 'oferta_social')
          .orderBy('data_culto', 'asc');
      } else if (data_inicio && data_fim) {
        // --- Consulta por período ---
        relatorios = await database('relatorios_culto')
          .whereBetween('data_culto', [data_inicio, data_fim])
          .select('id', 'data_culto', 'oferta_geral', 'oferta_social')
          .orderBy('data_culto', 'asc');
      } else {
        return response.status(400).json({ error: 'Parâmetros inválidos. Envie mês/ano ou data_inicio/data_fim.' });
      }

      for (const relatorio of relatorios) {
        const totalDizimos = await database('dizimos')
          .where('relatorio_id', relatorio.id)
          .sum('valor as total');

        const totalOutrasOfertas = await database('outras_ofertas')
          .where('relatorio_id', relatorio.id)
          .sum('valor as total');

        relatorio.total_dizimos = totalDizimos[0].total || 0;
        relatorio.total_outras_ofertas = totalOutrasOfertas[0].total || 0;

        relatorio.total_arrecadacao =
          Number(relatorio.oferta_geral || 0) +
          Number(relatorio.oferta_social || 0) +
          Number(relatorio.total_dizimos) +
          Number(relatorio.total_outras_ofertas);
      }

      return response.json(relatorios);
    } catch (error) {
      console.error('Erro ao consultar relatórios:', error);
      return response.status(500).json({ error: 'Erro ao consultar relatórios.' });
    }
  }

async consultarRelatoriosPorPeriodo(request, response) {
  const { data_inicio, data_fim } = request.query;

  if (!data_inicio || !data_fim) {
    return response.status(400).json({ error: 'Data inicial e final são obrigatórias.' });
  }

  try {
    const relatorios = await database('relatorios_culto')
      .whereBetween('data_culto', [data_inicio, data_fim])
      .orderBy('data_culto', 'asc');

    const resultado = [];

    for (const relatorio of relatorios) {
      const dizimos = await database('dizimos')
        .leftJoin('usuarios', 'dizimos.usuario_id', 'usuarios.id')
        .where('relatorio_id', relatorio.id)
        .select([
          'dizimos.valor',
          'usuarios.nome_completo',
          'dizimos.nome_livre'
        ]);

      const totalDizimos = dizimos.reduce((acc, item) => acc + Number(item.valor), 0);

      // Buscar todas as outras ofertas com descrição e valor
      const outrasOfertas = await database('outras_ofertas')
        .where('relatorio_id', relatorio.id)
        .select(['descricao', 'valor']);

      const totalOutrasOfertas = outrasOfertas.reduce((acc, oferta) => acc + Number(oferta.valor), 0);

      const totalArrecadacao = totalDizimos +
        Number(relatorio.oferta_geral || 0) +
        Number(relatorio.oferta_social || 0) +
        totalOutrasOfertas;

      const dizimistasFormatados = dizimos.map(item => {
        const nome = item.nome_completo || item.nome_livre;
        const valorFormatado = Number(item.valor).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        return `• ${nome} – ${valorFormatado}`;
      });

      resultado.push({
        id: relatorio.id,
        data: relatorio.data_culto,
        dia_semana: relatorio.dia_semana,
        visitantes: relatorio.visitantes,
        total_presentes: relatorio.total_presentes,
        oferta_geral: relatorio.oferta_geral,
        oferta_social: relatorio.oferta_social,
        dizimos: dizimos.map(item => ({
          nome: item.nome_completo || item.nome_livre,
          valor: item.valor
        })),
        dizimistas_formatados: dizimistasFormatados,
        outras_ofertas: outrasOfertas.map(oferta => ({
          descricao: oferta.descricao,
          valor: oferta.valor
        })),
        total_dizimos: totalDizimos,
        total_outras_ofertas: totalOutrasOfertas,
        total_arrecadacao: totalArrecadacao
      });
    }

    return response.json(resultado);

  } catch (error) {
    console.error('Erro ao consultar relatórios por período:', error);
    return response.status(500).json({ error: 'Erro ao consultar relatórios por período.' });
  }
}


async editarRelatorio(request, response) {
  const { id } = request.params;
  const {
    data_culto,
    visitantes,
    total_presentes,
    oferta_geral,
    oferta_social,
    dizimos = [],
    outras_ofertas = []
  } = request.body;

  if (!id) {
    return response.status(400).json({ error: 'ID do relatório é obrigatório.' });
  }

  // Validação da data e cálculo do dia da semana
  const [ano, mes, dia] = data_culto.split('-').map(Number);
  const dataObj = new Date(ano, mes - 1, dia);

  const dia_semana_raw = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dia_semana = dia_semana_raw.charAt(0).toUpperCase() + dia_semana_raw.slice(1).replace('-feira', '');

  const diasPermitidos = ['Domingo', 'Quarta', 'Sábado'];
  if (!diasPermitidos.includes(dia_semana)) {
    return response.status(400).json({ error: `Dia da semana inválido: ${dia_semana}. Permitido apenas Domingo, Quarta ou Sábado.` });
  }

  const trx = await database.transaction();

  try {
    // Atualiza dados principais
    await trx('relatorios_culto')
      .where('id', id)
      .update({
        data_culto,
        dia_semana,
        visitantes,
        total_presentes,
        oferta_geral,
        oferta_social
      });

    // Remove todos os dízimos antigos
    await trx('dizimos').where('relatorio_id', id).del();

    // Insere novos dízimos
    for (const dizimo of dizimos) {
      await trx('dizimos').insert({
        relatorio_id: id,
        usuario_id: dizimo.usuario_id || null,
        nome_livre: dizimo.nome_livre || dizimo.nome || null,
        valor: dizimo.valor
      });
    }

    // Remove outras ofertas que não estão mais presentes
    const idsOfertasMantidas = outras_ofertas.filter(o => o.id).map(o => o.id);
    await trx('outras_ofertas')
      .where('relatorio_id', id)
      .whereNotIn('id', idsOfertasMantidas.length ? idsOfertasMantidas : [0])
      .del();

    // Atualiza ou insere as outras ofertas
    for (const oferta of outras_ofertas) {
      if (oferta.id) {
        await trx('outras_ofertas')
          .where('id', oferta.id)
          .update({
            descricao: oferta.descricao,
            valor: oferta.valor
          });
      } else {
        await trx('outras_ofertas').insert({
          relatorio_id: id,
          descricao: oferta.descricao,
          valor: oferta.valor
        });
      }
    }

    await trx.commit();
    return response.json({ message: 'Relatório atualizado com sucesso.' });
  } catch (error) {
    await trx.rollback();
    console.error('Erro ao editar relatório:', error);
    return response.status(500).json({ error: 'Erro ao editar relatório.' });
  }
}




  async consultarNomesLivres(request, response) {
    try {
      const nomesLivres = await database('dizimos')
        .distinct('nome_livre')
        .whereNotNull('nome_livre')
        .orderBy('nome_livre', 'asc');

      return response.json(nomesLivres.map(n => n.nome_livre));
    } catch (error) {
      console.error('Erro ao consultar nomes livres:', error);
      return response.status(500).json({ error: 'Erro ao buscar nomes livres.' });
    }
  }


}

module.exports = new RelatorioController();
