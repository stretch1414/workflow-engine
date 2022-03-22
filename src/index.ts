import express from 'express';
import { graphqlHTTP } from 'express-graphql';

import typeDefs from './typeDefs';
import resolvers from './resolvers';

import { makeExecutableSchema } from '@graphql-tools/schema';

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Use those to handle incoming requests:
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    // rootValue,
    graphiql: true,
  })
);

// Start the server:
app.listen(4000, () => console.log('Server started on port 4000'));
