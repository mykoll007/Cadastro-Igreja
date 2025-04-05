document.addEventListener("DOMContentLoaded", () => {

    const email = localStorage.getItem("emailRecuperacao");

    // ✅ Verifica se a pessoa acessou direto a página sem passar pelo fluxo correto
    if (!email) {
        window.location.href = "../index.html"; // ou "index.html" dependendo da estrutura do seu projeto
        return;
    }

    const form = document.getElementById("formCodigo");
    const inputs = document.querySelectorAll(".codigo");
    const overlay = document.getElementById("overlay-loading");

    // Foco automático entre inputs
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    const mensagemErro = document.getElementById("mensagem-erro");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = ""; // limpa mensagens anteriores
    
        const email = localStorage.getItem("emailRecuperacao");
    
        if (!email) {
            mensagemErro.textContent = "Email não encontrado. Por favor, volte para a página anterior.";
            return setTimeout(() => {
                window.location.href = "recuperar.html";
            }, 1500);
        }
    
        const codigo = Array.from(inputs).map(input => input.value).join("");
    
        if (codigo.length !== 5 || !/^\d+$/.test(codigo)) {
            mensagemErro.textContent = "Digite os 5 dígitos corretamente.";
            return;
        }
    
        overlay.style.display = "flex";
    
        try {
            const response = await fetch("http://localhost:3600/admin/validar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, codigo_recuperacao: codigo })
            });
    
            const data = await response.json();
    
            setTimeout(() => {
                overlay.style.display = "none";
    
                if (!response.ok) {
                    mensagemErro.textContent = data.message || "Código incorreto.";
                
                    inputs.forEach(input => input.value = "");
                    inputs[0].focus(); 
                } else {
                    window.location.href = "redefinir.html";
                }
            }, 1000);
        } catch (error) {
            setTimeout(() => {
                overlay.style.display = "none";
                console.error(error);
                mensagemErro.textContent = "Erro ao validar o código. Tente novamente.";
            }, 1000);
        }
    });
    
});
