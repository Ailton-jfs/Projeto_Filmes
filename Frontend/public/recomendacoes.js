const TMDB_BASE = "https://image.tmdb.org/t/p/w500";
const API_URL = "http://localhost:3000/api/recomendacao";

async function carregarRecomendacoes(tipo) {
  const container = document.getElementById("listaRecomendacoes");
  container.innerHTML = "<p class='text-gray-400'>🔄 Carregando recomendações...</p>";

  try {
    // envia o tipo (filme, série, desenho)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferencias: [tipo], // envia o tipo para o GPT/TMDB
      }),
    });

    const data = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(data.erro || "Erro ao carregar recomendações");
    }

    container.innerHTML = "";

    data.forEach((item) => {
      const { title, name, poster_path, id } = item;
      const titulo = title || name || "Sem título";
      const imagem = poster_path
        ? `${TMDB_BASE}${poster_path}`
        : "https://via.placeholder.com/500x750?text=Sem+Imagem";
      const link = `https://www.themoviedb.org/${tipo === "filmes" ? "movie" : tipo === "series" ? "tv" : "movie"}/${id}`;

      const card = document.createElement("div");
      card.className =
        "bg-gray-900 rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-all cursor-pointer";
      card.innerHTML = `
        <a href="${link}" target="_blank">
          <img src="${imagem}" alt="${titulo}" class="w-full h-80 object-cover">
          <div class="p-3 text-center">
            <h3 class="text-white font-semibold text-sm truncate">${titulo}</h3>
          </div>
        </a>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar:", error);
    container.innerHTML = `<p class='text-red-500'>❌ ${error.message}</p>`;
  }
}
