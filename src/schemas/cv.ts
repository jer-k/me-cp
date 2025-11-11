import { z } from "zod/v4";

export const JobSchema = z.object({
  companyName: z.string(),
  companyUrl: z.string().optional(),
  workType: z.enum(["Remote", "On-Site"]),
  duration: z.string(),
  title: z.string(),
  descriptionMarkdown: z.string(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  url: z.string(),
  descriptionMarkdown: z.string(),
});

export const SchoolSchema = z.object({
  institutionName: z.string(),
  institutionUrl: z.string(),
  department: z.string().optional(),
  departmentUrl: z.string().optional(),
  location: z.string(),
  locationUrl: z.string(),
  duration: z.string(),
  degree: z.string().optional(),
  achievement: z.string().optional(),
});

export const CvResponseSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    location: z.string(),
    locationUrl: z.string(),
    avatarUrl: z.string(),
    avatarFallback: z.string(),
  }),
  about: z.object({
    summary: z.string(),
  }),
  jobs: z.array(JobSchema),
  projects: z.array(ProjectSchema),
  skills: z.object({
    languages: z.array(z.string()),
    technologies: z.array(z.string()),
  }),
  schools: z.array(SchoolSchema),
});

// For /api/cv/jobs endpoint
export const JobsResponseSchema = z.array(JobSchema);

export type Job = z.infer<typeof JobSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type School = z.infer<typeof SchoolSchema>;
export type CvResponse = z.infer<typeof CvResponseSchema>;
export type JobsResponse = z.infer<typeof JobsResponseSchema>;
