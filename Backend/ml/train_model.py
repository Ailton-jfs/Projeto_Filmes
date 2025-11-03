import sys, json, pickle

email = sys.argv[1] if len(sys.argv) > 1 else None

# Carrega o modelo salvo (simulação)
with open("ml/modelo_filmes.pkl", "rb") as f:
    modelo = pickle.load(f)

# Simula recomendação personalizada
recomendacoes = [
    {"title": "Inception", "vote_average": 8.8, "poster_path": "/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg"},
    {"title": "Matrix", "vote_average": 8.7, "poster_path": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"}
]

print(json.dumps(recomendacoes))
