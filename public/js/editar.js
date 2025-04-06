// Captura o ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Recupera o token salvo no localStorage
const token = sessionStorage.getItem("token");

// Função auxiliar para formatar a data no formato yyyy-MM-dd
function formatarData(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    data.setDate(data.getDate() + 1); // Soma +1 dia
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}


// Verifica se há ID e Token válidos
if (!id || !token) {
    window.location.href = "inicio.html"; // Redireciona se estiver errado
} else {
    fetch(`https://cadastro-igreja-ten.vercel.app/usuario/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Header de autenticação
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Erro na requisição");
        }
        return res.json();
    })
    .then(usuario => {

        // Atualiza o nome na div de exibição
        document.getElementById("nome-usuario-display").textContent = usuario.nome_completo;

        // Preenche os campos do formulário com os dados do usuário
        document.getElementById("nome").value = usuario.nome_completo || "";
        document.getElementById("nascimento").value = formatarData(usuario.data_nascimento);
        document.getElementById("telefone").value = usuario.telefone || "";
        document.getElementById("email").value = usuario.email || "";
        document.getElementById("endereco").value = usuario.endereco || "";
        document.getElementById("entrada_igreja").value = formatarData(usuario.data_entrada);

        // Estado civil (radio)
        const estadoCivil = document.querySelectorAll('input[name="estado_civil"]');
        estadoCivil.forEach(el => {
            if (el.value === usuario.estado_civil) el.checked = true;
        });

        // Batismo (radio + data)
        if (usuario.batizado === "Sim") {
            document.querySelector('input[name="batizado"][value="sim"]').checked = true;
            document.getElementById("data-batismo").style.display = "block";
            document.getElementById("batismo").value = formatarData(usuario.data_batismo);
        } else {
            document.querySelector('input[name="batizado"][value="nao"]').checked = true;
            document.getElementById("data-batismo").style.display = "none";
        }
    })
    .catch(error => {
        console.error(error);
        alert("Erro ao carregar os dados do usuário.");
    });
}

//Deixar os campos do formulário melhor para editar
document.addEventListener("DOMContentLoaded", function () {
    // 🎯 BLOQUEAR NÚMEROS NO CAMPO NOME E GARANTIR PRIMEIRA LETRA MAIÚSCULA
    const nomeInput = document.getElementById("nome");

    nomeInput.addEventListener("keydown", function (event) {
        let tecla = event.key;
        if (!/^[A-Za-zÀ-ÿ\s]$/.test(tecla) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(tecla)) {
            event.preventDefault();
        }
    });

    nomeInput.addEventListener("input", function () {
        this.value = this.value.toLowerCase().replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
    });

    // 🎯 BLOQUEAR NÚMEROS NO CAMPO ENDEREÇO E MAIÚSCULA NAS PALAVRAS
const enderecoInput = document.getElementById("endereco");

enderecoInput.addEventListener("keydown", function (event) {
    let tecla = event.key;
    if (!/^[A-Za-zÀ-ÿ0-9\s.,º°\-]$/.test(tecla) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(tecla)) {
        event.preventDefault();
    }
});

enderecoInput.addEventListener("input", function () {
    this.value = this.value.toLowerCase().replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
});

    // 🎯 PERMITIR APENAS UM CHECKBOX SELECIONADO NO ESTADO CIVIL
    const checkboxes = document.querySelectorAll("input[name='estado_civil']");
    const erroEstadoCivil = document.getElementById("erro-estado-civil");

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            checkboxes.forEach((cb) => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    function validarEstadoCivil() {
        let selecionado = Array.from(checkboxes).some((checkbox) => checkbox.checked);
        if (!selecionado) {
            erroEstadoCivil.textContent = "Por favor, selecione seu estado civil.";
            erroEstadoCivil.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        } else {
            erroEstadoCivil.textContent = "";
        }
        return true;
    }

    // 🎯 FORMATAR TELEFONE AUTOMATICAMENTE E VALIDAR
    const telefoneInput = document.getElementById("telefone");
    const erroTelefone = document.getElementById("erro-telefone");

    telefoneInput.addEventListener("input", function () {
        let numero = this.value.replace(/\D/g, "");
        if (numero.length > 10) {
            numero = numero.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (numero.length > 6) {
            numero = numero.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (numero.length > 2) {
            numero = numero.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (numero.length > 0) {
            numero = numero.replace(/^(\d{0,2})/, "($1");
        }
        this.value = numero;

        if (numero.length < 11) {
            erroTelefone.textContent = "Número inválido. O formato deve ser (XX) XXXXX-XXXX.";
        } else {
            erroTelefone.textContent = "";
        }
    });

    function validarTelefone() {
        let telefone = telefoneInput.value.replace(/\D/g, "");
        if (telefone.length < 11) {
            erroTelefone.textContent = "Número inválido. O formato deve ser (XX) XXXXX-XXXX.";
            telefoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        }
        return true;
    }

    // 🎯 LIMITAR O ANO EM CAMPOS DE DATA PARA 4 DÍGITOS SEM TRAVAR O CAMPO
    function limitarAno(input) {
        input.addEventListener("input", function () {
            let partes = input.value.split("-");
            if (partes.length === 3) {
                let ano = partes[0];

                if (ano.length > 4) {
                    partes[0] = ano.substring(0, 4);
                    input.value = partes.join("-");
                }
            }
        });
    }

    limitarAno(document.getElementById("nascimento"));
    limitarAno(document.getElementById("entrada_igreja"));
    limitarAno(document.getElementById("batismo"));
    
// 🎯 VALIDAR SE A DATA INFORMADA É ANTERIOR À DATA ATUAL E EXIBIR NO HTML
function validarData(input, erroId) {
    const erroMensagem = document.getElementById(erroId);

    input.addEventListener("change", function () {
        const dataSelecionada = new Date(this.value);
        const dataAtual = new Date();
        dataAtual.setHours(0, 0, 0, 0);
        dataSelecionada.setHours(0, 0, 0, 0);

        if (dataSelecionada >= dataAtual) {
            erroMensagem.textContent = "A data deve ser anterior à data de hoje.";
            this.value = "";
            this.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            erroMensagem.textContent = "";
        }
    });
}

// Aplica a validação nas datas
validarData(document.getElementById("nascimento"), "erro-nascimento");
validarData(document.getElementById("entrada_igreja"), "erro-entrada");
validarData(document.getElementById("batismo"), "erro-data-batismo");


    // 🎯 MOSTRAR/OCULTAR DATA DO BATISMO
    function mostrarCampo() {
        document.getElementById("data-batismo").style.display = "block";
    }

    function esconderCampo() {
        document.getElementById("data-batismo").style.display = "none";
    }

    const radioBatizado = document.querySelectorAll("input[name='batizado']");
    const erroBatismo = document.getElementById("erro-batismo");
    const erroDataBatismo = document.getElementById("erro-data-batismo");

    function validarBatismo() {
        let selecionado = false;
        let valorSelecionado = "";
        radioBatizado.forEach((radio) => {
            if (radio.checked) {
                selecionado = true;
                valorSelecionado = radio.value;
            }
        });

        if (!selecionado) {
            erroBatismo.textContent = "Por favor, selecione se já é batizado.";
            erroBatismo.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        } else {
            erroBatismo.textContent = "";
        }

        const dataBatismo = document.getElementById("batismo");
        if (valorSelecionado === "sim" && !dataBatismo.value) {
            erroDataBatismo.textContent = "Informe a data do batismo.";
            dataBatismo.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        } else {
            erroDataBatismo.textContent = "";
        }
        return true;
    }

    radioBatizado.forEach((radio) => {
        radio.addEventListener("change", function () {
            if (this.value === "sim") {
                mostrarCampo();
            } else {
                esconderCampo();
            }
        });
    });
    esconderCampo();
});



// Valida estado civil
function validarEstadoCivil() {
    const estadoCivilSelecionado = document.querySelector("input[name='estado_civil']:checked");
    if (!estadoCivilSelecionado) {
        alert("Por favor, selecione um estado civil.");
        return false;
    }
    return true;
}

// Valida telefone
function validarTelefone() {
    const telefone = document.getElementById("telefone").value.trim();
    const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!regexTelefone.test(telefone)) {
        alert("Telefone inválido. Exemplo: (11) 91234-5678");
        return false;
    }
    return true;
}

// Valida batismo
function validarBatismo() {
    const batizado = document.querySelector("input[name='batizado']:checked");
    const dataBatismo = document.getElementById("batismo").value;

    if (!batizado) {
        alert("Por favor, selecione se é batizado.");
        return false;
    }

    if (batizado.value === "sim" && dataBatismo === "") {
        alert("Por favor, preencha a data do batismo.");
        return false;
    }

    return true;
}

// Alterar o Usuário
document.getElementById("btn-alterar").addEventListener("click", async function (e) {
    e.preventDefault();

    const form = document.querySelector("form");

    // Força a validação HTML antes de continuar
    if (!form.checkValidity()) {
        form.reportValidity(); // Mostra os avisos nativos do navegador
        return;
    }

    // Validações personalizadas
    const estadoCivilSelecionado = document.querySelector('input[name="estado_civil"]:checked');
    if (!estadoCivilSelecionado) {
        document.getElementById("erro-estado-civil").innerText = "Selecione um estado civil.";
        return;
    } else {
        document.getElementById("erro-estado-civil").innerText = "";
    }

    const batizado = document.querySelector('input[name="batizado"]:checked');
    if (!batizado) {
        document.getElementById("erro-batismo").innerText = "Selecione se é batizado.";
        return;
    } else {
        document.getElementById("erro-batismo").innerText = "";
    }

    if (batizado.value === "sim") {
        const dataBatismo = document.getElementById("batismo").value;
        if (!dataBatismo) {
            document.getElementById("erro-data-batismo").innerText = "Preencha a data do batismo.";
            return;
        } else {
            document.getElementById("erro-data-batismo").innerText = "";
        }
    }

    // Coleta dados do formulário
    const nome = document.getElementById("nome").value.trim();
    const nascimento = document.getElementById("nascimento").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const entrada_igreja = document.getElementById("entrada_igreja").value;
    const estado_civil = estadoCivilSelecionado.value;
    const batismoSelecionado = batizado.value === "sim" ? "Sim" : "Não";
    const data_batismo = document.getElementById("batismo").value || null;

    try {
        document.getElementById("overlay-loading").style.display = "flex";

        const res = await fetch(`https://cadastro-igreja-ten.vercel.app/usuario/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nome_completo: nome,
                data_nascimento: nascimento,
                telefone,
                email,
                endereco,
                estado_civil,
                data_entrada: entrada_igreja,
                batizado: batismoSelecionado,
                data_batismo
            })
        });

        const data = await res.json();

        if (res.ok) {
            const msg = document.getElementById("mensagem-atualizado");
            msg.textContent = "Usuário atualizado com sucesso!";
            msg.style.color = "green";
        } else {
            alert(data.message || "Erro ao atualizar.");
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao atualizar os dados.");
    } finally {
        setTimeout(() => {
            document.getElementById("overlay-loading").style.display = "none";
        }, 1000);
}
});

