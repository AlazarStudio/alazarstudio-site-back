import dotenv from "dotenv"
import { prisma } from "../app/prisma.js"
import { getTagIdsByNames } from "../app/utils/tag.utils.js"

dotenv.config()

// Функция для генерации url_text из title
const generateUrlText = (title) => {
  if (!title) return ""
  
  // Извлекаем текст из JSX, если это объект
  let textStr = ""
  if (typeof title === "string") {
    textStr = title
  } else if (title && typeof title === "object") {
    // Простая обработка JSX-подобных объектов
    const extractText = (node) => {
      if (typeof node === "string") return node
      if (typeof node === "number") return String(node)
      if (Array.isArray(node)) {
        return node.map(extractText).join(" ")
      }
      if (node && node.props && node.props.children) {
        return extractText(node.props.children)
      }
      return ""
    }
    textStr = extractText(title)
  } else {
    textStr = String(title)
  }

  return textStr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
}

// Функция для проверки уникальности url_text
const getUniqueUrlText = async (baseUrlText, modelName, excludeId = null) => {
  let urlText = baseUrlText
  let counter = 1

  while (true) {
    let existing = null
    switch (modelName) {
      case "case":
        existing = await prisma.case.findUnique({ where: { urlText } })
        break
      case "banner":
        existing = await prisma.banner.findUnique({ where: { urlText } })
        break
      case "news":
        existing = await prisma.news.findUnique({ where: { urlText } })
        break
      case "shop":
        existing = await prisma.shop.findUnique({ where: { urlText } })
        break
    }

    if (!existing || existing.id === excludeId) {
      return urlText
    }

    urlText = `${baseUrlText}-${counter}`
    counter++
  }
}

// Данные из casesData.jsx (вручную скопированные)
const casesDataRaw = [
  {
    id: "case-1",
    imgSrc: "/case-img-1.png",
    title: "Магазин-каталог DR. PHONE",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн. Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-2",
    imgSrc: "/case-img-2.png",
    title: "Магазин-каталог ВЕЛО МОТО DRIVE",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-3",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии1",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-4",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии2",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн1",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-5",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии3",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-6",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии4",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн1",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-7",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии5",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн1",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
  {
    id: "case-8",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии6",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн1",
    tags: ["Веб-дизайн", "frontend", "2024"],
  },
]

const bannersDataRaw = [
  {
    id: "banner-1",
    imgSrc: "/banner-img-1.png",
    title: "Какая то акция1",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
  {
    id: "banner-2",
    imgSrc: "/banner-img-2.png",
    title: "Какая то акция2",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
  {
    id: "banner-3",
    imgSrc: "/banner-img-2.png",
    title: "Какая то акция3",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
  {
    id: "banner-4",
    imgSrc: "/banner-img-2.png",
    title: "Какая то акция4",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
  {
    id: "banner-5",
    imgSrc: "/banner-img-2.png",
    title: "Какая то акция5",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
  {
    id: "banner-6",
    imgSrc: "/banner-img-2.png",
    title: "Какая то акция6",
    description: "Здесь описание. Сами карточки черные, подсвечиваются при наведении курсора",
    tags: ["Акция"],
    date: "2026-01-12",
  },
]

const newsDataRaw = [
  {
    id: "new-1",
    imgSrc: "/new-img-1.png",
    title: "Какие то новости1",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    tags: ["Новости"],
    date: "2026-01-11",
  },
  {
    id: "new-2",
    imgSrc: "/new-img-1.png",
    title: "Какие то новости2",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    tags: ["Новости"],
    date: "2026-01-12",
  },
  {
    id: "new-3",
    imgSrc: "/new-img-1.png",
    title: "Какие то новости3",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    tags: ["Новости"],
    date: "2026-01-13",
  },
  {
    id: "new-4",
    imgSrc: "/new-img-1.png",
    title: "Какие то новости4",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    tags: ["Новости"],
    date: "2026-01-14",
  },
  {
    id: "new-5",
    imgSrc: "/new-img-1.png",
    title: "Какие то новости5",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    tags: ["Новости"],
    date: "2026-01-15",
  },
]

const shopDataRaw = [
  {
    id: "shop-1",
    imgSrc: "/case-img-1.png",
    title: "Магазин-каталог DR. PHONE",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
    price: "50000",
  },
  {
    id: "shop-2",
    imgSrc: "/case-img-2.png",
    title: "Магазин-каталог ВЕЛО МОТО DRIVE",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
    price: "50000",
  },
  {
    id: "shop-3",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии123",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
    price: "50000",
  },
  {
    id: "shop-4",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии223",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
    price: "50000",
  },
  {
    id: "shop-5",
    imgSrc: "/case-img-3.png",
    title: "Сайт адвокатской коллегии323",
    description: "Продумали внутреннюю логику для масштабного проекта, разработали систему и обновили дизайн",
    tags: ["Веб-дизайн", "frontend", "2024"],
    price: "50000",
  },
]

async function migrateData() {
  try {
    console.log("Начало миграции данных...")

    // Миграция Cases
    console.log("Миграция кейсов...")
    for (const item of casesDataRaw) {
      const baseUrlText = generateUrlText(item.title)
      const urlText = await getUniqueUrlText(baseUrlText, "case")

      // Получаем ID тегов
      const tagIds = await getTagIdsByNames(item.tags)

      await prisma.case.create({
        data: {
          title: item.title,
          description: item.description,
          imgSrc: item.imgSrc,
          urlText,
          tagIds,
        },
      })
    }
    console.log(`Создано ${casesDataRaw.length} кейсов`)

    // Миграция Banners
    console.log("Миграция акций...")
    for (const item of bannersDataRaw) {
      const baseUrlText = generateUrlText(item.title)
      const urlText = await getUniqueUrlText(baseUrlText, "banner")

      const tagIds = await getTagIdsByNames(item.tags)

      await prisma.banner.create({
        data: {
          title: item.title,
          description: item.description,
          imgSrc: item.imgSrc,
          date: new Date(item.date),
          urlText,
          tagIds,
        },
      })
    }
    console.log(`Создано ${bannersDataRaw.length} акций`)

    // Миграция News
    console.log("Миграция новостей...")
    for (const item of newsDataRaw) {
      const baseUrlText = generateUrlText(item.title)
      const urlText = await getUniqueUrlText(baseUrlText, "news")

      const tagIds = await getTagIdsByNames(item.tags)

      await prisma.news.create({
        data: {
          title: item.title,
          description: item.description,
          imgSrc: item.imgSrc,
          date: new Date(item.date),
          urlText,
          tagIds,
        },
      })
    }
    console.log(`Создано ${newsDataRaw.length} новостей`)

    // Миграция Shop
    console.log("Миграция товаров...")
    for (const item of shopDataRaw) {
      const baseUrlText = generateUrlText(item.title)
      const urlText = await getUniqueUrlText(baseUrlText, "shop")

      const tagIds = await getTagIdsByNames(item.tags)

      await prisma.shop.create({
        data: {
          title: item.title,
          description: item.description,
          imgSrc: item.imgSrc,
          price: parseFloat(item.price),
          urlText,
          tagIds,
        },
      })
    }
    console.log(`Создано ${shopDataRaw.length} товаров`)

    console.log("Миграция данных завершена успешно!")
  } catch (error) {
    console.error("Ошибка миграции данных:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
