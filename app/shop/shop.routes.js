import express from "express"
import { protect, admin } from "../middleware/auth.middleware.js"
import {
  getShopItems,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem
} from "./shop.controller.js"

const router = express.Router()

router
  .route("/")
  .get(protect, admin, getShopItems)
  .post(protect, admin, createShopItem)

router
  .route("/:id")
  .get(protect, admin, getShopItemById)
  .put(protect, admin, updateShopItem)
  .delete(protect, admin, deleteShopItem)

export default router
