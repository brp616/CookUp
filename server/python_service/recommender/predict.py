import pandas as pd
import numpy as np
from datetime import datetime, timezone
from bson import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .preprocess import combine_features
from .user_profile import build_user_profile

def get_recommendations(user_id, posts_collection, users_collection, top_n=10):
    try:
        # 1. Fetch Posts and User Data
        cursor = posts_collection.find({}, {
            "_id": 1, "user": 1, "tags": 1, "cookbookCategory": 1, 
            "recipeName": 1, "description": 1, "kudos": 1, "createdAt": 1
        })
        posts_df = pd.DataFrame(list(cursor))
        
        if posts_df.empty:
            return []

        # Fetch current user to check 'following' list
        user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        following_ids = [str(fid) for fid in user_data.get("following", [])] if user_data else []

        # 2. Preprocess & Vectorize
        posts_df['combined_features'] = posts_df.apply(combine_features, axis=1)
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(posts_df['combined_features'])

        # 3. Build User Profile (Taste Vector)
        user_profile = build_user_profile(user_id, posts_df, tfidf_matrix, users_collection)

        # 4. Calculate Scores
        # AI Similarity Score
        if user_profile is not None:
            cosine_sim = cosine_similarity(user_profile.reshape(1, -1), tfidf_matrix)
            posts_df['ai_score'] = cosine_sim[0]
        else:
            # Cold Start: Give everyone a base score so other weights can take over
            print(f"Cold Start for {user_id}: Using Social & Recency only.")
            posts_df['ai_score'] = 0.1 

        # 5. Social & Recency Weighting
        now = datetime.now(timezone.utc)
        
        def calculate_weights(row):
            # Recency: Half-life decay (Score drops by half every 48 hours)
            post_time = row['createdAt'].replace(tzinfo=timezone.utc)
            hours_old = (now - post_time).total_seconds() / 3600
            recency_weight = 1 / (1 + (hours_old / 48))
            
            # Follower Boost: 50% boost if following the author
            social_boost = 1.5 if str(row['user']) in following_ids else 1.0
            
            return recency_weight * social_boost

        posts_df['multiplier'] = posts_df.apply(calculate_weights, axis=1)
        posts_df['final_score'] = posts_df['ai_score'] * posts_df['multiplier']

        # 6. Filter: Remove already liked posts
        uid_str = str(user_id)
        is_liked = posts_df['kudos'].apply(
            lambda x: uid_str in [str(i) for i in x] if isinstance(x, list) else False
        )
        filtered_df = posts_df[~is_liked].copy()

        # 7. Diversity Filter: Drop duplicate recipe names (keep highest score)
        # This prevents the feed from being 5 "Chocolate Cake" recipes in a row
        filtered_df = filtered_df.sort_values('final_score', ascending=False)
        filtered_df = filtered_df.drop_duplicates(subset=['recipeName'], keep='first')

        # 8. Return top IDs
        recommendations = filtered_df.head(top_n)
        return recommendations['_id'].astype(str).tolist()

    except Exception as e:
        print(f"Error in recommender logic: {e}")
        return []