import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const resolvers = {
  Mutation: {
    async buildCount(obj, { input }, ctx) {
      const { filename, columnName, columnValue } = input;

      const dataToWrite = [];

      dataToWrite.push('import sys');
      dataToWrite.push('import pandas as pd');
      dataToWrite.push('def main():');
      dataToWrite.push('\tdataset = pd.read_excel(sys.argv[1])');
      dataToWrite.push('\tdataset = dataset.fillna(0)');
      dataToWrite.push(
        `\tcount = len(dataset[dataset['${columnName}'] == '${columnValue}'])`
      );
      dataToWrite.push("\tprint('count %s' % count)");
      dataToWrite.push('main()');

      const pathName = path.resolve('src/tmp/python', filename);

      fs.writeFile(pathName, dataToWrite.join('\n'), (err) => {
        if (err) {
          console.error(err);
        }
      });

      return pathName;
    },
    async executePython(obj, { input }, ctx) {
      const { functionName, filename } = input;

      const returnData = [];
      return new Promise((resolve, reject) => {
        const proc = spawn('py', ['-u', functionName, filename], {
          cwd: 'src/tmp/python',
        });

        proc.stdout.on('data', (data) => {
          console.log('stdout: ', data.toString());
          returnData.push(data.toString());
        });
        proc.stderr.on('data', (data) => {
          console.log('stderr: ', data.toString());
          returnData.push(data.toString());
        });

        proc.on('error', (error) => {
          console.log('error running child process', error);
          reject(error);
        });
        proc.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
          resolve(returnData);
        });
      });
    },
  },
  Query: {
    async pythonFiles(obj, args, ctx) {
      const pathName = path.resolve('src/tmp/python');
      const files = fs.readdirSync(pathName);

      return files.map(({ name }) => name);
    },
  },
};

export default resolvers;
