// Verifica se o token existe no sessionStorage
if (!sessionStorage.getItem('token')) {
    // Redireciona para a página de login (ou qualquer outra)
    window.location.href = '../index.html'; // altere para o caminho correto da sua página de login
}
let modoVisualizacao = 'mes'; // 'mes' ou 'periodo'

const bola1 = document.querySelector("#bola1");
const bola2 = document.querySelector("#bola2");
const centro1 = bola1.querySelector(".bola-centro");
const centro2 = bola2.querySelector(".bola-centro");

const selectMes = document.getElementById("mes").parentElement;
const selectAno = document.getElementById("ano").parentElement;
const formPeriodo = document.getElementById("form-periodo");
const formAte = document.getElementById("form-ate");

bola1.addEventListener("click", () => {
    modoVisualizacao = 'mes';
    centro1.style.display = "block";
    centro2.style.display = "none";
    selectMes.style.display = "flex";
    selectAno.style.display = "flex";
    formPeriodo.style.display = "none";
    formAte.style.display = "none";
});

bola2.addEventListener("click", () => {
    modoVisualizacao = 'periodo';
    centro1.style.display = "none";
    centro2.style.display = "block";
    selectMes.style.display = "none";
    selectAno.style.display = "none";
    formPeriodo.style.display = "flex";
    formAte.style.display = "flex";
});


async function carregarRelatorios() {
    mostrarOverlay(); // Início do carregamento

    const token = sessionStorage.getItem('token');
    const displaySection = document.getElementById('alternar-display');
    const container = document.getElementById('align-cont-valor');
    const mesAno = document.getElementById('mes-ano');
    const mensagemErro = document.getElementById('mensagem-erro');

    let url = 'https://cadastro-igreja-ten.vercel.app/relatorios';
    let labelPeriodo = '';

    if (modoVisualizacao === 'mes') {
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;

        if (!mes || !ano) {
            mensagemErro.style.display = 'block';
            mensagemErro.textContent = 'Selecione o mês e o ano.';
            displaySection.style.display = 'none';
            mesAno.style.display = 'none';
            container.innerHTML = '';
            esconderOverlay(); // Finaliza carregamento
            return;
        }

        url += `?mes=${mes}&ano=${ano}`;
        labelPeriodo = `${mes}/${ano}`;
    } else {
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFim = document.getElementById('data-fim').value;

        if (!dataInicio || !dataFim) {
            mensagemErro.style.display = 'block';
            mensagemErro.textContent = 'Informe a data de início e a data de fim.';
            displaySection.style.display = 'none';
            mesAno.style.display = 'none';
            container.innerHTML = '';
            esconderOverlay(); // Finaliza carregamento
            return;
        }

        url += `/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`;
        labelPeriodo = `De ${formatarData(dataInicio)} até ${formatarData(dataFim)}`;

    }

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar relatórios');
        }

        const relatorios = await response.json();
        container.innerHTML = '';

        if (relatorios.length === 0) {
            displaySection.style.display = 'none';
            mesAno.style.display = 'none';
            mensagemErro.style.display = 'block';
            mensagemErro.textContent = 'Nenhum relatório encontrado para o período selecionado.';
            esconderOverlay(); // Finaliza carregamento
            return;
        }

        mensagemErro.style.display = 'none';
        displaySection.style.display = 'block';
        mesAno.textContent = labelPeriodo;
        mesAno.style.display = 'block';

        const tituloArrecadacao = document.getElementById('titulo-arrecadacao');
        const containerPdf = document.getElementById('container-pdf');

        if (modoVisualizacao === 'mes') {
            tituloArrecadacao.textContent = 'Total de Arrecadação Mensal:';
            containerPdf.style.display = 'flex';
            renderizarRelatorios(relatorios);
        } else {
            tituloArrecadacao.textContent = 'Total de Arrecadação por Período:';
            containerPdf.style.display = 'none';
            renderizarRelatoriosPorPeriodo(relatorios);
        }

    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        mensagemErro.style.display = 'block';
        mensagemErro.textContent = 'Erro ao carregar relatórios.';
        displaySection.style.display = 'none';
        mesAno.style.display = 'none';
        container.innerHTML = '';
    }

    esconderOverlay(); // Finaliza carregamento (em qualquer caso)
}



