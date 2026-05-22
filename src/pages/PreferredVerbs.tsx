import { Navigation } from '@/components/Navigation';
import { SCHWARTZ_VALUES, HIGHER_ORDER_VALUES, HigherOrderValue, getTopValues } from '@/lib/schwartz-values';
import { ARCHETYPES, archetypeToScores } from '@/lib/archetypes';

function toFuture(verb: string): string {
  return verb.replace(/^I /, 'I will ');
}

function toShould(verb: string): string {
  return verb.replace(/^I /, 'I should ');
}

const ARCHETYPE_NAMES = ['Leslie Knope', 'Spock'] as const;

function ArchetypeCard({ name }: { name: string }) {
  const archetype = ARCHETYPES.find(a => a.name === name)!;
  const scores = archetypeToScores(archetype);
  const topValues = getTopValues(scores, 4);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold">{archetype.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{archetype.description}</p>
      </div>
      <div className="space-y-4">
        {topValues.map(v => {
          const color = `hsl(var(--${HIGHER_ORDER_VALUES[v.higherOrderValue].color}))`;
          const sample = v.verbs.slice(0, 2);
          return (
            <div key={v.code} className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold" style={{ color }}>{v.code}</span>
                <span className="text-sm font-medium">{v.label}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Character</span>
                  <span>{sample.join(' / ')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Preference</span>
                  <span className="text-muted-foreground">{sample.map(toFuture).join(' / ')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Role</span>
                  <span className="text-muted-foreground">{sample.map(toShould).join(' / ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PreferredVerbs() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Values as Preferred Verbs"
        description="Extending Schwartz's theory through predicate forms"
      />

      {/* Introduction */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Schwartz's PVQ-RR describes values as abstract motivational goals — what a person fundamentally
              cares about. But goals only become visible through action. By expressing each of the 19 basic
              values as first-person verb forms, we can move from the abstract to the behavioural: not just
              "this person values Benevolence" but "this person cares, helps, nurtures."
            </p>
            <p>
              This is a proposed extension of the theory, not a standard component of it. The verb forms
              below are interpretive — designed to be evocative rather than exhaustive, and to make value
              profiles readable as portraits of agency.
            </p>
          </div>
        </div>
      </section>

      {/* Full Verbs Table */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6 text-center">The 19 Schwartz Basic Values as Verbs</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold w-48">Basic value</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Preferred predicate forms</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHWARTZ_VALUES.map((v, i) => (
                    <tr key={v.code} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-4 py-2.5 align-top">
                        <span
                          className="font-mono text-xs font-semibold mr-1.5"
                          style={{ color: `hsl(var(--${HIGHER_ORDER_VALUES[v.higherOrderValue].color}))` }}
                        >
                          {v.code}
                        </span>
                        <span className="font-medium">{v.label}</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {v.verbs.join(' / ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Three Lenses */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-2 text-center">Three Lenses: Tense and Modality</h2>
            <p className="text-center text-muted-foreground text-sm mb-8">
              The same verb changes meaning depending on how it is inflected — revealing different aspects of a person's relationship to a value.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="rounded-xl border bg-card p-5">
                <div className="text-2xl font-serif font-bold mb-1">Character</div>
                <div className="text-sm text-muted-foreground mb-3">Present simple</div>
                <p className="text-sm leading-relaxed">
                  The values I already act from, habitually and reliably. This is who I am — not what I aspire
                  to or what my role requires, but what consistently animates my choices and attention.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-muted text-sm italic">"I relish."</div>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <div className="text-2xl font-serif font-bold mb-1">Preference</div>
                <div className="text-sm text-muted-foreground mb-3">Future simple</div>
                <p className="text-sm leading-relaxed">
                  The experiences I'm drawn toward and would choose given the opportunity. This register
                  captures desire and intention — what I would do if unconstrained by circumstance or duty.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-muted text-sm italic">"I will relish."</div>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <div className="text-2xl font-serif font-bold mb-1">Role</div>
                <div className="text-sm text-muted-foreground mb-3">Modal (should)</div>
                <p className="text-sm leading-relaxed">
                  The obligations my position places on me. This register is normative — it may or may not
                  reflect intrinsic motivation, but it describes what a role demands and what social context
                  reinforces.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-muted text-sm italic">"I should relish."</div>
              </div>
            </div>

            {/* Gap explanation */}
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground leading-relaxed space-y-2">
              <p className="font-semibold text-foreground">Why the gaps between lenses matter</p>
              <p>
                When the three forms align — "I care / I will care / I should care" — the value is integrated:
                it is simultaneously who the person is, what they want, and what their role demands.
              </p>
              <p>
                Gaps are diagnostically interesting. "I should comply" without "I will comply" may signal
                external constraint without internalized motivation. "I will analyse" without "I should analyse"
                may describe intellectual curiosity that exists outside the demands of a person's current role.
                Conflict between registers is often where value tension becomes most visible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Archetype Exploration */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-2 text-center">Exploring Two Archetypes</h2>
            <p className="text-center text-muted-foreground text-sm mb-8 max-w-2xl mx-auto">
              Leslie Knope and Spock share high scores on Self-direction–thought and Achievement, but diverge
              sharply elsewhere. Reading their top values across all three lenses makes the contrast vivid.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {ARCHETYPE_NAMES.map(name => (
                <ArchetypeCard key={name} name={name} />
              ))}
            </div>
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground leading-relaxed space-y-2">
              <p className="font-semibold text-foreground">Reading the contrast</p>
              <p>
                Both archetypes act from Self-direction–thought — "I analyse / I imagine" — but arrive at it
                differently. For Spock, it sits alongside Conformity–rules ("I comply / I obey") and Humility
                ("I defer / I accept my place"). For Knope, it sits alongside Benevolence–caring ("I care /
                I help") and Achievement ("I accomplish / I excel"). The same verb — "I analyse" — belongs to
                two very different characters.
              </p>
              <p>
                The role lens is particularly revealing. "I should comply" and "I should defer" describe a
                character whose obligations run inward — toward principle and self-restraint. "I should care"
                and "I should accomplish" describe someone whose obligations run outward — toward community
                and results. Same tense; entirely different moral worlds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Verb forms are an interpretive extension of{' '}
            <a
              href="https://www.researchgate.net/publication/306432422_The_Refined_Theory_of_Basic_Values"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Schwartz's Refined Theory of Basic Values
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
