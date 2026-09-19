import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    // =========================
    // SIGN IN
    // =========================

    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    signInSuccess: (state, action) => {
      const user = action.payload?.user || action.payload;

      state.currentUser = user;
      state.loading = false;
      state.error = null;
    },

    signInFailure: (state, action) => {
      state.currentUser = null;
      state.loading = false;
      state.error = action.payload;
    },

    // =========================
    // UPDATE USER
    // =========================

    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    updateUserSuccess: (state, action) => {
      const updatedUser =
        action.payload?.user || action.payload;

      state.currentUser = updatedUser;
      state.loading = false;
      state.error = null;
    },

    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // =========================
    // DELETE USER
    // =========================

    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },

    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // =========================
    // SIGN OUT
    // =========================

    signOutUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },

    signOutUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // =========================
    // CLEAR ERROR
    // =========================

    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,

  updateUserStart,
  updateUserSuccess,
  updateUserFailure,

  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,

  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,

  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;