function renderizarRelatorios(relatorios) {
    const container = document.getElementById('align-cont-valor');
    container.innerHTML = '';

    let totalGeralArrecadacao = 0;
    let totalDizimos = 0;
    let totalOfertas = 0;
    let totalOutrasOfertas = 0;
    let totalSocial = 0;

    relatorios.forEach(relatorio => {
        const {
            data_culto,
            total_dizimos,
            oferta_geral,
            total_outras_ofertas,
            oferta_social,
            total_arrecadacao
        } = relatorio;

        totalGeralArrecadacao += Number(total_arrecadacao);
        totalDizimos += Number(total_dizimos);
        totalOfertas += Number(oferta_geral);
        totalOutrasOfertas += Number(total_outras_ofertas);
        totalSocial += Number(oferta_social);

        const div = document.createElement('div');
        div.classList.add('container-valor');
        div.innerHTML = `
            <div class="align-valor"><p>Data:</p><p class="valor">${formatarData(data_culto)}</p></div>
            <div class="align-valor"><p>Total Dízimos:</p><p class="valor">R$ ${formatarValor(total_dizimos)}</p></div>
            <div class="align-valor"><p>Ofertas Gerais:</p><p class="valor">R$ ${formatarValor(oferta_geral)}</p></div>
            <div class="align-valor"><p>Outras Ofertas:</p><p class="valor">R$ ${formatarValor(total_outras_ofertas)}</p></div>
            <div class="align-valor"><p>Oferta Social:</p><p class="valor">R$ ${formatarValor(oferta_social)}</p></div>
            <div class="align-valor"><p>Total Arrecadação:</p><p class="valor" style="color: green; font-weight: 500">R$ ${formatarValor(total_arrecadacao)}</p></div>
        `;
        container.appendChild(div);
    });

    // Atualiza todos os totais na UI
    document.getElementById('valor-total').textContent = `R$ ${formatarValor(totalGeralArrecadacao)}`;
    document.getElementById('valor-dizimos').textContent = `R$ ${formatarValor(totalDizimos)}`;
    document.getElementById('valor-ofertas').textContent = `R$ ${formatarValor(totalOfertas)}`;
    document.getElementById('valor-outras').textContent = `R$ ${formatarValor(totalOutrasOfertas)}`;
    document.getElementById('valor-social').textContent = `R$ ${formatarValor(totalSocial)}`;
}

