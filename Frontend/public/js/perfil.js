
    // --- Funções de navegação ---
    function voltar() {
      window.location.href = "index.html";
    }

    function editarPerfil() {
      window.location.href = "editar.html";
    }

    function sair() {
      localStorage.removeItem("usuario");
      localStorage.removeItem("dadosUsuario");
      window.location.href = "login.html";
    }

    // --- Carregar dados do usuário ---
    const dados = JSON.parse(localStorage.getItem("dadosUsuario"));
    const nomeLocal = localStorage.getItem("usuario");

    if (dados) {
      document.getElementById("nomeUsuario").textContent = dados.nome || nomeLocal;
      document.getElementById("emailUsuario").textContent = dados.email || "E-mail não informado";
    } else if (nomeLocal) {
      document.getElementById("nomeUsuario").textContent = nomeLocal;
      document.getElementById("emailUsuario").textContent = "E-mail não informado";
    } else {
      // se o usuário não estiver logado, redireciona automaticamente
      window.location.href = "login.html";
    }
  