import { createApp } from "@prexress/frm";

const app = createApp();

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

app.get("/", (req, res) => {
  res.status(200).json({ message: "root routes" });
});

app.get("/posts", (req, res) => {
  res.json({ data: posts });
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  const post = posts.find((post) => post.id === Number(id));
  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }
  res.json({ data: post });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
