import { withSlackRetry } from "@backbeat/notifications";
import type { PrismaClient, User } from "@backbeat/db";

export interface SlackActorClient {
  users: {
    info(input: { user: string }): Promise<{
      user?: {
        profile?: {
          email?: string;
        };
      };
    }>;
  };
}

export async function mapSlackActor(
  prisma: PrismaClient,
  client: SlackActorClient,
  slackUserId: string
): Promise<User | null> {
  const mapped = await prisma.user.findUnique({
    where: { slackUserId }
  });
  if (mapped?.active) return mapped;

  const slackUser = await withSlackRetry(() =>
    client.users.info({ user: slackUserId })
  );
  const email = slackUser.user?.profile?.email?.trim().toLowerCase();
  if (!email) return null;

  const user = await prisma.user.findFirst({
    where: {
      active: true,
      email: {
        equals: email,
        mode: "insensitive"
      }
    }
  });
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { slackUserId }
  });
}
