"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CellId } from "@/lib/cells-data";
import { generateProtocolId } from "@/lib/cells-data";

export type ClearanceTier = "L0" | "L1" | "L2" | "L3";
export type TerminalPhase = "boot" | "consent" | "terminal" | "breach" | "clearance";

interface TerminalState {
  phase: TerminalPhase;
  audioEnabled: boolean;
  clearance: ClearanceTier;
  protocolId: string | null;
  witnessedAnomaly: boolean;
  breachedCells: CellId[];
  activeCell: CellId | null;
  xp: number;
  fieldOrdersComplete: string[];
  affinityHover: Record<string, number>;
  anomalyGlitch: boolean;

  setPhase: (phase: TerminalPhase) => void;
  enter: () => void;
  enableAudio: () => void;
  disableAudio: () => void;
  requestClearance: () => void;
  breachCell: (id: CellId) => void;
  closeBreach: () => void;
  addXp: (amount: number) => void;
  completeFieldOrder: (id: string) => void;
  recordHover: (cellId: string) => void;
  triggerAnomaly: () => void;
  elevateClearance: (tier: ClearanceTier) => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      phase: "boot",
      audioEnabled: false,
      clearance: "L0",
      protocolId: null,
      witnessedAnomaly: false,
      breachedCells: [],
      activeCell: null,
      xp: 0,
      fieldOrdersComplete: [],
      affinityHover: {},
      anomalyGlitch: false,

      setPhase: (phase) => set({ phase }),

      enter: () => set({ phase: "terminal" }),

      enableAudio: () => set({ audioEnabled: true, phase: "terminal" }),

      disableAudio: () => set({ audioEnabled: false }),

      requestClearance: () =>
        set({
          clearance: "L1",
          protocolId: generateProtocolId(),
          phase: "terminal",
        }),

      breachCell: (id) => {
        const breached = get().breachedCells;
        set({
          activeCell: id,
          phase: "breach",
          breachedCells: breached.includes(id) ? breached : [...breached, id],
        });
        get().addXp(50);
      },

      closeBreach: () => set({ activeCell: null, phase: "terminal" }),

      addXp: (amount) => {
        const xp = get().xp + amount;
        const updates: Partial<TerminalState> = { xp };
        if (xp >= 500 && get().clearance === "L1") {
          updates.clearance = "L2";
        }
        set(updates);
      },

      completeFieldOrder: (id) => {
        const done = get().fieldOrdersComplete;
        if (done.includes(id)) return;
        set({
          fieldOrdersComplete: [...done, id],
        });
        get().addXp(120);
      },

      recordHover: (cellId) => {
        const prev = get().affinityHover[cellId] ?? 0;
        set({
          affinityHover: { ...get().affinityHover, [cellId]: prev + 1 },
        });
      },

      triggerAnomaly: () =>
        set({
          witnessedAnomaly: true,
          anomalyGlitch: true,
        }),

      elevateClearance: (tier) => set({ clearance: tier }),
    }),
    {
      name: "z2-terminal-state",
      partialize: (s) => ({
        clearance: s.clearance,
        protocolId: s.protocolId,
        witnessedAnomaly: s.witnessedAnomaly,
        breachedCells: s.breachedCells,
        xp: s.xp,
        fieldOrdersComplete: s.fieldOrdersComplete,
        affinityHover: s.affinityHover,
      }),
    }
  )
);
