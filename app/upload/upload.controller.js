import asyncHandler from "express-async-handler"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs/promises"
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Upload file and convert to webp
// @route   POST /api/admin/upload
// @access  Private/Admin
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error("No file uploaded")
  }

  try {
    const inputPath = req.file.path
    const originalName = path.parse(req.file.originalname).name
    const webpFilename = `${originalName}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
    const webpPath = path.join(path.dirname(inputPath), webpFilename)

    // Конвертируем в webp
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(webpPath)

    // Удаляем оригинальный файл
    await fs.unlink(inputPath)

    // Возвращаем путь к webp файлу
    const filePath = `/uploads/${webpFilename}`

    res.json({
      success: true,
      filePath,
      filename: webpFilename,
      originalName: req.file.originalname,
      size: (await fs.stat(webpPath)).size
    })
  } catch (error) {
    // Удаляем загруженный файл в случае ошибки
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }
    res.status(500)
    throw new Error(`Ошибка обработки изображения: ${error.message}`)
  }
})

// @desc    Upload multiple files
// @route   POST /api/admin/upload/multiple
// @access  Private/Admin
export const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error("No files uploaded")
  }

  const files = []
  
  for (const file of req.files) {
    try {
      const inputPath = file.path
      const originalName = path.parse(file.originalname).name
      const webpFilename = `${originalName}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
      const webpPath = path.join(path.dirname(inputPath), webpFilename)

      // Конвертируем в webp
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(webpPath)

      // Удаляем оригинальный файл
      await fs.unlink(inputPath)

      const filePath = `/uploads/${webpFilename}`
      const stats = await fs.stat(webpPath)

      files.push({
        filePath,
        filename: webpFilename,
        originalName: file.originalname,
        size: stats.size
      })
    } catch (error) {
      // Удаляем файл в случае ошибки
      if (file.path) {
        try {
          await fs.unlink(file.path)
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError)
        }
      }
      console.error(`Error processing file ${file.originalname}:`, error)
    }
  }

  if (files.length === 0) {
    res.status(500)
    throw new Error("Не удалось обработать ни одного файла")
  }

  res.json({
    success: true,
    files
  })
})
