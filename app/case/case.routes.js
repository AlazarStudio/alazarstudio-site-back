import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
} from "./case.controller.js"

const router = express.Router()

router
  .route("/")
  .get(protect, admin, getCases)
  .post(protect, admin, createCase)

router
  .route("/:id")
  .get(protect, admin, getCaseById)
  .put(protect, admin, updateCase)
  .delete(protect, admin, deleteCase)

export default router
