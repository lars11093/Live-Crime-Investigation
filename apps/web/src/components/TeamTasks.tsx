import { useState, type FormEvent } from "react";
import type { TeamTask, TeamTaskPatch, TeamView } from "@case-zero/shared";
import { doneTasks, groupOpenTasks, playerName } from "../lib/teamTasks";

interface Props {
  myId: string;
  tasks: TeamTask[];
  team: TeamView | null;
  onAdd: (text: string) => Promise<string | null>;
  onUpdate: (taskId: string, patch: TeamTaskPatch) => Promise<string | null>;
  onRemove: (taskId: string) => Promise<string | null>;
  onBack: () => void;
}

/**
 * Story #50 — eine gemeinsame Aufgabenliste.
 *
 * Offene Aufgaben nach Person gruppiert, damit auf einen Blick klar ist, wer
 * was noch erledigt. Jede Aenderung geht ueber den Server live an alle.
 */
export function TeamTasks({ myId, tasks, team, onAdd, onUpdate, onRemove, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const players = team?.players ?? [];
  const isLeader = team?.leaderId === myId;
  const done = doneTasks(tasks);

  async function run(action: Promise<string | null>) {
    setError(await action);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    const problem = await onAdd(draft);
    setError(problem);
    if (!problem) setDraft("");
  }

  function row(task: TeamTask) {
    const canRemove = task.createdBy === myId || isLeader;
    return (
      <li key={task.id} className={`task${task.done ? " task--done" : ""}`}>
        <label className="task__check">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => run(onUpdate(task.id, { done: !task.done }))}
          />
          <span className="task__text">{task.text}</span>
        </label>
        <span className="task__meta">
          von {playerName(team, task.createdBy, myId)}
        </span>
        <select
          aria-label={`Zustaendig fuer: ${task.text}`}
          value={task.assigneeId ?? ""}
          onChange={(e) => run(onUpdate(task.id, { assigneeId: e.target.value || null }))}
        >
          <option value="">— niemand —</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id === myId ? `${p.name} (du)` : p.name}
            </option>
          ))}
        </select>
        {!task.done && task.assigneeId !== myId && (
          <button onClick={() => run(onUpdate(task.id, { assigneeId: myId }))}>Ich uebernehme</button>
        )}
        {canRemove && (
          <button onClick={() => run(onRemove(task.id))} aria-label={`Aufgabe loeschen: ${task.text}`}>
            Loeschen
          </button>
        )}
      </li>
    );
  }

  const groups = groupOpenTasks(tasks, team, myId);

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Aufgaben · {tasks.length - done.length} offen
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      <form className="team-chat__form" onSubmit={submit}>
        <input
          aria-label="Neue Aufgabe"
          placeholder="Neue Aufgabe, z. B. Alibi von Leo pruefen"
          value={draft}
          maxLength={140}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="button--primary" disabled={!draft.trim()}>
          Hinzufuegen
        </button>
      </form>
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}

      {tasks.length === 0 ? (
        <p className="evidence-list__empty">Noch keine Aufgaben. Teilt die Ermittlung auf.</p>
      ) : (
        <>
          {groups.map((group) => (
            <div key={group.assigneeId ?? "niemand"} className="task-group">
              <p className="team-code__label">
                {group.label} · {group.open.length} offen
              </p>
              <ul className="task-list">{group.open.map(row)}</ul>
            </div>
          ))}
          {done.length > 0 && (
            <div className="task-group">
              <p className="team-code__label">Erledigt · {done.length}</p>
              <ul className="task-list">{done.map(row)}</ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
