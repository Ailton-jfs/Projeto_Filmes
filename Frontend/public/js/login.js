
    const API_BASE = "http://localhost:3000/api/usuarios";
    const mensagem = document.getElementById("mensagem");

    // LOGIN
    function voltar() {
      window.location.href = "index.html";
    }
    document.getElementById("formLogin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();

      if (!email || !senha) {
        mensagem.textContent = "Preencha todos os campos.";
        mensagem.className = "text-red-500 text-center mt-4";
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha })
        });
        const data = await response.json();

        if (response.status === 404) {
          mensagem.textContent = "Usuário não cadastrado.";
          mensagem.className = "text-yellow-400 text-center mt-4";
          setTimeout(() => window.location.href = "cadastro.html", 1500);
          return;
        }

        if (response.status === 401) {
          mensagem.textContent = "Senha incorreta!";
          mensagem.className = "text-red-500 text-center mt-4";
          return;
        }

        if (response.ok) {
          // 🔹 Salva o objeto completo do usuário no localStorage
          localStorage.setItem("dadosUsuario", JSON.stringify(data.usuario));
          localStorage.setItem("usuario", data.usuario.nome);

          mensagem.textContent = "Login realizado com sucesso!";
          mensagem.className = "text-green-400 text-center mt-4";
          setTimeout(() => window.location.href = "index.html", 1000);
        }

      } catch (err) {
        mensagem.textContent = "Erro de conexão com o servidor.";
        mensagem.className = "text-red-500 text-center mt-4";
      }
    });

    // MODAL RECUPERAR SENHA
    const modal = document.getElementById("modalRecuperar");
    const emailRecuperar = document.getElementById("emailRecuperar");
    const msgRecuperar = document.getElementById("msgRecuperar");

    document.getElementById("esqueceuSenha").onclick = () => modal.classList.remove("hidden");
    document.getElementById("fecharModal").onclick = () => { modal.classList.add("hidden"); msgRecuperar.textContent = ""; };

    document.getElementById("btnRecuperar").onclick = async () => {
      const email = emailRecuperar.value.trim();
      if (!email) {
        msgRecuperar.textContent = "Digite um e-mail válido.";
        msgRecuperar.className = "text-red-400 mt-3 text-center";
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/recuperarSenha`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (response.status === 404) {
          msgRecuperar.textContent = data.erro;
          msgRecuperar.className = "text-red-400 mt-3 text-center";
          return;
        }

        if (response.ok) {
          msgRecuperar.textContent = data.mensagem;
          msgRecuperar.className = "text-green-400 mt-3 text-center";
          setTimeout(() => window.location.href = "index.html", 1000);
        }

      } catch (err) {
        msgRecuperar.textContent = "Erro ao enviar solicitação.";
        msgRecuperar.className = "text-red-400 mt-3 text-center";
      }
    };
  