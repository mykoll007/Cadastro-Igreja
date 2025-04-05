document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const cadastroBtn = document.getElementById("cadastroBtn");
    const formLogin = document.getElementById("formLogin");
    const formCadastro = document.getElementById("formCadastro");
    const titulo = document.querySelector("h2");

    const mensagemErro = document.getElementById("mensagem-erro");
    const mensagemSucesso = document.getElementById("mensagem-sucesso");
    const overlay = document.getElementById("overlay-loading");

    // 🔥 VERIFICA SE EXISTE MENSAGEM DE SUCESSO NO STORAGE
    const msgSucesso = sessionStorage.getItem("mensagem-sucesso");
    console.log("Mensagem sucesso:", msgSucesso);
    if (msgSucesso) {
        mensagemSucesso.textContent = msgSucesso;
        mensagemSucesso.style.color = "green";
        mensagemSucesso.scrollIntoView({ behavior: "smooth", block: "center" });
        sessionStorage.removeItem("mensagem-sucesso");
    }

    cadastroBtn.addEventListener("click", () => {
        formLogin.style.display = "none";
        formCadastro.style.display = "inline-block";
        titulo.textContent = "Cadastre sua conta";

        cadastroBtn.style.backgroundColor = "white";
        cadastroBtn.style.border = "1px solid white";
        cadastroBtn.style.color = "black";

        loginBtn.style.backgroundColor = "unset";
        loginBtn.style.border = "unset";
        loginBtn.style.color = "#7D7D91";

        mensagemErro.textContent = "";
        mensagemSucesso.textContent = "";
    });

    loginBtn.addEventListener("click", () => {
        formCadastro.style.display = "none";
        formLogin.style.display = "inline-block";
        titulo.textContent = "Acesse sua conta";

        loginBtn.style.backgroundColor = "white";
        loginBtn.style.border = "1px solid white";
        loginBtn.style.color = "black";

        cadastroBtn.style.backgroundColor = "unset";
        cadastroBtn.style.border = "unset";
        cadastroBtn.style.color = "#7D7D91";

        mensagemErro.textContent = "";
    });

    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = "";
        mensagemSucesso.textContent = "";
        overlay.style.display = "flex";

        const email = document.getElementById("emailCadastro").value.trim();
        const senha = document.getElementById("senhaCadastro").value.trim();
        const confirmarSenha = document.getElementById("confirmaSenha").value.trim();
        const codigoCadastro = document.getElementById("codigoCadastro").value.trim();

        try {
            const [response] = await Promise.all([
                fetch("http://localhost:3600/admin/cadastrar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, senha, confirmarSenha, codigoCadastro })
                }),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            const data = await response.json();
            overlay.style.display = "none";

            if (!response.ok) {
                mensagemErro.style.color = "red";
                mensagemErro.textContent = data.message || "Erro ao cadastrar.";
                mensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                sessionStorage.setItem("mensagem-sucesso", "Cadastro realizado com sucesso!");
                formCadastro.reset();
                window.location.reload(); // ✅ ESSA LINHA FAZ A MÁGICA ACONTECER!
            }
        } catch (error) {
            overlay.style.display = "none";
            console.error("Erro:", error);
            mensagemErro.style.color = "red";
            mensagemErro.textContent = "Erro ao conectar com o servidor.";
            mensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensagemErro.textContent = "";
        overlay.style.display = "flex";

        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value.trim();

        try {
            const [response] = await Promise.all([
                fetch("http://localhost:3600/admin/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, senha })
                }),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            const data = await response.json();
            overlay.style.display = "none";

            if (!response.ok) {
                mensagemErro.style.color = "red";
                mensagemErro.textContent = data.message || "Erro ao fazer login.";
                mensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                console.log("Token recebido:", data.token);
                sessionStorage.setItem("token", data.token); // Armazena o token

                // Redireciona para a página protegida
                setTimeout(() => {
                    window.location.href = "pages/inicio.html";
                }, 300)
            }
        } catch (error) {
            overlay.style.display = "none";
            console.error("Erro ao logar:", error);
            mensagemErro.style.color = "red";
            mensagemErro.textContent = "Erro ao conectar com o servidor.";
            mensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });


});
