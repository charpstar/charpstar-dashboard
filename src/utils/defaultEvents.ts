export const defaultEvents = {
  charpstAR_Load: {
    title: "CharpstAR Load",
    tooltip: "Tooltip1",
    count: undefined,
  },
  charpstAR_AR_Button_Click: {
    title: "CharpstAR AR Click",
    tooltip: "Tooltip2",
    count: undefined,
  },
  charpstAR_3D_Button_Click: {
    title: "CharpstAR 3D Click",
    tooltip: "Tooltip3",
    count: undefined,
  },
} as Record<
  string,
  { title: string; tooltip: string; count: number | undefined }
>;
