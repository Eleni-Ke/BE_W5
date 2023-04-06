import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { extname } from "path";
import { getBlogposts, saveCover, writeBlogposts } from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";

const coverRouter = Express.Router();
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "blogposts/covers" },
  }),
}).single("cover");

coverRouter.post(
  "/:blogpostsId/uploadCover",
  // multer().single("cover"),
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const allBlogposts = await getBlogposts();
      const blogpostId = req.params.blogpostsId;
      const index = allBlogposts.findIndex((e) => e.id === blogpostId);
      if (index !== -1) {
        // const originalFileExt = extname(req.file.originalname);
        // const fileName = blogpostId + originalFileExt;
        // await saveCover(fileName, req.file.buffer);

        const oldPost = allBlogposts[index];
        const updatedAuthor = {
          ...oldPost,
          ...req.body,
          cover: req.file.path,
          updatedAt: new Date(),
        };
        allBlogposts[index] = updatedAuthor;
        await writeBlogposts(allBlogposts);
        res.send({ message: "Cover has been updated" });
      } else {
        next(
          createHttpError(404, `Blogpost with the id: ${blogpostId} not found.`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default coverRouter;
