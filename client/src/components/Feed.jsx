import RecipePost from "./RecipePost.jsx";



export default function Feed() {
  const posts = [
    {
      id: 1,
      username: "Chef Gordon",
      userAvatar: "https://i.pravatar.cc/150?u=gordon",
      timeAgo: "2h",
      location: "London",
      recipeName: "Midnight Spicy Ramen",
      description: "Extra chili oil and a 6-minute egg. Perfect fuel.",
      dishImages: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624","https://nationalzoo.si.edu/sites/default/files/styles/wide/public/animals/20181031-skipbrown152.jpg?h=8165685c&itok=0tjfQSVM"],
      cookTime: 15,
      difficulty: "Easy",
      kudosCount: 124,
      commentCount: 18,
      rating: 4,
      tags: ["gluten-free", "dinner", "spicy", "quick-prep"],
      sourceUrl: "https://www.bonappetit.com/recipe/spicy-miso-ramen"
    },
    {
      id: 2,
      username: "Elena Bakes",
      userAvatar: "https://i.pravatar.cc/150?u=elena",
      timeAgo: "5h",
      location: "Paris",
      recipeName: "Sourdough Starter",
      description: "Finally got the crumb right! 72-hour ferment.",
      dishImages: ["https://www.willpowders.com/cdn/shop/articles/sourdough-loaf-recipe_f7108e70-6a3f-4237-b3a7-6901dfd165ae.webp?v=1758711227"],
      cookTime: 120,
      difficulty: "Hard",
      kudosCount: 89,
      commentCount: 5,
      rating: 4,
      tags: ["vegetarian", "breakfast", "quick-prep"],
      sourceUrl: "https://www.willpowders.com/cdn/shop/articles/sourdough-loaf-recipe",

    }
  ];

  return (
    <div className="feed-container">
      {posts.map(post => (
        <RecipePost key={post.id} post={post} />
      ))}
    </div>
  );
}