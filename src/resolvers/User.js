import crypto from 'crypto';
import {
  databaseByEmailSingleton,
  generatePassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from '../auth';

const resolvers = {
  Mutation: {
    async login(obj, { input }, ctx) {
      const responses = {
        success: (token, user) => ({
          __typename: 'LoginResponse_Success',
          token,
          user,
        }),
        invalidCredentials: () => ({
          __typename: 'LoginResponse_InvalidCredentials',
          reason: 'The user was not found or the credentials were invalid',
        }),
      };

      const { email, password } = input;

      // Fetch from database
      const user = databaseByEmailSingleton[email];

      if (!user) {
        return responses.invalidCredentials();
      }

      // Validate password with password hash
      const passwordMatch = await verifyPassword(user.hashedPassword, password);

      if (!passwordMatch) {
        return responses.invalidCredentials();
      }

      // Generate token from user
      const token = await generateToken(user);

      // Return token
      return responses.success(token);
    },
    async signup(obj, { input }, ctx) {
      const responses = {
        success: (user) => ({
          __typename: 'SignupResponse_Success',
          user,
        }),
        alreadyExists: () => ({
          // TODO - This is bad and allows someone to detect users in the system
          __typename: 'SignupResponse_AlreadyExists',
          reason: 'A user with that email already exists',
        }),
      };

      const { email, password } = input;

      if (databaseByEmailSingleton[email]) {
        return responses.alreadyExists();
      }

      // Generate password hash
      const hashedPassword = await generatePassword(password);

      // TODO - Generate email verification string
      // TODO - Generate email hash

      // Store in database
      databaseByEmailSingleton[email] = {
        id: crypto.randomBytes(16).toString('hex'),
        email,
        hashedPassword,
      };

      // TODO - Optionally generate a token and log the user in?

      return responses.success(databaseByEmailSingleton[email]);
    },
    //async verifyEmail(obj, { input }, ctx) {
    // TODO
    // Validate email hash from verification string
    // Update email in database
    //},
  },
  Query: {
    async me(obj, args, ctx) {
      // Fetch from database
      const { email } = ctx.currentUser;

      return databaseByEmailSingleton[email];
    },
  },
};

export default resolvers;
