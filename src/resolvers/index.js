import glob from 'glob';
import { mergeResolvers } from '@graphql-tools/merge';

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Have to use globbing instead because of https://github.com/nodejs/node/issues/31710
const resolversArray = await Promise.all(
  glob
    .sync('./*', { ignore: ['./index.js'], cwd: __dirname })
    .map((file) => import(pathToFileURL(path.resolve(__dirname, file))))
);

const mergedResolvers = mergeResolvers(
  resolversArray.map((resolverMap) => {
    return resolverMap.default;
  })
);

export default mergedResolvers;
