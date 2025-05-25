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

function somarUmDia(dataStr) {
    const data = new Date(dataStr);
    data.setDate(data.getDate() + 1);
    return data.toISOString().slice(0, 10);
}

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
        labelPeriodo = `De ${formatarData(somarUmDia(dataInicio))} até ${formatarData(somarUmDia(dataFim))}`;
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
            data,
            dia_semana,
            visitantes,
            total_presentes,
            oferta_geral,
            oferta_social,
            dizimos,
            total_dizimos,
            total_arrecadacao,
            total_outras_ofertas
        } = relatorio;

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

        const div = document.createElement('div');
        div.classList.add('container-valor');
        div.innerHTML = `
            <div class="align-valor"><p>Data:</p><p class="valor">${formatarData(data)}</p></div>
            <div class="align-valor"><p>Dia:</p><p class="valor">${dia_semana}</p></div>
            <div class="align-valor"><p>Visitantes:</p><p class="valor">${visitantes}</p></div>
            <div class="align-valor"><p>Total Presentes:</p><p class="valor">${total_presentes}</p></div>
            <div class="align-valor"><p>Ofertas Gerais:</p><p class="valor">R$ ${formatarValor(oferta_geral)}</p></div>
            <div class="align-valor"><p>Oferta Social:</p><p class="valor">R$ ${formatarValor(oferta_social)}</p></div>
            <div class="align-valor"><p>Outras Ofertas:</p><p class="valor">R$ ${formatarValor(total_outras_ofertas || 0)}</p></div>
            ${dizimosHtml}
            <div class="align-valor"><p>Total Dízimos:</p><p class="valor">R$ ${formatarValor(total_dizimos)}</p></div>
            <div class="align-valor"><p>Total Arrecadação:</p><p class="valor" style="color: green; font-weight: 500">R$ ${formatarValor(total_arrecadacao)}</p></div>
        `;
        container.appendChild(div);
    });

    // Atualiza todos os totais na UI para o modo período
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
}

function formatarValor(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    data.setDate(data.getDate() + 1);
    return data.toLocaleDateString('pt-BR');
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

