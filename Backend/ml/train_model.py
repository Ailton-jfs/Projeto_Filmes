import sys, json, pickle

email = sys.argv[1] if len(sys.argv) > 1 else None

# Carrega o modelo salvo (caminho relativo)
with open("ml/modelo_filmes.pkl", "rb") as f:
    modelo = pickle.load(f)

# Simula recomendação personalizada (SÓ TÍTULO E NOTA)
recomendacoes = [
    {"title": "Inception", "vote_average": 8.8},
    {"title": "Matrix", "vote_average": 8.7}
]

# ... sua lógica real de ML aqui ...

print(json.dumps(recomendacoes))