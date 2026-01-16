import RecipePost from "./RecipePost.jsx";
import React from "react";
// Feed.jsx
export default function Feed({ posts, myCookbooks }) {
  // LOG 1: Is the variable even getting here?
  console.log("Feed received posts:", posts);

  // LOG 2: If it's not an array, something is wrong with the fetch
  if (!Array.isArray(posts)) {
    return <p>Error: Data is not in list format.</p>;
  }

  return (
    <div className="feed">
      {posts.length > 0 ? (
        posts.map((post) => (
          <RecipePost 
            key={post._id} 
            post={post} 
            myCookbooks={myCookbooks} 
          />
        ))
      ) : (
        <div className="no-data-msg">
           <p>Your shelf is empty!</p>
           <p>Try adding a recipe or check if your MongoDB is connected.</p>
        </div>
      )}
    </div>
  );
}