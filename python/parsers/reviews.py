import json

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

reviews_filename = "../data/reviews.json"
num_entries_to_load = 500000
with open(reviews_filename, "r") as f:
    data = [json.loads(next(f)) for _ in range(num_entries_to_load)]
df_reviews = pd.DataFrame(data)

df_reviews['txt'] = df_reviews['txt'].str.replace('\n', ' ')
df_reviews = df_reviews.rename(columns={"item_id": "book_id", "txt": "review"})
df_reviews["embedding"] = None

df_sample_reviews = df_reviews.sample(100000)

model = SentenceTransformer("Supabase/gte-small")

df_sample_reviews["embedding"] = None
counter = 1
for index, row in df_sample_reviews.iterrows():
    review = row["review"]
    embeddings = model.encode(review)
    df_sample_reviews.at[index, "embedding"] = embeddings.tolist()
    if counter % 100 == 0:
        print(f"Processed {counter:,} reviews")
    if counter % 10000 == 0:
        df_sample_reviews.head(counter).to_csv(
            "../out/reviews/reviews_" + str(counter) + ".csv", index=False
        )
    counter += 1

df_sample_reviews.to_csv("../out/reviews/reviews_all.csv", index=False)
