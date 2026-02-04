import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, GitCompare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Citation {
  authors: string;
  year: number;
  title: string;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  note?: string;
}

const CITATIONS: Record<string, Citation> = {
  reynolds2012: {
    authors: 'Reynolds, S.J., Owens, B.P., & Rubenstein, A.L.',
    year: 2012,
    title: 'Moral Stress: Considering the Nature and Effects of Managerial Moral Uncertainty',
    journal: 'Journal of Business Ethics',
    volume: '106',
    pages: '491-502',
    doi: '10.1007/s10551-011-1013-8',
  },
  larsson2018: {
    authors: 'Larsson, G., Nilsson, S., Hyllengren, P., Ohlsson, A., Waaler, G., & Kallenberg, K.',
    year: 2018,
    title: 'Stress reactions following acute situations involving moral challenges among health care professionals',
    journal: 'Scandinavian Journal of Psychology',
    volume: '59',
    pages: '177-185',
    doi: '10.1111/sjop.12425',
  },
  bouckenooghe2005: {
    authors: 'Bouckenooghe, D., Buelens, M., Fontaine, J., & Vanderheyden, K.',
    year: 2005,
    title: 'The Prediction of Stress by Values and Value Conflict',
    journal: 'The Journal of Psychology',
    volume: '139(4)',
    pages: '369-384',
    doi: '10.3200/JRLP.139.4.369-384',
  },
  lee2015: {
    authors: 'Lee, S.',
    year: 2015,
    title: 'Managerial dilemmas as situational tensions acting on stable value systems',
    note: 'Citation as referenced in original literature review',
  },
  klenk2022: {
    authors: 'Klenk, M.',
    year: 2022,
    title: 'The Influence of Situational Factors in Sacrificial Dilemmas on Utilitarian Moral Judgments',
    journal: 'Review of Philosophy and Psychology',
    volume: '13',
    pages: '593-625',
    doi: '10.1007/s13164-021-00547-4',
  },
  myyry2007: {
    authors: 'Myyry, L., & Helkama, K.',
    year: 2007,
    title: 'Socio-cognitive conflict, emotions and complexity of thought in real-life morality',
    journal: 'Scandinavian Journal of Psychology',
    volume: '48(3)',
    pages: '247-259',
    doi: '10.1111/j.1467-9450.2007.00579.x',
  },
  carminati2023: {
    authors: 'Carminati, L., & Gao-Héliot, Y.',
    year: 2023,
    title: 'Professional and religious identity conflict: individual and organizational dynamics in ethically-charged circumstances',
    journal: 'Self and Identity',
    volume: '22(7-8)',
    doi: '10.1080/15298868.2023.2248686',
  },
  haan1975: {
    authors: 'Haan, N.',
    year: 1975,
    title: 'Hypothetical and actual moral reasoning in a situation of civil disobedience',
    journal: 'Journal of Personality and Social Psychology',
    volume: '32',
    pages: '255-270',
    doi: '10.1037/0022-3514.32.2.255',
  },
  jex2003: {
    authors: 'Jex, S.M., Adams, G.A., Bachrach, D.G., & Sorenson, S.',
    year: 2003,
    title: 'The impact of situational constraints, role stressors, and commitment on employee altruism',
    journal: 'Journal of Occupational Health Psychology',
    volume: '8(3)',
    pages: '171-180',
    doi: '10.1037/1076-8998.8.3.171',
  },
  fida2015: {
    authors: 'Fida, R., Paciello, M., Tramontano, C., Fontaine, R.G., Barbaranelli, C., & Farnese, M.L.',
    year: 2015,
    title: 'An Integrative Approach to Understanding Counterproductive Work Behavior: The Roles of Stressors, Negative Emotions, and Moral Disengagement',
    journal: 'Journal of Business Ethics',
    volume: '130(1)',
    pages: '131-144',
    doi: '10.1007/s10551-014-2268-9',
  },
};

