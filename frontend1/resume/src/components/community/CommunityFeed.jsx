import React, { useState, useEffect } from "react";
import { getFeedPosts, createPost, voteOnPost } from "../../services/communityApi";

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getFeedPosts();
      setPosts(response.posts || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Please enter both title and content");
      return;
    }

    try {
      setCreating(true);
      await createPost(newPostTitle, newPostContent);
      setNewPostTitle("");
      setNewPostContent("");
      setShowCreateModal(false);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      const result = await voteOnPost(postId, voteType);
      
      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId
            ? {
                ...p,
                votes: result.votes,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error voting on post:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl text-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl text-white">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
          Community
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Discussions</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Share updates, ask questions, and engage with students and alumni.
        </p>
      </div>

      {/* Create Post */}
      <div className="mb-6 border border-white/10 rounded-xl bg-neutral-950 p-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-neutral-500 hover:border-green-500 hover:text-neutral-300 transition text-left"
        >
          Create a post...
        </button>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-4 rounded-xl border border-white/10 bg-neutral-950 p-4"
            >
              {/* Votes */}
              <div className="flex flex-col items-center text-neutral-500">
                <button
                  onClick={() => handleVote(post.postId, "upvote")}
                  className={`hover:text-green-500 transition ${
                    post.upvotes?.includes(localStorage.getItem("resumate_user_id"))
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  ▲
                </button>
                <span className="text-sm font-medium text-white">
                  {post.votes}
                </span>
                <button
                  onClick={() => handleVote(post.postId, "downvote")}
                  className={`hover:text-red-500 transition ${
                    post.downvotes?.includes(localStorage.getItem("resumate_user_id"))
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  ▼
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Meta */}
                <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mb-2">
                  <span className="text-neutral-300 font-medium">
                    {post.author}
                  </span>
                  <span>·</span>
                  <span>{post.role}</span>
                  <span>·</span>
                  <span>{post.timestamp}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-white mb-2">
                  {post.title}
                </h3>

                {/* Body */}
                <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex gap-6 text-xs text-neutral-500">
                  <button className="hover:text-white transition">
                    💬 {post.comments} comments
                  </button>
                  <button className="hover:text-white transition">Share</button>
                  <button className="hover:text-white transition">Save</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-medium mb-6">Create a Post</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Post Title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 h-40 resize-none focus:outline-none focus:border-green-500"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePost}
                  disabled={creating}
                  className="flex-1 rounded-full bg-green-500 py-2 text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Posting..." : "Post"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-full border border-white/10 py-2 text-white hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
