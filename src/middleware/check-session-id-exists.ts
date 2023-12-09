import { FastifyReply, FastifyRequest } from 'fastify';
import { knex } from '../database';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
    };
  }
}

export async function checkSessionIdExists(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return response.status(401).send({
      error: 'Unauthorized',
    });
  }

  const user = await getUserBySessionId(sessionId);

  if (!user) {
    return response.status(401).send({
      error: 'User not found.',
    });
  }

  request.user = user;
}

async function getUserBySessionId(sessionId: string) {
  return await knex('users').where('session_id', sessionId).select('id').first();
}
