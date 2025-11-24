
        const API_KEY = "7a06d5be8eb8fc9cf8aa4de226aefdba";
        const BASE_URL = "https://api.themoviedb.org/3";
        const IMG_URL = "https://image.tmdb.org/t/p/w500";
        const usuario = localStorage.getItem("usuario");
        const adminToken = localStorage.getItem("adminToken"); // NOVO: verifica token admin
        const userArea = document.getElementById("userArea");
        const searchContainer = document.getElementById("searchContainer");
        
        // Elementos do Modal Admin
        const adminLoginModal = document.getElementById('adminLoginModal');
        const loginAdminForm = document.getElementById('loginAdminForm');
        const fecharAdminLogin = document.getElementById('fecharAdminLogin');
        const mensagemErroAdmin = document.getElementById('mensagemErroAdmin');
        const API_URL_ADMIN = "http://localhost:3000/api/admin/login";

        // 🚨 1. Redirecionamento de Admin logado
        if (adminToken) {
            // Se Admin está logado, redireciona diretamente para o Dashboard
            window.location.href = 'admin-dashboard.html'; 
        } 
        
        // 2. Navbar e Lógica de Usuário
        else if (usuario) {
            // Se Usuário comum está logado (mantido)
            searchContainer.classList.remove("hidden");
            userArea.innerHTML = `
                <div class="relative group">
                    <button class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
                        <span>${usuario}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div class="absolute right-0 top-full pt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg hidden group-hover:block">
                        <a href="perfil.html" class="block px-4 py-2 hover:bg-gray-800">👤 Ver Perfil</a>
                        <a href="editar.html" class="block px-4 py-2 hover:bg-gray-800">⚙️ Alterar Dados</a>
                        <button id="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-800 text-red-400">🚪 Sair</button>
                    </div>
                </div>`;
            document.getElementById("logout").addEventListener("click", () => {
                localStorage.removeItem("usuario");
                window.location.href = "login.html";
            });
        } 
        
        // 3. Área sem Login (Mostra Entrar e Admin)
        else {
            userArea.innerHTML = `
                <a href="login.html" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-lg font-semibold">Entrar</a>
                <button id="abrirAdminLogin" class="text-gray-300 hover:text-white transition ml-3">Área Admin</button>
            `;
            // Adiciona listener para abrir o modal de login do admin
            document.getElementById("abrirAdminLogin").addEventListener("click", () => {
                adminLoginModal.style.display = 'flex';
            });
        }

        // 4. Lógica do Modal Admin
        fecharAdminLogin.addEventListener("click", () => {
            adminLoginModal.style.display = 'none';
            mensagemErroAdmin.classList.add('hidden');
        });

        loginAdminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            mensagemErroAdmin.classList.add('hidden');
            
            const email = document.getElementById('emailAdmin').value;
            const senha = document.getElementById('senhaAdmin').value;

            try {
                const response = await fetch(API_URL_ADMIN, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (response.ok) {
                    // SUCESSO: Armazena token e redireciona
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminUser', JSON.stringify(data.admin));
                    window.location.href = 'admin-dashboard.html'; 
                } else {
                    mensagemErroAdmin.textContent = data.erro || 'Erro desconhecido. Verifique as credenciais.';
                    mensagemErroAdmin.classList.remove('hidden');
                }
            } catch (error) {
                mensagemErroAdmin.textContent = 'Erro de conexão com o servidor.';
                mensagemErroAdmin.classList.remove('hidden');
                console.error('Erro de rede/admin:', error);
            }
        });


        // Banner Duna
        document.getElementById("btnAssistirDuna").addEventListener("click", () => {
            // Agora verifica se o usuário COMUM ou ADMIN está logado
            if (usuario || adminToken) window.open("https://www.themoviedb.org/movie/693134-dune-part-two", "_blank");
            else window.location.href = "login.html";
        });

        // Criar cards (Mantido)
        function criarCard(filme) {
            if (!filme.poster_path) return null;
            const div = document.createElement("div");
            div.className = "min-w-[180px] sm:min-w-[200px] md:min-w-[220px] relative group cursor-pointer";
            div.innerHTML = `
                <img src="${IMG_URL + filme.poster_path}" class="rounded-xl shadow-lg object-cover w-full h-[280px]" alt="${filme.title}">
                <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div class="text-center"><p class="text-white text-sm font-semibold">${filme.title}</p></div>
                </div>`;
            div.addEventListener("click", () => {
                 // Agora verifica se o usuário COMUM ou ADMIN está logado
                if (usuario || adminToken) window.open(`https://www.themoviedb.org/movie/${filme.id}`, "_blank");
                else window.location.href = "login.html";
            });
            return div;
        }

        // Funções carregarFilmes (Mantido)
        async function carregarFilmes(endpoint, containerId) {
            const container = document.getElementById(containerId);
            try {
                const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR&page=1`);
                const data = await res.json();
                container.innerHTML = "";
                data.results.forEach(f => {
                    const card = criarCard(f);
                    if (card) container.appendChild(card);
                });
            } catch {
                container.innerHTML = `<p class="text-gray-400">Erro ao carregar filmes</p>`;
            }
        }

        carregarFilmes("/movie/popular", "populares");
        carregarFilmes("/movie/now_playing", "lancamentos");
        carregarFilmes("/movie/top_rated", "descubra");

        // Busca
        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("keydown", async (e) => {
            if (e.key === "Enter" && searchInput.value.trim() !== "") {
                const query = searchInput.value.trim();
                const container = document.getElementById("buscaContainer");
                const secao = document.getElementById("resultadosBusca");
                secao.classList.remove("hidden");
                container.innerHTML = `<p class="text-gray-400">Buscando "${query}"...</p>`;
                try {
                    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    container.innerHTML = "";
                    if (data.results.length === 0) {
                        container.innerHTML = `<p class="text-gray-400">Nenhum filme encontrado.</p>`;
                        return;
                    }
                    data.results.forEach(f => {
                        const card = criarCard(f);
                        if (card) container.appendChild(card);
                    });
                } catch {
                    container.innerHTML = `<p class="text-gray-400">Erro na busca.</p>`;
                }
            }
        });

        // Controle de carrossel (setas)
        document.querySelectorAll(".carousel-nav").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = document.getElementById(btn.dataset.target);
                const scrollAmount = 400;
                if (btn.classList.contains("left")) target.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                else target.scrollBy({ left: scrollAmount, behavior: "smooth" });
            });
        });

        // ===========================================
        // RECOMENDAÇÕES PERSONALIZADAS (MANTIDO)
        // ===========================================
        const btnRecomendar = document.getElementById("btnRecomendar");
        const inputPreferencias = document.getElementById("inputPreferencias");
        const recomendacoesContainer = document.getElementById("recomendacoesContainer");

        btnRecomendar.addEventListener("click", async () => {
            const preferencias = inputPreferencias.value.trim();

            if (preferencias.length < 3) {
                alert("Digite suas preferências para gerar recomendações.");
                return;
            }

            recomendacoesContainer.innerHTML = `<p class="text-gray-300">🔄 Gerando recomendações...</p>`;

            try {
                const response = await fetch("http://localhost:3000/api/recomendacoes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ preferencias }),
                });

                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0) {
                    recomendacoesContainer.innerHTML = `<p class="text-gray-300">Nenhuma recomendação encontrada.</p>`;
                    return;
                }

                recomendacoesContainer.innerHTML = "";

                data.forEach((item) => {
                    const card = document.createElement("div");
                    card.className = "min-w-[180px] sm:min-w-[200px] md:min-w-[220px] relative group cursor-pointer";

                    const posterImg = item.poster || "https://via.placeholder.com/500x750?text=Sem+Imagem";

                    card.innerHTML = `
                        <img src="${posterImg}" class="rounded-xl shadow-lg object-cover w-full h-[280px]">
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <div class="text-center">
                                <p class="text-white text-sm font-semibold">${item.titulo}</p>
                                <p class="text-gray-300 text-xs mt-1">${item.ano || ""}</p>
                            </div>
                        </div>
                    `;

                    card.addEventListener("click", () => window.open(item.link_tmdb, "_blank"));

                    recomendacoesContainer.appendChild(card);
                });
            } catch (erro) {
                recomendacoesContainer.innerHTML = `<p class="text-red-400">❌ Erro ao gerar recomendações.</p>`;
                console.error("Erro:", erro);
            }
        });
    