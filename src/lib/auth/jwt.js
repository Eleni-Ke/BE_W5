import createHttpError from "http-errors";
import jwt, { verify } from "jsonwebtoken";
import AuthorsModel from "../../api/authors/model.js";
import { verifyAccessToken } from "./tools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide Bearer token in authorization header."
      )
    );
  } else {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    try {
      const payload = await verifyAccessToken(accessToken);
      req.author = { _id: payload._id, role: payload.role };
      next();
    } catch (error) {
      next(createHttpError(401, "Token not valid! Please log in again!"));
    }
  }
};
