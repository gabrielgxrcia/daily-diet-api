import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env'
import { registerUser } from './routes/users'
import { mealsRoutes } from './routes/meals'

const app = fastify()

app.register(registerUser, { prefix: 'users'})
app.register(mealsRoutes, { prefix: 'meals' })
app.register(cookie)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP Server Running at port ${env.PORT}`)
  })