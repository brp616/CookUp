from pymongo import MongoClient
from bson import ObjectId

# Paste your connection string here
MONGO_URI = "mongodb+srv://brp616_db_user:K2FEAr81RAbhPB7U@cluster0.qb8lvtm.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

print("--- DIAGNOSTIC REPORT ---")
print(f"Available Databases: {client.list_database_names()}")

# Guess the database (usually 'test' or 'cookup_db')
# Update this if your real data is in a different one!
db_name = 'test' 
if 'cookup_db' in client.list_database_names():
    db_name = 'cookup_db'

print(f"Checking Database: '{db_name}'")
db = client[db_name]
posts = db.posts.find_one()

if posts:
    print(f"✅ Found a post!")
    print(f"ID Value: {posts['_id']}")
    print(f"ID Type: {type(posts['_id'])}")
else:
    print("❌ No posts found in this database. Check your db_name.")