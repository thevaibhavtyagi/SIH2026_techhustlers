const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const email = z.string().trim().toLowerCase().email('Valid email is required');

const roleEnum = z.enum([ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP, ROLES.CITIZEN]);

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email,
  password,
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number is required')
    .optional(),
  state: z.string().trim().optional(),
  district: z.string().trim().optional(),
  constituency: z.string().trim().optional(),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  role: roleEnum,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

const forgotPasswordSchema = z.object({
  email,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password,
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
