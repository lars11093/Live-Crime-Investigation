import { useCallback, useEffect, useState } from "react";
import type { TaskAck, TeamTask, TeamTaskPatch, TeamView } from "@case-zero/shared";
import { socket } from "./socket";
import type { PlayerIdentity } from "./player";

/**
 * Die gemeinsame Aufgabenliste einer Session (Story #50) ueber Socket.IO.
 *
 * Der Server schickt nach jeder Aenderung die ganze Liste samt Team; der
 * Client zeigt nur an, was zurueckkommt — keine optimistischen Updates, die
 * bei einer Ablehnung zurueckgerollt werden muessten.
 */
export function useTeamTasks(code: string, me: PlayerIdentity, enabled: boolean) {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [team, setTeam] = useState<TeamView | null>(null);

  useEffect(() => {
    if (!enabled) return;
    function join() {
      socket.emit("tasks:join", { code, playerId: me.id, name: me.name });
    }
    function onState(payload: { tasks: TeamTask[]; team: TeamView }) {
      setTasks(payload.tasks);
      setTeam(payload.team);
    }
    socket.on("tasks:state", onState);
    socket.on("connect", join);
    if (socket.connected) join();
    return () => {
      socket.off("tasks:state", onState);
      socket.off("connect", join);
    };
  }, [code, me, enabled]);

  const ack = (resolve: (reason: string | null) => void) => (result: TaskAck) =>
    resolve(result.ok ? null : result.reason);

  const add = useCallback(
    (text: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.emit("tasks:add", { code, playerId: me.id, text }, ack(resolve));
      }),
    [code, me]
  );

  const update = useCallback(
    (taskId: string, patch: TeamTaskPatch) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.emit("tasks:update", { code, playerId: me.id, taskId, patch }, ack(resolve));
      }),
    [code, me]
  );

  const remove = useCallback(
    (taskId: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.emit("tasks:remove", { code, playerId: me.id, taskId }, ack(resolve));
      }),
    [code, me]
  );

  return { tasks, team, add, update, remove };
}
