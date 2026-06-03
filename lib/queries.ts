import { useQuery } from "@tanstack/react-query";

import { ATGCalendarDayRoot } from "@/types/ATG/CalendarDay";
import { ATGGameRoot } from "@/types/ATG/Game";

export const queryKeys = {
  day: ["day"],
  game: ["game"],
  rankPoints: ["rankPoints"],
};

export const useDay = (date: string) => {
  return useQuery({
    queryKey: queryKeys.day,
    queryFn: async () => {
      const res = await fetch(`/api/day&date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch day data");
      return res.json() as Promise<ATGCalendarDayRoot>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useGame = (id: string) => {
  return useQuery({
    queryKey: queryKeys.game,
    queryFn: async () => {
      const res = await fetch(`/api/game&id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch game data");
      return res.json() as Promise<ATGGameRoot>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useRankPoints = () => {
  return useQuery({
    queryKey: queryKeys.rankPoints,
    queryFn: async () => {
      const res = await fetch("/api/rank-points");
      if (!res.ok) throw new Error("Failed to fetch rank points");
      return res.json() as Promise<unknown>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};
