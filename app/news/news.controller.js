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
    const existing = await prisma.news.findUnique({
      where: { urlText }
    })
    
    if (!existing || existing.id === excludeId) {
      return urlText
    }
    
    urlText = `${baseUrlText}-${counter}`
    counter++
  }
}

// @desc    Get all news
// @route   GET /api/admin/news
// @access  Private/Admin
export const getNews = asyncHandler(async (req, res) => {
  const news = await prisma.news.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedNews = await Promise.all(
    news.map(async (item) => ({
      ...item,
      tags: await getTagNamesByIds(item.tagIds)
    }))
  )

  res.json(formattedNews)
})

// @desc    Get news by ID
// @route   GET /api/admin/news/:id
// @access  Private/Admin
export const getNewsById = asyncHandler(async (req, res) => {
  const newsItem = await prisma.news.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!newsItem) {
    res.status(404)
    throw new Error("News not found")
  }

  const tags = await getTagNamesByIds(newsItem.tagIds)

  res.json({
    ...newsItem,
    tags
  })
})

// @desc    Create news
// @route   POST /api/admin/news
// @access  Private/Admin
export const createNews = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, date, tags = [] } = req.body

  if (!title || !description || !imgSrc || !date) {
    res.status(400)
    throw new Error("Title, description, imgSrc and date are required")
  }

  const baseUrlText = generateUrlText(title)
  const urlText = await getUniqueUrlText(baseUrlText)

  const tagIds = await getTagIdsByNames(tags)

  const newsItem = await prisma.news.create({
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
    ...newsItem,
    tags
  })
})

// @desc    Update news
// @route   PUT /api/admin/news/:id
// @access  Private/Admin
export const updateNews = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, date, tags = [] } = req.body
  const newsId = req.params.id

  const existingNews = await prisma.news.findUnique({
    where: { id: newsId }
  })

  if (!existingNews) {
    res.status(404)
    throw new Error("News not found")
  }

  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (imgSrc !== undefined) updateData.imgSrc = imgSrc
  if (date !== undefined) updateData.date = new Date(date)

  // Если изменился title, обновляем url_text
  if (title && title !== existingNews.title) {
    const baseUrlText = generateUrlText(title)
    updateData.urlText = await getUniqueUrlText(baseUrlText, newsId)
  }

  // Обновляем теги
  if (tags !== undefined) {
    updateData.tagIds = await getTagIdsByNames(tags)
  }

  const updatedNews = await prisma.news.update({
    where: { id: newsId },
    data: updateData
  })

  const tagNames = await getTagNamesByIds(updatedNews.tagIds)

  res.json({
    ...updatedNews,
    tags: tagNames
  })
})

// @desc    Delete news
// @route   DELETE /api/admin/news/:id
// @access  Private/Admin
export const deleteNews = asyncHandler(async (req, res) => {
  const newsId = req.params.id

  const existingNews = await prisma.news.findUnique({
    where: { id: newsId }
  })

  if (!existingNews) {
    res.status(404)
    throw new Error("News not found")
  }

  await prisma.news.delete({
    where: { id: newsId }
  })

  res.json({ message: "News deleted successfully" })
})