function CitationLink({ id }: { id: keyof typeof CITATIONS }) {
  const cite = CITATIONS[id];
  const doiUrl = cite.doi ? `https://doi.org/${cite.doi}` : cite.url;

  return (
    <a
      href={doiUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary hover:underline ${!doiUrl ? 'cursor-default no-underline text-muted-foreground' : ''}`}
      title={cite.title}
    >
      ({cite.authors.split(',')[0].split(' ').pop()} et al., {cite.year})
    </a>
  );
}

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold">Research Background</h1>
            <p className="text-sm text-muted-foreground">
              Literature review of the tension carriers framework
            </p>
          </div>
        </div>
      </header>

      {/* Introduction */}
      <section className="py-12 border-b">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 mb-8">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">About This Review</h2>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This page presents a research-grounded evaluation of the "tension carriers" concept used on this site.
                It reviews empirical and theoretical support, challenges and critiques, and comparable taxonomies
                from psychology, organizational studies, and moral philosophy. The term "tension carriers" refers to
                situational features that systematically activate, strain, or force trade-offs among values—rather
                than being values themselves.
              </p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              Below is a structured summary of the relevant academic literature, organized into three sections:
              research that supports the idea of tension carriers, research that challenges or complicates the
              framework, and comparable taxonomies that provide useful context.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Supporting Research */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold">1. Research That Supports Tension Carriers</h2>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <p>
              Across psychology, organizational studies, and moral philosophy, there is strong convergent
              support for the claim that specific situational properties reliably generate value tension.
            </p>

            {/* 1.1 Moral stress */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">1.1 Moral Stress, Moral Uncertainty, and Value Strain</h3>
              <p className="text-muted-foreground">
                Research on moral stress shows that tension arises not merely from conflicting values, but from
                situational ambiguity, responsibility, and constraint—precisely the kind of "carrier" the
                tension carriers taxonomy highlights.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  <CitationLink id="reynolds2012" /> define moral stress as arising from uncertainty, ambiguity,
                  and responsibility under constraint, emphasizing that stress is situationally induced rather
                  than value-intrinsic.
                </li>
                <li>
                  <CitationLink id="larsson2018" /> show that acute situations involving moral challenges
                  (time pressure, stakes, role obligation) reliably produce stress reactions even when
                  individuals' core values remain stable.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                These findings support the idea that tension is "carried" by situational features, not by
                values alone.
              </p>
            </div>

            {/* 1.2 Value conflict and situational activation */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">1.2 Value Conflict and Situational Activation</h3>
              <p className="text-muted-foreground">
                Values research consistently shows that values are trans-situational, but conflict is
                situationally triggered.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  <CitationLink id="bouckenooghe2005" /> demonstrate that stress is predicted not by values
                  per se, but by value conflict activated by organizational and situational demands.
                </li>
                <li>
                  <CitationLink id="lee2015" /> explicitly frames managerial dilemmas as situational tensions
                  acting on stable value systems, arguing that values become problematic only under certain
                  contextual pressures.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                This aligns strongly with the carrier metaphor: values are latent; situations load them.
              </p>
            </div>

            {/* 1.3 Moral dilemmas */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">1.3 Moral Dilemmas and Situational Factor Taxonomies</h3>
              <p className="text-muted-foreground">
                There is direct precedent for classifying dilemmas by situational features, rather than
                moral content.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  <CitationLink id="klenk2022" /> reviews how factors like personal force, proximity,
                  uncertainty, and outcome salience systematically alter moral judgment across dilemmas.
                </li>
                <li>
                  <CitationLink id="myyry2007" /> propose a taxonomy of real-life moral problems based on
                  socio-cognitive conflict intensity and emotional load.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                These works strongly support the legitimacy of a structured list of situational
                "tension amplifiers."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges */}
      <section className="py-12 border-b">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold">2. Research That Challenges the Framework</h2>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

            {/* 2.1 Individual differences */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">2.1 Individual Differences Undermine Fixed Carrier Effects</h3>
              <p className="text-muted-foreground">
                One challenge is that the same situational feature does not produce the same tension for
                all agents.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  <CitationLink id="carminati2023" /> show that moral identity strength and role identification
                  moderate whether a situation produces conflict or coherence.
                </li>
                <li>
                  <CitationLink id="haan1975" /> found large divergences between hypothetical and actual moral
                  reasoning depending on identity, experience, and coping resources.
                </li>
              </ul>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-4">
                Implication: Tension carriers are probabilistic, not deterministic; they interact with
                person-level variables.
              </p>
            </div>

            {/* 2.2 Overlap and non-orthogonality */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">2.2 Overlap and Non-Orthogonality</h3>
              <p className="text-muted-foreground">
                Organizational stress research repeatedly finds that situational stressors are highly correlated.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  <CitationLink id="jex2003" /> show that role conflict, ambiguity, and constraints overlap
                  strongly and resist clean separation.
                </li>
                <li>
                  <CitationLink id="fida2015" /> argue for integrative rather than modular models of stressors
                  because discrete categories often collapse empirically.
                </li>
              </ul>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-4">
                Implication: A list of 12 carriers risks false precision unless explicitly framed as
                analytical lenses rather than independent variables.
              </p>
            </div>

            {/* 2.3 Cultural and institutional dependence */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-serif text-lg font-semibold mb-4 mt-0">2.3 Cultural and Institutional Dependence</h3>
              <p className="text-muted-foreground">
                What counts as a tension-carrier is culturally mediated.
              </p>
              <ul className="text-muted-foreground space-y-3 mt-4">
                <li>
                  Situations involving authority, hierarchy, or autonomy produce different value tensions
                  across institutional contexts (e.g., healthcare vs. military vs. startups){' '}
                  <CitationLink id="larsson2018" />.
                </li>
              </ul>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-4">
                Implication: This challenges any claim of universality without contextual qualifiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Comparable Taxonomies */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold">3. Comparable Taxonomies</h2>
          </div>

          <p className="text-muted-foreground mb-8">
            The tension carriers framework sits at the intersection of several established classification
            traditions:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Role stressor models */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-serif font-semibold mb-3">3.1 Role Stressor Models</h3>
              <p className="text-xs text-muted-foreground mb-3">(Organizational Psychology)</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                <li>• Role conflict</li>
                <li>• Role ambiguity</li>
                <li>• Role overload</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                <CitationLink id="jex2003" />
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                These overlap strongly with carriers like conflicting obligations, uncertainty, and
                resource constraints.
              </p>
            </div>

            {/* Moral dilemma feature taxonomies */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-serif font-semibold mb-3">3.2 Moral Dilemma Feature Taxonomies</h3>
              <p className="text-xs text-muted-foreground mb-3">(Moral Psychology)</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                <li>• Personal force</li>
                <li>• Proximity</li>
                <li>• Intentionality</li>
                <li>• Outcome certainty</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                <CitationLink id="klenk2022" />
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                These are near-isomorphic to several proposed carriers and provide empirical grounding.
              </p>
            </div>

            {/* Value conflict frameworks */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-serif font-semibold mb-3">3.3 Value Conflict Frameworks</h3>
              <p className="text-xs text-muted-foreground mb-3">(Values Research)</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                <li>• Intrapersonal vs. interpersonal conflict</li>
                <li>• Value hierarchy clashes</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                <CitationLink id="bouckenooghe2005" />; <CitationLink id="lee2015" />
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                These focus less on situations, but help explain why carriers produce strain.
              </p>
            </div>

            {/* Socio-cognitive conflict models */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-serif font-semibold mb-3">3.4 Socio-Cognitive Conflict Models</h3>
              <p className="text-xs text-muted-foreground mb-3">(Social Psychology)</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                <li>• Degree of social disagreement</li>
                <li>• Emotional salience</li>
                <li>• Cognitive complexity</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                <CitationLink id="myyry2007" />
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                These are especially relevant if carriers include social exposure, contestation, or
                public accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overall Assessment */}
      <section className="py-12 border-b">
        <div className="container max-w-4xl">
          <h2 className="font-serif text-2xl font-bold mb-8">Overall Assessment</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-4">What the Research Supports</h3>
              <ul className="text-sm text-emerald-800 dark:text-emerald-300 space-y-2">
                <li>• The core idea that situational features systematically generate value tension is
                  very well supported.</li>
                <li>• Treating these features as a taxonomy of tension carriers is conceptually legitimate
                  and empirically defensible.</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-4">What the Research Challenges</h3>
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                <li>• Fixed, universal effects of any single carrier</li>
                <li>• Strict independence between carriers</li>
                <li>• Culture-free or role-free interpretations</li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-4">Best Framing Going Forward</h3>
            <p className="text-muted-foreground">
              The strongest alignment with the literature is to treat the 12 carriers as:
            </p>
            <blockquote className="mt-4 pl-4 border-l-4 border-primary text-lg font-medium">
              "Recurring situational patterns that probabilistically activate value conflict,
              moderated by identity, role, and context."
            </blockquote>
          </div>
        </div>
      </section>

      {/* References */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <h2 className="font-serif text-2xl font-bold mb-8">References</h2>

          <div className="space-y-4">
            {Object.entries(CITATIONS)
              .sort((a, b) => a[1].authors.localeCompare(b[1].authors))
              .map(([id, cite]) => (
                <div key={id} className="text-sm text-muted-foreground">
                  <p>
                    {cite.authors} ({cite.year}). <em>{cite.title}</em>.
                    {cite.journal && ` ${cite.journal}`}
                    {cite.volume && `, ${cite.volume}`}
                    {cite.pages && `, ${cite.pages}`}.
                    {cite.doi && (
                      <>
                        {' '}
                        <a
                          href={`https://doi.org/${cite.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          DOI: {cite.doi}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                    {cite.note && <span className="italic"> {cite.note}</span>}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            <Link to="/carriers" className="text-primary hover:underline">
              Explore Tension Carriers
            </Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
