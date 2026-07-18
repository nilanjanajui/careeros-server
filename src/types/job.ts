export interface Job {
  id: string; // external job id, prefixed with source (e.g. "adzuna_123456")
  source: "adzuna";
  title: string;
  company: string;
  companyLogoUrl: string; // Clearbit logo, falls back to ui-avatars initials
  location: string;
  description: string;
  category: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  contractType?: string; // full_time | part_time | contract, when Adzuna provides it
  redirectUrl: string; // outbound apply link on the source site
  createdDate: string; // ISO string
}

export interface JobSearchParams {
  what?: string; // keyword search
  where?: string; // location/city
  category?: string;
  salaryMin?: number;
  sortBy?: "date" | "salary" | "relevance";
  page?: number; // 1-indexed
  resultsPerPage?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  totalResults: number;
  page: number;
  resultsPerPage: number;
}
