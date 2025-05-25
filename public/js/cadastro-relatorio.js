

let usuarios = []; // Array global preenchido do backend

// Dados temporários para dízimos e outras ofertas
let dizimos = [];
let outrasOfertas = [];

// Seletores gerais do DOM
const dizimosLista = document.getElementById('dizimos-lista');
const ofertasLista = document.getElementById('ofertas-lista');
const totalDizimosInput = document.getElementById('total-dizimos');
const totalArrecadacaoInput = document.getElementById('total-arrecadacao');
const btnAddDizimo = document.getElementById('btn-add-dizimo');
const btnAddOferta = document.getElementById('btn-add-oferta');
const ofertaGeralInput = document.querySelector('input[name="oferta_geral"]');
const ofertaSocialInput = document.querySelector('input[name="oferta_social"]');

// Modais e inputs dentro dos modais
const modalDizimo = document.getElementById('modal-dizimo');
const modalOferta = document.getElementById('modal-oferta');
const selectDizimista = document.getElementById('input-dizimista');
const valorDizimo = document.getElementById('valor-dizimo');
const descricaoOferta = document.getElementById('descricao-oferta');
const valorOferta = document.getElementById('valor-oferta');

// Auto-complete para campo dizimista
const sugestoesLista = document.getElementById('sugestoes-dizimista');
const inputDizimista = document.getElementById('input-dizimista');

// Função para carregar usuários do backend com autenticação
async function carregarUsuarios() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const resposta = await fetch("https://cadastro-igreja-ten.vercel.app/usuarios", {
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (resposta.status === 401) {
      alert("Sessão expirada ou token inválido. Faça login novamente.");
      sessionStorage.removeItem("token");
      window.location.href = "../index.html";
      return;
    }

    if (!resposta.ok) throw new Error("Erro ao carregar usuários");

    usuarios = await resposta.json();

    const selectUsuarios = document.getElementById("select-usuarios");
    if (selectUsuarios) {
      selectUsuarios.innerHTML = '';
      usuarios.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.id;
        option.textContent = usuario.nome_completo;
        selectUsuarios.appendChild(option);
      });
    }

  } catch (erro) {
    console.error("Erro na requisição:", erro);
    alert("Erro ao carregar usuários.");
  }
}

// Preenche o selectDizimista com os usuários
function preencherSelectUsuarios() {
  selectDizimista.innerHTML = '';
  usuarios.forEach(usuario => {
    const option = document.createElement('option');
    option.value = usuario.nome_completo;
    option.textContent = usuario.nome_completo;
    selectDizimista.appendChild(option);
  });
}

// Renderiza a lista de dízimos
function renderizarDizimos() {
  dizimosLista.innerHTML = '';
  dizimos.forEach((dizimo, index) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <p><strong>👤 ${dizimo.nome}</strong></p>
      <p>💰 R$ ${dizimo.valor.toFixed(2).replace('.',',')}</p>
      <button type="button" class="remover-dizimo" data-index="${index}" style="color:red;background:none;border:none;cursor:pointer;">[Remover]</button>
    `;
    dizimosLista.appendChild(div);
  });
}

// Renderiza a lista de outras ofertas
function renderizarOfertas() {
  ofertasLista.innerHTML = '';
  outrasOfertas.forEach((oferta, index) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <p><strong>🏷️ ${oferta.descricao}</strong></p>
      <p>💰 R$ ${oferta.valor.toFixed(2).replace('.',',')}</p>
      <button type="button" class="remover-oferta" data-index="${index}" style="color:red;background:none;border:none;cursor:pointer;">[Remover]</button>
    `;
    ofertasLista.appendChild(div);
  });
}

// Atualiza os totais
function atualizarTotais() {
  const totalDizimos = dizimos.reduce((acc, item) => acc + item.valor, 0);
  const ofertasGerais = parseFloat(ofertaGeralInput.value) || 0;
  const ofertasSociais = parseFloat(ofertaSocialInput.value) || 0;
  const totalOutrasOfertas = outrasOfertas.reduce((acc, item) => acc + item.valor, 0);

  totalDizimosInput.value = totalDizimos.toFixed(2).replace('.',',');
  totalArrecadacaoInput.value = (totalDizimos + ofertasGerais + ofertasSociais + totalOutrasOfertas).toFixed(2).replace('.',',');
}

