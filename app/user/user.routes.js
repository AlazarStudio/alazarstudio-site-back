import express from "express"

import { protect } from "../middleware/auth.middleware.js"

import { getUserProfile, updateUserProfile, updateUserTheme } from "./user.controller.js"

const router = express.Router()

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

router
  .route("/theme")
  .put(protect, updateUserTheme)

export default router
