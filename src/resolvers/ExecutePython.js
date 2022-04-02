import { cwd } from 'process';
import { spawn } from 'child_process';

const resolvers = {
  Mutation: {
    async executePython(obj, { input }, ctx) {
      const { functionName } = input;

      const proc = spawn('py', ['-u', functionName], {
        cwd: 'src/lib/python',
      });
      proc.stdout.on('data', (data) => {
        console.log('stdout: ', data.toString());
      });
      proc.stderr.on('data', (data) => {
        console.log('stderr: ', data.toString());
      });

      proc.on('error', (error) => {
        console.log('error running child process', error);
      });
      proc.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
    },
  },
};

export default resolvers;
