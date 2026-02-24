import { create } from "zustand";

type DocsStoreState = {
  headerIdsInView: string[];
  updateHeaderIdInView: (inView: boolean, id: string) => void;
  resetHeaderIdsInView: () => void;
};

// useDocsStore tracks which docs headers are currently in view for sidecar highlighting.
export const useDocsStore = create<DocsStoreState>()((set, get) => ({
  headerIdsInView: [],
  updateHeaderIdInView: (inView: boolean, id: string) => {
    const headerIds = get().headerIdsInView;

    if (inView && !headerIds.includes(id)) {
      set({ headerIdsInView: [...headerIds, id] });
    } else {
      set({ headerIdsInView: headerIds.filter((item) => item !== id) });
    }
  },
  resetHeaderIdsInView: () => {
    set({ headerIdsInView: [] });
  },
}));
