import { create } from "zustand";
import type { CreateTaskInput } from "@/lib/schemas";

interface ModalState {
  isTaskModalOpen: boolean;
  taskModalData?: Partial<CreateTaskInput>;
  openTaskModal: (task?: Partial<CreateTaskInput>) => void;
  closeTaskModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isTaskModalOpen: false,
  taskModalData: undefined,
  openTaskModal: (task) => set({ isTaskModalOpen: true, taskModalData: task }),
  closeTaskModal: () =>
    set({ isTaskModalOpen: false, taskModalData: undefined }),
}));
