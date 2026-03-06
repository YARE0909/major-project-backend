// services/userAccessibility/userAccessibility.service.ts
import { prisma } from "../../prismaClient";

export const getUserAccessibilityProfile = async (userId: string) => {
  return prisma.userAccessibilityProfile.findUnique({
    where: { userId },
  });
};

export const upsertUserAccessibilityProfile = async (
  userId: string,
  profile: {
    wheelchair?: boolean;
    blind?: boolean;
    deaf?: boolean;
    cognitive?: boolean;
    fatigue?: boolean;
  }
) => {
  return prisma.userAccessibilityProfile.upsert({
    where: { userId },
    update: {
      wheelchair: !!profile.wheelchair,
      blind: !!profile.blind,
      deaf: !!profile.deaf,
      cognitive: !!profile.cognitive,
      fatigue: !!profile.fatigue,
    },
    create: {
      userId,
      wheelchair: !!profile.wheelchair,
      blind: !!profile.blind,
      deaf: !!profile.deaf,
      cognitive: !!profile.cognitive,
      fatigue: !!profile.fatigue,
    },
  });
};