import express from "express";
import Post from "../models/Post.js";
import User from "../models/user.js";

const router = express.Router();

// SEARCH ROUTE (Must be before /:id)
router.get("/search", async (req, res) => {
  const { q } = req.query; // Get the query from URL (e.g., ?q=pasta)

  if (!q) return res.status(400).json({ message: "Query required" });

  try {
    const posts = await Post.find({
      // 1. Only show Public posts (Privacy Check)
      $or: [{ visibility: "public" }, { visibility: { $exists: false } }],

      // 2. AND match the search term
      $and: [
        {
          $or: [
            { recipeName: { $regex: q, $options: "i" } }, // Match Name (case insensitive)
            { description: { $regex: q, $options: "i" } }, // Match Description
            { tags: { $regex: q, $options: "i" } }, // Match Tags
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 1. GET: Public posts only (For the "Fresh" Feed)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [{ visibility: "public" }, { visibility: { $exists: false } }],
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET TIMELINE: Fetch posts ONLY from followed users
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    // Safety check
    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    // Get the list of people the user follows
    const followingIds = currentUser.following.map((id) => id.toString());
    const myId = currentUser._id.toString();

    // Find posts where the 'user' (author) is in that list
    // We also optionally include the user's OWN posts (currentUser._id) so they see their own uploads
    const timelinePosts = await Post.find({
      user: { $in: [...followingIds, myId] },
    }).sort({ createdAt: -1 });

    res.status(200).json(timelinePosts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 2. GET: Single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST: Create post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. PATCH: Increment Yums
router.patch("/:id/yum", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.kudos) post.kudos = [];
    const hasYummed = post.kudos.includes(userId);

    if (hasYummed) {
      post.kudos = post.kudos.filter((id) => id !== userId);
      post.kudosCount = Math.max(0, (post.kudosCount || 1) - 1);
    } else {
      post.kudos.push(userId);
      post.kudosCount = (post.kudosCount || 0) + 1;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. POST: Add comment (UPDATED with avatar logic)
router.post("/:id/comments", async (req, res) => {
  try {
    const { text, username, userAvatar } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            text,
            username,
            userAvatar, // Explicitly saving the avatar string
          },
        },
      },
      { new: true },
    );

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. DELETE: Remove a specific comment
router.delete("/:postId/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true },
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. DELETE: Remove a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. PATCH: Update category
router.patch("/:id/category", async (req, res) => {
  try {
    const { category } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { cookbookCategory: category },
      { new: true },
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
