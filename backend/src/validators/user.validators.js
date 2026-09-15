const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

// Admin-provisioned accounts only — citizens self-register via /auth/register.
const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  password,
  role: z.enum([ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP]),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number is required')
    .optional(),
  designation: z.string().trim().optional(),
  department: z.string().trim().optional(),
  state: z.string().trim().optional(),
  district: z.string().trim().optional(),
  constituency: z.string().trim().optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number is required')
      .optional(),
    designation: z.string().trim().optional(),
    department: z.string().trim().optional(),
    state: z.string().trim().optional(),
    district: z.string().trim().optional(),
    constituency: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields provided to update' });

const listUsersQuerySchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.DISTRICT_NODAL, ROLES.MP, ROLES.CITIZEN]).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamSchema = z.object({
  id: z.string().uuid('Invalid user id'),
});

module.exports = { createUserSchema, updateUserSchema, listUsersQuerySchema, idParamSchema };
