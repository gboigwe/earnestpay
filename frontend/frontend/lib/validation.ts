import { z } from "zod";

/**
 * Validation utilities for form inputs
 * Provides consistent validation patterns across the application
 */

// Custom validators
export const aptosAddressValidator = z
  .string()
  .min(1, "Address is required")
  .regex(/^0x[a-fA-F0-9]{1,64}$/, "Invalid Aptos address format (must start with 0x)");

export const emailValidator = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const positiveNumberValidator = z
  .number()
  .positive("Must be greater than 0")
  .finite("Must be a finite number");

export const nonEmptyStringValidator = z
  .string()
  .min(1, "This field is required");

export const trimmedString = (minLength?: number, message?: string) =>
  z
    .string()
    .min(1, "This field is required")
    .transform((val) => val.trim())
    .pipe(z.string().min(minLength || 1, message || "This field is required"));

// Employee Profile Validation Schema
export const employeeProfileSchema = z.object({
  employeeAddress: aptosAddressValidator,
  firstName: trimmedString(2, "First name must be at least 2 characters"),
  lastName: trimmedString(2, "Last name must be at least 2 characters"),
  email: emailValidator,
  department: trimmedString(2, "Department must be at least 2 characters"),
  salary: z
    .string()
    .min(1, "Salary is required")
    .transform((val) => Number(val))
    .pipe(positiveNumberValidator),
  taxJurisdiction: nonEmptyStringValidator,
  paymentAddress: z.string().optional(),
  role: z.number().int().min(0).max(4, "Invalid role selected"),
});

export type EmployeeProfileFormData = z.infer<typeof employeeProfileSchema>;

// Company Registration Validation Schema
export const companyRegistrationSchema = z.object({
  companyName: trimmedString(3, "Company name must be at least 3 characters")
    .pipe(z.string().max(100, "Company name must be less than 100 characters")),
});

export type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;

// Transfer APT Validation Schema
export const transferAPTSchema = z.object({
  recipientAddress: aptosAddressValidator,
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => Number(val))
    .pipe(positiveNumberValidator),
});

export type TransferAPTFormData = z.infer<typeof transferAPTSchema>;

// Tax Calculation Validation Schema
export const taxCalculationSchema = z.object({
  grossAmount: z
    .string()
    .min(1, "Gross amount is required")
    .transform((val) => Number(val))
    .pipe(z.number().nonnegative("Amount cannot be negative")),
  jurisdiction: trimmedString(2, "Jurisdiction is required"),
});

export type TaxCalculationFormData = z.infer<typeof taxCalculationSchema>;

// Tax Rate Validation Schema
export const taxRateSchema = z.object({
  federalRate: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%")),
  stateRate: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%")),
  socialSecurityRate: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%")),
  medicareRate: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%")),
  unemploymentRate: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%")),
});

export type TaxRateFormData = z.infer<typeof taxRateSchema>;

/**
 * Helper function to validate a single field
 * Returns error message or null if valid
 */
export function validateField<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.errors[0]?.message || "Invalid value";
  }
  return null;
}

/**
 * Helper function to validate entire form
 * Returns object with field errors or null if valid
 */
export function validateForm<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { errors: Record<string, string> | null; data: z.infer<T> | null } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return { errors, data: null };
  }

  return { errors: null, data: result.data };
}

/**
 * Get user-friendly error message from validation error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message || "Validation failed";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
