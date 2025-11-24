
    const API_BASE = "http://localhost:3000/api/usuarios";
    const senhaInput = document.getElementById("senha");
    const formCadastro = document.getElementById("formCadastro");

    function voltar() {
      window.location.href = "index.html";
    }
    // Seletores dos itens da lista de requisitos
    const requisitos = {
        min_chars: document.getElementById("req_min_chars"),
        upper_case: document.getElementById("req_upper_case"),
        special_char: document.getElementById("req_special_char")
    };

    // Expressões Regulares em JavaScript para feedback visual
    const REGEX_UPPER = /[A-Z]/;
    const REGEX_SPECIAL = /[!@#$%^&*()_+={}\[\]|:;\"'<,>.?/~`]/;

    // Função para atualizar visualmente os requisitos
    function atualizarRequisitos(senha) {
        const check = (elemento, condicao) => {
            if (condicao) {
                elemento.classList.add("text-green-500");
                elemento.classList.remove("text-gray-400");
            } else {
                elemento.classList.add("text-gray-400");
                elemento.classList.remove("text-green-500");
            }
        };

        // 1. Mínimo 8 caracteres
        check(requisitos.min_chars, senha.length >= 8);
        
        // 2. Letra maiúscula
        check(requisitos.upper_case, REGEX_UPPER.test(senha));

        // 3. Caractere especial
        check(requisitos.special_char, REGEX_SPECIAL.test(senha));
    }

    // Atualiza os requisitos em tempo real
    senhaInput.addEventListener("keyup", (e) => atualizarRequisitos(e.target.value));
    
    // Roda a função uma vez no carregamento caso o navegador preencha
    atualizarRequisitos(senhaInput.value); 


    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = senhaInput.value; // Pegamos o valor com o .trim() para garantir
      const preferencias = document.getElementById("preferencias").value.trim();

      // **Validação JavaScript de último recurso no frontend (Gatilho para o alert)**
      if (!senhaInput.checkValidity()) {
          // O checkValidity verifica o atributo pattern e minlength
          alert("❌ A senha não atende aos requisitos de segurança. Por favor, verifique os requisitos listados abaixo do campo.");
          return;
      }
      // Fim da Validação JavaScript
      
      try {
        const res = await fetch(`${API_BASE}/cadastrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha, preferencias })
        });

        const data = await res.json();
        
        if (!res.ok) {
            // O erro agora pode vir do backend se a validação falhar lá
            alert("❌ " + (data.erro || "Erro desconhecido ao cadastrar.")); 
            return;
        }

        alert("Conta criada com sucesso!");
        window.location.href = "login.html";

      } catch (err) {
        alert("Erro ao cadastrar. Verifique se o servidor backend está ativo (porta 3000).");
        console.error(err);
      }
    });
  