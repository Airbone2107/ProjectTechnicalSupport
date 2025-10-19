import { create } from 'zustand';

interface NewTicketState {
  newTicketIds: Set<number>;
  addNewTicketId: (id: number) => void;
  removeNewTicketId: (id: number) => void;
}

export const useNewTicketStore = create<NewTicketState>((set) => ({
  newTicketIds: new Set(),
  addNewTicketId: (id) => set((state) => ({ newTicketIds: new Set(state.newTicketIds).add(id) })),
  removeNewTicketId: (id) => set((state) => {
    const newSet = new Set(state.newTicketIds);
    newSet.delete(id);
    return { newTicketIds: newSet };
  }),
})); 