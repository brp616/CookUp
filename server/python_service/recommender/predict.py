import pandas as pd
from datetime import datetime, timezone
from bson import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .preprocess import combine_features
from .user_profile import build_user_profile


def get_recommendations(user_id, posts_collection, users_collection, top_n=10):
    """
    Generates a ranked list of post IDs for a given user.
    This started as pure content-based filtering and slowly
    grew to include social + time-based signals.
    """
    try:
        # pull posts from mongo
        cursor = posts_collection.find(
            {},
            {
                "_id": 1,
                "user": 1,
                "tags": 1,
                "cookbookCategory": 1,
                "recipeName": 1,
                "description": 1,
                "kudos": 1,
                "createdAt": 1,
            },
        )

        posts_df = pd.DataFrame(list(cursor))

        if posts_df.empty:
            return []

        # user info 
        # we want to find their likes and who they follow
        user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
        following_ids = []

        if user_doc:
            # played around with str() to get it to match
            following_ids = [str(fid) for fid in user_doc.get("following", [])]

        # ---- feature engineering ----
        # original version only used tags, but descriptions helped a lot
        posts_df["combined_features"] = posts_df.apply(
            combine_features, axis=1
        )

        # OLD APPROACH (kept for reference)
        # vectorizer = CountVectorizer(stop_words="english")
        # feature_matrix = vectorizer.fit_transform(posts_df["combined_features"])

        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform(posts_df["combined_features"])

        #  build user taste profile
        # this is basically an average of vectors from posts they interacted with
        user_profile = build_user_profile(
            user_id,
            posts_df,
            tfidf_matrix,
            users_collection,
        )

        # ---- similarity scoring ----
        if user_profile is not None:
            similarity_scores = cosine_similarity(
                user_profile.reshape(1, -1),
                tfidf_matrix,
            )
            posts_df["ai_score"] = similarity_scores[0]
        else:
            # cold start problem
            # this used to just return random posts
            print(f"[recs] cold start for user {user_id}")
            posts_df["ai_score"] = 0.1

        # ---- time + social weighting - played around with LLMs/read online for what to do----
        now = datetime.now(timezone.utc)

        def compute_weight(row):
            # recency decay
            created_at = row["createdAt"].replace(tzinfo=timezone.utc)
            hours_old = (now - created_at).total_seconds() / 3600
            recency_weight = 1 / (1 + (hours_old / 48))

            # social boost if user follows the author
            social_weight = (
                1.5 if str(row["user"]) in following_ids else 1.0
            )
            return recency_weight * social_weight
        posts_df["multiplier"] = posts_df.apply(compute_weight, axis=1)
        posts_df["final_score"] = (
            posts_df["ai_score"] * posts_df["multiplier"]
        )

        # filter out already liked posts
        uid = str(user_id)

        def has_liked(kudos):
            if not isinstance(kudos, list):
                return False
            return uid in [str(k) for k in kudos]

        filtered_df = posts_df[~posts_df["kudos"].apply(has_liked)].copy()

        # OLD IDEA
        # filtered_df = filtered_df[filtered_df["ai_score"] > 0.2]

        # diversity cleanup
        # avoids showing 5 versions of the same recipe
        filtered_df = filtered_df.sort_values(
            "final_score", ascending=False
        )
        filtered_df = filtered_df.drop_duplicates(
            subset=["recipeName"],
            keep="first",
        )

        # finally, we have the final selection!
        top_posts = filtered_df.head(top_n)
        return top_posts["_id"].astype(str).tolist()
    except Exception as e:
        # recommender errors shouldn't break the feed
        print(f"[recs] error in recommendation pipeline: {e}")
        return []