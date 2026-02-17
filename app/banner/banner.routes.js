import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} from "./banner.controller.js"

const router = express.Router()

router
  .route("/")
  .get(protect, admin, getBanners)
  .post(protect, admin, createBanner)

router
  .route("/:id")
  .get(protect, admin, getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner)

export default router
