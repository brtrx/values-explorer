import { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SchwartzCircle } from '@/components/SchwartzCircle';
import { ValueEditor } from '@/components/ValueEditor';
import { ClarificationPanel } from '@/components/ClarificationPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

    // Filter out timestamps older than 1 hour
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

interface AnalysisResult {
  scores: ValueScores;
  confidence: Record<string, ConfidenceLevel>;
  rationales?: Record<string, string>;
}

const JobAnalysis = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({ count: 0, timestamps: [] });

  // Update rate limit state on mount and after each analysis
  useEffect(() => {
    setRateLimitState(getRateLimitState());
  }, []);

  const remaining = RATE_LIMIT - rateLimitState.count;
  const rateLimitReached = remaining <= 0;

  const handleAnalyze = async () => {
    // Check rate limit
    const currentState = getRateLimitState();
    if (currentState.count >= RATE_LIMIT) {
      toast.error(`Rate limit reached. ${getTimeUntilReset()}`);
      setRateLimitState(currentState);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await supabase.functions.invoke('analyze-job-description', {
        body: { jobDescription }
      });

      if (response.error) {
        throw response.error;
      }

      setResults(response.data as AnalysisResult);
      addRateLimitTimestamp();
      setRateLimitState(getRateLimitState());
      toast.success('Analysis complete!');


    } catch (error) {
      console.error('Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze job description';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle score updates from ClarificationPanel
  const handleScoresUpdate = (newScores: ValueScores) => {
    if (results) {
      setResults({
        ...results,
        scores: newScores,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Job Description Analyzer"
        description="Infer Schwartz values from job descriptions"
      />

      <main className="container max-w-2xl py-8 px-4">
        <div className="space-y-8">
          {/* Warning Banner */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Experimental Feature</AlertTitle>
            <AlertDescription>
              This tool infers values from job descriptions using AI. Results are directionally
              accurate but not psychometrically validated. Use for exploration, not formal assessment.
            </AlertDescription>
          </Alert>

          {/* Rate Limit Info */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Limit: {RATE_LIMIT} analyses per hour. <strong>{remaining}</strong> remaining.{' '}
              {rateLimitReached && getTimeUntilReset()}
            </AlertDescription>
          </Alert>

          {/* Input Section */}
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
                disabled={isAnalyzing || jobDescription.length < 50 || rateLimitReached}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Values'}
              </Button>
            </div>
          </section>

          {/* Results Section (only show after analysis) */}
          {results && (
            <>
              {/* Spider Chart */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="font-serif text-xl font-semibold mb-4 text-center">
                  Inferred Value Profile
                </h2>
                <div className="flex justify-center pb-4">
                  <SchwartzCircle scores={results.scores} size={280} />
                </div>
              </section>

              {/* Confidence Legend */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="font-serif text-xl font-semibold mb-4">Confidence Levels</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>High - Clear evidence in description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Medium - Inferrable but not explicit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Unspecified - No relevant information</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  {Object.entries(results.confidence)
                    .sort(([codeA, levelA], [codeB, levelB]) => {
                      // Sort by confidence level first (high → medium → unspecified)
                      const levelOrder = { high: 0, medium: 1, unspecified: 2 };
                      const levelDiff = levelOrder[levelA] - levelOrder[levelB];
                      if (levelDiff !== 0) return levelDiff;
                      // Then alphabetically by code
                      return codeA.localeCompare(codeB);
                    })
                    .map(([code, level]) => {
                      const rationale = results.rationales?.[code];
                      return (
                        <div key={code} className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            level === 'high' ? 'bg-green-500' :
                            level === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <span className="font-mono text-xs flex-shrink-0">{code}</span>
                          <span className="text-muted-foreground flex-shrink-0">{level}</span>
                          {rationale && (
                            <span className="text-xs text-muted-foreground italic truncate">
                              — {rationale}
                            </span>
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
                </p>
                <ValueEditor
                  scores={results.scores}
                  onChange={handleScoresUpdate}
                />
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
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

export default JobAnalysis;
