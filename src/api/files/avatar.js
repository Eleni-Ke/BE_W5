import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { extname } from "path";
import { getAuthors, saveAuthorImg, writeAuthors } from "../../lib/fs-tools.js";

const avatarRouter = Express.Router();

avatarRouter.post(
  "/:authorsId/uploadAvatar",
  multer().single("avatar"),
  async (req, res, next) => {
    try {
      const allAuthors = await getAuthors();
      const authorId = req.params.authorsId;
      const index = allAuthors.findIndex((e) => e.id === authorId);
      if (index !== -1) {
        const originalFileExt = extname(req.file.originalname);
        const fileName = authorId + originalFileExt;
        await saveAuthorImg(fileName, req.file.buffer);
        const oldAuthor = allAuthors[index];
        const updatedAuthor = {
          ...oldAuthor,
          ...req.body,
          avatar: `http://localhost:3001/img/authors/${fileName}`,
          updatedAt: new Date(),
        };
        allAuthors[index] = updatedAuthor;
        await writeAuthors(allAuthors);
        res.send({ message: "Avatar has been updated" });
      } else {
        next(
          createHttpError(404, `Author with the id: ${authorId} not found.`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default avatarRouter;
