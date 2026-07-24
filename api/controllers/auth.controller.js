import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRY = '7d';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const duplicateFieldMessage = (error) => {
  const field = Object.keys(error.keyValue || {})[0] || 'account';
  return `A user with that ${field} already exists!`;
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username.trim() === '' ||
    email.trim() === ''
  ) {
    return next(errorHandler(400, 'All fields are required!'));
  }
  if (password.length < 6) {
    return next(errorHandler(400, 'Password must be at least 6 characters!'));
  }
  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json('User created successfully!');
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, duplicateFieldMessage(error)));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(errorHandler(400, 'All fields are required!'));
  }
  try {
    const validUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie('access_token', token, COOKIE_OPTIONS)
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return next(errorHandler(400, 'Email is required!'));
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
      });
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, COOKIE_OPTIONS)
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          (req.body.name || 'user').split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
      });
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, COOKIE_OPTIONS)
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

// Reached only if verifyToken passed; lets the client confirm its
// persisted login still has a live cookie behind it.
export const validateSession = (req, res) => {
  res.status(200).json({ valid: true });
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};
