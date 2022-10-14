import express from "express";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { checkBooksSchema, checkValidationResult } from "./valditor.js";
import { sendAnEmail } from "../lib/emailTool.js";
import json2csv from "json2csv";
import { pipeline } from "stream";

const blogsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
);

const blogsRouter = express.Router();

blogsRouter.get("/CSV", (req, res, next) => {

  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogs.csv");
    const source = fs.createReadStream(blogsJSONPath)
    const destination = res;
    const transform = new json2csv.Transform({
      fields: ["id", "title", "category"]
    });

    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
     
    });
  } catch (error) {
    console.log(error)
    next(error);
    
  }
});

blogsRouter.post(
  "/",
  checkBooksSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const newblog = { ...req.body, createdAt: new Date(), id: uniqid() };

      const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath));

      blogsArray.push(newblog);

      fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray));

      res.status(201).send({ id: newblog.id });
    } catch (error) {
      next(error);
    }
  }
);

blogsRouter.get("/", (req, res, next) => {
  try {
    const fileContent = fs.readFileSync(blogsJSONPath);

    const blogs = JSON.parse(fileContent);

    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogID = req.params.blogId;

    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath));

    const foundblog = blogsArray.find((blog) => blog.id === blogID);

    res.send(foundblog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId", (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath));

    const index = blogsArray.findIndex((blog) => blog.id === req.params.blogId);
    const oldblog = blogsArray[index];

    const updatedblog = { ...oldblog, ...req.body, updatedAt: new Date() };

    blogsArray[index] = updatedblog;

    fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray));

    res.send(updatedblog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:blogId", (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath));

    const remainingblogs = blogsArray.filter(
      (blog) => blog.id !== req.params.blogId
    );

    fs.writeFileSync(blogsJSONPath, JSON.stringify(remainingblogs));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
blogsRouter.post("/send", async (req, res, next) => {
  try {
    const email = process.env.RESEBENT_EMAIL;
    console.log(email)

    await sendAnEmail(email);
    res.send({ message: "email sent" });
    
  } catch (error) {

  }
});


export default blogsRouter;
