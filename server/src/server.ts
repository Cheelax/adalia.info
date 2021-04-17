import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { MongoClient } from 'mongodb'
import Asteroids from './asteroids'
import initialize from './initializer'
import schema from './schema'

const app = express()

const mongoUrl = process.env.MONGO_URL ?? 'localhost:27017'
const mongoConnectionStr = `mongodb://${mongoUrl}/influence-info`
const client = new MongoClient(mongoConnectionStr, {
  useUnifiedTopology: true,
})
client
  .connect()
  .then((client) => client.db().collection('asteroids'))
  .then(initialize)

const server = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  dataSources: () => ({
    asteroids: new Asteroids(client.db().collection('asteroids')),
  }),
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen(5000, () => console.log('Server started on port 5000'))
