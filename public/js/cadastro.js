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
        document.getElementById("batismo").value = "";
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

    // 🎯 ENVIO DO FORMULÁRIO PARA O BACK-END
    const formulario = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const erroEmail = document.createElement("p"); // Criar elemento para exibir erro
    erroEmail.style.color = "red";
    erroEmail.style.fontSize = "14px";
    erroEmail.style.marginTop = "5px";
    emailInput.insertAdjacentElement("afterend", erroEmail); // Adicionar erro abaixo do e-mail

    formulario.addEventListener("submit", async function (event) {
        event.preventDefault();

        let telefoneValido = validarTelefone();
        let estadoCivilValido = validarEstadoCivil();
        let batismoValido = validarBatismo();

        if (!telefoneValido || !estadoCivilValido || !batismoValido) {
            return;
        }

        // Mostra o overlay de loading
        document.getElementById("overlay-loading").style.display = "flex";

        const formData = new FormData(formulario);
        const estadoCivilSelecionado = document.querySelector("input[name='estado_civil']:checked");
        formData.set("estado_civil", estadoCivilSelecionado ? estadoCivilSelecionado.value : "");

        const dados = {
            nome_completo: formData.get("nome"),
            data_nascimento: formData.get("nascimento"),
            telefone: formData.get("telefone"),
            email: formData.get("email"),
            endereco: formData.get("endereco"),
            estado_civil: formData.get("estado_civil"),
            data_entrada: formData.get("entrada_igreja"),
            batizado: formData.get("batizado"),
            data_batismo: formData.get("batismo") || null
        };

        try {
            const resposta = await fetch("https://cadastro-igreja-ten.vercel.app/usuario/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                // ✅ Armazena a mensagem de sucesso no localStorage
                localStorage.setItem("mensagemCadastro", resultado.message);
                
                // ✅ Redireciona para cadastrado.html
                window.location.href = "cadastrado.html";
            } else {
                if (resultado.message === "E-mail já cadastrado.") {
                    emailInput.value = ""; // Limpa o campo de e-mail
                    emailInput.focus(); // Foca no campo de e-mail
                    erroEmail.textContent = "Este e-mail já está cadastrado. Por favor, insira outro.";
                } else {
                    alert("Erro: " + resultado.message);
                }
            }
        } catch (erro) {
            console.error("Erro ao enviar os dados:", erro);
            alert("Erro ao conectar ao servidor.");
        }finally {
            // Esconde o overlay de loading após o processo
            document.getElementById("overlay-loading").style.display = "none";
        }
    });

    esconderCampo();
});
