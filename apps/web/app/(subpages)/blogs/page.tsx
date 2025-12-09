import { BlogItem } from "../../components/blog-item";
import { getBlogs } from "../../lib/getBlogs";

const BlogsPage = async () => {
  const posts = await getBlogs();

  return (
    <div className="min-h-screen pt-4 dark:text-white md:pt-10">
      <div className="container px-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">My Blogs</h1>
        {posts.map((post, index) => (
          <div className="my-6 md:my-8 " key={post.slug}>
            <BlogItem blog={post} />
            {index !== posts.length - 1 && (
              <hr className="mt-6 border-t-slate-800 dark:border-t-slate-400 md:mt-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
