import express from 'express';
import { graphqlHTTP } from 'express-graphql';

import { getToken } from './auth';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
// import context from './context';

import { makeExecutableSchema } from '@graphql-tools/schema';

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const resolveOptions = async (req, res, reqParams) => {
  return {
    schema,
    // context: await context(req, res, reqParams),
    graphiql: true,
  };
};

// app
//   .use(
//     jwt({
//       secret: process.env.TOKEN_SECRET,
//       audience,
//       issuer,
//       algorithms: ['RS256'],
//     }),
//     getToken
//   )
//   .unless({ path: ['/token'] });

// Use those to handle incoming requests:
app.use('/graphql', graphqlHTTP(resolveOptions));

// app.get('/token', getToken);

// Start the server:
app.listen(4000, () => console.log('Server started on port 4000'));
