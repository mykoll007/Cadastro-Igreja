document.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem("emailRecuperacao");

    // Verifica se o email está no localStorage. Se não estiver, redireciona pro início.
    if (!email) {
        window.location.href = "../index.html";
        return;
    }
    
    const form = document.querySelector("form");
    const senhaInput = document.querySelectorAll("input[type='password']")[0];
    const confirmarSenhaInput = document.querySelectorAll("input[type='password']")[1];
    const mensagemErro = document.getElementById("mensagem-erro");
    const overlay = document.getElementById("overlay-loading");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = "";

        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        const email = localStorage.getItem("emailRecuperacao");

        if (!email) {
            mensagemErro.textContent = "Email não encontrado. Volte para o início do processo.";
            return setTimeout(() => {
                window.location.href = "recuperar.html";
            }, 2000);
        }

        overlay.style.display = "flex"; // Mostra o loading

        try {
            const response = await fetch("http://localhost:3600/admin/redefinir", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha,
                    confirmarSenha
                })
            });

            const data = await response.json();

            setTimeout(() => {
                overlay.style.display = "none"; // Oculta o loading

                if (!response.ok) {
                    mensagemErro.textContent = data.message || "Erro ao redefinir a senha.";
                } else {
                    localStorage.removeItem("emailRecuperacao");
                    sessionStorage.setItem("mensagem-sucesso", data.message);
                    window.location.href = "../index.html";
                }
            }, 1000); // Pequeno delay pra suavizar
        } catch (error) {
            setTimeout(() => {
                overlay.style.display = "none"; // Oculta o loading
                console.error(error);
                mensagemErro.textContent = "Erro de conexão. Tente novamente mais tarde.";
            }, 1000);
        }
    });
});
