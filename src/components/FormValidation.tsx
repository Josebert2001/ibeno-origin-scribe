import { z } from "zod";

// Certificate form validation schema
export const certificateSchema = z.object({
  bearer_name: z
    .string()
    .min(2, "Bearer name must be at least 2 characters")
    .max(100, "Bearer name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Bearer name can only contain letters, spaces, hyphens, and apostrophes"),
  
  native_of: z
    .string()
    .min(2, "Place of origin must be at least 2 characters")
    .max(100, "Place of origin must not exceed 100 characters"),
  
  village: z
    .string()
    .min(2, "Village must be at least 2 characters")
    .max(100, "Village must not exceed 100 characters"),
  
  date_issued: z
    .string()
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      return parsedDate <= today && parsedDate >= oneYearAgo;
    }, "Date must be within the last year and not in the future"),
    
  passport_photo: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Passport photo is required")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type), 
      "Only JPEG, PNG, and WebP image files are allowed"),
});

export type CertificateFormData = z.infer<typeof certificateSchema>;

// Verification form validation
export const verificationSchema = z.object({
  certificate_number: z
    .string()
    .min(1, "Certificate number is required")
    .regex(/^[A-Z0-9\s-]+$/, "Invalid certificate number format"),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;

// Contact form validation
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  
  email: z
    .string()
    .email("Please enter a valid email address"),
  
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must not exceed 500 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;