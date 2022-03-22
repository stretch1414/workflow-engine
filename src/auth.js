import jwt from 'express-jwt';
import argon2 from 'argon2';

export const getToken = async (req, res) => {};

export const generateToken = async ({ email, password }) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
  } catch (error) {}
};

export const tradeTokenForUser = async (token) => {
  const { email, password } = await jwt.verify(token);
};

export const verifyPassword = async (hash, password) => {
  try {
    const verified = await argon2.verify(passwordHash, password, {
      type: argon2.argon2id,
    });
  } catch (error) {}
};
