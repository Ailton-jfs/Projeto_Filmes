import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import joblib

# === 1. Carregar datasets ===
movies = pd.read_csv("ml-latest-small/movies.csv")
ratings = pd.read_csv("ml-latest-small/ratings.csv")

# === 2. Juntar notas médias aos filmes ===
movie_ratings = ratings.groupby('movieId')['rating'].mean().reset_index()
movies = movies.merge(movie_ratings, on='movieId', how='left')

# === 3. Criar “descrição” combinando gêneros e título ===
movies['descricao'] = movies['title'] + " " + movies['genres'].fillna("")

# === 4. Vetorização de texto ===
vectorizer = CountVectorizer(tokenizer=lambda x: x.split('|'))
matriz = vectorizer.fit_transform(movies['descricao'])

# === 5. Calcular similaridade entre filmes ===
similaridade = cosine_similarity(matriz)

# === 6. Função de recomendação ===
def recomendar(titulo, n=5):
    if titulo not in movies['title'].values:
        print("Filme não encontrado!")
        return []
    idx = movies[movies['title'] == titulo].index[0]
    scores = list(enumerate(similaridade[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)[1:n+1]
    recomendados = [movies.iloc[i[0]]['title'] for i in scores]
    return recomendados

# Teste rápido:
print("Recomendações para 'Toy Story (1995)':")
print(recomendar("Toy Story (1995)"))

# === 7. Salvar o modelo ===
joblib.dump((movies, similaridade), "modelo_filmes.pkl")
print("✅ Modelo salvo em modelo_filmes.pkl")
