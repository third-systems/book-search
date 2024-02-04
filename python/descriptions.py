import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

books_filename = './data/metadata.json'
df = pd.read_json(books_filename, lines=True)

df.rename(columns={'item_id': 'id'}, inplace=True)
df['description'] = df['description'].str.replace('\n', ' ')
df.dropna(subset=['description'], inplace=True)
df["embedding"] = None

model = SentenceTransformer("Supabase/gte-small")

counter = 1
for index, row in df.iterrows():
    text = row["description"]
    embeddings = model.encode(text)
    df.at[index, "embedding"] = embeddings.tolist()
    if counter % 100 == 0:
        print(f"Processed {counter:,} reviews")
    
    counter += 1

df.to_csv("./out/descriptions/descriptions_all.csv", index=False)