import path from 'path';
import fs, { createWriteStream, unlink } from 'fs';
import { readdir } from 'fs/promises';
import { GraphQLUpload } from 'graphql-upload';

const resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    async uploadFile(obj, { input }, ctx) {
      const { filename, createReadStream } = await input.file;

      const stream = createReadStream();

      const pathName = path.resolve('src/tmp/database', filename);

      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(pathName);

        writeStream.on('finish', resolve);

        writeStream.on('error', (error) => {
          unlink(pathName, () => {
            reject(error);
          });
        });

        stream.on('error', (error) => writeStream.destroy(error));

        stream.pipe(writeStream);
      });

      return pathName;
    },
  },
  Query: {
    async dataFiles(obj, args, ctx) {
      const pathName = path.resolve('src/tmp/database');

      try {
        const files = await readdir(pathName);

        return files;
      } catch (err) {
        console.error(err);
      }
    },
  },
};

export default resolvers;
