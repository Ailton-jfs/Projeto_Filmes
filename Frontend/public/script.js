// Pega o nome do usuário e exibe
const nome = localStorage.getItem("usuario") || "Usuário";
document.getElementById("usuario").textContent = nome;

// Pega as preferências armazenadas
const preferencias = localStorage.getItem("preferencias") || "";

// Containers das recomendações
const tmdbContainer = document.getElementById("tmdbFilmes");
const iaContainer = document.getElementById("iaFilmes");
const resultado = document.getElementById("resultado");

// Mostra loading
tmdbContainer.innerHTML = "<p>🎬 Carregando recomendações do TMDB...</p>";
iaContainer.innerHTML = "<p>🤖 Carregando recomendações da IA...</p>";
resultado.classList.remove("hidden");

// Função principal
async function carregarRecomendacoes() {
  try {
    // 🔹 1️⃣ Busca no TMDB via backend (baseada em texto)
    const tmdbRes = await fetch(`http://localhost:3000/api/tmdb?busca=${encodeURIComponent(preferencias)}`);
    const filmesTMDB = await tmdbRes.json();

    // Renderiza TMDB
    tmdbContainer.innerHTML = "";
    filmesTMDB.slice(0, 6).forEach(f => {
      const card = document.createElement("div");
      card.className = "bg-gray-700 p-4 rounded shadow text-center";
      card.innerHTML = `
        <img src="${f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : "https://via.placeholder.com/200x300?text=Sem+Imagem"}" 
             alt="${f.title || f.name}" class="w-full h-64 object-cover rounded mb-2">
        <h3 class="font-semibold text-lg">${f.title || f.name}</h3>
        <p class="text-sm text-gray-300">${(f.overview || "Sem descrição").substring(0, 120)}...</p>
      `;
      tmdbContainer.appendChild(card);
    });

    // 🔹 2️⃣ Busca recomendações da IA
    const chatRes = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, preferencias }),
    });

    const chatData = await chatRes.json();
    const filmesIA = chatData.recomendacoes || [];

    // Renderiza IA
iaContainer.innerHTML = "";
if (filmesIA.length === 0) {
  iaContainer.innerHTML = "<p>Nenhuma recomendação da IA disponível.</p>";
} else {
  filmesIA.forEach(f => {
    const card = document.createElement("div");
    card.className = "bg-gray-700 p-4 rounded shadow text-center";

    // Monta os links como botões
    let linksHTML = "";
    if (f.links && f.links.length > 0) {
      linksHTML = `<div class="mt-2 flex flex-wrap justify-center gap-2">` +
        f.links.map(l => `<a href="${l.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">${l.plataforma}</a>`).join("") +
        `</div>`;
    }

    card.innerHTML = `
      <h3 class="font-semibold text-lg">${f.titulo}</h3>
      <p class="text-sm text-gray-300">${(f.descricao || "Sem descrição").substring(0, 120)}...</p>
      ${linksHTML}
    `;
    iaContainer.appendChild(card);
  });
}


  } catch (err) {
    console.error("❌ Erro ao carregar recomendações:", err);
    tmdbContainer.innerHTML = "<p>Erro ao carregar filmes do TMDB 😢</p>";
    iaContainer.innerHTML = "<p>Erro ao carregar recomendações da IA 😢</p>";
  }
}

// Executa automaticamente ao abrir a página
carregarRecomendacoes();
