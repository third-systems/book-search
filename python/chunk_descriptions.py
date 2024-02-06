import pandas as pd
from sentence_transformers import SentenceTransformer

books_filename = './data/metadata.json'
df = pd.read_json(books_filename, lines=True)
df.rename(columns={'id': 'item_id'}, inplace=True)
df.dropna(subset=['description'], inplace=True)


from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)

model = SentenceTransformer("Supabase/gte-small")
vectors = []
counter = 1

for index, row in df.iterrows():
    splitted = text_splitter.create_documents([row['description']])
    for i, chunk in enumerate(splitted):
        text = chunk.page_content
        embeddings = model.encode(text)
        vectors.append({
            'item_id': row['item_id'],
            'chunk': text,
            'embedding': embeddings.tolist()
        })
    if counter % 100 == 0:
        print(f"Processed {counter:,} reviews")
    counter += 1

df_chunks = pd.DataFrame(vectors)
df_chunks.to_csv("./out/descriptions/descriptions_all.csv", index=False)