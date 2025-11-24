// Pega o nome do usuário e exibe
const nome = localStorage.getItem("usuario") || "Usuário";
// Pega o email para a rota de ML
const emailUsuario = localStorage.getItem("emailUsuario") || "sem_email@exemplo.com";

const usuarioEl = document.getElementById("usuario");
if (usuarioEl) usuarioEl.textContent = nome;

// Pega as preferências armazenadas
let preferencias = localStorage.getItem("preferencias") || "";

// Containers das recomendações
const tmdbContainer = document.getElementById("tmdbFilmes");
const iaContainer = document.getElementById("iaFilmes");
const mlContainer = document.getElementById("mlFilmes");
const resultado = document.getElementById("resultado");

// ----------- 🔥 BOTÃO QUE FALTAVA 🔥 -------------
const btnRecomendar = document.getElementById("btnRecomendar");

if (btnRecomendar) {
    btnRecomendar.addEventListener("click", () => {
        const input = document.getElementById("inputPreferencias");
        if (!input) return;

        const texto = input.value.trim();
        if (!texto) {
            alert("Digite suas preferências antes de continuar!");
            return;
        }

        // Salva a preferência
        localStorage.setItem("preferencias", texto);
        preferencias = texto;

        // Mostra a área de resultados
        if (resultado) resultado.classList.remove("hidden");

        // Recarrega tudo
        carregarRecomendacoes();

        // Rola a página suavemente até as recomendações
        setTimeout(() => {
            resultado.scrollIntoView({ behavior: "smooth" });
        }, 300);
    });
}
// ------------------------------------------------


// Garante que os containers foram encontrados antes de tentar usá-los
if (tmdbContainer && iaContainer && mlContainer && resultado) {
    tmdbContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>🎬 Carregando recomendações do TMDB...</p>";
    iaContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>🤖 Carregando recomendações da IA...</p>";
    mlContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>⚙️ Buscando recomendações de ML...</p>";
    resultado.classList.remove("hidden");
}



// ----------------------------------------
// FUNÇÃO TMDB (COM IMAGEM)
// ----------------------------------------
function createTmdbCardHTML(f) {
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



// ----------------------------------------
// FUNÇÃO ML (mesmo formato TMDB)
// ----------------------------------------
function createMlCardHTML(f) {
    return createTmdbCardHTML(f);
}



// ----------------------------------------
// FUNÇÃO IA (Com e Sem imagem)
// ----------------------------------------
function createIaCardHTML(f) {
    const hasImage = f.poster_url;

    if (hasImage) {
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
            linksHTML = `<div class="mt-3 px-3 pb-3 text-center"><span class="text-xs text-gray-500">Sem links encontrados.</span></div>`;
        }

        return `
            <div class="${cardClasses}">
                <img src="${f.poster_url}" class="w-full h-auto object-cover rounded-t-lg">
                <div class="p-3">
                    <h3 class="font-bold text-base mt-2">${f.titulo}</h3>
                    <p class="text-xs text-gray-400 mt-1">${f.descricao || "Sem descrição."}</p>
                </div>
                ${linksHTML}
            </div>
        `;
    }

    // SEM IMAGEM
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

    return `
        <div class="${cardClasses}">
            <h3 class="font-bold text-lg text-center">${f.titulo}</h3>
            <p class="text-sm text-gray-400 mt-2">${f.descricao || "Sem descrição."}</p>
            ${linksHTML}
        </div>
    `;
}



// ----------------------------------------
// FUNÇÃO PRINCIPAL DE RECOMENDAÇÃO
// ----------------------------------------
async function carregarRecomendacoes() {
    try {
        if (!tmdbContainer || !iaContainer || !mlContainer || !resultado) {
            console.error("❌ Elementos HTML não encontrados.");
            return;
        }

        // 1️⃣ TMDB
        const tmdbRes = await fetch(`http://localhost:3000/api/tmdb?busca=${encodeURIComponent(preferencias)}`);
        const filmesTMDB = await tmdbRes.json();

        tmdbContainer.innerHTML = "";
        if (filmesTMDB.length === 0) {
            tmdbContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Nenhum filme do TMDB encontrado.</p>";
        } else {
            filmesTMDB.slice(0, 10).forEach(f => {
                tmdbContainer.innerHTML += createTmdbCardHTML(f);
            });
        }

        // 2️⃣ IA
        const chatRes = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, preferencias }),
        });

        const chatData = await chatRes.json();
        const filmesIA = chatData.recomendacoes || [];

        iaContainer.innerHTML = "";
        if (filmesIA.length === 0) {
            iaContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Nenhuma recomendação da IA disponível.</p>";
        } else {
            filmesIA.forEach(f => {
                iaContainer.innerHTML += createIaCardHTML(f);
            });
        }

        // 3️⃣ Machine Learning (ML)
        const mlRes = await fetch(`http://localhost:3000/api/filmes/recomendar?email=${encodeURIComponent(emailUsuario)}`);
        const filmesML = await mlRes.json();

        mlContainer.innerHTML = "";
        if (filmesML.length === 0) {
            mlContainer.innerHTML = "<p class='text-gray-400 col-span-full text-center'>Nenhuma recomendação de ML disponível.</p>";
        } else {
            filmesML.forEach(f => {
                mlContainer.innerHTML += createMlCardHTML(f);
            });
        }

    } catch (err) {
        console.error("❌ Erro ao carregar recomendações:", err);
    }
}



// Executa ao abrir a página
carregarRecomendacoes();
