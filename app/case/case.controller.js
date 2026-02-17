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
    const existing = await prisma.case.findUnique({
      where: { urlText }
    })
    
    if (!existing || existing.id === excludeId) {
      return urlText
    }
    
    urlText = `${baseUrlText}-${counter}`
    counter++
  }
}

// @desc    Get all cases
// @route   GET /api/admin/cases
// @access  Private/Admin
export const getCases = asyncHandler(async (req, res) => {
  const cases = await prisma.case.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedCases = await Promise.all(
    cases.map(async (item) => ({
      ...item,
      tags: await getTagNamesByIds(item.tagIds)
    }))
  )

  res.json(formattedCases)
})

// @desc    Get case by ID
// @route   GET /api/admin/cases/:id
// @access  Private/Admin
export const getCaseById = asyncHandler(async (req, res) => {
  const caseItem = await prisma.case.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!caseItem) {
    res.status(404)
    throw new Error("Case not found")
  }

  const tags = await getTagNamesByIds(caseItem.tagIds)

  res.json({
    ...caseItem,
    tags
  })
})

// @desc    Create case
// @route   POST /api/admin/cases
// @access  Private/Admin
export const createCase = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, tags = [] } = req.body

  if (!title || !description || !imgSrc) {
    res.status(400)
    throw new Error("Title, description and imgSrc are required")
  }

  const baseUrlText = generateUrlText(title)
  const urlText = await getUniqueUrlText(baseUrlText)

  // Получаем ID тегов
  const tagIds = await getTagIdsByNames(tags)

  const caseItem = await prisma.case.create({
    data: {
      title,
      description,
      imgSrc,
      urlText,
      tagIds
    }
  })

  res.status(201).json({
    ...caseItem,
    tags
  })
})

// @desc    Update case
// @route   PUT /api/admin/cases/:id
// @access  Private/Admin
export const updateCase = asyncHandler(async (req, res) => {
  const { title, description, imgSrc, tags = [] } = req.body
  const caseId = req.params.id

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId }
  })

  if (!existingCase) {
    res.status(404)
    throw new Error("Case not found")
  }

  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (imgSrc !== undefined) updateData.imgSrc = imgSrc

  // Если изменился title, обновляем url_text
  if (title && title !== existingCase.title) {
    const baseUrlText = generateUrlText(title)
    updateData.urlText = await getUniqueUrlText(baseUrlText, caseId)
  }

  // Обновляем теги
  if (tags !== undefined) {
    updateData.tagIds = await getTagIdsByNames(tags)
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: updateData
  })

  const tagNames = await getTagNamesByIds(updatedCase.tagIds)

  res.json({
    ...updatedCase,
    tags: tagNames
  })
})

// @desc    Delete case
// @route   DELETE /api/admin/cases/:id
// @access  Private/Admin
export const deleteCase = asyncHandler(async (req, res) => {
  const caseId = req.params.id

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId }
  })

  if (!existingCase) {
    res.status(404)
    throw new Error("Case not found")
  }

  await prisma.case.delete({
    where: { id: caseId }
  })

  res.json({ message: "Case deleted successfully" })
})
