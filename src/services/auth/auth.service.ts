import { prisma } from "../../prismaClient";
import { signJwt } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";

export const signupService = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error("Invalid credentials");
  const token = signJwt({ userId: user.id });
  return { token, user };
};
