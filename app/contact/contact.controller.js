import asyncHandler from "express-async-handler"
import { prisma } from "../prisma.js"

// @desc    Get all contact requests
// @route   GET /api/admin/contacts
// @access  Private/Admin
export const getContactRequests = asyncHandler(async (req, res) => {
  const contacts = await prisma.contactRequest.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  res.json(contacts)
})

// @desc    Get contact request by ID
// @route   GET /api/admin/contacts/:id
// @access  Private/Admin
export const getContactRequestById = asyncHandler(async (req, res) => {
  const contact = await prisma.contactRequest.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!contact) {
    res.status(404)
    throw new Error("Contact request not found")
  }

  res.json(contact)
})

// @desc    Create contact request (public endpoint)
// @route   POST /api/contacts
// @access  Public
export const createContactRequest = asyncHandler(async (req, res) => {
  const { name, phone, email, company, budget, comment } = req.body

  if (!name || !email) {
    res.status(400)
    throw new Error("Name and email are required")
  }

  const contactRequest = await prisma.contactRequest.create({
    data: {
      name,
      phone: phone || null,
      email,
      company: company || null,
      budget: budget || null,
      comment: comment || null
    }
  })

  res.status(201).json(contactRequest)
})

// @desc    Delete contact request
// @route   DELETE /api/admin/contacts/:id
// @access  Private/Admin
export const deleteContactRequest = asyncHandler(async (req, res) => {
  const contactId = req.params.id

  const existingContact = await prisma.contactRequest.findUnique({
    where: { id: contactId }
  })

  if (!existingContact) {
    res.status(404)
    throw new Error("Contact request not found")
  }

  await prisma.contactRequest.delete({
    where: { id: contactId }
  })

  res.json({ message: "Contact request deleted successfully" })
})
