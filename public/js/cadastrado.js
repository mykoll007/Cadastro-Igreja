document.addEventListener("DOMContentLoaded", function () {
    // 🔍 Verifica se existe a mensagem de cadastro no localStorage
    const mensagem = localStorage.getItem("mensagemCadastro");

    if (!mensagem) {
        // 🚫 Se não houver mensagem, redireciona para a página de cadastro
        window.location.href = "cadastro.html";
        return; // Impede que o restante do código seja executado
    }

    // ✅ Exibe a mensagem e depois remove do localStorage
    document.getElementById("mensagem").textContent = mensagem;
    localStorage.removeItem("mensagemCadastro");
});

// ✅ Função para voltar à tela de cadastro
function voltarParaHome() {
    window.location.href = "cadastro.html"; // Redireciona para a página correta
}
