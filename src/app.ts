import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { registerUser } from './routes/users'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(registerUser, { prefix: 'users'})
app.register(mealsRoutes, { prefix: 'meals' })
app.register(cookie)
