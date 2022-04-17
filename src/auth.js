import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

export const databaseByEmailSingleton = {
  // 'test@example.com': {},
};

export const generatePassword = async (password) => {
  try {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    return hashedPassword;
  } catch (err) {
    console.error('Error generating password', err);
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

export const generateToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      Buffer.from(process.env.TOKEN_SECRET, 'base64'),
      { expiresIn: '6h' },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      Buffer.from(process.env.TOKEN_SECRET, 'base64'),
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
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

export const resolveUserFn = async (context) => {
  // console.log('context', context);
  const token = context.req.headers.authorization;

  try {
    const user = await tradeTokenForUser(token);

    return user;
  } catch (err) {
    console.error('Failed to validate token', err);

    return null;
  }
};

export const validateUser = async (user, context) => {
  if (!user) {
    throw new Error('Unauthenticated');
  }
};
