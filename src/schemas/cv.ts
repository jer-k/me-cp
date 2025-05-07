import { z } from 'zod';

// Schema for work experience
export const JobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
  skills: z.array(z.string()).optional(),
});

// Schema for education
export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// Schema for personal information
export const PersonalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string().email(),
  location: z.string(),
  summary: z.string(),
  links: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    })
  ),
});

// Schema for complete CV
export const CVSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experience: z.array(JobSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  languages: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
    })
  ).optional(),
});

// Schema for jobs-only section
export const JobsListSchema = z.object({
  experience: z.array(JobSchema),
});

// Type definitions
export type Job = z.infer<typeof JobSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type CV = z.infer<typeof CVSchema>;
export type JobsList = z.infer<typeof JobsListSchema>;