
    const form = document.getElementById("formRecomendacoes");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // salva as preferências no localStorage
      const preferencias = document.getElementById("preferencias").value;
      localStorage.setItem("preferencias", preferencias);
      // redireciona para a página de recomendações
      window.location.href = "recomendacoes.html";
    });
  