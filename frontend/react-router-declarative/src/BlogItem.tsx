import { useParams } from "react-router";

function BlogItem() {
  const { slug } = useParams();
  return <div>Blog item: {slug}</div>;
}

export default BlogItem;
