import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be under 255 characters"),
  phone: z.string().trim().max(30, "Phone must be under 30 characters").optional().or(z.literal("")),
  destination: z.string().min(1, "Please select a destination"),
  groupSize: z.string().optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Message must be under 2000 characters").optional().or(z.literal("")),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

export const reviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255).optional().or(z.literal("")),
  comment: z.string().trim().max(2000, "Comment must be under 2000 characters").optional().or(z.literal("")),
  score: z.number().min(1, "Please select a rating").max(10),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const tourPlannerContactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be under 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be under 50 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be under 255 characters"),
  phone: z.string().trim().max(30, "Phone must be under 30 characters").optional().or(z.literal("")),
});

export type TourPlannerContactData = z.infer<typeof tourPlannerContactSchema>;
