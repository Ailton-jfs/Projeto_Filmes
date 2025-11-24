
    const API_BASE = "http://localhost:3000/api/usuarios";
    const btnRecuperar = document.getElementById("btnRecuperar");
    const emailRecuperar = document.getElementById("emailRecuperar");
    const msgRecuperar = document.getElementById("msgRecuperar");

    btnRecuperar.addEventListener("click", async () => {
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
          msgRecuperar.textContent = data.erro || "E-mail não encontrado.";
          msgRecuperar.className = "text-red-400 mt-3 text-center";
          return;
        }

        if (response.ok) {
          msgRecuperar.textContent = data.mensagem || "Enviamos um link de recuperação para seu e-mail!";
          msgRecuperar.className = "text-green-400 mt-3 text-center";
        }

      } catch (err) {
        msgRecuperar.textContent = "Erro ao enviar solicitação. Tente novamente.";
        msgRecuperar.className = "text-red-400 mt-3 text-center";
      }
    });
  