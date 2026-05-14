import redis
import requests
import numpy as np
from sentence_transformers import SentenceTransformer
from redis.commands.search.field import (
    NumericField,
    TagField,
    TextField,
    VectorField,
)
from redis.commands.search.index_definition import IndexDefinition, IndexType

url = "https://raw.githubusercontent.com/bsbodden/redis_vss_getting_started/main/data/bikes.json"
response = requests.get(url, timeout=10)
bikes = response.json()

client = redis.Redis(host="localhost", port="6379", decode_responses=True)
pipeline = client.pipeline()

for i, bike in enumerate(bikes, start=1):
    redis_key = f"bikes:{i:03}"
    pipeline.json().set(redis_key, "$", bike)

res = pipeline.execute()
print(res)

keys = sorted(client.keys("bikes:*"))
print(keys)

descriptions = client.json().mget(keys, "$.description")
descriptions = [item[0] for item in descriptions]
print(descriptions)

embedder = SentenceTransformer("msmarco-distilbert-base-v4")
embeddings = embedder.encode(descriptions).astype(np.float32).tolist()
VECTOR_DIMENSION = len(embeddings[0])

pipeline = client.pipeline()
for key, embedding in zip(keys, embeddings):
    pipeline.json().set(key, "$.description_embeddings", embedding)
pipeline.execute()

res = client.json().get("bikes:010")
print(res)

schema = (
    TextField("$.model", no_stem=True, as_name="model"),
    TextField("$.brand", no_stem=True, as_name="brand"),
    NumericField("$.price", as_name="price"),
    TagField("$.type", as_name="type"),
    TextField("$.description", as_name="description"),
    VectorField(
        "$.description_embeddings",
        "FLAT",
        {
            "TYPE": "FLOAT32",
            "DIM": VECTOR_DIMENSION,
            "DISTANCE_METRIC": "COSINE",
        },
        as_name="vector",
    ),
)
definition = IndexDefinition(prefix=["bikes:"], index_type=IndexType.JSON)
res = client.ft("idx:bikes_vss").create_index(fields=schema, definition=definition)
