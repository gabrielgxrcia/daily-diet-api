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
  app.put('/:id', { preHandler: [checkSessionIdExists] }, editMealHandler);
  app.delete('/:id', { preHandler: [checkSessionIdExists] }, deleteMealHandler);
  app.get('/summary', { preHandler: [checkSessionIdExists] }, getMealsSummaryHandler);
}

async function createMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const { name, description, isOnTheDiet } = parseMealData(request);
    const userId = getUserIdFromRequest(request);

    await createMeal(userId, name, description, isOnTheDiet);

    response.status(201).send();
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function getMealsHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const userId = getUserIdFromRequest(request);
    const meals = await getMealsByUserId(userId);

    return { meals };
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function getMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const params = getMealParams(request);
    const meal = await getMealById(params.id);

    return { meal };
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function editMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const params = getMealParams(request);
    const { name, description, isOnTheDiet } = parseMealData(request);
    const userId = getUserIdFromRequest(request);

    await updateMeal(params.id, userId, name, description, isOnTheDiet);

    response.status(202).send();
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function deleteMealHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const params = getMealParams(request);
    const userId = getUserIdFromRequest(request);

    await deleteMeal(params.id, userId);

    response.status(204).send('Refeição deletada com sucesso.');
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

async function getMealsSummaryHandler(request: FastifyRequest, response: FastifyReply) {
  try {
    const userId = getUserIdFromRequest(request);
    const summary = await getMealsSummary(userId);

    return { summary };
  } catch (error: unknown) {
    response.status(401).send({ error: (error as Error).message });
  }
}

function getUserIdFromRequest(request: FastifyRequest): string {
  if (!request.user) {
    throw new Error('User not found');
  }

  return request.user.id;
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

async function getMealsByUserId(userId: string): Promise<Meal[]> {
  return await knex<Meal>('meals').where('user_id', userId).select();
}

async function getMealById(id: string): Promise<Meal | undefined> {
  return await knex<Meal>('meals').where('id', id).first();
}

async function updateMeal(id: string, userId: string, name: string, description: string, is_on_diet: boolean) {
  const updatedMeal = await knex<Meal>('meals')
    .where('id', id)
    .andWhere('user_id', userId)
    .first()
    .update({
      name,
      description,
      is_on_diet,
    });

  if (!updatedMeal) {
    throw new Error('Meal not found.');
  }
}

async function deleteMeal(id: string, userId: string) {
  const meal = await knex('meals')
    .where('id', id)
    .andWhere('user_id', userId)
    .first();

  if (!meal) {
    throw new Error('Refeição não encontrada.');
  }

  await knex('meals')
    .where('id', id)
    .andWhere('user_id', userId)
    .delete();
}

async function getMealsSummary(userId: string): Promise<Summary> {
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

  return {
    'Total de refeições registradas': parseInt(count[0]['Total de refeições registradas'] as string),
    'Total de refeições dentro da dieta': parseInt(refDieta[0]['Total de refeições dentro da dieta'] as string),
    'Total de refeições fora da dieta': parseInt(refForaDieta[0]['Total de refeições fora da dieta'] as string),
  };
}