// Abrir modais
btnAddDizimo.addEventListener('click', () => {
  valorDizimo.value = '';
  modalDizimo.classList.remove('hidden');
});

btnAddOferta.addEventListener('click', () => {
  descricaoOferta.value = '';
  valorOferta.value = '';
  modalOferta.classList.remove('hidden');
});

// Confirmar adição de dízimo
document.getElementById('confirmar-dizimo').addEventListener('click', () => {
  const nome = selectDizimista.value.trim();
  const valor = parseFloat(valorDizimo.value);

  if (!nome) {
    alert('Por favor, informe ou selecione o nome do dizimista.');
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    alert('Digite um valor válido para o dízimo.');
    return;
  }

  const usuarioEncontrado = usuarios.find(u => u.nome_completo === nome);

  dizimos.push({
    nome: nome,
    valor,
    usuario_id: usuarioEncontrado ? usuarioEncontrado.id : null,
    nome_livre: usuarioEncontrado ? null : nome
  });

  renderizarDizimos();
  atualizarTotais();
  modalDizimo.classList.add('hidden');
});

// Cancelar modal
document.getElementById('cancelar-dizimo').addEventListener('click', () => {
  modalDizimo.classList.add('hidden');
});

// Confirmar adição de oferta
document.getElementById('confirmar-oferta').addEventListener('click', () => {
  const descricao = descricaoOferta.value.trim();
  const valor = parseFloat(valorOferta.value);

  if (!descricao) {
    alert('Por favor, preencha a descrição da oferta.');
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    alert('Digite um valor válido para a oferta.');
    return;
  }

  outrasOfertas.push({ descricao, valor });
  renderizarOfertas();
  atualizarTotais();
  modalOferta.classList.add('hidden');
});

document.getElementById('cancelar-oferta').addEventListener('click', () => {
  modalOferta.classList.add('hidden');
});

// Remover dízimo
dizimosLista.addEventListener('click', (e) => {
  if (e.target.classList.contains('remover-dizimo')) {
    const index = parseInt(e.target.dataset.index);
    dizimos.splice(index, 1);
    renderizarDizimos();
    atualizarTotais();
  }
});

// Remover oferta
ofertasLista.addEventListener('click', (e) => {
  if (e.target.classList.contains('remover-oferta')) {
    const index = parseInt(e.target.dataset.index);
    outrasOfertas.splice(index, 1);
    renderizarOfertas();
    atualizarTotais();
  }
});

// Atualiza totais em tempo real
[ofertaGeralInput, ofertaSocialInput].forEach(input => {
  input.addEventListener('input', atualizarTotais);
});

// Autocomplete dizimista
inputDizimista.addEventListener('input', () => {
  const valor = inputDizimista.value.toLowerCase().trim();
  sugestoesLista.innerHTML = '';
  if (!valor) return;

  const filtrados = usuarios.filter(usuario =>
    usuario.nome_completo.toLowerCase().includes(valor)
  );

  filtrados.forEach(usuario => {
    const li = document.createElement('li');
    li.textContent = usuario.nome_completo;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      inputDizimista.value = usuario.nome_completo;
      sugestoesLista.innerHTML = '';
    });
    sugestoesLista.appendChild(li);
  });
});

// Fecha sugestões ao clicar fora
document.addEventListener('click', (e) => {
  if (!sugestoesLista.contains(e.target) && e.target !== inputDizimista) {
    sugestoesLista.innerHTML = '';
  }
});

// Inicialização ao carregar
document.addEventListener("DOMContentLoaded", async () => {
  await carregarUsuarios();
  preencherSelectUsuarios();
  atualizarTotais();
});

