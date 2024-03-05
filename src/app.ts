import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"
import http from 'http'
import cors from 'cors'
import morgan from "morgan";
import signale from "signale";

const startApolloServer = async (typeDefs: any, resolvers: any) => {

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use('/graphql', cors(), express.json(), expressMiddleware(server));
  app.use(morgan('dev'));

  signale.watch('Server on port 4000');

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));

};

export default startApolloServer;
