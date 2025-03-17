import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import usePageTitle from '../../hooks/usePageTitle';
import { MarkdownRenderers } from '../blog/MarkdownRenderers';
import { 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  getPostById,
  type Post, 
  type PostList,
  type PostCreate} from '../../services/api';

// Preview components berdasarkan referensi PostDetail
const PostPreviewHeader: React.FC<{ title: string; date: string }> = ({ title, date }) => (
  <header className="mb-8">
    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
    <div className="flex items-center text-gray-400 text-sm">
      <span className="mr-4">
        <span className="font-medium">Posted:</span>{' '}
        {new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
    </div>
  </header>
);

const PostPreviewContent: React.FC<{ content: string; isPublished?: boolean }> = ({ content }) => {
  if (!content || content.trim() === '') {
    return (
      <div className="prose prose-invert prose-lg max-w-none">
        <div className="p-4 rounded-md bg-gray-700 border border-yellow-500">
          <p className="text-yellow-400 font-semibold">
            No content available for preview.
          </p>
          <p className="text-gray-300 mt-2">
            Please add some content before publishing this post.
          </p>
        </div>
      </div>
    );
  }
  
  // For both published and unpublished posts, show the content preview if available
  return (
    <div className="prose prose-invert prose-lg max-w-none overflow-visible">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={MarkdownRenderers}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const Posts: React.FC = () => {
  // Mengatur judul halaman
  usePageTitle('Manage Posts');
  
  const [posts, setPosts] = useState<PostList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 5;
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [publishedStatus, setPublishedStatus] = useState<"published" | "unpublished" | "all">("all");
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchQuery, filterTag, publishedStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Pass all parameters including publishedStatus
      const skip = (currentPage - 1) * postsPerPage;
      const data = await getAllPosts(
        skip, 
        postsPerPage, 
        publishedStatus, 
        searchQuery || undefined,
        filterTag || undefined
      );
      
      // Update posts from items array
      setPosts(data.items);
      
      // Set total posts count from API metadata
      setTotalPosts(data.total_count);
      
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchPosts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterTag('');
    setPublishedStatus("all");
    setCurrentPage(1);
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setSlug('');
    setExcerpt('');
    setPublished(false);
    setTags([]);
    setTagInput('');
    setShowForm(true);
  };

  const handleEdit = async (post: PostList) => {
    try {
      setLoading(true);
      // Get full post data including content
      const fullPost = await getPostById(post.id);
      
      setEditingPost(fullPost);
      setTitle(fullPost.title);
      setContent(fullPost.content || "");
      setSlug(fullPost.slug);
      setExcerpt(fullPost.excerpt);
      setTags(fullPost.tags || []);
      setTagInput('');
      setPublished(fullPost.published ?? post.published);
      setShowForm(true);
      
      // Show warning if content is empty (regardless of publication status)
      if (!fullPost.content) {
        toast('Failed to retrieve post content. You will need to re-enter the content.', {
          icon: '⚠️', // Warning icon
          duration: 5000
        });
      }
    } catch (error) {
      toast.error('Failed to load post details');
      console.error('Error fetching post details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deletePost(postToDelete);
      toast.success('Post deleted successfully');
      
      // Remove the deleted post from the current posts list
      setPosts(posts.filter(post => post.id !== postToDelete));
      
      // If we deleted the last post on this page, go back one page
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchPosts(); // Refresh the current page to get updated count
      }
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const postData: PostCreate = {
        title,
        content,
        excerpt: excerpt || undefined,
        published,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        tags: tags.length > 0 ? tags : undefined
      };
      
      if (editingPost) {
        await updatePost(editingPost.id, postData);
        toast.success('Post updated successfully');
      } else {
        await createPost(postData);
        toast.success('Post created successfully');
      }
      
      setShowForm(false);
      fetchPosts(); // This will refresh the posts and update the count from the API
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || 'Failed to save post');
      } else {
        toast.error('Failed to save post');
      }
      console.error('Error saving post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle if possible
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      if (endPage < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const togglePublished = async (post: PostList) => {
    try {
      setLoading(true);
      
      // Get full post data first
      const fullPost = await getPostById(post.id);
      
      // Toggle the published status
      const updatedData: PostCreate = {
        title: fullPost.title,
        content: fullPost.content || "", // Handle potentially empty content
        excerpt: fullPost.excerpt,
        slug: fullPost.slug,
        published: !post.published, // Toggle based on current state in the list
        tags: fullPost.tags
      };
      
      await updatePost(post.id, updatedData);
      
      toast.success(`Post ${updatedData.published ? 'published' : 'unpublished'} successfully`);
      fetchPosts(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update publication status');
      console.error('Error updating publication status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400">Manage yudopr blog content</p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="btn-primary"
          >
            Create New Post
          </button>
        )}
      </div>

      {/* Search & Filter */}
      {!showForm && (
        <div className="bg-gray-800 p-4 rounded-xl mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
                  Search Posts
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field text-white bg-gray-700 w-full"
                  placeholder="Search by title, content or excerpt..."
                />
              </div>
              <div className="md:w-1/4">
                <label htmlFor="tag" className="block text-sm font-medium text-gray-400 mb-1">
                  Filter by Tag
                </label>
                <input
                  id="tag"
                  type="text"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="input-field text-white bg-gray-700 w-full"
                  placeholder="Enter tag name"
                />
              </div>
              <div className="md:w-1/4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">
                  Publication Status
                </label>
                <select
                  id="status"
                  value={publishedStatus}
                  onChange={(e) => setPublishedStatus(e.target.value as "published" | "unpublished" | "all")}
                  className="input-field text-white bg-gray-700 w-full"
                >
                  <option value="all">All Posts</option>
                  <option value="published">Published Only</option>
                  <option value="unpublished">Drafts Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {(searchQuery || filterTag || publishedStatus !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="submit"
                className="btn-primary"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Post Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Left Column - Form (wider) */}
            <div className="lg:w-3/5 pr-4 overflow-y-auto h-[calc(100vh-19rem)]">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-6 flex-1">
                  <div className="p-0.5">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field text-white bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="Post title"
                      required
                    />
                  </div>

                  <div className="p-0.5">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-400 mb-1">
                      Slug (URL identifier)
                    </label>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="input-field text-white bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="post-url-identifier (leave empty to generate from title)"
                    />
                  </div>

                  <div className="p-0.5">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-400 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="input-field text-white bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="Short summary of the post (will be generated automatically if empty)"
                      rows={3}
                    />
                  </div>

                  <div className="p-0.5">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-1">
                      Tags (optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            e.preventDefault();
                            if (!tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                            }
                            setTagInput('');
                          }
                        }}
                        className="input-field text-white bg-gray-700 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput('');
                          }
                        }}
                        className="btn-primary px-4 flex items-center justify-center font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <div key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md flex items-center">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setTags(tags.filter((_, i) => i !== index))}
                              className="ml-2 text-gray-400 hover:text-gray-200"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Tags will be automatically generated if not provided
                    </p>
                  </div>
                  
                  <div className="flex flex-col flex-1 p-0.5">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">
                      Content (Markdown)
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => {
                        // Handle Ctrl+] to add indentation (tab)
                        if (e.ctrlKey && e.key === ']') {
                          e.preventDefault();
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          
                          // If there's selected text, add tab to the beginning of each line in selection
                          if (start !== end) {
                            const selectedText = content.substring(start, end);
                            const lines = selectedText.split('\n');
                            const newText = lines.map(line => '  ' + line).join('\n');
                            const newContent = 
                              content.substring(0, start) + 
                              newText + 
                              content.substring(end);
                            
                            setContent(newContent);
                            
                            // Set the selection to the newly indented text
                            setTimeout(() => {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + newText.length;
                            }, 0);
                          } else {
                            // If no selection, find the current line and add indentation at its beginning
                            const lineStart = content.lastIndexOf('\n', start - 1) + 1;
                            const lineEnd = content.indexOf('\n', start);
                            const currentLine = content.substring(
                              lineStart, 
                              lineEnd === -1 ? content.length : lineEnd
                            );
                            
                            // Calculate cursor's position relative to the line start
                            const cursorOffsetInLine = start - lineStart;
                            
                            // Create new content with indentation at the beginning of the line
                            const newContent = 
                              content.substring(0, lineStart) + 
                              '  ' + currentLine + 
                              content.substring(lineEnd === -1 ? content.length : lineEnd);
                            
                            setContent(newContent);
                            
                            // Move cursor to the same relative position in the indented line
                            setTimeout(() => {
                              const newCursorPos = lineStart + 2 + cursorOffsetInLine;
                              textarea.selectionStart = textarea.selectionEnd = newCursorPos;
                            }, 0);
                          }
                        }
                        
                        // Handle Ctrl+[ to remove indentation
                        if (e.ctrlKey && e.key === '[') {
                          e.preventDefault();
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          
                          // If there's selected text, remove one level of indentation from each line
                          if (start !== end) {
                            const selectedText = content.substring(start, end);
                            const lines = selectedText.split('\n');
                            const newText = lines.map(line => {
                              if (line.startsWith('  ')) return line.substring(2);
                              if (line.startsWith(' ')) return line.substring(1);
                              return line;
                            }).join('\n');
                            
                            const newContent = 
                              content.substring(0, start) + 
                              newText + 
                              content.substring(end);
                            
                            setContent(newContent);
                            
                            // Update selection to match the new text boundaries
                            setTimeout(() => {
                              textarea.selectionStart = start;
                              textarea.selectionEnd = start + newText.length;
                            }, 0);
                          } else {
                            // If no selection, check if we can unindent the current line
                            const lineStart = content.lastIndexOf('\n', start - 1) + 1;
                            const lineEnd = content.indexOf('\n', start);
                            const currentLine = content.substring(
                              lineStart, 
                              lineEnd === -1 ? content.length : lineEnd
                            );
                            
                            if (currentLine.startsWith('  ')) {
                              // Remove two spaces
                              const newContent = 
                                content.substring(0, lineStart) + 
                                currentLine.substring(2) + 
                                content.substring(lineEnd === -1 ? content.length : lineEnd);
                              
                              setContent(newContent);
                              
                              // Adjust cursor position
                              setTimeout(() => {
                                const newPos = Math.max(start - 2, lineStart);
                                textarea.selectionStart = textarea.selectionEnd = newPos;
                              }, 0);
                            } else if (currentLine.startsWith(' ')) {
                              // Remove one space
                              const newContent = 
                                content.substring(0, lineStart) + 
                                currentLine.substring(1) + 
                                content.substring(lineEnd === -1 ? content.length : lineEnd);
                              
                              setContent(newContent);
                              
                              // Adjust cursor position
                              setTimeout(() => {
                                const newPos = Math.max(start - 1, lineStart);
                                textarea.selectionStart = textarea.selectionEnd = newPos;
                              }, 0);
                            }
                          }
                        }
                      }}
                      className="input-field text-white bg-gray-700 w-full h-full flex-1 resize-y min-h-[350px] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      placeholder="Write your post content in Markdown format... (Use Ctrl+] to indent, Ctrl+[ to unindent)"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="published"
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-600 rounded"
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-300">
                      Published (visible to readers)
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary relative"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="opacity-0">{editingPost ? 'Update Post' : 'Create Post'}</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <ArrowPathIcon className="animate-spin h-5 w-5 text-white" />
                        </span>
                      </>
                    ) : (
                      editingPost ? 'Update Post' : 'Create Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Right Column - Preview (narrower) */}
            <div className="lg:w-2/5 flex flex-col">
              <div className="sticky top-2 flex flex-col bg-gray-900 rounded-xl border border-gray-700 h-[calc(100vh-19rem)]">
                <h3 className="text-lg font-semibold text-white p-4 border-b border-gray-700">Post Preview</h3>
                <div className="overflow-auto p-6 flex-1">
                  <article className="min-w-full">
                    <PostPreviewHeader 
                      title={title || 'Untitled Post'} 
                      date={editingPost?.created_at || new Date().toISOString()} 
                    />
                    <PostPreviewContent 
                      content={content} 
                      isPublished={published} 
                    />
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      {!showForm && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary-400 rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts found. Create your first post!</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Excerpt
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{post.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{post.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">{post.excerpt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => togglePublished(post)}
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.published 
                                ? 'bg-green-900 text-green-100 hover:bg-green-800' 
                                : 'bg-yellow-900 text-yellow-100 hover:bg-yellow-800'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-primary-400 hover:text-primary-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`mx-1 px-3 py-2 rounded-md ${
                        currentPage === 1 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      &laquo; Prev
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        className={`mx-1 px-3 py-2 rounded-md ${
                          page === currentPage
                            ? 'bg-primary-500 text-white' 
                            : page === '...'
                              ? 'text-gray-500 cursor-default'
                              : 'text-gray-300 hover:bg-gray-700'
                        }`}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`mx-1 px-3 py-2 rounded-md ${
                        currentPage === totalPages 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Next &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-700">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-900/30 p-2 rounded-full mr-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Confirm Deletion</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors relative"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="opacity-0">Delete</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <ArrowPathIcon className="animate-spin h-5 w-5 text-white" />
                      </span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts; 