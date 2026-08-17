import { useState } from "react";
import type { EvidenceEdge, EvidenceNode } from "@case-zero/shared";
import { socket } from "../lib/socket";

interface Props {
  code: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export function EvidenceBoard({ code, nodes, edges }: Props) {
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  function handleNodeClick(nodeId: string) {
    if (!pendingFrom) {
      setPendingFrom(nodeId);
      return;
    }
    if (pendingFrom !== nodeId) {
      socket.emit("board:connect", { code, fromId: pendingFrom, toId: nodeId });
    }
    setPendingFrom(null);
  }

  function handleDrag(nodeId: string, event: React.MouseEvent<HTMLDivElement>) {
    const board = event.currentTarget.parentElement as HTMLElement;
    const rect = board.getBoundingClientRect();

    function onMove(moveEvent: MouseEvent) {
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      socket.emit("board:moveNode", { code, nodeId, x, y });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="evidence-board">
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.fromId);
          const to = nodes.find((n) => n.id === edge.toId);
          if (!from || !to) return null;
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={edge.correct ? "var(--accent)" : "var(--muted)"}
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {nodes.map((node) => (
        <div
          key={node.id}
          className="evidence-node"
          style={{
            left: node.x,
            top: node.y,
            outline: pendingFrom === node.id ? "2px solid var(--danger)" : "none",
          }}
          onMouseDown={(e) => handleDrag(node.id, e)}
          onClick={() => handleNodeClick(node.id)}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}
