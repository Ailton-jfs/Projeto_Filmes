document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const preferencias = document.getElementById("preferencias").value;

  try {
    // Envia os dados para o backend
    const resposta = await fetch("http://localhost:3000/api/usuarios/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, preferencias }),
    });

    const usuario = await resposta.json();
    alert(`Bem-vindo, ${usuario.nome}! Recomendando filmes...`);

    // Agora busca recomendações personalizadas
    const respRec = await fetch(`http://localhost:3000/api/filmes/recomendar?email=${usuario.email}`);
    const filmes = await respRec.json();

    const container = document.getElementById("filmes");
    container.innerHTML = "";

    filmes.forEach(filme => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}">
        <div class="titulo">${filme.title}</div>
        <div class="nota">⭐ ${filme.vote_average.toFixed(1)}</div>
      `;
      container.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao cadastrar ou recomendar:", erro);
  }
});
