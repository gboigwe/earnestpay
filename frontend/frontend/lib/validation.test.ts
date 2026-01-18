import { describe, it, expect } from "vitest";
import {
  aptosAddressValidator,
  emailValidator,
  positiveNumberValidator,
  nonEmptyStringValidator,
  employeeProfileSchema,
  companyRegistrationSchema,
  transferAPTSchema,
  taxCalculationSchema,
  taxRateSchema,
  validateField,
  validateForm,
  getErrorMessage,
} from "./validation";
import { z } from "zod";

describe("Validation Utilities", () => {
  describe("aptosAddressValidator", () => {
    it("should accept valid Aptos addresses", () => {
      const validAddresses = [
        "0x1",
        "0x123abc",
        "0xabcdef1234567890",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ];

      validAddresses.forEach((address) => {
        const result = aptosAddressValidator.safeParse(address);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid Aptos addresses", () => {
      const invalidAddresses = [
        "",
        "0x",
        "123abc",
        "0xGHIJKL",
        "not an address",
      ];

      invalidAddresses.forEach((address) => {
        const result = aptosAddressValidator.safeParse(address);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("emailValidator", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@domain.co.uk",
        "firstname+lastname@company.org",
      ];

      validEmails.forEach((email) => {
        const result = emailValidator.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "",
        "notanemail",
        "@example.com",
        "user@",
        "user@domain",
      ];

      invalidEmails.forEach((email) => {
        const result = emailValidator.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("positiveNumberValidator", () => {
    it("should accept positive numbers", () => {
      const validNumbers = [0.1, 1, 100, 999.99];

      validNumbers.forEach((num) => {
        const result = positiveNumberValidator.safeParse(num);
        expect(result.success).toBe(true);
      });
    });

    it("should reject zero, negative numbers, and infinity", () => {
      const invalidNumbers = [0, -1, -100, Infinity, -Infinity];

      invalidNumbers.forEach((num) => {
        const result = positiveNumberValidator.safeParse(num);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("nonEmptyStringValidator", () => {
    it("should accept and trim non-empty strings", () => {
      const result = nonEmptyStringValidator.safeParse("  hello  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello");
      }
    });

    it("should reject empty strings", () => {
      const invalidStrings = ["", "   "];

      invalidStrings.forEach((str) => {
        const result = nonEmptyStringValidator.safeParse(str);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("employeeProfileSchema", () => {
    it("should validate a complete employee profile", () => {
      const validProfile = {
        employeeAddress: "0x123abc",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        salary: "2500.50",
        taxJurisdiction: "US_FED",
        role: 0,
      };

      const result = employeeProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("should reject invalid employee profile", () => {
      const invalidProfile = {
        employeeAddress: "invalid",
        firstName: "J",
        lastName: "",
        email: "not-an-email",
        department: "E",
        salary: "-100",
        taxJurisdiction: "",
        role: 10,
      };

      const result = employeeProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("should transform salary string to number", () => {
      const profile = {
        employeeAddress: "0x123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        department: "Engineering",
        salary: "1500",
        taxJurisdiction: "US_FED",
        role: 0,
      };

      const result = employeeProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.salary).toBe("number");
        expect(result.data.salary).toBe(1500);
      }
    });
  });

  describe("companyRegistrationSchema", () => {
    it("should validate a valid company name", () => {
      const result = companyRegistrationSchema.safeParse({
        companyName: "Acme Corporation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject company names that are too short", () => {
      const result = companyRegistrationSchema.safeParse({
        companyName: "AB",
      });
      expect(result.success).toBe(false);
    });

    it("should reject company names that are too long", () => {
      const longName = "A".repeat(101);
      const result = companyRegistrationSchema.safeParse({
        companyName: longName,
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from company name", () => {
      const result = companyRegistrationSchema.safeParse({
        companyName: "  Acme Corp  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe("Acme Corp");
      }
    });
  });

  describe("transferAPTSchema", () => {
    it("should validate a valid transfer", () => {
      const result = transferAPTSchema.safeParse({
        recipientAddress: "0xabc123",
        amount: "100.5",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid recipient address", () => {
      const result = transferAPTSchema.safeParse({
        recipientAddress: "invalid",
        amount: "100",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero or negative amounts", () => {
      const result = transferAPTSchema.safeParse({
        recipientAddress: "0xabc123",
        amount: "0",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("taxCalculationSchema", () => {
    it("should validate tax calculation input", () => {
      const result = taxCalculationSchema.safeParse({
        grossAmount: "5000",
        jurisdiction: "US_CA",
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative gross amount", () => {
      const result = taxCalculationSchema.safeParse({
        grossAmount: "-100",
        jurisdiction: "US_CA",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("taxRateSchema", () => {
    it("should validate tax rates within 0-100%", () => {
      const result = taxRateSchema.safeParse({
        federalRate: "22",
        stateRate: "7",
        socialSecurityRate: "6.2",
        medicareRate: "1.45",
        unemploymentRate: "0.6",
      });
      expect(result.success).toBe(true);
    });

    it("should reject rates over 100%", () => {
      const result = taxRateSchema.safeParse({
        federalRate: "101",
        stateRate: "7",
        socialSecurityRate: "6.2",
        medicareRate: "1.45",
        unemploymentRate: "0.6",
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative rates", () => {
      const result = taxRateSchema.safeParse({
        federalRate: "-5",
        stateRate: "7",
        socialSecurityRate: "6.2",
        medicareRate: "1.45",
        unemploymentRate: "0.6",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateField helper", () => {
    it("should return null for valid input", () => {
      const error = validateField(emailValidator, "test@example.com");
      expect(error).toBeNull();
    });

    it("should return error message for invalid input", () => {
      const error = validateField(emailValidator, "invalid-email");
      expect(error).toBeTruthy();
      expect(typeof error).toBe("string");
    });
  });

  describe("validateForm helper", () => {
    it("should return data and no errors for valid form", () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().positive(),
      });

      const { errors, data } = validateForm(schema, {
        name: "John",
        age: 30,
      });

      expect(errors).toBeNull();
      expect(data).toEqual({ name: "John", age: 30 });
    });

    it("should return errors for invalid form", () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().positive(),
      });

      const { errors, data } = validateForm(schema, {
        name: "J",
        age: -5,
      });

      expect(errors).toBeTruthy();
      expect(data).toBeNull();
      expect(errors).toHaveProperty("name");
      expect(errors).toHaveProperty("age");
    });
  });

  describe("getErrorMessage helper", () => {
    it("should extract message from ZodError", () => {
      const schema = z.string().email();
      const result = schema.safeParse("invalid");

      if (!result.success) {
        const message = getErrorMessage(result.error);
        expect(message).toBeTruthy();
        expect(typeof message).toBe("string");
      }
    });

    it("should extract message from Error", () => {
      const error = new Error("Test error");
      const message = getErrorMessage(error);
      expect(message).toBe("Test error");
    });

    it("should return default message for unknown errors", () => {
      const message = getErrorMessage("some string");
      expect(message).toBe("An unexpected error occurred");
    });
  });
});
