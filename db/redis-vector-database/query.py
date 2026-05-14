import redis
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from redis.commands.search.query import Query

client = redis.Redis(host="localhost", port="6379", decode_responses=True)
pipeline = client.pipeline()

embedder = SentenceTransformer("msmarco-distilbert-base-v4")

queries = [
    "Bike for small kids",
    "Best Mountain bikes for kids",
    "Cheap Mountain bike for kids",
    "Female specific mountain bike",
    "Road bike for beginners",
    "Commuter bike for people over 60",
    "Comfortable commuter bike",
    "Good bike for college students",
    "Mountain bike for beginners",
    "Vintage bike",
    "Comfortable city bike",
]

encoded_queries = embedder.encode(queries)
len(encoded_queries)


def create_query_table(query, queries, encoded_queries, extra_params=None):
    """
    Creates a query table.
    """
    results_list = []
    for i, encoded_query in enumerate(encoded_queries):
        result_docs = (
            client.ft("idx:bikes_vss")
            .search(
                query,
                {"query_vector": np.array(encoded_query, dtype=np.float32).tobytes()}
                | (extra_params if extra_params else {}),
            )
            .docs
        )
        for doc in result_docs:
            vector_score = round(1 - float(doc.vector_score), 2)
            results_list.append(
                {
                    "query": queries[i],
                    "score": vector_score,
                    "id": doc.id,
                    "brand": doc.brand,
                    "model": doc.model,
                    "description": doc.description,
                }
            )

    # Optional: convert the table to Markdown using Pandas
    queries_table = pd.DataFrame(results_list)
    queries_table.sort_values(
        by=["query", "score"], ascending=[True, False], inplace=True
    )
    queries_table["query"] = queries_table.groupby("query")["query"].transform(
        lambda x: [x.iloc[0]] + [""] * (len(x) - 1)
    )
    queries_table["description"] = queries_table["description"].apply(
        lambda x: (x[:497] + "...") if len(x) > 500 else x
    )
    return queries_table.to_markdown(index=False)


query = (
    Query("(*)=>[KNN 3 @vector $query_vector AS vector_score]")
    .sort_by("vector_score")
    .return_fields("vector_score", "id", "brand", "model", "description")
    .dialect(2)
)

table = create_query_table(query, queries, encoded_queries)
print(table)
# >>> | Best Mountain bikes for kids     |    0.54 | bikes:003...

hybrid_query = (
    Query("(@brand:Peaknetic)=>[KNN 3 @vector $query_vector AS vector_score]")
    .sort_by("vector_score")
    .return_fields("vector_score", "id", "brand", "model", "description")
    .dialect(2)
)
table = create_query_table(hybrid_query, queries, encoded_queries)
print(table)
# >>> | Best Mountain bikes for kids     |    0.3  | bikes:008...

range_query = (
    Query(
        "@vector:[VECTOR_RANGE $range $query_vector]=>"
        "{$YIELD_DISTANCE_AS: vector_score}"
    )
    .sort_by("vector_score")
    .return_fields("vector_score", "id", "brand", "model", "description")
    .paging(0, 4)
    .dialect(2)
)
table = create_query_table(
    range_query, queries[:1], encoded_queries[:1], {"range": 0.55}
)
print(table)
