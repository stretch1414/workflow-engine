import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const resolvers = {
  Mutation: {
    async buildCount(obj, { input }, ctx) {
      const { filename, columnName, columnValue } = input;

      const dataToWrite = [];

      dataToWrite.push('import sys\n');
      dataToWrite.push('import pandas as pd\n');
      dataToWrite.push('def main():\n');
      dataToWrite.push('\tdataset = pd.read_excel(sys.argv[1])\n');
      dataToWrite.push('\tdataset = dataset.fillna(0)\n');
      dataToWrite.push(
        `\tcount = len(dataset[dataset['${columnName}'] == '${columnValue}'])\n`
      );
      dataToWrite.push("\tprint('count %s' % count)\n");
      dataToWrite.push('main()\n');

      const pathName = path.resolve('src/lib/python', filename);
      console.log('pathName: ', pathName);
      const writeStream = fs.createWriteStream(pathName);

      for (const line of dataToWrite) {
        writeStream.write(line);
      }

      writeStream.end();

      return pathName;
    },
    async executePython(obj, { input }, ctx) {
      const { functionName, filename } = input;

      const returnData = [];
      return new Promise((resolve, reject) => {
        const proc = spawn('py', ['-u', functionName, filename], {
          cwd: 'src/lib/python',
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
      const pathName = path.resolve('src/lib/python');
      const files = fs.readdirSync(pathName, { withFileTypes: true });

      console.log('files: ', files);

      return files
        .map(({ name }) => name)
        .filter((name) => name.includes('.py'));
    },
  },
};

export default resolvers;
