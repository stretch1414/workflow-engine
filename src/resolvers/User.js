import {} from '../auth';

const resolvers = {
  Mutation: {
    async login(obj, { input }, ctx) {
      // TODO
      // Fetch from database
      // Validate password with password hash
      // Generate token from user
      // Return token
    },
    async signup(obj, { input }, ctx) {
      // TODO
      // Generate password hash
      // Generate email verification string
      // Generate email hash
      // Store in database
      // Optionally generate a token and log the user in?
    },
    //async verifyEmail(obj, { input }, ctx) {
    // TODO
    // Validate email hash from verification string
    // Update email in database
    //},
  },
  Query: {
    async me(obj, args, ctx) {
      // TODO - Fetch from database
    },
  },
};

export default resolvers;
