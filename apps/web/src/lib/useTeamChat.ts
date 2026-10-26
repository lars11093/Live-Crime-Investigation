import { useCallback, useEffect, useState } from "react";
import type { TeamChatMessage } from "@case-zero/shared";
import { socket } from "./socket";
import { appendMessage } from "./teamChat";
import type { PlayerIdentity } from "./player";

/**
 * Der Team-Chat einer Session (Story #49) ueber Socket.IO.
 *
 * Tritt dem Room bei, sobald `enabled` ist, und bei jedem Reconnect erneut —
 * Socket.IO vergisst die Room-Mitgliedschaft beim Verbindungsabbruch.
 */
export function useTeamChat(code: string, me: PlayerIdentity, enabled: boolean) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!enabled) return;

    function join() {
      socket.emit("chat:join", { code, playerId: me.id, name: me.name });
    }
    function onHistory(history: TeamChatMessage[]) {
      setMessages((prev) => history.reduce(appendMessage, prev));
    }
    function onMessage(message: TeamChatMessage) {
      setMessages((prev) => appendMessage(prev, message));
    }
    function onConnect() {
      setConnected(true);
      join();
    }
    function onDisconnect() {
      setConnected(false);
    }

    socket.on("chat:history", onHistory);
    socket.on("chat:message", onMessage);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) join();

    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:message", onMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [code, me, enabled]);

  const send = useCallback(
    (text: string) =>
      new Promise<string | null>((resolve) => {
        if (!socket.connected) {
          resolve("Keine Verbindung zum Server.");
          return;
        }
        socket.emit("chat:send", { code, playerId: me.id, name: me.name, text }, (result) =>
          resolve(result.ok ? null : result.reason)
        );
      }),
    [code, me]
  );

  return { messages, connected, send };
}
