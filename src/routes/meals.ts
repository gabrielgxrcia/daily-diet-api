import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { knex } from '../database';
import crypto from 'node:crypto';
import { z } from 'zod';

interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_on_diet: boolean;
}

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', createMealHandler);
  app.get('/', getMealsHandler);
  app.get('/:id', getMealHandler);
  app.get('/summary', getMealsSummaryHandler);
}

async function createMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const sessionId = request.cookies.sessionId;

    if (!sessionId) {
      throw new Error('sessionId not found.');
    }

    const user = await getUserBySessionId(sessionId);

    if (!user) {
      throw new Error('User not found.');
    }

    const { name, description, isOnTheDiet } = parseMealData(request);

    await createMeal(user.id, name, description, isOnTheDiet);

    response.status(201).send();
  } catch (error: unknown) {
    response.status(401).send({
      error: (error as Error).message,
    });
  }
}

async function getMealsHandler() {
  const meals = await knex<Meal>('meals').select();
  return { meals };
}

async function getMealHandler(request: FastifyRequest) {
  try {
    const params = getMealParams(request);
    const meal = await knex<Meal>('meals').where('id', params.id).first();
    return { meal };
  } catch (error: unknown) {
    return { error: (error as Error).message };
  }
}

async function getMealsSummaryHandler() {
  try {
    const count = await knex('meals').count('id', {
      as: 'Total de refeições registradas',
    });

    const refDieta = await knex('meals')
      .count('id', { as: 'Total de refeições dentro da dieta' })
      .where('is_on_diet', true);

    const refForaDieta = await knex('meals')
      .count('id', { as: 'Total de refeições fora da dieta' })
      .where('is_on_diet', false);

    const summary = {
      'Total de refeições registradas': parseInt(count[0]['Total de refeições registradas'] as string),
      'Total de refeições dentro da dieta': parseInt(refDieta[0]['Total de refeições dentro da dieta'] as string),
      'Total de refeições fora da dieta': parseInt(refForaDieta[0]['Total de refeições fora da dieta'] as string),
    };

    return { summary };
  } catch (error: unknown) {
    return { error: (error as Error).message };
  }
}

async function getUserBySessionId(sessionId: string) {
  return await knex('users').where('session_id', sessionId).select('id').first();
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
