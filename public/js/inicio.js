let todosUsuarios = [];
let totalTexto; // Agora acessível globalmente

// ==== Função para renderizar os usuários ====
function renderizarUsuarios(listaUsuarios) {
    const lista = document.getElementById("lista-membros");
    const mensagemVazia = document.getElementById("mensagem-vazia");
    lista.innerHTML = "";

    if (listaUsuarios.length === 0) {
        mensagemVazia.classList.remove("hidden");
    } else {
        mensagemVazia.classList.add("hidden");
    }

    listaUsuarios.forEach(usuario => {
        const section = document.createElement("section");
        section.classList.add("usuario-card");
        section.dataset.id = usuario.id;

        section.innerHTML = `
            <div class="container-membros">
                <div class="iconNome">
                    <img src="../assets/Nome.png" alt="Ícone do Membro">
                    <p>${usuario.nome_completo}</p>
                </div>
                <div class="iconTel">
                    <img src="../assets/Phone.png" alt="Ícone do Telefone">
                    <p>${usuario.telefone || "Sem telefone"}</p>
                </div>
                <div id="editarExcluir">
                    <div class="iconEditar">
                        <img src="../assets/Edit.png" alt="Ícone de Editar">
                       <p><a href="#" class="btn-editar" data-id="${usuario.id}">[Editar]</a></p>
                    </div>
                    <div class="iconExcluir">
                        <img src="../assets/Delete.png" alt="Ícone de Excluir">
                        <p>[Excluir]</p>
                    </div>
                </div>
            </div>
        `;
        lista.appendChild(section);
    });

    totalTexto.textContent = `Total (${listaUsuarios.length})`;
}

// === Redirecionamento com atraso (e bolinha de carregamento) ===
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("btn-editar")) {
        event.preventDefault();

        const id = event.target.dataset.id;

        // Mostra a bolinha de loading
        document.getElementById("overlay-loading").style.display = "flex";

        // Aguarda 1 segundo antes de redirecionar
        setTimeout(() => {
            window.location.href = `editar.html?id=${id}`;
        }, 1000);
    }
});

// ==== Ao carregar a página ====
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token");
    const lista = document.getElementById("lista-membros");
    totalTexto = document.getElementById("total");
    const campoPesquisa = document.getElementById("campo-pesquisa");

    if (!token) {
        window.location.href = "../index.html";
        return;
    }

    try {
        const response = await fetch("https://cadastro-igreja-ten.vercel.app/usuarios", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Erro ao buscar usuários:", data.message);
            alert("Token inválido ou expirado. Faça login novamente.");
            sessionStorage.removeItem("token");
            window.location.href = "../index.html";
            return;
        }

        todosUsuarios = data;
        renderizarUsuarios(todosUsuarios);

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
    }

    campoPesquisa.addEventListener("input", () => {
        const termo = campoPesquisa.value.trim();
        const termoNumerico = termo.replace(/\D/g, "");
        const termoNome = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const filtrados = todosUsuarios.filter(usuario => {
            const nome = usuario.nome_completo || "";
            const telefone = (usuario.telefone || "").replace(/\D/g, "");
            const nomeNormalizado = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const ehNumero = /^[0-9]+$/.test(termoNumerico) && termoNumerico.length > 0;

            if (ehNumero) {
                return telefone.includes(termoNumerico);
            }

            return nomeNormalizado.includes(termoNome);
        });

        renderizarUsuarios(filtrados);
    });
});

// ==== Modal de Exclusão ====
let idParaExcluir = null;

document.addEventListener("click", (e) => {
    if (e.target.closest(".iconExcluir")) {
        const usuarioCard = e.target.closest(".usuario-card");
        idParaExcluir = usuarioCard.dataset.id;

        // Captura o nome do usuário
        const nomeUsuario = usuarioCard.querySelector(".iconNome p").textContent;

        // Atualiza o texto do modal com o nome
        const textoModal = document.getElementById("texto-modal-exclusao");
        textoModal.innerHTML = `Tem certeza que deseja excluir <strong>${nomeUsuario}</strong>?`;

        // Mostra o modal
        document.getElementById("modal-excluir").classList.remove("hidden");
    }
});


document.getElementById("cancelar-exclusao").addEventListener("click", () => {
    document.getElementById("modal-excluir").classList.add("hidden");
    idParaExcluir = null;
});

document.getElementById("confirmar-exclusao").addEventListener("click", async () => {
    if (!idParaExcluir) return;

    try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(`https://cadastro-igreja-ten.vercel.app/usuario/${idParaExcluir}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            const cardRemover = document.querySelector(`[data-id="${idParaExcluir}"]`);
            if (cardRemover) {
                cardRemover.classList.add("fade-out");
                setTimeout(() => cardRemover.remove(), 300);
            }

            todosUsuarios = todosUsuarios.filter(usuario => usuario.id !== parseInt(idParaExcluir));
            totalTexto.textContent = `Total (${todosUsuarios.length})`;

            document.getElementById("modal-excluir").classList.add("hidden");
            idParaExcluir = null;
        } else {
            alert(result.message || "Erro ao excluir o usuário.");
        }
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao conectar ao servidor.");
    }
});

// ==== Botão de Atualizar (Recarregar) ====
document.getElementById("btn-recarregar").addEventListener("click", async () => {
    const icone = document.getElementById("icone-recarregar");

    // Reinicia a animação
    icone.classList.remove("girando");
    void icone.offsetWidth; // força reflow para reiniciar animação
    icone.classList.add("girando");

    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch("https://cadastro-igreja-ten.vercel.app/usuarios", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro ao buscar usuários:", data.message);
            alert("Erro ao atualizar a lista. Faça login novamente.");
            return;
        }

        todosUsuarios = data;
        renderizarUsuarios(todosUsuarios);
    } catch (error) {
        console.error("Erro na atualização:", error);
        alert("Erro ao conectar com o servidor.");
    }
});

document.addEventListener('DOMContentLoaded', function () {
  const btnMembros = document.getElementById('btn-membros');
  const btnRelatorios = document.getElementById('btn-relatorios');
  const conteudoPrincipal = document.getElementById('conteudo-principal');
  const btnsRelatorios = document.getElementById('btns-relatorios');

  function mostrarRelatorios() {
    conteudoPrincipal.style.display = 'none';
    btnsRelatorios.style.display = 'grid';
  }

  function mostrarMembros() {
    conteudoPrincipal.style.display = 'block';
    btnsRelatorios.style.display = 'none';
  }

  btnRelatorios.addEventListener('click', () => {
    mostrarRelatorios();
    localStorage.setItem('mostrarRelatorios', 'true');
  });

  btnMembros.addEventListener('click', () => {
    mostrarMembros();
    localStorage.removeItem('mostrarRelatorios');
  });

  // Verifica no localStorage e mostra a tela correta SEM piscar a padrão
  if (localStorage.getItem('mostrarRelatorios') === 'true') {
    mostrarRelatorios();
  } else {
    mostrarMembros();
  }
});


