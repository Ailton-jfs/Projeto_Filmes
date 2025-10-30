const nome = localStorage.getItem("usuario");
document.getElementById("usuario").textContent = nome;

const preferencias = JSON.parse(localStorage.getItem("preferencias")) || [];
const filmesContainer = document.getElementById("filmesContainer");

async function carregarRecomendacoes() {
  filmesContainer.innerHTML = "<p>Carregando recomendações...</p>";

  try {
    // 1️⃣ Busca do backend local
    const localRes = await fetch("http://localhost:3000/filmes");
    const filmesLocal = await localRes.json();

    // 2️⃣ Busca TMDB
    const generosString = preferencias.join(",");
    const tmdbRes = await fetch(`http://localhost:3000/api/tmdb?generos=${generosString}`);
    const filmesTMDB = await tmdbRes.json();

    // 3️⃣ Busca ChatGPT
    const chatRes = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generos: preferencias, nome }),
    });
    const chatData = await chatRes.json();
    const filmesIA = chatData.recomendacoes || [];

    filmesContainer.innerHTML = "";

    // Junta todos os resultados
    const todos = [
      ...filmesLocal.map(f => ({
        origem: "Local",
        titulo: f.title,
        descricao: f.overview,
        imagem: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
      })),
      ...filmesTMDB.map(f => ({
        origem: "TMDB",
        titulo: f.title,
        descricao: f.overview,
        imagem: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
      })),
      ...filmesIA.map(f => ({
        origem: "IA",
        titulo: f.titulo,
        descricao: f.descricao,
        imagem: "https://via.placeholder.com/200x300?text=IA+Recomendou",
      })),
    ];

    // Renderiza na tela
    todos.forEach(filme => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${filme.imagem}" alt="${filme.titulo}">
        <h3>${filme.titulo}</h3>
        <p><b>Fonte:</b> ${filme.origem}</p>
        <p>${filme.descricao.substring(0, 120)}...</p>
      `;
      filmesContainer.appendChild(card);
    });
  } catch (err) {
    filmesContainer.innerHTML = "<p>Erro ao carregar filmes 😢</p>";
    console.error(err);
  }
}

carregarRecomendacoes();