function renderizarRelatoriosPorPeriodo(relatorios) {
    const container = document.getElementById('align-cont-valor');
    container.innerHTML = '';

    let totalGeralArrecadacao = 0;
    let totalDizimos = 0;
    let totalOfertas = 0;
    let totalOutrasOfertas = 0;
    let totalSocial = 0;

    relatorios.forEach(relatorio => {
        const {
            id, _id, data, dia_semana, visitantes, total_presentes,
            oferta_geral, oferta_social, dizimos,
            outras_ofertas = [],
            total_dizimos, total_arrecadacao, total_outras_ofertas
        } = relatorio;

        const relatorioId = id || _id;

        totalGeralArrecadacao += Number(total_arrecadacao);
        totalDizimos += Number(total_dizimos);
        totalOfertas += Number(oferta_geral);
        totalOutrasOfertas += Number(total_outras_ofertas || 0);
        totalSocial += Number(oferta_social);

        const dizimosHtml = dizimos.map(d => `
            <div class="align-valor dizimo-item">
                <p>Dízimo:</p>
                <div class="dizimo-info">
                    <p class="valor">${d.nome}</p>
                    <p>R$ ${formatarValor(d.valor)}</p>
                </div>
            </div>
        `).join('');

        const outrasOfertasHtml = outras_ofertas.map(oferta => `
            <div class="align-valor outra-oferta-item" data-id="${oferta.id}" data-descricao="${oferta.descricao}">
                <p>${oferta.descricao}:</p>
                <p class="valor">R$ ${formatarValor(oferta.valor)}</p>
            </div>
        `).join('');

        const div = document.createElement('div');
        div.classList.add('container-valor');
        div.innerHTML = `
            <div class="align-valor"><p>Data:</p><p class="valor">${formatarData(data)}</p></div>
            <div class="align-valor"><p>Dia:</p><p class="valor">${dia_semana}</p></div>
            <div class="align-valor"><p>Visitantes:</p><p class="valor">${visitantes}</p></div>
            <div class="align-valor"><p>Total Presentes:</p><p class="valor">${total_presentes}</p></div>
            <div class="align-valor"><p>Ofertas Gerais:</p><p class="valor">R$ ${formatarValor(oferta_geral)}</p></div>
            <div class="align-valor"><p>Oferta Social:</p><p class="valor">R$ ${formatarValor(oferta_social)}</p></div>
            <div style="height: 1px; margin-top: 8px; background-color: black;"></div>
            ${outrasOfertasHtml}
            <div class="align-valor"><p>Total Outras Ofertas:</p><p class="valor">R$ ${formatarValor(total_outras_ofertas || 0)}</p></div>
            ${dizimosHtml}
            <div class="align-valor"><p>Total Dízimos:</p><p class="valor">R$ ${formatarValor(total_dizimos)}</p></div>
            <div class="align-valor"><p>Total Arrecadação:</p><p class="valor" style="color: green; font-weight: 500">R$ ${formatarValor(total_arrecadacao)}</p></div>
            <button class="btn-editar" data-id="${relatorioId}">Editar</button>
        `;
        container.appendChild(div);
    });

    // Atualiza totais na UI para modo período
    document.getElementById('valor-total').textContent = `R$ ${formatarValor(totalGeralArrecadacao)}`;
    document.getElementById('valor-dizimos').textContent = `R$ ${formatarValor(totalDizimos)}`;
    document.getElementById('valor-ofertas').textContent = `R$ ${formatarValor(totalOfertas)}`;
    document.getElementById('valor-outras').textContent = `R$ ${formatarValor(totalOutrasOfertas)}`;
    document.getElementById('valor-social').textContent = `R$ ${formatarValor(totalSocial)}`;

    const dizimoItems = document.querySelectorAll('.dizimo-item');
    if (dizimoItems.length > 0) {
        dizimoItems[0].style.marginTop = '10px';
        dizimoItems[dizimoItems.length - 1].style.marginBottom = '4px';
    }

    const botoesEditar = container.querySelectorAll('.btn-editar');
    botoesEditar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const idRelatorio = btn.getAttribute('data-id');
            console.log("ID do relatório para editar:", idRelatorio);
            abrirEditorRelatorio(idRelatorio);
        });
    });
}



