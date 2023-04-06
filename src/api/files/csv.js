import Express from "express";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";
import { getAuthorsJSONReadableStream } from "../../lib/fs-tools.js";

const csvRouter = Express.Router();

csvRouter.get("/authors/csv", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    const source = getAuthorsJSONReadableStream();

    const transform = new Transform({
      fields: ["id", "name", "surname", "email", "DOB"],
    });
    const destination = res;
    console.log(source);
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default csvRouter;
