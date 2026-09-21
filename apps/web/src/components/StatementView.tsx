import { splitByTime, splitIntoSentences, timesIn } from "../lib/statement";

interface Props {
  statement?: string;
  /** Satznummern, die als Widerspruch markiert sind (#17). */
  markedIndices: number[];
  onToggleSentence: (sentenceIndex: number, text: string) => void;
}

function TimeHighlighted({ text }: { text: string }) {
  return (
    <>
      {splitByTime(text).map((segment, i) =>
        segment.isTime ? (
          <mark key={i} className="statement__time">
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}

/**
 * Story #16 — Aussage mit hervorgehobenen Zeitangaben.
 * Story #17 — einzelne Saetze als Widerspruch markieren.
 *
 * Markiert wird satzweise, nicht zeichengenau — siehe lib/statement.ts.
 */
export function StatementView({ statement, markedIndices, onToggleSentence }: Props) {
  if (!statement) {
    return (
      <div className="statement">
        <p className="team-code__label">Aussage</p>
        <p className="briefing__empty" style={{ margin: 0 }}>
          Keine Aussage aufgenommen
        </p>
      </div>
    );
  }

  const times = timesIn(statement);
  const sentences = splitIntoSentences(statement);
  const marked = new Set(markedIndices);

  return (
    <div className="statement">
      <div className="statement__bar">
        <p className="team-code__label" style={{ margin: 0 }}>
          Aussage zur Tatnacht
        </p>
        {times.length > 0 && (
          <p className="statement__times">
            {times.length} {times.length === 1 ? "Zeitangabe" : "Zeitangaben"}
          </p>
        )}
      </div>

      <p className="case-status__hint" style={{ marginBottom: "0.6rem" }}>
        Klicke einen Satz an, um ihn als Widerspruch zu markieren.
      </p>

      <blockquote className="statement__text">
        {sentences.map((sentence, index) => (
          <button
            key={index}
            className={`statement__sentence${marked.has(index) ? " statement__sentence--marked" : ""}`}
            onClick={() => onToggleSentence(index, sentence)}
            aria-pressed={marked.has(index)}
            title={marked.has(index) ? "Markierung aufheben" : "Als Widerspruch markieren"}
          >
            <TimeHighlighted text={sentence} />{" "}
          </button>
        ))}
      </blockquote>
    </div>
  );
}
