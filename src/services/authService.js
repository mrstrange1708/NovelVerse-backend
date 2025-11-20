const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma");
const PasswordValidator = require("password-validator");

const prisma = new PrismaClient();

const passwordSchema = new PasswordValidator();
passwordSchema
  .is()
  .min(8)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols()
  .has()
  .not()
  .spaces();

class AuthService {
  async register(firstName, lastName, email, password) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email is already registered");
    }
    if (!password) {
      throw new Error("Password is required");
    }
    const passwordValid = passwordSchema.validate(password, { list: true });
    if (passwordValid.length > 0) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });

    return { message: "User registered successfully" };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { message: "Login successful", token ,user };
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  }
}

module.exports = new AuthService();
