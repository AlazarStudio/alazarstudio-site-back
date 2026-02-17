import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} from "./tag.controller.js"

const router = express.Router()

router
  .route("/")
  .get(protect, admin, getTags)
  .post(protect, admin, createTag)

router
  .route("/:id")
  .get(protect, admin, getTagById)
  .put(protect, admin, updateTag)
  .delete(protect, admin, deleteTag)

export default router
