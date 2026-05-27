import { useState, useEffect } from 'react';
import { AlertCircle, Info, Building2, Briefcase, Star, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SchwartzCircle } from '@/components/SchwartzCircle';
import { ValueEditor } from '@/components/ValueEditor';
import { ClarificationPanel } from '@/components/ClarificationPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ValueScores } from '@/lib/schwartz-values';
import type { ConfidenceLevel } from '@/lib/job-clarification';

// Rate limiting constants
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitState {
  count: number;
  timestamps: number[];
}

function getRateLimitState(): RateLimitState {
  const stored = localStorage.getItem('job-analysis-rate-limit');
  if (!stored) return { count: 0, timestamps: [] };

  try {
    const { timestamps } = JSON.parse(stored);
    const now = Date.now();
    const validTimestamps = (timestamps as number[]).filter((ts) => now - ts < RATE_WINDOW_MS);
    return { count: validTimestamps.length, timestamps: validTimestamps };
  } catch {
    return { count: 0, timestamps: [] };
  }
}

function addRateLimitTimestamp(): void {
  const state = getRateLimitState();
  state.timestamps.push(Date.now());
  localStorage.setItem('job-analysis-rate-limit', JSON.stringify({ timestamps: state.timestamps }));
}

function getTimeUntilReset(): string {
  const state = getRateLimitState();
  if (state.timestamps.length === 0) return '';
  const oldestTimestamp = Math.min(...state.timestamps);
  const resetTime = oldestTimestamp + RATE_WINDOW_MS;
  const minutesRemaining = Math.ceil((resetTime - Date.now()) / 60000);
  if (minutesRemaining <= 0) return 'Rate limit reset.';
  return `Resets in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}.`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OccupationalContext {
  socCode: string;
  occupationTitle: string;
  isProfession: boolean;
  professionEthicsNote?: string;
  topWorkStyles: string[];
  interestProfile: string[];
  workValues: string[];
}

interface AnalysisResult {
  detectedJobTitle?: string;
  scores: ValueScores;
  confidence: Record<string, ConfidenceLevel>;
  rationales?: Record<string, string>;
  sources?: Record<string, 'job_description' | 'onet' | 'merged'>;
  occupationalContext?: OccupationalContext;
  onetEnriched?: boolean;
}

// ---------------------------------------------------------------------------
// Confidence helpers
// ---------------------------------------------------------------------------

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = {
  high: 0,
  medium: 1,
  occupational: 2,
  professional: 3,
  unspecified: 4,
};

function confidenceDot(level: ConfidenceLevel) {
  const classes: Record<ConfidenceLevel, string> = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    occupational: 'bg-blue-500',
    professional: 'bg-purple-500',
    unspecified: 'bg-gray-400',
  };
  return classes[level] ?? 'bg-gray-400';
}

function confidenceLabel(level: ConfidenceLevel) {
  const labels: Record<ConfidenceLevel, string> = {
    high: 'high',
    medium: 'medium',
    occupational: 'occupational',
    professional: 'professional',
    unspecified: 'unspecified',
  };
  return labels[level] ?? level;
}

// ---------------------------------------------------------------------------
// OccupationalContextPanel
// ---------------------------------------------------------------------------

