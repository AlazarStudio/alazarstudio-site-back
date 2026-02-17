import asyncHandler from "express-async-handler"
import { prisma } from "../prisma.js"

// @desc    Get all tags
// @route   GET /api/admin/tags
// @access  Private/Admin
export const getTags = asyncHandler(async (req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  res.json(tags)
})

// @desc    Get tag by ID
// @route   GET /api/admin/tags/:id
// @access  Private/Admin
export const getTagById = asyncHandler(async (req, res) => {
  const tag = await prisma.tag.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!tag) {
    res.status(404)
    throw new Error("Tag not found")
  }

  res.json(tag)
})

// @desc    Create tag
// @route   POST /api/admin/tags
// @access  Private/Admin
export const createTag = asyncHandler(async (req, res) => {
  const { name, category } = req.body

  if (!name) {
    res.status(400)
    throw new Error("Name is required")
  }

  // Проверяем, существует ли тег с таким именем
  const existingTag = await prisma.tag.findUnique({
    where: { name }
  })

  if (existingTag) {
    res.status(400)
    throw new Error("Tag with this name already exists")
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      category: category || null
    }
  })

  res.status(201).json(tag)
})

// @desc    Update tag
// @route   PUT /api/admin/tags/:id
// @access  Private/Admin
export const updateTag = asyncHandler(async (req, res) => {
  const { name, category } = req.body
  const tagId = req.params.id

  const existingTag = await prisma.tag.findUnique({
    where: { id: tagId }
  })

  if (!existingTag) {
    res.status(404)
    throw new Error("Tag not found")
  }

  const updateData = {}
  if (name !== undefined) {
    // Проверяем уникальность имени, если оно изменилось
    if (name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: { name }
      })
      if (duplicateTag) {
        res.status(400)
        throw new Error("Tag with this name already exists")
      }
    }
    updateData.name = name
  }
  if (category !== undefined) updateData.category = category

  const updatedTag = await prisma.tag.update({
    where: { id: tagId },
    data: updateData
  })

  res.json(updatedTag)
})

// @desc    Delete tag
// @route   DELETE /api/admin/tags/:id
// @access  Private/Admin
export const deleteTag = asyncHandler(async (req, res) => {
  const tagId = req.params.id

  const existingTag = await prisma.tag.findUnique({
    where: { id: tagId }
  })

  if (!existingTag) {
    res.status(404)
    throw new Error("Tag not found")
  }

  await prisma.tag.delete({
    where: { id: tagId }
  })

  res.json({ message: "Tag deleted successfully" })
})
