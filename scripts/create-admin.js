import dotenv from "dotenv"
import { hash } from "argon2"
import { prisma } from "../app/prisma.js"
import readline from "readline"

dotenv.config()

// Функция для чтения ввода из консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  try {
    console.log("=== Создание администратора ===\n")

    // Получаем данные от пользователя
    const login = await question("Логин: ")
    if (!login) {
      console.error("Логин обязателен!")
      process.exit(1)
    }

    const email = await question("Email: ")
    if (!email) {
      console.error("Email обязателен!")
      process.exit(1)
    }

    // Проверяем email формат
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("Неверный формат email!")
      process.exit(1)
    }

    const password = await question("Пароль: ")
    if (!password) {
      console.error("Пароль обязателен!")
      process.exit(1)
    }

    if (password.length < 6) {
      console.error("Пароль должен быть не менее 6 символов!")
      process.exit(1)
    }

    const name = await question("Имя (необязательно, нажмите Enter для пропуска): ") || null

    console.log("\nПроверка существующих пользователей...")

    // Проверяем, существует ли пользователь с таким логином
    const existingUser = await prisma.user.findUnique({
      where: { login }
    })

    if (existingUser) {
      console.error(`Пользователь с логином "${login}" уже существует!`)
      process.exit(1)
    }

    // Проверяем, существует ли пользователь с таким email
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      console.error(`Пользователь с email "${email}" уже существует!`)
      process.exit(1)
    }

    console.log("Создание пользователя...")

    // Хешируем пароль
    const hashedPassword = await hash(password)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        login,
        email,
        password: hashedPassword,
        name: name || `Admin ${login}`,
        role: "SUPERADMIN"
      },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log("\n✅ Администратор успешно создан!")
    console.log("\nДанные пользователя:")
    console.log(`  ID: ${user.id}`)
    console.log(`  Логин: ${user.login}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Имя: ${user.name}`)
    console.log(`  Роль: ${user.role}`)
    console.log(`  Создан: ${user.createdAt.toLocaleString("ru-RU")}`)
    console.log("\nТеперь вы можете войти в админ панель используя эти данные.")

  } catch (error) {
    console.error("\n❌ Ошибка при создании администратора:", error.message)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin()
