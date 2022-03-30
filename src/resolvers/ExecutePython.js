import { spawn } from 'child_process';

const resolvers = {
  Mutation: {
    async executePython(obj, args, ctx) {
      // const process = spawn('python', ['data_example.py']);
      // // TODO - Stream data back
      // process.stdout.on('data', (data) => {
      //   //res.send(data.toString());
      // });
    },
  },
};

export default resolvers;
