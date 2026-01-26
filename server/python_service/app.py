from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from recommender.predict import get_recommendations
from pymongo import MongoClient
from bson import ObjectId
import uvicorn

app = FastAPI()

# --- 1. CONFIGURATION ---
# Your Cloud Connection String
MONGO_URI = "mongodb+srv://brp616_db_user:K2FEAr81RAbhPB7U@cluster0.qb8lvtm.mongodb.net/?appName=Cluster0"

# --- 2. DB CONNECTION ---
client = MongoClient(MONGO_URI)
# Use the simpler logic since we know the DB name now
# (If your previous step said 'cookup_db', keep it. If 'test', change it here)
db_name = "cookup_db" if "cookup_db" in client.list_database_names() else "test"
db = client[db_name]
print(f"✅ Connected to database: {db_name}")

posts_collection = db["posts"]
users_collection = db["users"]

# --- 3. HELPER: SERIALIZER (The Fix) ---
def serialize_mongo(data):
    """
    Recursively converts MongoDB ObjectIds to strings so JSON doesn't crash.
    """
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]
    if isinstance(data, dict):
        return {key: serialize_mongo(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

# --- 4. CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:10000","https://cookup-1gl6.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend/{user_id}")
def recommend(user_id: str):
    print(f"Generating recommendations for: {user_id}")
    
    # 1. Get IDs from AI
    rec_ids = get_recommendations(user_id, posts_collection, users_collection)
    
    if not rec_ids:
        return {"recommendations": []}

    # 2. Prepare Query IDs (Handle both String and ObjectId formats)
    query_ids = []
    for rid in rec_ids:
        query_ids.append(rid)
        try:
            query_ids.append(ObjectId(rid))
        except:
            pass
            
    # 3. Fetch full posts
    posts_cursor = posts_collection.find({"_id": {"$in": query_ids}})
    
    # Create a map for sorting
    # We use serialize_mongo HERE to safely convert the keys immediately
    posts_map = {}
    for post in posts_cursor:
        # Clean the WHOLE post object right now
        clean_post = serialize_mongo(post)
        posts_map[clean_post["_id"]] = clean_post

    # 4. Re-order to match relevance
    full_posts = []
    for rid in rec_ids:
        if rid in posts_map:
            full_posts.append(posts_map[rid])

    print(f"Returning {len(full_posts)} full post objects")
    
    # Return the clean list
    return {"recommendations": full_posts}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)