document.addEventListener('DOMContentLoaded', () => {
  const inputBusca = document.querySelector('input[type="search"]');
  const container = document.getElementById('align-container');
  const token = sessionStorage.getItem('token');
  const overlayLoading = document.getElementById('overlay-loading'); // pegar loading

  const alignSeta = document.querySelector('.align-seta');
  const btnVoltarlista = document.getElementById('btn-voltarlista');
  const searchContainer = document.getElementById('display-align');
  const detalhesContainer = document.getElementById('detalhes-dizimista');
  const nomeTitulo = document.getElementById('nome-dizimista');
  const tbody = document.getElementById('lista-detalhes');

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  let dizimistas = [];

  async function carregarDizimistas() {
    try {
      overlayLoading.style.display = 'flex'; // mostrar loading

      const resposta = await fetch("https://cadastro-igreja-ten.vercel.app/dizimistas", {
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) throw new Error('Erro ao buscar dizimistas.');

      const data = await resposta.json();
      dizimistas = data;
      renderizarDizimistas(dizimistas);
    } catch (erro) {
      console.error("Erro ao carregar dizimistas:", erro);
    } finally {
      overlayLoading.style.display = 'none'; // esconder loading
    }
  }

  function renderizarDizimistas(lista) {
    container.innerHTML = '';

    if (lista.length === 0) {
      container.innerHTML = '<p style="text-align: center;">Nenhum dizimista encontrado.</p>';
      return;
    }

    lista.forEach(dizimista => {
      const nome = dizimista.nome_completo || dizimista.nome_livre || 'Sem nome';
      const id = dizimista.usuario_id || dizimista.nome_livre;

      const item = document.createElement('div');
      item.classList.add('dizimista-item');
      item.innerHTML = `
        <div id="container-dizimistas">
          <div id="nomes-dizimistas">
            <img src="../assets/Nome.png" alt="Ícone de nome">
            <p>${nome}</p>
          </div>
          <div id="info-dizimistas">
            <img src="../assets/Search-blue.png" alt="Ícone de pesquisa">
            <a href="#" class="ver-detalhes" data-id="${id}" data-nome="${nome}" data-islivre="${!dizimista.usuario_id}"><p>Ver detalhes</p></a>
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    document.querySelectorAll('.ver-detalhes').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = link.dataset.id;
        const nome = link.dataset.nome;
        const isLivre = link.dataset.islivre === 'true';

        await mostrarDetalhesDizimista(id, nome, isLivre);
      });
    });
  }

  async function mostrarDetalhesDizimista(id, nome, isLivre) {
    try {
      overlayLoading.style.display = 'flex'; // mostrar loading

      alignSeta.style.display = 'none';
      searchContainer.style.display = 'none';
      btnVoltarlista.style.display = 'block';
      container.style.display = 'none';
      detalhesContainer.style.display = 'block';

      nomeTitulo.textContent = nome;
      tbody.innerHTML = '<tr><td colspan="2">Carregando...</td></tr>';

      const url = `https://cadastro-igreja-ten.vercel.app/dizimistas/${isLivre ? 'livre' : 'usuario'}/${id}`;
      const resposta = await fetch(url, {
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) throw new Error('Erro ao buscar detalhes.');

      const dados = await resposta.json();

      if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2">Nenhum registro encontrado.</td></tr>';
        return;
      }

      tbody.innerHTML = dados.map(registro => `
        <tr>
          <td>${formatarDataSimples(registro.data_culto)}</td>
          <td>R$ ${parseFloat(registro.valor).toFixed(2).replace('.', ',')}</td>
        </tr>
      `).join('');
    } catch (erro) {
      console.error("Erro ao carregar detalhes:", erro);
      tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar detalhes do dizimista.</td></tr>';
    } finally {
      overlayLoading.style.display = 'none'; // esconder loading
    }
  }

  // Função que formata data no formato dd/mm/aaaa sem mexer em fuso horário
function formatarDataSimples(dataISO) {
  if (!dataISO) return '';
  const dataSomente = dataISO.split('T')[0]; 
  const [ano, mes, dia] = dataSomente.split('-');
  return `${dia}/${mes}/${ano}`;
}


  // Função do botão Voltar
  window.voltarParaLista = function () {
    searchContainer.style.display = 'flex';
    detalhesContainer.style.display = 'none';
    container.style.display = 'block';
    btnVoltarlista.style.display = 'none';
    alignSeta.style.display = 'block';
  }

  inputBusca.addEventListener('input', () => {
    const termo = inputBusca.value.toLowerCase();
    const filtrados = dizimistas.filter(d =>
      (d.nome_completo || d.nome_livre || '').toLowerCase().includes(termo)
    );
    renderizarDizimistas(filtrados);
  });

  carregarDizimistas();
});
