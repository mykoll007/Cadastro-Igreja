document.addEventListener("DOMContentLoaded", () => {
    const formRecuperar = document.getElementById("formRecuperar");
    const overlay = document.getElementById("overlay-loading");

    // Criar mensagem dinâmica
    const mensagem = document.createElement("p");
    mensagem.style.marginTop = "12px";
    mensagem.style.fontWeight = "500";
    formRecuperar.appendChild(mensagem);

    formRecuperar.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagem.textContent = "";
        mensagem.style.color = "";

        const email = document.getElementById("emailLogin").value.trim();

        if (!email) {
            mensagem.textContent = "Por favor, preencha o e-mail.";
            mensagem.style.color = "red";
            return;
        }

        overlay.style.display = "flex";

        try {
            const response = await fetch("http://localhost:3600/admin/recuperar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                // Espera 1 segundo antes de mostrar erro
                setTimeout(() => {
                    overlay.style.display = "none";
                    mensagem.textContent = data.message || "Erro ao enviar o código.";
                    mensagem.style.color = "red";
                }, 1000);
            } else {
                overlay.style.display = "none";
                mensagem.textContent = data.message;
                mensagem.style.color = "green";

                localStorage.setItem("emailRecuperacao", email);
                window.location.href = "codigo.html";
            }
        } catch (error) {
            setTimeout(() => {
                overlay.style.display = "none";
                console.error("Erro:", error);
                mensagem.textContent = "Erro ao conectar com o servidor.";
                mensagem.style.color = "red";
            }, 1000);
        }
    });
});
