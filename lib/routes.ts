export const Routes = {
  home: "/",
  routines: {
    new: "/routines/new",
    detail: (id: number) => `/routines/${id}`,
    dayMetrics: (routineId: number, dayId: number) => `/routines/${routineId}/days/${dayId}`,
  },
} as const;
