import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

export const databaseByEmailSingleton = {
  // 'test@example.com': {},
};

export const generateJwt = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      exp,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '6h' }
  );
};

export const generateToken = async ({ email, password }) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
  } catch (error) {}
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const tradeTokenForUser = async (token) => {
  const { email } = await verifyToken(token);

  try {
    // TODO - Replace with actual database call
    const user = databaseByEmailSingleton[email];

    return user;
  } catch (err) {
    console.error('Error trading token for user', err);
  }
};

export const verifyPassword = async (passwordHash, password) => {
  try {
    const verified = await argon2.verify(passwordHash, password, {
      type: argon2.argon2id,
    });

    return verified;
  } catch (err) {
    console.error('Error verifying password', err);
  }
};

export const resolveUserFn = async (context) => {
  const token = context.req.headers.authorization;

  try {
    const user = await tradeTokenForUser(token);

    return user;
  } catch (err) {
    console.err('Failed to validate token');

    return null;
  }
};

export const validateUser = async (user, context) => {
  if (!user) {
    throw new Error('Unauthenticated');
  }
};