function OccupationalContextPanel({ ctx }: { ctx: OccupationalContext }) {
  const [open, setOpen] = useState(true);

  const riasecColors: Record<string, string> = {
    Realistic: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    Investigative: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Artistic: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    Social: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Enterprising: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    Conventional: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <section className="rounded-xl border bg-card p-6">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Occupational Baseline
        </h2>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium">{ctx.occupationTitle}</span>
              <span className="text-muted-foreground ml-2">SOC {ctx.socCode}</span>
            </div>
          </div>

          {ctx.interestProfile.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Holland Interest Profile</p>
              <div className="flex flex-wrap gap-2">
                {ctx.interestProfile.map(type => (
                  <span key={type} className={cn('px-2 py-0.5 rounded-full text-xs font-medium', riasecColors[type] ?? 'bg-muted text-muted-foreground')}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ctx.topWorkStyles.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Top Work Styles</p>
              <div className="flex flex-wrap gap-2">
                {ctx.topWorkStyles.map(style => (
                  <span key={style} className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ctx.workValues.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">O*NET Work Values</p>
              <div className="flex flex-wrap gap-2">
                {ctx.workValues.map(val => (
                  <span key={val} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ctx.isProfession && ctx.professionEthicsNote && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800 p-3 text-sm">
              <p className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-1.5 mb-1">
                <Star className="h-3.5 w-3.5" />
                Regulated Profession
              </p>
              <p className="text-purple-700 dark:text-purple-300">{ctx.professionEthicsNote}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Conformity–Rules and Universalism–Concern are elevated to reflect professional ethics obligations.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const JobAnalysis = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({ count: 0, timestamps: [] });

  useEffect(() => {
    setRateLimitState(getRateLimitState());
  }, []);

  const remaining = RATE_LIMIT - rateLimitState.count;
  const rateLimitReached = remaining <= 0;

  // ── Step 1: analyze job description ───────────────────────────────────────
  const handleAnalyze = async () => {
    const currentState = getRateLimitState();
    if (currentState.count >= RATE_LIMIT) {
      toast.error(`Rate limit reached. ${getTimeUntilReset()}`);
      setRateLimitState(currentState);
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const analyzeResponse = await supabase.functions.invoke('analyze-job-description', {
        body: { jobDescription }
      });

      if (analyzeResponse.error) {
        // Log details to browser console for diagnosis
        console.error('[JobAnalysis] analyze-job-description error:', analyzeResponse.error);
        throw analyzeResponse.error;
      }

      setResults(analyzeResponse.data as AnalysisResult);
      addRateLimitTimestamp();
      setRateLimitState(getRateLimitState());
      toast.success('Analysis complete!');

    } catch (error) {
      console.error('[JobAnalysis] Analysis failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze job description';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Step 2: optional O*NET enrichment (user-triggered) ────────────────────
  const handleEnrich = async () => {
    if (!results?.detectedJobTitle) return;

    setIsEnriching(true);
    try {
      const enrichResponse = await supabase.functions.invoke('enrich-job-analysis', {
        body: {
          jobTitle: results.detectedJobTitle,
          existingAnalysis: {
            scores: results.scores,
            confidence: results.confidence,
            rationales: results.rationales ?? {},
          },
        }
      });

      if (enrichResponse.error) {
        console.warn('[JobAnalysis] enrich-job-analysis error:', enrichResponse.error);
        toast.error('O*NET enrichment unavailable — analysis unchanged');
        return;
      }

      const enriched = enrichResponse.data as AnalysisResult;
      if (enriched?.scores && enriched?.confidence) {
        setResults({ ...enriched, detectedJobTitle: results.detectedJobTitle });
        if (enriched.onetEnriched) {
          toast.success('Enriched with O*NET occupational data');
        } else {
          toast.info('No O*NET match found for this role — analysis unchanged');
        }
      } else {
        toast.info('O*NET enrichment returned no data — analysis unchanged');
      }
    } catch (err) {
      console.warn('[JobAnalysis] enrich-job-analysis threw:', err);
      toast.error('O*NET enrichment unavailable');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleScoresUpdate = (newScores: ValueScores) => {
    if (results) setResults({ ...results, scores: newScores });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Job Description Analyzer"
        description="Infer Schwartz values from job descriptions"
      />

      <main className="container max-w-2xl py-8 px-4">
        <div className="space-y-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Experimental Feature</AlertTitle>
            <AlertDescription>
              This tool infers values from job descriptions using AI and O*NET occupational data.
              Results are directionally accurate but not psychometrically validated. Use for
              exploration, not formal assessment.
            </AlertDescription>
          </Alert>

          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Limit: {RATE_LIMIT} analyses per hour. <strong>{remaining}</strong> remaining.{' '}
              {rateLimitReached && getTimeUntilReset()}
            </AlertDescription>
          </Alert>

          {/* Input */}
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Job Description</h2>
            <Textarea
              placeholder="Paste the job description here (minimum 50 characters)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="resize-y"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {jobDescription.length} characters
                {jobDescription.length > 0 && jobDescription.length < 50 && (
                  <span className="text-destructive"> (need at least 50)</span>
                )}
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isEnriching || jobDescription.length < 50 || rateLimitReached}
              >
                {isAnalyzing ? 'Analyzing…' : 'Analyze Values'}
              </Button>
            </div>
          </section>

          {/* Results */}
          {results && (
            <>
              {/* Detected job title + O*NET enrich button */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {results.detectedJobTitle && (
                  <p className="text-sm text-muted-foreground">
                    Detected role: <strong>{results.detectedJobTitle}</strong>
                  </p>
                )}
                {results.detectedJobTitle && !results.onetEnriched && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnrich}
                    disabled={isEnriching}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isEnriching ? 'Enriching…' : 'Enrich with O*NET'}
                  </Button>
                )}
                {results.onetEnriched && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Enriched with O*NET data
                  </span>
                )}
              </div>

              {/* Spider Chart */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="font-serif text-xl font-semibold mb-4 text-center">Inferred Value Profile</h2>
                <div className="flex justify-center pb-4">
                  <SchwartzCircle scores={results.scores} size={280} />
                </div>
              </section>

              {/* Occupational Context */}
              {results.occupationalContext && (
                <OccupationalContextPanel ctx={results.occupationalContext} />
              )}

              {/* Confidence Legend */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="font-serif text-xl font-semibold mb-4">Confidence Levels</h2>
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>High — clear evidence in description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Medium — inferrable but not explicit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Occupational — inferred from O*NET baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Professional — influenced by ethics code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Unspecified — no relevant information</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  {Object.entries(results.confidence)
                    .sort(([codeA, levelA], [codeB, levelB]) => {
                      const levelDiff = (CONFIDENCE_ORDER[levelA] ?? 4) - (CONFIDENCE_ORDER[levelB] ?? 4);
                      if (levelDiff !== 0) return levelDiff;
                      return codeA.localeCompare(codeB);
                    })
                    .map(([code, level]) => {
                      const rationale = results.rationales?.[code];
                      const source = results.sources?.[code];
                      return (
                        <div key={code} className="flex items-start gap-2">
                          <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', confidenceDot(level))} />
                          <span className="font-mono text-xs flex-shrink-0">{code}</span>
                          <span className="text-muted-foreground flex-shrink-0">{confidenceLabel(level)}</span>
                          {source && source !== 'job_description' && (
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0',
                              source === 'onet' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                              source === 'merged' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' : ''
                            )}>
                              {source}
                            </span>
                          )}
                          {rationale && (
                            <span className="text-xs text-muted-foreground italic truncate">— {rationale}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Clarification Panel */}
              <ClarificationPanel
                jobDescription={jobDescription}
                scores={results.scores}
                confidence={results.confidence}
                onScoresUpdate={handleScoresUpdate}
              />

              {/* Detailed Scores */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="font-serif text-xl font-semibold mb-4">Detailed Scores</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Scores range from 0 (contradicts value) to 7 (strongly emphasizes value).
                  3.5 indicates neutral/not mentioned.
                  {results.onetEnriched && (
                    <> Scores marked <code className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1 rounded">onet</code> or <code className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 px-1 rounded">merged</code> draw on O*NET occupational data.</>
                  )}
                </p>
                <ValueEditor scores={results.scores} onChange={handleScoresUpdate} />
              </section>
            </>
          )}

          <HowItWorksSection />
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Based on{' '}
            <a
              href="https://www.researchgate.net/publication/306432422_The_Refined_Theory_of_Basic_Values"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              The Refined Theory of Basic Values
            </a>
            {' '}by Shalom H. Schwartz
          </p>
        </div>
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border bg-card p-6">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="font-serif text-xl font-semibold">How it works</h2>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <p>
            This tool uses a two-layer approach to infer the Schwartz values (PVQ-RR) that
            best describe what a job is likely to reward, require, and reinforce.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-foreground">Job description analysis</p>
                <p>
                  An AI reads the job posting and scores all 19 Schwartz values based on
                  what the employer explicitly states or implies. Values with clear textual
                  evidence are marked <strong>High</strong>; inferrable ones are <strong>Medium</strong>;
                  anything the description doesn't address is <strong>Unspecified</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-foreground">O*NET occupational enrichment (optional)</p>
                <p>
                  Click <strong>Enrich with O*NET</strong> to look up the detected job title in the{' '}
                  <a href="https://www.onetcenter.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    O*NET database
                  </a>{' '}
                  (U.S. Department of Labor). O*NET's work values, work styles, Holland interest
                  codes, and knowledge areas are mapped to Schwartz values to fill any gaps left
                  <strong> Unspecified</strong> by the job description.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-foreground">Merging and tension detection</p>
                <p>
                  Where both sources agree, scores are blended (60% job description, 40% O*NET)
                  and marked <strong>Merged</strong>. Where they diverge by more than 1.5 points,
                  a tension note is added — gaps between what an employer <em>said</em> and what
                  the work <em>structurally requires</em> are often the most revealing interview topics.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="font-medium text-foreground">Professional ethics detection</p>
                <p>
                  For licensed or regulated professions an applicable ethics code is identified.
                  Conformity–Rules and Universalism–Concern are nudged upward to reflect public
                  accountability obligations.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 text-xs">
            <p className="font-medium mb-1">Data provenance note</p>
            <p>
              O*NET data is collected from U.S. workers and employers. Scores reflect North
              American occupational norms and may not match conditions in other countries.
              The mapping from O*NET constructs to Schwartz values is a directional heuristic,
              not a psychometrically validated instrument.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default JobAnalysis;
