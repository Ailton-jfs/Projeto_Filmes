document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const preferencias = document.getElementById("preferencias").value.trim();

  if (!nome || !email || !senha || !preferencias) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    // Envia o cadastro para o backend
    const resposta = await fetch("http://localhost:3000/api/usuarios/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, preferencias }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || "Erro ao cadastrar usuário");
    }

    const usuario = await resposta.json();
    alert(`Bem-vindo, ${usuario.nome}! Estamos gerando suas recomendações...`);

    // Agora busca recomendações personalizadas
    const respRec = await fetch(
      `http://localhost:3000/api/recomendacao?email=${encodeURIComponent(usuario.email)}&preferencias=${encodeURIComponent(usuario.preferencias)}`
    );

    if (!respRec.ok) {
      throw new Error("Erro ao buscar recomendações de filmes");
    }

    const filmes = await respRec.json();

    const container = document.getElementById("filmes");
    container.innerHTML = "";

    if (filmes.length === 0) {
      container.innerHTML = "<p>Nenhuma recomendação encontrada 😢</p>";
      return;
    }

    filmes.forEach((filme) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : "img/placeholder.jpg"}" alt="${filme.title}">
        <div class="titulo">${filme.title}</div>
        <div class="nota">⭐ ${filme.vote_average ? filme.vote_average.toFixed(1) : "N/A"}</div>
      `;
      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao cadastrar ou recomendar:", erro);
    alert("Erro ao processar sua solicitação. Verifique o console.");
  }
});
