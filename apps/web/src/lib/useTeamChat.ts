import { useCallback, useEffect, useState } from "react";
import type { TeamChatMessage } from "@case-zero/shared";
import { socket } from "./socket";
import { appendMessage } from "./teamChat";

/**
 * Der Team-Chat einer Session (Story #49) über Socket.IO.
 *
 * Läuft über das Team aus #22: den Verlauf schickt der Server beim
 * `team:join`, also auch nach jedem Reconnect erneut. Schreiben kann nur, wer
 * dem Team beigetreten ist.
 */
export function useTeamChat(code: string) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    function onHistory(history: TeamChatMessage[]) {
      setMessages((prev) => history.reduce(appendMessage, prev));
    }
    function onMessage(message: TeamChatMessage) {
      setMessages((prev) => appendMessage(prev, message));
    }
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    socket.on("chat:history", onHistory);
    socket.on("chat:message", onMessage);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:message", onMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [code]);

  const send = useCallback(
    (text: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) {
          resolve("Keine Verbindung zum Server.");
          return;
        }
        socket
          .timeout(5000)
          .emit("chat:send", { code, text }, (err, result) =>
            resolve(err ? "Server nicht erreichbar. Bitte erneut versuchen." : result.ok ? null : result.reason)
          );
      }),
    [code]
  );

  return { messages, connected, send };
}
