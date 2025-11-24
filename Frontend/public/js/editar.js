
    const API_BASE = "http://localhost:3000/api/usuarios";
    const form = document.getElementById("formEditar");
    const msg = document.getElementById("mensagem");
    const senhaInput = document.getElementById("senha");

    // Seletores dos itens da lista de requisitos
    const requisitos = {
        min_chars: document.getElementById("req_min_chars"),
        upper_case: document.getElementById("req_upper_case"),
        special_char: document.getElementById("req_special_char")
    };

    // Expressões Regulares em JavaScript para feedback visual
    const REGEX_UPPER = /[A-Z]/;
    const REGEX_SPECIAL = /[!@#$%^&*()_+={}\[\]|:;,.<>?/~`]/;

    // Função para atualizar visualmente os requisitos
    function atualizarRequisitos(senha) {
        const check = (elemento, condicao) => {
            if (condicao) {
                elemento.classList.add("text-green-400");
                elemento.classList.remove("text-gray-400");
            } else {
                elemento.classList.add("text-gray-400");
                elemento.classList.remove("text-green-400");
            }
        };

        // Se o campo estiver vazio, não mostra nada verde, apenas cinza
        if (senha === '') {
             Object.values(requisitos).forEach(el => {
                el.classList.add("text-gray-400");
                el.classList.remove("text-green-400");
            });
            return;
        }

        // 1. Mínimo 8 caracteres
        check(requisitos.min_chars, senha.length >= 8);
        
        // 2. Letra maiúscula
        check(requisitos.upper_case, REGEX_UPPER.test(senha));

        // 3. Caractere especial
        check(requisitos.special_char, REGEX_SPECIAL.test(senha));
    }

    // Atualiza os requisitos em tempo real
    senhaInput.addEventListener("keyup", (e) => atualizarRequisitos(e.target.value));
    
    // Inicia a validação no carregamento
    document.addEventListener("DOMContentLoaded", () => {
        // ... (código existente para carregar o usuário)
        
        const usuario = JSON.parse(localStorage.getItem("dadosUsuario"));

        if (!usuario || !usuario.id) {
           window.location.href = "login.html";
           return;
        }

        document.getElementById("nome").value = usuario.nome;
        document.getElementById("email").value = usuario.email;

        // Garante que o feedback visual comece limpo
        atualizarRequisitos(senhaInput.value);

        form.addEventListener("submit", async (e) => {
           e.preventDefault();

           const nome = document.getElementById("nome").value.trim();
           const email = document.getElementById("email").value.trim();
           const senha = senhaInput.value; // Senha não precisa de trim

           if (!nome || !email) {
              msg.textContent = "Preencha nome e e-mail.";
              msg.className = "text-red-500 text-center mt-4";
              return;
           }
           
           // ** VALIDAÇÃO ADICIONAL PARA SENHA PREENCHIDA **
           if (senha !== '' && !senhaInput.checkValidity()) {
               msg.textContent = "❌ A nova senha não atende aos requisitos de segurança. Por favor, verifique os requisitos.";
               msg.className = "text-red-500 text-center mt-4";
               return;
           }
           // ** FIM DA VALIDAÇÃO **

           const body = { nome, email };
           if (senha) body.senha = senha;

           try {
              const response = await fetch(`${API_BASE}/${usuario.id}`, {
                 method: "PATCH",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(body)
              });

              if (!response.ok) {
                 const data = await response.json();
                 // Se houver um erro de validação no backend, ele será exibido aqui
                 msg.textContent = data.erro || "Erro ao atualizar perfil.";
                 msg.className = "text-red-500 text-center mt-4";
                 return;
              }

              const updated = await response.json();
              
             // Atualiza o localStorage, garantindo que o token não seja perdido, se houver
              localStorage.setItem("dadosUsuario", JSON.stringify(updated));
              localStorage.setItem("usuario", updated.nome); 

              msg.textContent = "✅ Perfil atualizado com sucesso!";
              msg.className = "text-green-400 text-center mt-4";

              setTimeout(() => window.location.href = "perfil.html", 1000);

           } catch (err) {
              msg.textContent = "Erro de conexão com o servidor.";
              msg.className = "text-red-500 text-center mt-4";
           }
        });
     });
     
    // Função voltar mantida fora do DOMContentLoaded
    function voltar() {
      window.location.href = "perfil.html";
    }
  