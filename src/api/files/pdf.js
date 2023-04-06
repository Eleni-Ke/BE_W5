import Express from "express";
import { getBlogposts } from "../../lib/fs-tools.js";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";

const pdfRouter = Express.Router();

pdfRouter.get("/:postsId/pdf", async (req, res, next) => {
  try {
    const postId = req.params.postsId;
    const allPosts = await getBlogposts();
    const matchedPost = allPosts.find((e) => e.id === postId);
    if (matchedPost) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${matchedPost.title}.pdf`
      );
      const source = await getPDFReadableStream(matchedPost);
      const destination = res;
      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      console.log("there has been an error");
    }
  } catch (error) {
    next(error);
  }
});

export default pdfRouter;
