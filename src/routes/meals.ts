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
}

async function createMealHandler(request: FastifyRequest, response: FastifyReply) {
  const { name, description, isOnTheDiet } = parseMealData(request);

  await createMeal(name, description, isOnTheDiet);

  response.status(201).send();
}

async function getMealsHandler() {
  const meals = await knex<Meal>('meals').select();

  return { meals };
}

async function getMealHandler(request: FastifyRequest) {
  const params = getMealParams(request);

  const meal = await knex<Meal>('meals').where('id', params.id).first();

  return { meal };
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

async function createMeal(name: string, description: string, is_on_diet: boolean) {
  const userId = crypto.randomUUID();

  await knex<Meal>('meals').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    description,
    is_on_diet,
  });
}
