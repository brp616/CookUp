import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .preprocess import combine_features
from .user_profile import build_user_profile

def get_recommendations(user_id, posts_collection, users_collection, top_n=10):
    try:
        # 1. Fetch Posts
        cursor = posts_collection.find({}, {
            "_id": 1, "tags": 1, "cookbookCategory": 1, 
            "recipeName": 1, "description": 1, "kudos": 1, "createdAt": 1
        })
        posts_df = pd.DataFrame(list(cursor))

        if posts_df.empty:
            return []

        # 2. Preprocess & Vectorize
        posts_df['combined_features'] = posts_df.apply(combine_features, axis=1)
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(posts_df['combined_features'])

        # 3. Build User Profile (PASSING the users_collection now)
        user_profile = build_user_profile(user_id, posts_df, tfidf_matrix, users_collection)

        # 4. Cold Start Strategy
        if user_profile is None:
            # If user has no profile, return the Freshest posts
            print("Cold Start: Returning freshest posts.")
            fresh_posts = posts_df.sort_values(by='createdAt', ascending=False).head(top_n)
            return fresh_posts['_id'].astype(str).tolist()

        # 5. Calculate Similarity
        cosine_sim = cosine_similarity(user_profile.reshape(1, -1), tfidf_matrix)
        posts_df['score'] = cosine_sim[0]

        # 6. Filter out already liked posts
        has_liked_mask = posts_df['kudos'].apply(
            lambda x: user_id in (x if isinstance(x, list) else [])
        )
        
        recommendations = posts_df[~has_liked_mask].sort_values(by='score', ascending=False).head(top_n)
        return recommendations['_id'].astype(str).tolist()

    except Exception as e:
        print(f"Error in recommender: {e}")
        return []