import asyncHandler from "express-async-handler"
import { prisma } from "../prisma.js"
import { getTagIdsByNames, getTagNamesByIds } from "../utils/tag.utils.js"

// Функция для генерации url_text из title
const generateUrlText = (title) => {
  if (!title) return ''
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

// Функция для проверки уникальности url_text
const getUniqueUrlText = async (baseUrlText, excludeId = null) => {
  let urlText = baseUrlText
  let counter = 1
  
  while (true) {
    const existing = await prisma.shop.findUnique({
      where: { urlText }
    })
    
    if (!existing || existing.id === excludeId) {
      return urlText
    }
    
    urlText = `${baseUrlText}-${counter}`
    counter++
  }
}

// @desc    Get all shop items
// @route   GET /api/admin/shop
// @access  Private/Admin
export const getShopItems = asyncHandler(async (req, res) => {
  const shopItems = await prisma.shop.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedShopItems = await Promise.all(
    shopItems.map(async (item) => ({
      ...item,
      price: item.price.toString(),
      tags: await getTagNamesByIds(item.tagIds)
    }))
  )

  res.json(formattedShopItems)
})

// @desc    Get shop item by ID
// @route   GET /api/admin/shop/:id
// @access  Private/Admin
export const getShopItemById = asyncHandler(async (req, res) => {
  const shopItem = await prisma.shop.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!shopItem) {
    res.status(404)
    throw new Error("Shop item not found")
  }

  const tags = await getTagNamesByIds(shopItem.tagIds)

  res.json({
    ...shopItem,
    price: shopItem.price.toString(),
    tags
  })
})

// @desc    Create shop item
// @route   POST /api/admin/shop
// @access  Private/Admin
export const createShopItem = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, price, tags = [] } = req.body

  if (!title || !description || !imgSrc || price === undefined) {
    res.status(400)
    throw new Error("Title, description, imgSrc and price are required")
  }

  const baseUrlText = generateUrlText(title)
  const urlText = await getUniqueUrlText(baseUrlText)

  const tagIds = await getTagIdsByNames(tags)

  const shopItem = await prisma.shop.create({
    data: {
      title,
      description,
      imgSrc,
      price: parseFloat(price),
      urlText,
      tagIds
    }
  })

  res.status(201).json({
    ...shopItem,
    price: shopItem.price.toString(),
    tags
  })
})

// @desc    Update shop item
// @route   PUT /api/admin/shop/:id
// @access  Private/Admin
export const updateShopItem = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, price, tags = [] } = req.body
  const shopId = req.params.id

  const existingShopItem = await prisma.shop.findUnique({
    where: { id: shopId }
  })

  if (!existingShopItem) {
    res.status(404)
    throw new Error("Shop item not found")
  }

  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (imgSrc !== undefined) updateData.imgSrc = imgSrc
  if (price !== undefined) updateData.price = parseFloat(price)

  // Если изменился title, обновляем url_text
  if (title && title !== existingShopItem.title) {
    const baseUrlText = generateUrlText(title)
    updateData.urlText = await getUniqueUrlText(baseUrlText, shopId)
  }

  // Обновляем теги
  if (tags !== undefined) {
    updateData.tagIds = await getTagIdsByNames(tags)
  }

  const updatedShopItem = await prisma.shop.update({
    where: { id: shopId },
    data: updateData
  })

  const tagNames = await getTagNamesByIds(updatedShopItem.tagIds)

  res.json({
    ...updatedShopItem,
    price: updatedShopItem.price.toString(),
    tags: tagNames
  })
})

// @desc    Delete shop item
// @route   DELETE /api/admin/shop/:id
// @access  Private/Admin
export const deleteShopItem = asyncHandler(async (req, res) => {
  const shopId = req.params.id

  const existingShopItem = await prisma.shop.findUnique({
    where: { id: shopId }
  })

  if (!existingShopItem) {
    res.status(404)
    throw new Error("Shop item not found")
  }

  await prisma.shop.delete({
    where: { id: shopId }
  })

  res.json({ message: "Shop item deleted successfully" })
})
