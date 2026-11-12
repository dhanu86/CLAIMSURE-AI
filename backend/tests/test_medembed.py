
from sentence_transformers import SentenceTransformer

print("Loading MedEmbed model...")

model = SentenceTransformer(
    "abhinand/MedEmbed-small-v0.1"
)

texts = [
    "The patient was diagnosed with type 2 diabetes.",
    "The patient has elevated blood glucose levels.",
    "The patient suffered a fracture of the left femur."
]

embeddings = model.encode(
    texts,
    normalize_embeddings=True
)

print("Embedding shape:", embeddings.shape)

similarities = model.similarity(
    embeddings,
    embeddings
)

print("\nSimilarity matrix:")
print(similarities)

print("\nMedEmbed loaded and tested successfully!")
