import Express from "express";
import createHttpError from "http-errors";
import { basicAuthMiddleware } from "../../lib/auth/basic.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import AuthorsModel from "./model.js";
// import uniqid from "uniqid";
// import { getAuthors, writeAuthors } from "../../lib/fs-tools.js";

const authorsRouter = Express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    console.log(newAuthor);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/:authorsId",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const author = await AuthorsModel.findById(req.params.authorsId);
      if (author) {
        res.send(author);
      } else {
        next(
          createHttpError(
            404,
            `Author with the id: ${req.params.authorsId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.put(
  "/:authorsId",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      if (
        request.author._id.toString() === request.params.authorId ||
        request.author.role === "Admin"
      ) {
        const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
          req.params.authorsId,
          req.body,
          { new: true, runValidators: true }
        );
        if (updatedAuthor) {
          res.send(updatedAuthor);
        } else {
          next(
            createError(
              404,
              `Author with id ${req.params.authorsId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(403, "You are not authorized to update this author")
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.delete("/:authorsId", async (req, res, next) => {
  try {
    if (
      request.author._id.toString() === request.params.authorId ||
      request.author.role === "Admin"
    ) {
      const deletedAuthor = await AuthorsModel.findByIdAndDelete(
        req.params.authorsId
      );
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(
          createError(404, `Author with id ${req.params.authorsId} not found!`)
        );
      }
    } else {
      next(
        createHttpError(403, "You are not authorized to update this author")
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      const payload = { _id: author._id, role: author.role };
      const accessToken = await createAccessToken(payload);
      res.send(accessToken);
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
