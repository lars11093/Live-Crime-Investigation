import { useCallback, useEffect, useState } from "react";
import type { TaskAck, TeamTask, TeamTaskPatch } from "@case-zero/shared";
import { socket } from "./socket";

/**
 * Die gemeinsame Aufgabenliste einer Session (Story #50) über Socket.IO.
 *
 * Läuft über das Team aus #22: den Stand schickt der Server beim
 * `team:join` und nach jeder Änderung. Der Client zeigt nur an, was
 * zurückkommt — keine optimistischen Updates, die bei einer Ablehnung
 * zurückgerollt werden müssten.
 */
export function useTeamTasks(code: string) {
  const [tasks, setTasks] = useState<TeamTask[]>([]);

  useEffect(() => {
    socket.on("tasks:state", setTasks);
    return () => {
      socket.off("tasks:state", setTasks);
    };
  }, [code]);

  const ack = (resolve: (reason: string | null) => void) => (err: Error | null, result: TaskAck) =>
    resolve(err ? "Server nicht erreichbar. Bitte erneut versuchen." : result.ok ? null : result.reason);

  const add = useCallback(
    (text: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.timeout(5000).emit("tasks:add", { code, text }, ack(resolve));
      }),
    [code]
  );

  const update = useCallback(
    (taskId: string, patch: TeamTaskPatch) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.timeout(5000).emit("tasks:update", { code, taskId, patch }, ack(resolve));
      }),
    [code]
  );

  const remove = useCallback(
    (taskId: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) return resolve("Keine Verbindung zum Server.");
        socket.timeout(5000).emit("tasks:remove", { code, taskId }, ack(resolve));
      }),
    [code]
  );

  return { tasks, add, update, remove };
}
