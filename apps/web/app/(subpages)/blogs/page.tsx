import { Breadcrumbs } from "../../components/breadcrumbs";
import { getBlogs } from "../../lib/getBlogs";
import { BlogsClient } from "./blogs-client";

const BlogsPage = async () => {
  const posts = await getBlogs();

  return (
    <>
      <div className="container px-8 pt-4 md:pt-10">
        <Breadcrumbs items={[{ label: "Blogs" }]} />
      </div>
      <BlogsClient initialBlogs={posts} />
    </>
  );
};

export default BlogsPage;
