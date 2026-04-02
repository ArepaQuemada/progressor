export const Routes = {
  home: "/",
  routines: {
    new: "/routines/new",
    detail: (id: number) => `/routines/${id}`,
  },
} as const;
