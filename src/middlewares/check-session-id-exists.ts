import { FastifyRequest, FastifyReply } from "fastify";

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const cookies = request.cookies.sessionId;

  if (!cookies) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }
}