async function abrirEditorRelatorio(id) {
    if (!id) {
        alert('ID do relatório inválido para edição.');
        return;
    }

    const container = document.getElementById('align-cont-valor');
    const divRelatorio = [...container.children].find(div => div.querySelector(`button[data-id="${id}"]`));

    if (!divRelatorio) {
        alert('Relatório não encontrado para edição.');
        return;
    }

    const htmlOriginal = divRelatorio.innerHTML; // Salva o conteúdo original

    const dataAtual = divRelatorio.querySelector('.align-valor:nth-child(1) .valor').textContent;
    const diaSemanaAtual = divRelatorio.querySelector('.align-valor:nth-child(2) .valor').textContent;
    const visitantesAtual = divRelatorio.querySelector('.align-valor:nth-child(3) .valor').textContent;
    const totalPresentesAtual = divRelatorio.querySelector('.align-valor:nth-child(4) .valor').textContent;
    const ofertaGeralAtual = divRelatorio.querySelector('.align-valor:nth-child(5) .valor').textContent.replace('R$ ', '').replace('.', '').replace(',', '.').trim();
    const ofertaSocialAtual = divRelatorio.querySelector('.align-valor:nth-child(6) .valor').textContent.replace('R$ ', '').replace('.', '').replace(',', '.').trim();

    let outrasOfertasArray = [];
    const outrasOfertasElementos = divRelatorio.querySelectorAll('.outra-oferta-item');
    outrasOfertasElementos.forEach(element => {
        const descricao = element.getAttribute('data-descricao') || '';
        let valorTexto = element.querySelector('.valor')?.textContent.trim() || '0';
        valorTexto = valorTexto.replace('R$', '').replace('.', '').replace(',', '.').trim();

        outrasOfertasArray.push({
            id: Number(element.getAttribute('data-id')) || 0,
            descricao,
            valor: parseFloat(valorTexto) || 0
        });
    });

    if (outrasOfertasArray.length === 0) {
        outrasOfertasArray.push({ descricao: '', valor: 0 });
    }

    const dizimosDivs = divRelatorio.querySelectorAll('.dizimo-item');
    let dizimosInputsHtml = '';
    dizimosDivs.forEach((dizimoDiv, index) => {
        const nome = dizimoDiv.querySelector('.dizimo-info .valor').textContent;
        const valorText = dizimoDiv.querySelector('.dizimo-info p:nth-child(2)').textContent;
        const valor = valorText.replace('R$ ', '').replace('.', '').replace(',', '.').trim();

        dizimosInputsHtml += `
      <div class="dizimo-editar">
        <label>Nome Dízimo #${index + 1}: <input type="text" name="dizimo-nome" value="${nome}"></label>
        <label>Valor Dízimo #${index + 1}: <input type="number" step="0.01" name="dizimo-valor" value="${valor}"></label>
      </div>
    `;
    });

    let outrasOfertasInputsHtml = '';
    outrasOfertasArray.forEach((oferta, index) => {
        outrasOfertasInputsHtml += `
      <div class="outra-oferta-item" data-id="${oferta.id}">
        <label>Descrição #${index + 1}:
          <input type="text" class="outra-desc" name="outra-descricao" value="${oferta.descricao}">
        </label>
        <label>Valor #${index + 1}:
          <input type="number" step="0.01" name="outra-valor" value="${oferta.valor}">
        </label>
      </div>
    `;
    });

    divRelatorio.innerHTML = `
    <label>Data: <input type="date" id="input-data" value="${formatarDataParaInput(dataAtual)}"></label>
    <label>Dia da Semana: <input type="text" id="input-dia-semana" value="${diaSemanaAtual}" readonly></label>
    <label>Visitantes: <input type="number" id="input-visitantes" value="${visitantesAtual}"></label>
    <label>Total Presentes: <input type="number" id="input-total-presentes" value="${totalPresentesAtual}"></label>
    <label>Ofertas Gerais: <input type="number" step="0.01" id="input-oferta-geral" value="${ofertaGeralAtual}"></label>
    <label>Oferta Social: <input type="number" step="0.01" id="input-oferta-social" value="${ofertaSocialAtual}"></label>

    <fieldset>
      <legend>Outras Ofertas</legend>
      <div id="container-outras-ofertas">
        ${outrasOfertasInputsHtml}
      </div>
    </fieldset>

    <fieldset>
      <legend>Dízimos</legend>
      ${dizimosInputsHtml || '<p>Sem dízimos cadastrados.</p>'}
    </fieldset>

    <button id="btn-salvar">Salvar</button>
    <button id="btn-cancelar">Cancelar</button>
  `;

    divRelatorio.querySelector('#btn-salvar').addEventListener('click', async () => {
        const data = divRelatorio.querySelector('#input-data').value;
        const visitantes = divRelatorio.querySelector('#input-visitantes').value;
        const totalPresentes = divRelatorio.querySelector('#input-total-presentes').value;
        const ofertaGeral = divRelatorio.querySelector('#input-oferta-geral').value;
        const ofertaSocial = divRelatorio.querySelector('#input-oferta-social').value;

        const outrasOfertasDivs = divRelatorio.querySelectorAll('.outra-oferta-item');
        const outras_ofertas = [...outrasOfertasDivs].map(div => {
            const idAttr = div.getAttribute('data-id');
            const id = idAttr ? Number(idAttr) : undefined;
            const descricao = div.querySelector('input.outra-desc').value.trim();
            const valor = parseFloat(div.querySelector('input[name="outra-valor"]').value) || 0;

            return {
                ...(id !== undefined && { id }),
                descricao,
                valor
            };
        }).filter(oferta => oferta.descricao !== '' && oferta.valor > 0);

        const nomesDizimos = [...divRelatorio.querySelectorAll('input[name="dizimo-nome"]')].map(input => input.value.trim());
        const valoresDizimos = [...divRelatorio.querySelectorAll('input[name="dizimo-valor"]')].map(input => input.value);

        const dizimos = nomesDizimos.map((nome, i) => ({
            nome_livre: nome,
            valor: parseFloat(valoresDizimos[i]) || 0
        })).filter(d => d.nome_livre !== '' && d.valor > 0);

        const totalDizimos = dizimos.reduce((acc, curr) => acc + curr.valor, 0);
        const totalOutrasOfertas = outras_ofertas.reduce((acc, curr) => acc + curr.valor, 0);
        const totalArrecadacao = Number(ofertaGeral) + Number(ofertaSocial) + totalDizimos + totalOutrasOfertas;

        const body = {
            data_culto: data,
            visitantes: Number(visitantes),
            total_presentes: Number(totalPresentes),
            oferta_geral: Number(ofertaGeral),
            oferta_social: Number(ofertaSocial),
            outras_ofertas,
            dizimos,
            total_dizimos: totalDizimos,
            total_outras_ofertas: totalOutrasOfertas,
            total_arrecadacao: totalArrecadacao,
        };

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('Usuário não autenticado. Faça login novamente.');
                return;
            }

            const response = await fetch(`https://cadastro-igreja-ten.vercel.app/relatorios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert('Relatório atualizado com sucesso!');

                window.location.reload(false);
            } else {
                const erro = await response.text();
                alert(`Erro ao salvar: ${erro}`);
            }
        } catch (error) {
            alert('Erro ao salvar o relatório: ' + error.message);
        }
    });

    divRelatorio.querySelector('#btn-cancelar').addEventListener('click', () => {
        divRelatorio.innerHTML = htmlOriginal;

        // Reatribui o evento do botão "Editar"
        setTimeout(() => {
            const botaoEditar = divRelatorio.querySelector(`button[data-id="${id}"]`);
            if (botaoEditar) {
                botaoEditar.addEventListener('click', () => abrirEditorRelatorio(id));
            }
        }, 0);
    });

    divRelatorio.querySelector('#input-data').addEventListener('change', e => {
        const [ano, mes, dia] = e.target.value.split('-').map(Number);
        const novaData = new Date(ano, mes - 1, dia);
        const diaSemana = novaData.toLocaleDateString('pt-BR', { weekday: 'long' });
        divRelatorio.querySelector('#input-dia-semana').value = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    });

}

function formatarDataParaInput(dataStr) {
    const partes = dataStr.split('/');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}


function formatarDataParaInput(dataStr) {
    const partes = dataStr.split('/');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}




// Mesma função auxiliar para data no formato correto
function formatarDataParaInput(dataStr) {
    const partes = dataStr.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return '';
}


// Função auxiliar para converter data exibida no formato dd/mm/yyyy para yyyy-mm-dd para input type=date
function formatarDataParaInput(dataStr) {
    // Supondo data no formato dd/mm/yyyy
    const partes = dataStr.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return ''; // fallback
}


function formatarValor(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}




document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-visualizar').addEventListener('click', e => {
        e.preventDefault();
        carregarRelatorios();
    });
});

document.getElementById('align-extrair').addEventListener('click', () => {
    const conteudo = document.getElementById('conteudo-pdf');

    const options = {
        margin: 0,
        filename: `relatorio-${new Date().toLocaleDateString('pt-BR')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            scrollY: 0,
            useCORS: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    html2pdf().set(options).from(conteudo).save();
});

function mostrarOverlay() {
    document.getElementById('overlay-loading').style.display = 'flex';
}

function esconderOverlay() {
    document.getElementById('overlay-loading').style.display = 'none';
}

