import { createRouter } from "@prexress/frm";

const posts = [
  {
    id: 1,
    title: "post 1",
  },
  {
    id: 2,
    title: "post 2",
  },
  {
    id: 3,
    title: "post 3",
  },
];

export const postRouter = createRouter();
postRouter.get("/posts", (req, res) => {
  res.json({ data: posts });
});

postRouter.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  const post = posts.find((post) => post.id === Number(id));
  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }
  res.json({ data: post });
});
