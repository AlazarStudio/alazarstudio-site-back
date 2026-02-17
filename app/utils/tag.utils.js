import { prisma } from "../prisma.js"

// Функция для получения ID тегов по именам
export const getTagIdsByNames = async (tagNames) => {
  const tagIds = []
  for (const tagName of tagNames) {
    let tag = await prisma.tag.findUnique({
      where: { name: tagName }
    })
    
    if (!tag) {
      tag = await prisma.tag.create({
        data: { name: tagName }
      })
    }
    
    tagIds.push(tag.id)
  }
  return tagIds
}

// Функция для получения имен тегов по ID
export const getTagNamesByIds = async (tagIds) => {
  if (!tagIds || tagIds.length === 0) return []
  
  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds }
    }
  })
  
  return tags.map(tag => tag.name)
}