// Envio do relatório
async function enviarRelatorio() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Faça login para enviar o relatório.");
    window.location.href = "../index.html";
    return;
  }

  const visitantes = parseInt(document.getElementById('visitantes').value);
  const totalPresentes = parseInt(document.getElementById('total-presentes').value);
  const dataCulto = document.getElementById('data_culto').value;
  const ofertasGerais = parseFloat(ofertaGeralInput.value) || 0;
  const ofertasSociais = parseFloat(ofertaSocialInput.value) || 0;

  const dizimosFormatados = dizimos.map(d => ({
    valor: d.valor,
    usuario_id: d.usuario_id || null,
    nome_livre: d.nome_livre || null
  }));

  if (isNaN(visitantes) || visitantes < 0) {
    alert("Informe um número válido de visitantes.");
    return;
  }
  if (isNaN(totalPresentes) || totalPresentes < 0) {
    alert("Informe um número válido para total de presentes.");
    return;
  }

  const dadosRelatorio = {
    data_culto: dataCulto,
    visitantes,
    total_presentes: totalPresentes,
    oferta_geral: ofertasGerais,
    oferta_social: ofertasSociais,
    dizimos: dizimosFormatados,
    outras_ofertas: outrasOfertas
  };

  mostrarOverlay(); // <-- Mostra o carregamento

  try {
    const resposta = await fetch('https://cadastro-igreja-ten.vercel.app/relatorio/cadastrar', {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosRelatorio)
    });

    if (resposta.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      sessionStorage.removeItem("token");
      window.location.href = "../index.html";
      return;
    }

    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(textoErro);
    }

    // Sucesso
    dizimos = [];
    outrasOfertas = [];
    renderizarDizimos();
    renderizarOfertas();
    atualizarTotais();
    document.getElementById('visitantes').value = '';
    document.getElementById('total-presentes').value = '';
    ofertaGeralInput.value = '';
    ofertaSocialInput.value = '';

    esconderOverlay(); // <-- Oculta o carregamento

    const msgSucesso = document.getElementById('msg-sucesso');
    msgSucesso.style.display = 'block';

    document.getElementById('btn-fechar-msg').onclick = () => {
      msgSucesso.style.display = 'none';
      window.location.href = 'inicio.html';
    };

  } catch (erro) {
    esconderOverlay(); // <-- Também oculta se der erro
    console.error("Erro ao cadastrar relatório:", erro);
    alert("Erro ao cadastrar relatório. Veja o console para detalhes.");
  }
}


// Listener para botão enviar
document.getElementById('btn-enviar-relatorio').addEventListener('click', (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  enviarRelatorio();
});

const form = document.getElementById('form-relatorio');

function validarFormulario() {
  // Validação nativa dos campos required, tipo e etc
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }


  // Você pode adicionar outras validações aqui, por exemplo:
  // Se quiser garantir que total presentes >= visitantes, etc.

  return true;
}



document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('relatorioSucesso') === 'true') {
    const msgSucesso = document.getElementById('msg-sucesso');
    msgSucesso.style.display = 'block';

    sessionStorage.removeItem('relatorioSucesso');

    // Redirecionar automaticamente após 3 segundos
    setTimeout(() => {
      window.location.href = 'inicio.html';
    }, 3000);

    // Também mantém o botão para fechar manualmente antes do redirecionamento
    document.getElementById('btn-fechar-msg').addEventListener('click', () => {
      msgSucesso.style.display = 'none';
      window.location.href = 'inicio.html';
    });
  }
});

function capitalizeFirstLetter(inputElement) {
  inputElement.addEventListener('input', function () {
    const input = this.value;
    if (input.length > 0) {
      this.value = input.charAt(0).toUpperCase() + input.slice(1);
    }
  });
}

capitalizeFirstLetter(document.getElementById('input-dizimista'));
capitalizeFirstLetter(document.getElementById('descricao-oferta'));


function mostrarOverlay() {
  document.getElementById('overlay-loading').style.display = 'flex';
}

function esconderOverlay() {
  document.getElementById('overlay-loading').style.display = 'none';
}

