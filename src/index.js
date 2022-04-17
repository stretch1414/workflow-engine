import 'dotenv/config';
import express from 'express';
import path from 'path';
import { access, constants, mkdir } from 'fs';

import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
  sendResult,
} from 'graphql-helix';
import { envelop, useLogger, useSchema, useTiming } from '@envelop/core';
import { useGenericAuth } from '@envelop/generic-auth';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlUploadExpress } from 'graphql-upload';

import { resolveUserFn, validateUser } from './auth';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
// import context from './context';

// Initialize tmp directory with database and python folders
access(path.resolve('src/tmp'), constants.F_OK, (err) => {
  if (err) {
    mkdir(path.resolve('src/tmp/database'), { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    mkdir(path.resolve('src/tmp/python'), { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
});

const app = express();

const getEnveloped = envelop({
  plugins: [
    useSchema(
      makeExecutableSchema({
        typeDefs,
        resolvers,
      })
    ),
    useLogger(),
    useTiming(),
    useGenericAuth({
      resolveUserFn,
      validateUser,
      mode: 'protect-all',
    }),
  ],
});

app.use(express.json());

// Use those to handle incoming requests:
app.use(
  '/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  async (req, res) => {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped({
      req,
    });

    // Create a generic Request object that can be consumed by Graphql Helix's API
    const request = {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
    };

    // Determine whether we should render GraphiQL instead of returning an API response
    if (shouldRenderGraphiQL(request)) {
      res.send(renderGraphiQL());
    } else {
      // Extract the Graphql parameters from the request
      const { operationName, query, variables } = getGraphQLParameters(request);

      // Validate and execute the query
      const result = await processRequest({
        operationName,
        query,
        variables,
        request,
        schema,
        parse,
        validate,
        execute,
        contextFactory,
      });

      // processRequest returns one of three types of results depending on how the server should respond
      // 1) RESPONSE: a regular JSON payload
      // 2) MULTIPART RESPONSE: a multipart response (when @stream or @defer directives are used)
      // 3) PUSH: a stream of events to push back down the client for a subscription
      // The "sendResult" is a NodeJS-only shortcut for handling all possible types of Graphql responses,
      // See "Advanced Usage" below for more details and customizations available on that layer.
      sendResult(result, res);
      // if (result.type === "RESPONSE") {
      //   sendResponseResult(result, res);
      // } else if (result.type === "MULTIPART_RESPONSE") {
      //   sendMultipartResponseResult(result, res);
      // } else if (result.type === "PUSH") {
      //   sendPushResult(result, res);
      // }
    }
  }
);

// Start the server:
app.listen(4000, () => console.log('Server started on port 4000'));

process.once('SIGUSR2', () => {
  // gracefulShutdown(function () {
  process.kill(process.pid, 'SIGUSR2');
  // });
});
