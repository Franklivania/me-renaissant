import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  expand: boolean;
  toggleExpand: () => void;
  setExpand: (value: boolean) => void;
  isExpanded: () => boolean;
}

const useSidebarStore = create<SidebarState>()(
  persist<SidebarState>(
    (set, get) => ({
      expand: false,
      toggleExpand: () => set((state) => ({ expand: !state.expand })),
      setExpand: (value: boolean) => set({ expand: value }),
      isExpanded: () => get().expand,
    }),
    {
      name: "me-renaissance-sidebar-toggle",
    },
  ),
);

export default useSidebarStore;
