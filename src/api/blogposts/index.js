import Express from "express";
import BlogpostModel from "./model.js";
import { sendsPostEmail } from "../../lib/email-tools.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { basicAuthMiddleware } from "../../lib/auth/basic.js";
import { adminOnlyMiddleware } from "../../lib/auth/admin.js";

const blogpostsRouter = Express.Router();

blogpostsRouter.get(
  "/me/stories",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const blogs = await BlogpostModel.find({
        authors: { $in: [req.author._id] },
      }).populate("authors");
      res.send(blogs);
    } catch (error) {
      next(error);
    }
  }
);

blogpostsRouter.post("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const newBlogpost = new BlogpostModel(req.body);
    newBlogpost.authors = [...newBlogpost.authors, req.author._id];

    const { _id } = await newBlogpost.save();

    //const email = req.body.author.email;
    //console.log(email);
    //await sendsPostEmail(email);

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const blogposts = await BlogpostModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    const total = await BlogpostModel.countDocuments(mongoQuery.criteria);
    res.send({
      links: mongoQuery.links("http://localhost:3001/blogposts", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      blogposts,
    });
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:postsId", async (req, res, next) => {
  try {
    const blogpost = await BlogpostModel.findById(req.params.postsId);
    if (blogpost) {
      res.send(blogpost);
    } else {
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostsId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.put(
  "/:postsId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const blog = await BlogpostModel.findById(req.params.postsId);
      if (
        blog.authors.includes(req.author._id) ||
        req.author.role === "Admin"
      ) {
        const updatedBlog = await BlogpostModel.findByIdAndUpdate(
          req.params.postsId,
          req.body,
          { new: true, runValidators: true }
        );
        if (updatedBlog) {
          res.send(updatedBlog);
        } else {
          next(
            createHttpError(404, {
              message: `Blog with _id ${request.params.postsId} was not found!`,
            })
          );
        }
      } else {
        next(
          createHttpError(403, "You are not authorized to update this blog!")
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogpostsRouter.delete("/:postsId", async (req, res, next) => {
  try {
    const blog = await BlogpostModel.findById(req.params.postsId);
    if (blog.authors.includes(req.author._id) || req.author.role === "Admin") {
      const deletedBlog = await BlogpostModel.findByIdAndDelete(
        req.params.postsId
      );
      if (deletedBlog) {
        response.status(204).send();
      } else {
        next(
          createHttpError(404, {
            message: `Blog with _id ${req.params.postsId} was not found!`,
          })
        );
      }
    } else {
      next(createHttpError(403, "You are not authorized to delete this blog!"));
    }
  } catch (error) {
    next(error);
  }
});

// *********************** EMBEDDED CRUD ***************************

blogpostsRouter.post("/:postsId/comments", async (req, res, next) => {
  try {
    const commentToAdd = {
      ...req.body,
      commentCreatedAt: new Date(),
      commentUpdatedAt: new Date(),
    };
    const updatedPost = await BlogpostModel.findByIdAndUpdate(
      req.params.postsId,
      { $push: { comments: commentToAdd } },
      { new: true, runValidator: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(
        createHttpError(
          404,
          `Blogpost witht the id: ${req.params.postsId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:postsId/comments", async (req, res, next) => {
  try {
    const post = await BlogpostModel.findById(req.params.postsId);
    if (post) {
      res.send(post.comments);
    } else {
      next(
        createHttpError(
          404,
          `Blogpost witht the id: ${req.params.postsId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:postsId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await BlogpostModel.findById(req.params.postsId);
    if (post) {
      const comment = post.comments.find(
        (e) => e._id.toString() === req.params.commentId
      );
      if (comment) {
        res.send(comment);
      } else {
        next(
          createHttpError(
            404,
            `Comment witht the id: ${req.params.commentId} not found.`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Blogpost witht the id: ${req.params.postsId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.put("/:postsId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await BlogpostModel.findById(req.params.postsId);
    if (post) {
      const index = post.comments.findIndex(
        (e) => e._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        post.comments[index] = {
          ...post.comments[index].toObject(),
          ...req.body,
          commentUpdatedAt: new Date(),
        };
        await post.save();
        res.send(post);
      } else {
        next(
          createHttpError(
            404,
            `Comment witht the id: ${req.params.commentId} not found.`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Blogpost witht the id: ${req.params.postsId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.delete(
  "/:postsId/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedPost = await BlogpostModel.findByIdAndUpdate(
        req.params.postsId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send(updatedPost);
      } else {
        next(
          createHttpError(
            404,
            `Blogpost witht the id: ${req.params.postsId} not found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// *********************** LIKES *********************

blogpostsRouter.post("/:postsId/like", async (req, res, next) => {
  try {
    const idToInsert = req.body.id;
    const post = await BlogpostModel.findById(req.params.postsId);
    if (!post)
      return next(
        createHttpError(
          404,
          `Blogpost witht the id: ${req.params.postsId} not found.`
        )
      );
    const index = post.likes.findIndex((e) => e === req.body.id);
    if (index === -1) {
      const updatedPost = await BlogpostModel.findByIdAndUpdate(
        req.params.postsId,
        { $push: { likes: idToInsert } },
        { new: true, runValidators: true }
      );
      if (!updatedPost)
        return next(
          createHttpError(
            404,
            `Blogpost witht the id: ${req.params.postsId} not found.`
          )
        );
      res.send(updatedPost);
    } else {
      const updatedPost = await BlogpostModel.findByIdAndUpdate(
        req.params.postsId,
        { $pull: { likes: idToInsert } },
        { new: true, runValidators: true }
      );
      if (!updatedPost)
        return next(
          createHttpError(
            404,
            `Blogpost witht the id: ${req.params.postsId} not found.`
          )
        );
      res.send(updatedPost);
    }
  } catch (error) {
    next(error);
  }
});

export default blogpostsRouter;
