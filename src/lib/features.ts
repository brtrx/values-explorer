/**
 * Feature flags — flip a value here to enable or disable a feature across
 * the app (navigation + routes).  No deploy config required; just change
 * the boolean and push.
 */
export const FEATURES = {
  /** Set to true to re-enable the Job Analysis page (/job-analysis). */
  jobAnalysis: false,
  /** Set to true to re-enable the Data Export page (/export). */
  dataExport: false,
} as const;
