import { create } from "zustand";
import dayjs from "dayjs";

type CalendarState = {
  today: string;
  selectedDate: string;
};

type CalendarActions = {
  setSelectedDate: (date: string) => void;
  setPreviousDate: (date: string) => void;
  setNextDate: (date: string) => void;
};

const initialState: CalendarState = {
  today: dayjs().format("YYYY-MM-DD"),
  selectedDate: dayjs().format("YYYY-MM-DD"),
};

export const useCalendarStore = create<CalendarState & CalendarActions>(
  (set) => ({
    ...initialState,
    setSelectedDate: (date: string) =>
      set((state) => ({ ...state, selectedDate: date })),
    setPreviousDate: (date: string) =>
      set((state) => ({
        ...state,
        selectedDate: dayjs(date).subtract(1, "day").format("YYYY-MM-DD"),
      })),
    setNextDate: (date: string) =>
      set((state) => ({
        ...state,
        selectedDate: dayjs(date).add(1, "day").format("YYYY-MM-DD"),
      })),
  }),
);
