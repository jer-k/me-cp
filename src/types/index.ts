// Common types used across the application

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
}

export interface CV {
  personalInfo: {
    name: string;
    title: string;
    contact: {
      email: string;
      location: string;
    };
  };
  jobs: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
}

export interface About {
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
}