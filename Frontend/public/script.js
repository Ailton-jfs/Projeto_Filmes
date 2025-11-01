// Pega o nome do usuário e exibe
const nome = localStorage.getItem("usuario") || "Usuário";
// O ID 'usuario' deve estar no HTML (recomendacoes.html) para esta linha funcionar
const usuarioEl = document.getElementById("usuario");
if (usuarioEl) usuarioEl.textContent = nome;

// Pega as preferências armazenadas
const preferencias = localStorage.getItem("preferencias") || "";

// Containers das recomendações
const tmdbContainer = document.getElementById("tmdbFilmes");
const iaContainer = document.getElementById("iaFilmes");
const resultado = document.getElementById("resultado");

// Garante que os containers foram encontrados antes de tentar usá-los
if (tmdbContainer && iaContainer && resultado) {
    // Estilo Netflix para o Loading
    tmdbContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>🎬 Carregando recomendações do TMDB...</p>";
    iaContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>🤖 Carregando recomendações da IA...</p>";
    resultado.classList.remove("hidden");
}


// Função para gerar o HTML do Card do TMDB (COM IMAGEM)
function createTmdbCardHTML(f) {
    // Classes do card com imagem (rounded-t-lg)
    const cardClasses = "bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-2xl";
    
    let linksHTML = "";
    if (f.links && f.links.length > 0) {
        linksHTML = `<div class="mt-3 px-3 pb-3 flex flex-wrap justify-center gap-2">` +
            f.links.map(l => 
                `<a href="${l.url}" target="_blank" class="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200">
                    ${l.plataforma}
                </a>`
            ).join("") +
            `</div>`;
    } else {
        linksHTML = `<div class="mt-3 px-3 pb-3 text-center"><span class="text-xs text-gray-500">Sem streaming (BR) no momento.</span></div>`;
    }

    // Estrutura HTML do Card COM IMAGEM
    return `
        <div class="${cardClasses}">
            <img src="${f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : "https://via.placeholder.com/200x300?text=Sem+Imagem"}" 
                alt="${f.title || f.name}" class="w-full h-auto object-cover rounded-t-lg">
            <div class="p-3">
                <h3 class="font-bold text-base mt-2">${f.title || f.name}</h3>
                <p class="text-xs text-gray-400 mt-1">${(f.overview || "Sem descrição").substring(0, 90)}...</p>
            </div>
            ${linksHTML}
        </div>
    `;
}

// Função para gerar o HTML do Card da IA (SEM IMAGEM)
function createIaCardHTML(f) {
    // Classes do card SEM imagem (rounded-lg completo)
    const cardClasses = "bg-gray-800 p-4 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl h-full";
    
    let linksHTML = "";
    if (f.links && f.links.length > 0) {
        linksHTML = `<div class="mt-3 flex flex-wrap justify-center gap-2">` +
            f.links.map(l => 
                `<a href="${l.url}" target="_blank" class="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200">
                    ${l.plataforma}
                </a>`
            ).join("") +
            `</div>`;
    } else {
        linksHTML = `<div class="mt-3 text-center"><span class="text-xs text-gray-500">Sem links encontrados.</span></div>`;
    }

    // Estrutura HTML do Card APENAS COM TEXTO
    return `
        <div class="${cardClasses}">
            <h3 class="font-bold text-lg text-center">${f.titulo}</h3>
            <p class="text-sm text-gray-400 mt-2">${f.descricao || "Sem descrição."}</p>
            ${linksHTML}
        </div>
    `;
}


// Função principal
async function carregarRecomendacoes() {
    try {
        // Verifica se os elementos HTML foram carregados (para evitar o erro "null")
        if (!tmdbContainer || !iaContainer || !resultado) {
            console.error("❌ Erro: Elementos HTML (TMDB/IA/Resultado) não encontrados. Verifique os IDs no HTML.");
            return;
        }

        // 🔹 1️⃣ Busca no TMDB via backend
        const tmdbRes = await fetch(`http://localhost:3000/api/tmdb?busca=${encodeURIComponent(preferencias)}`);
        const filmesTMDB = await tmdbRes.json();

        // Renderiza TMDB (usando a função COM IMAGEM)
        tmdbContainer.innerHTML = "";
        if (filmesTMDB.length === 0) {
            tmdbContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Nenhum filme do TMDB encontrado.</p>";
        } else {
            filmesTMDB.slice(0, 10).forEach(f => {
                tmdbContainer.innerHTML += createTmdbCardHTML(f);
            });
        }


        // 🔹 2️⃣ Busca recomendações da IA
        const chatRes = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, preferencias }),
        });

        const chatData = await chatRes.json();
        const filmesIA = chatData.recomendacoes || [];

        // Renderiza IA (usando a função SEM IMAGEM)
        iaContainer.innerHTML = "";
        if (filmesIA.length === 0) {
            iaContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Nenhuma recomendação da IA disponível.</p>";
        } else {
            filmesIA.forEach(f => {
                iaContainer.innerHTML += createIaCardHTML(f);
            });
        }


    } catch (err) {
        console.error("❌ Erro ao carregar recomendações:", err);
        tmdbContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Erro ao carregar filmes do TMDB 😢</p>";
        iaContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Erro ao carregar recomendações da IA 😢</p>";
    }
}

// Executa automaticamente ao abrir a página
carregarRecomendacoes();