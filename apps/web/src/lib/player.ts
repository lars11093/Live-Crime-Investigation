import type { Role } from "@case-zero/shared";

/** Die Rollen aus README Abschnitt 1, so wie sie im UI heissen. */
export const ROLE_LABEL: Record<Role, string> = {
  forensics: "Forensiker",
  cyber: "Cyber Investigator",
  interrogation: "Verhör-Spezialist",
  field: "Field Detective",
  lead: "Lead Detective",
};

/** Kurz, was die Rolle exklusiv sieht (README Abschnitt 1). */
export const ROLE_FOCUS: Record<Role, string> = {
  forensics: "DNA, Fingerabdrücke, Autopsie",
  cyber: "Handys, Chats, Dateien, Metadaten",
  interrogation: "Verdächtige befragen",
  field: "Orte, CCTV, Zeugenaussagen",
  lead: "Timeline und Evidence Board",
};
