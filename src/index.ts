import startApolloServer from "./app";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";

startApolloServer(typeDefs, resolvers);
