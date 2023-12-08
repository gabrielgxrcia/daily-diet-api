import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { z } from 'zod'

interface User {
  id: string
  name: string
  email: string
  address: string
  weight: number
  height: number
}

export async function registerUser(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const { name, email, address, weight, height } = parseRequestData(request);

    const existingUser = await FindUserByEmail(email);

    if (existingUser) {
      throw new Error('This email address is already registered.');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      address,
      weight,
      height
    }

    await createUser(newUser)

    response.status(201).send()
  })
}

function parseRequestData(request: FastifyRequest) {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    weight: z.number(),
    height: z.number(),
  })

  return schema.parse(request.body)
}

async function FindUserByEmail(email: string) {
  return knex.select('*').from('users').where({ email }).first()
}

async function createUser(user: User) {
  await knex('users').insert(user)
}

