
    const userArea = document.getElementById("userArea");
    const usuario = localStorage.getItem("usuario");

    if (usuario) {
      userArea.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
            <span>${usuario}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg hidden group-hover:block">
            <a href="perfil.html" class="block px-4 py-2 hover:bg-gray-800">👤 Ver Perfil</a>
            <a href="editar.html" class="block px-4 py-2 hover:bg-gray-800">⚙️ Alterar Dados</a>
            <button id="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-800 text-red-400">🚪 Sair</button>
          </div>
        </div>
      `;
      document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
      });
    } else {
      userArea.innerHTML = `<a href="login.html" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-lg font-semibold">Entrar</a>`;
    }

    async function carregarFilmes() {
      const lista = document.getElementById("lista");
      lista.innerHTML = `<p class="text-gray-400">🔍 Buscando recomendações...</p>`;

      try {
        const resposta = await fetch("http://localhost:3000/api/recomendacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferencias: "filmes de ação e aventura" })
        });

        const filmes = await resposta.json();
        lista.innerHTML = "";

        filmes.forEach(filme => {
          const card = document.createElement("div");
          card.className = "w-[200px] relative group cursor-pointer transition-transform transform hover:scale-105";
          card.innerHTML = `
            <img src="${filme.poster}" alt="${filme.titulo}" class="rounded-xl shadow-lg object-cover w-full h-[300px]" />
            <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <p class="text-white text-center px-2 font-semibold">${filme.titulo}</p>
            </div>
          `;
          card.addEventListener("click", () => window.open(`https://www.themoviedb.org/search?query=${encodeURIComponent(filme.titulo)}`, "_blank"));
          lista.appendChild(card);
        });
      } catch (err) {
        lista.innerHTML = `<p class="text-red-500">❌ Erro ao carregar recomendações.</p>`;
      }
    }

    carregarFilmes();
  