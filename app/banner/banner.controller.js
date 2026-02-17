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
    const existing = await prisma.banner.findUnique({
      where: { urlText }
    })
    
    if (!existing || existing.id === excludeId) {
      return urlText
    }
    
    urlText = `${baseUrlText}-${counter}`
    counter++
  }
}

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedBanners = await Promise.all(
    banners.map(async (item) => ({
      ...item,
      tags: await getTagNamesByIds(item.tagIds)
    }))
  )

  res.json(formattedBanners)
})

// @desc    Get banner by ID
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
export const getBannerById = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!banner) {
    res.status(404)
    throw new Error("Banner not found")
  }

  const tags = await getTagNamesByIds(banner.tagIds)

  res.json({
    ...banner,
    tags
  })
})

// @desc    Create banner
// @route   POST /api/admin/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, date, tags = [] } = req.body

  if (!title || !description || !imgSrc || !date) {
    res.status(400)
    throw new Error("Title, description, imgSrc and date are required")
  }

  const baseUrlText = generateUrlText(title)
  const urlText = await getUniqueUrlText(baseUrlText)

  const tagIds = await getTagIdsByNames(tags)

  const banner = await prisma.banner.create({
    data: {
      title,
      description,
      imgSrc,
      date: new Date(date),
      urlText,
      tagIds
    }
  })

  res.status(201).json({
    ...banner,
    tags
  })
})

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, date, tags = [] } = req.body
  const bannerId = req.params.id

  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId }
  })

  if (!existingBanner) {
    res.status(404)
    throw new Error("Banner not found")
  }

  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (imgSrc !== undefined) updateData.imgSrc = imgSrc
  if (date !== undefined) updateData.date = new Date(date)

  // Если изменился title, обновляем url_text
  if (title && title !== existingBanner.title) {
    const baseUrlText = generateUrlText(title)
    updateData.urlText = await getUniqueUrlText(baseUrlText, bannerId)
  }

  // Обновляем теги
  if (tags !== undefined) {
    updateData.tagIds = await getTagIdsByNames(tags)
  }

  const updatedBanner = await prisma.banner.update({
    where: { id: bannerId },
    data: updateData
  })

  const tagNames = await getTagNamesByIds(updatedBanner.tagIds)

  res.json({
    ...updatedBanner,
    tags: tagNames
  })
})

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const bannerId = req.params.id

  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId }
  })

  if (!existingBanner) {
    res.status(404)
    throw new Error("Banner not found")
  }

  await prisma.banner.delete({
    where: { id: bannerId }
  })

  res.json({ message: "Banner deleted successfully" })
})
