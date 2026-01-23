from bson import ObjectId
import numpy as np

def build_user_profile(user_id, posts_df, tfidf_matrix, users_collection):
    """
    Creates a 'Taste Vector' for the user based on posts they have liked.
    """
    try:
        # 1. Find the User in the passed collection
        # We try both ObjectId and String formats to be safe
        query = {"_id": user_id}
        try:
            query = {"_id": ObjectId(user_id)}
        except:
            pass
            
        user = users_collection.find_one(query)

        if not user:
            print(f"User {user_id} not found in DB.")
            return None

        # 2. Get the list of post IDs the user has liked
        # Check if your DB uses 'likedPosts' or 'likes' or 'favorites'
        liked_post_ids = user.get("likedPosts", []) 
        
        if not liked_post_ids:
            print(f"User {user_id} has no likes.")
            return None

        # 3. Find where these posts are in our DataFrame
        # We need to match the liked IDs to the rows in posts_df
        
        # Ensure IDs are strings for comparison
        liked_post_ids = [str(pid) for pid in liked_post_ids]
        
        # Filter the DataFrame to find rows that match the liked IDs
        liked_posts_df = posts_df[posts_df['_id'].astype(str).isin(liked_post_ids)]
        
        if liked_posts_df.empty:
            print("User has likes, but those posts are not in the current recommendations pool.")
            return None

        # 4. Get the vectors for these posts
        liked_indices = liked_posts_df.index
        user_vectors = tfidf_matrix[liked_indices]

        # 5. Average them to get the User Profile (Taste Vector)
        user_profile = user_vectors.mean(axis=0)
        
        # Convert to numpy array format expected by cosine_similarity
        return np.asarray(user_profile)

    except Exception as e:
        print(f"Error building user profile: {e}")
        return None