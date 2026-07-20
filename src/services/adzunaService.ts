import { withCache, getCached, setCached } from "../utils/cache";
import { getPrimaryLogoUrl } from "../utils/companyLogo";
import { Job, JobSearchParams, JobSearchResult } from "../types/job";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — Adzuna free tier is rate-limited

interface AdzunaRawResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  category?: { label?: string };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  redirect_url: string;
  created: string;
}

interface AdzunaRawResponse {
  count: number;
  results: AdzunaRawResult[];
}

function normalize(raw: AdzunaRawResult): Job {
  const company = raw.company?.display_name ?? "Unknown company";
  return {
    id: `adzuna_${raw.id}`,
    source: "adzuna",
    title: raw.title,
    company,
    companyLogoUrl: getPrimaryLogoUrl(company),
    location: raw.location?.display_name ?? "Not specified",
    description: raw.description ?? "",
    category: raw.category?.label ?? "Other",
    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,
    contractType: raw.contract_time,
    redirectUrl: raw.redirect_url,
    createdDate: raw.created,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export async function searchJobs(
  params: JobSearchParams,
): Promise<JobSearchResult> {
  const appId = requireEnv("ADZUNA_APP_ID");
  const appKey = requireEnv("ADZUNA_APP_KEY");
  const country = params.country ?? process.env.ADZUNA_COUNTRY ?? "us";
  const page = params.page ?? 1;
  const resultsPerPage = params.resultsPerPage ?? 20;

  const query = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(resultsPerPage),
    "content-type": "application/json",
  });
  if (params.what) query.set("what", params.what);
  if (params.where) query.set("where", params.where);
  if (params.category) query.set("category", params.category);
  if (params.salaryMin) query.set("salary_min", String(params.salaryMin));
  if (params.sortBy) query.set("sort_by", params.sortBy);

  const cacheKey = `adzuna:search:${country}:${page}:${query.toString()}`;

  return withCache(cacheKey, CACHE_TTL_MS, async () => {
    const url = `${BASE_URL}/${country}/search/${page}?${query.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Adzuna request failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as AdzunaRawResponse;
    const jobs = data.results.map(normalize);
    // Adzuna has no get-by-id endpoint on the free tier. Populate a
    // per-job cache entry from every search response so /jobs/:id can be
    // served from something Adzuna actually returned, instead of guessing
    // via a bogus free-text search on the id.
    for (const job of jobs) {
      setCached(`adzuna:job:${job.id}`, job, CACHE_TTL_MS);
    }
    return { jobs, totalResults: data.count, page, resultsPerPage };
  });
}

/**
 * Best-effort lookup: only returns a hit if this job appeared in a search
 * result within the last CACHE_TTL_MS (see searchJobs, which populates this
 * cache). If the user hits /jobs/:id directly without that job being cached
 * (shared link, cold cache), this returns undefined and the caller should
 * show a "listing expired, browse similar jobs" state — that's an inherent
 * limitation of Adzuna's free tier, not something to paper over silently.
 */
export async function getJobById(externalId: string): Promise<Job | undefined> {
  return getCached<Job>(`adzuna:job:${externalId}`);
}