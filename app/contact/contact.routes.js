import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getContactRequests,
  getContactRequestById,
  createContactRequest,
  deleteContactRequest
} from "./contact.controller.js"

const router = express.Router()

// Public route for creating contact requests
router.route("/").post(createContactRequest)

// Admin routes
router
  .route("/admin")
  .get(protect, admin, getContactRequests)

router
  .route("/admin/:id")
  .get(protect, admin, getContactRequestById)
  .delete(protect, admin, deleteContactRequest)

export default router
