import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} from "./news.controller.js"

const router = express.Router()

router
  .route("/")
  .get(protect, admin, getNews)
  .post(protect, admin, createNews)

router
  .route("/:id")
  .get(protect, admin, getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews)

export default router
