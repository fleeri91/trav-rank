import { useQuery } from "@tanstack/react-query";

import { BathingWaterResult } from "@/types/BathingWaters/BathingWaterResult";

export const queryKeys = {
  bathingWaters: ["bathingWaters"],
};

export const useBathingWaters = () => {
  return useQuery({
    queryKey: queryKeys.bathingWaters,
    queryFn: async () => {
      const res = await fetch("/api/bathing-waters");
      if (!res.ok) throw new Error("Failed to fetch bathing waters");
      return res.json() as Promise<BathingWaters>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};
