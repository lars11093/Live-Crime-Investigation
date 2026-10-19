import type { CollectableEvidence } from "@case-zero/shared";

/** Deutsche Beschriftung der Beweisarten — einmal, fuer Liste und Detail. */
export const KIND_LABEL: Record<CollectableEvidence["kind"], string> = {
  person: "Person",
  object: "Gegenstand",
  location: "Ort",
  message: "Nachricht",
  fact: "Feststellung",
};
