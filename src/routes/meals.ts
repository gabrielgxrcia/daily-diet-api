import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { knex } from '../database';
import crypto from 'node:crypto';
import { z } from 'zod';
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_on_diet: boolean;
}

interface Summary {
  'Total de refeições registradas': number;
  'Total de refeições dentro da dieta': number;
  'Total de refeições fora da dieta': number;
}

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionIdExists] }, createMealHandler);
  app.get('/', { preHandler: [checkSessionIdExists] }, getMealsHandler);
  app.get('/:id', { preHandler: [checkSessionIdExists] }, getMealHandler);
  app.get('/summary', { preHandler: [checkSessionIdExists] }, getMealsSummaryHandler);
  app.delete('/:id', { preHandler: [checkSessionIdExists] }, deleteMealHandler);
}

async function createMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const { name, description, isOnTheDiet } = parseMealData(request);

    if (!request.user) {
      throw new Error('User not found');
    }

    await createMeal(request.user.id, name, description, isOnTheDiet);

    response.status(201).send();
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function getMealsHandler(request: FastifyRequest, response: FastifyReply) {
  if (!request.user) {
    return response.status(401).send({
      error: 'User not found.',
    });
  }

  const userId = request.user.id;

  const meals = await knex<Meal>('meals').where('user_id', userId).select();
  return { meals } as { meals: Meal[] };
}

async function getMealHandler(request: FastifyRequest) {
  try {
    const params = getMealParams(request);
    const meal = await knex<Meal>('meals').where('id', params.id).first();
    return { meal } as { meal: Meal | undefined };
  } catch (error: unknown) {
    return { error: (error as Error).message } as { error: string };
  }
}

async function deleteMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const params = getMealParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const [user] = await knex('users')
      .where('session_id', sessionId)
      .select('id');

    const userId = user.id;

    const meal = await knex('meals')
      .where('id', params.id)
      .andWhere('user_id', userId)
      .first();

    if (!meal) {
      return response.status(404).send({
        error: 'Refeição não encontrada.',
      });
    }

    await knex('meals')
      .where('id', params.id)
      .andWhere('user_id', userId)
      .delete();

    response.status(204).send('Refeição deletada com sucesso.');
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function getMealsSummaryHandler(request: FastifyRequest, response: FastifyReply) {
  if (!request.user) {
    return response.status(401).send({
      error: 'User not found.',
    });
  }

  const userId = request.user.id;

  try {
    const count = await knex('meals').count('id', {
      as: 'Total de refeições registradas',
    }).where('user_id', userId);

    const refDieta = await knex('meals')
      .count('id', { as: 'Total de refeições dentro da dieta' })
      .where('is_on_diet', true)
      .andWhere('user_id', userId);

    const refForaDieta = await knex('meals')
      .count('id', { as: 'Total de refeições fora da dieta' })
      .where('is_on_diet', false)
      .andWhere('user_id', userId);

    const summary: Summary = {
      'Total de refeições registradas': parseInt(count[0]['Total de refeições registradas'] as string),
      'Total de refeições dentro da dieta': parseInt(refDieta[0]['Total de refeições dentro da dieta'] as string),
      'Total de refeições fora da dieta': parseInt(refForaDieta[0]['Total de refeições fora da dieta'] as string),
    };

    return { summary } as { summary: Summary };
  } catch (error: unknown) {
    return { error: (error as Error).message } as { error: string };
  }
}

function parseMealData(request: FastifyRequest) {
  const schema = z.object({
    name: z.string(),
    description: z.string(),
    isOnTheDiet: z.boolean(),
  });

  return schema.parse(request.body);
}

function getMealParams(request: FastifyRequest) {
  const getMealParamsSchema = z.object({
    id: z.string().uuid(),
  });

  return getMealParamsSchema.parse(request.params);
}

async function createMeal(userId: string, name: string, description: string, is_on_diet: boolean) {
  await knex<Meal>('meals').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    description,
    is_on_diet,
  });
}
