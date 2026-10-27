import { Injectable } from '@nestjs/common';
import type {
  CreateOutreach,
  OutreachConversation,
  OutreachList,
  OutreachRequest,
  OutreachStatus,
  RespondOutreach,
} from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { NotificationsService } from '../notifications/notifications.service';

const DAILY_REQUEST_LIMIT = 5;

@Injectable()
export class OutreachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, input: CreateOutreach): Promise<OutreachRequest> {
    if (userId === input.recipientId) {
      throw new AppError('SELF_OUTREACH', 'You cannot send a request to yourself');
    }
    const recipient = await this.prisma.user.findUnique({
      where: { id: input.recipientId },
      include: { publicProfile: true },
    });
    if (!recipient) throw AppError.notFound('That contributor has no platform account');
    if (!recipient.publicProfile?.published || !recipient.publicProfile.mentorOptIn) {
      throw new AppError(
        'NOT_OPTED_IN',
        recipient.githubLogin
          ? `They have not opted in to platform requests. Reach them on GitHub: https://github.com/${recipient.githubLogin}`
          : 'They have not opted in to platform requests',
        403,
      );
    }
    const blocked = await this.prisma.blockedUser.findUnique({
      where: { blockerId_blockedId: { blockerId: recipient.id, blockedId: userId } },
    });
    if (blocked) {
      throw AppError.forbidden('This contributor has blocked you');
    }
    const since = new Date(Date.now() - 86_400_000);
    const sentToday = await this.prisma.outreachRequest.count({
      where: { senderId: userId, createdAt: { gte: since } },
    });
    if (sentToday >= DAILY_REQUEST_LIMIT) {
      throw AppError.limitReached(
        `You can send ${DAILY_REQUEST_LIMIT} requests per day. Try again tomorrow.`,
        'OUTREACH_LIMIT',
      );
    }
    const pending = await this.prisma.outreachRequest.findFirst({
      where: { senderId: userId, recipientId: input.recipientId, status: 'PENDING' },
    });
    if (pending) {
      throw AppError.conflict('ALREADY_PENDING', 'You already sent them a request');
    }
    const created = await this.prisma.outreachRequest.create({
      data: {
        senderId: userId,
        recipientId: input.recipientId,
        type: input.type,
        message: input.message,
      },
      include: { sender: true, recipient: true },
    });
    await this.notifications
      .create({
        userId: recipient.id,
        type: 'OUTREACH_REQUEST',
        title: input.type === 'MENTORSHIP' ? 'New mentorship request' : 'New recruitment request',
        body: `${created.sender.name}: ${input.message.slice(0, 160)}`,
        link: '/requests',
        dedupeKey: `outreach:${created.id}`,
      })
      .catch(() => null);
    return this.toDto(created);
  }

  async list(userId: string): Promise<OutreachList> {
    const [received, sent] = await Promise.all([
      this.prisma.outreachRequest.findMany({
        where: { recipientId: userId },
        include: { sender: true, recipient: true, conversation: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.outreachRequest.findMany({
        where: { senderId: userId },
        include: { sender: true, recipient: true, conversation: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      received: received.map((row) => this.toDto(row)),
      sent: sent.map((row) => this.toDto(row)),
    };
  }

  async respond(userId: string, requestId: string, input: RespondOutreach): Promise<OutreachRequest> {
    const request = await this.prisma.outreachRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, recipient: true, conversation: true },
    });
    if (!request) throw AppError.notFound('Request not found');
    if (request.recipientId !== userId) throw AppError.forbidden('Only the recipient can respond');
    if (request.status !== 'PENDING') {
      throw AppError.conflict('ALREADY_ANSWERED', 'This request already has an answer');
    }
    const status: OutreachStatus =
      input.action === 'ACCEPT' ? 'ACCEPTED' : input.action === 'DECLINE' ? 'DECLINED' : 'BLOCKED';
    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.outreachRequest.update({
        where: { id: requestId },
        data: { status, respondedAt: new Date() },
        include: { sender: true, recipient: true, conversation: true },
      });
      if (status === 'ACCEPTED' && !saved.conversation) {
        await tx.outreachConversation.create({ data: { requestId } });
      }
      if (status === 'BLOCKED') {
        await tx.blockedUser.upsert({
          where: { blockerId_blockedId: { blockerId: userId, blockedId: request.senderId } },
          create: { blockerId: userId, blockedId: request.senderId },
          update: {},
        });
      }
      return saved;
    });
    await this.notifications
      .create({
        userId: request.senderId,
        type: status === 'ACCEPTED' ? 'OUTREACH_ACCEPTED' : 'SYSTEM',
        title:
          status === 'ACCEPTED'
            ? `${request.recipient.name} accepted your request`
            : status === 'DECLINED'
              ? 'Your request was declined'
              : 'Your request was blocked',
        body:
          status === 'ACCEPTED'
            ? 'Open Requests to continue the conversation.'
            : 'You cannot message this person again.',
        link: '/requests',
        dedupeKey: `outreach-response:${requestId}:${status}`,
      })
      .catch(() => null);
    return this.toDto(await this.prisma.outreachRequest.findUniqueOrThrow({
      where: { id: updated.id },
      include: { sender: true, recipient: true, conversation: true },
    }));
  }

  async conversation(userId: string, requestId: string): Promise<OutreachConversation> {
    const request = await this.requireParticipant(userId, requestId);
    if (request.status !== 'ACCEPTED' || !request.conversation) {
      throw AppError.conflict('NOT_ACCEPTED', 'The conversation starts after the request is accepted');
    }
    const messages = await this.prisma.outreachMessage.findMany({
      where: { conversationId: request.conversation.id },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
    return {
      id: request.conversation.id,
      requestId,
      messages: messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.name,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  }

  async sendMessage(userId: string, requestId: string, body: string): Promise<OutreachConversation> {
    const request = await this.requireParticipant(userId, requestId);
    if (request.status !== 'ACCEPTED' || !request.conversation) {
      throw AppError.conflict('NOT_ACCEPTED', 'The conversation starts after the request is accepted');
    }
    await this.prisma.outreachMessage.create({
      data: { conversationId: request.conversation.id, senderId: userId, body },
    });
    const recipientId = request.senderId === userId ? request.recipientId : request.senderId;
    await this.notifications
      .create({
        userId: recipientId,
        type: 'OUTREACH_MESSAGE',
        title: `New message from ${request.senderId === userId ? request.sender.name : request.recipient.name}`,
        body: body.slice(0, 160),
        link: '/requests',
        dedupeKey: `outreach-message:${requestId}:${Date.now()}`,
      })
      .catch(() => null);
    return this.conversation(userId, requestId);
  }

  private async requireParticipant(userId: string, requestId: string) {
    const request = await this.prisma.outreachRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, recipient: true, conversation: true },
    });
    if (!request) throw AppError.notFound('Request not found');
    if (request.senderId !== userId && request.recipientId !== userId) {
      throw AppError.notFound('Request not found');
    }
    return request;
  }

  private toDto(row: {
    id: string;
    sender: { id: string; name: string; avatarUrl: string | null; username: string | null };
    recipient: { id: string; name: string; avatarUrl: string | null; username: string | null };
    type: string;
    message: string;
    status: string;
    createdAt: Date;
    respondedAt: Date | null;
    conversation?: { id: string } | null;
  }): OutreachRequest {
    return {
      id: row.id,
      sender: {
        id: row.sender.id,
        name: row.sender.name,
        handle: row.sender.username,
        avatarUrl: row.sender.avatarUrl,
      },
      recipient: {
        id: row.recipient.id,
        name: row.recipient.name,
        handle: row.recipient.username,
        avatarUrl: row.recipient.avatarUrl,
      },
      type: row.type as OutreachRequest['type'],
      message: row.message,
      status: row.status as OutreachRequest['status'],
      conversationId: row.conversation?.id ?? null,
      createdAt: row.createdAt.toISOString(),
      respondedAt: row.respondedAt?.toISOString() ?? null,
    };
  }
}