// ==== Modal de Exclusão ====

let idParaExcluir = null;

// Botão "Excluir" do formulário
document.getElementById("btn-excluir").addEventListener("click", function (e) {
    e.preventDefault();

    // Pegue o ID do usuário (você precisa ter esse valor no escopo ou em um input hidden)
    const id = document.getElementById("id_usuario").value; // exemplo: input hidden no formulário
    idParaExcluir = id;

    const nome = document.getElementById("nome").value;
    const textoModal = document.getElementById("texto-modal-exclusao");
    textoModal.innerHTML = `Tem certeza que deseja excluir <strong>${nome}</strong>?`;

    document.getElementById("modal-excluir").classList.remove("hidden");
});

// Cancelar modal
document.getElementById("cancelar-exclusao").addEventListener("click", () => {
    document.getElementById("modal-excluir").classList.add("hidden");
    idParaExcluir = null;
});

// Confirmar exclusão
document.getElementById("confirmar-exclusao").addEventListener("click", async () => {
    if (!id) return;

    try {
        
        const token = sessionStorage.getItem("token");
        

        const response = await fetch(`https://cadastro-igreja-ten.vercel.app/usuario/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            // alert("Usuário excluído com sucesso!");
            setTimeout(() => {
                window.location.href = "inicio.html";
            }, 300)
        } else {
            alert(result.message || "Erro ao excluir o usuário.");
        }
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao conectar ao servidor, verifique sua Internet");
    }
});

document.getElementById('link-retornar').addEventListener('click', function(event) {
    event.preventDefault(); // impede o redirecionamento imediato
   
    // Mostra a bolinha de carregamento
    document.getElementById('overlay-loading').style.display = 'flex';
  
    const urlDestino = event.currentTarget.href;
  
    setTimeout(() => {
      window.location.href = urlDestino;
    }, 1000);
  });
  
  



