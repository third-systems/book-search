import json

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

reviews_filename = "./data/reviews.json"
num_entries_to_load = 500000
with open(reviews_filename, "r") as f:
    data = [json.loads(next(f)) for _ in range(num_entries_to_load)]
df_reviews = pd.DataFrame(data)

df_reviews = df_reviews.rename(columns={"item_id": "book_id", "txt": "review"})
df_reviews["embedding"] = None

model = SentenceTransformer("Supabase/gte-small")

df_reviews["embedding"] = None
for index, row in df_reviews.iterrows():
    review = row["review"]
    embeddings = model.encode(review)
    df_reviews.at[index, "embedding"] = embeddings.tolist()
    if index % 100 == 0:
        print(f"Processed {index:,} reviews")
    if index % 10000 == 0:
        df_reviews.head(index).to_csv(
            "./out/reviews/reviews_" + str(index) + ".csv", index=False
        )

df_reviews.to_csv("./out/reviews.csv", index=False)
