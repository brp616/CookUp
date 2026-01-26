from bson import ObjectId
import numpy as np

def build_user_profile(user_id, posts_df, tfidf_matrix, users_collection):
    try:
        # 1. Force ID to string for comparison
        target_uid = str(user_id)
        print(f"DEBUG: Looking for likes in posts for User ID: {target_uid}")

        # 2. Find posts where this user exists in the 'kudos' array
        # We check every row in the 'kudos' column of our DataFrame
        def check_kudos(kudos_list):
            if not isinstance(kudos_list, list): return False
            return any(str(uid) == target_uid for uid in kudos_list)

        liked_mask = posts_df['kudos'].apply(check_kudos)
        liked_posts_df = posts_df[liked_mask]

        # 3. If we find nothing, the user truly has no activity in the system
        if liked_posts_df.empty:
            print(f"DEBUG: No posts in the database have {target_uid} in their kudos array.")
            return None

        print(f"✅ SUCCESS: Found {len(liked_posts_df)} liked posts. Calculating taste vector...")

        # 4. Create the average vector (The "Taste Profile")
        liked_indices = liked_posts_df.index
        user_vector = tfidf_matrix[liked_indices].mean(axis=0)
        
        return np.asarray(user_vector)

    except Exception as e:
        print(f"Error in build_user_profile: {e}")
        return None