import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export const useRentalStore = create((set) => ({
  rentals: [],
  setRentals: (rentals) => set({ rentals }),
  addRental: (rental) => set((state) => ({ rentals: [...state.rentals, rental] }))
}));
