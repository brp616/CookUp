#imports, get your imports here!
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from recommender.predict import get_recommendations
from pymongo import MongoClient
from bson import ObjectId
import uvicorn

app = FastAPI()

# mongo connection (atlas)
# creds live here for now – probably should env this later
MONGO_URI = "mongodb+srv://brp616_db_user:K2FEAr81RAbhPB7U@cluster0.qb8lvtm.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

# quick check to see which db exists
# confirmation for deploy after some testing
db_name = "cookup_db" if "cookup_db" in client.list_database_names() else "test"
db = client[db_name]

print(f"✅ connected to mongo db: {db_name}")

posts_collection = db["posts"]
users_collection = db["users"]


def serialize_mongo(data):
    """
    Converts ObjectIds to strings so FastAPI doesn't explode on JSON responses.
    Handles nested stuff too (lists, dicts, etc).
    """
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]

    if isinstance(data, dict):
        return {key: serialize_mongo(value) for key, value in data.items()}

    if isinstance(data, ObjectId):
        return str(data)

    return data


# CORS config
# frontend runs on a couple different ports. most recently added render frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:10000",
        "https://cookup-1gl6.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# gettinr recommendations
@app.get("/recommend/{user_id}")
def recommend(user_id: str):
    print(f"[recs] generating recommendations for user:", user_id)

    # this returns a list of post ids ranked by relevance
    rec_ids = get_recommendations(
        user_id,
        posts_collection,
        users_collection
    )

    if not rec_ids:
        return {"recommendations": []}

    # handle both string ids + ObjectIds
    # mongo is picky here
    query_ids = []
    for rid in rec_ids:
        query_ids.append(rid)
        try:
            query_ids.append(ObjectId(rid))
        except Exception:
            # happens if it's already an ObjectId or malformed
            pass

    posts_cursor = posts_collection.find(
        {"_id": {"$in": query_ids}}
    )

    # map posts by id so we can re-order later
    posts_map = {}
    for post in posts_cursor:
        clean_post = serialize_mongo(post)
        posts_map[clean_post["_id"]] = clean_post

    # preserve original ranking from recommender
    full_posts = []
    for rid in rec_ids:
        if rid in posts_map:
            full_posts.append(posts_map[rid])

    print(f"[recs] returning {len(full_posts)} posts")

    return {"recommendations": full_posts}


# uncomment if you want to run this standalone, got rid of for web deploy
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)