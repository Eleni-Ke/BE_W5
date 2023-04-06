import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const authorsJSONPath = join(dataFolderPath, "authors.json");
const blogpostsJSONPath = join(dataFolderPath, "blogposts.json");
const commentsJSONPath = join(dataFolderPath, "comments.json");
const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors");
const coverPublicFolderPath = join(process.cwd(), "./public/img/cover");

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (allAuthors) =>
  writeJSON(authorsJSONPath, allAuthors);
export const getBlogposts = () => readJSON(blogpostsJSONPath);
export const writeBlogposts = (allBlogposts) =>
  writeJSON(blogpostsJSONPath, allBlogposts);

export const getComments = () => readJSON(commentsJSONPath);
export const writeComments = (allComments) =>
  writeJSON(commentsJSONPath, allComments);

export const saveAuthorImg = (fileName, fileContentAsBuffer) =>
  writeFile(join(authorsPublicFolderPath, fileName), fileContentAsBuffer);

export const saveCover = (fileName, fileContentAsBuffer) =>
  writeFile(join(coverPublicFolderPath, fileName), fileContentAsBuffer);

export const getAuthorsJSONReadableStream = () =>
  createReadStream(authorsJSONPath);
