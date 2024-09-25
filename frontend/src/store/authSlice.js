import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

//load state from local storage
const initialState = localStorage.getItem("loggedInUser")
  ? JSON.parse(localStorage.getItem("loggedInUser"))
  : {
      isLoggedIn: false,
      user: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const { userData } = action.payload;

      state.isLoggedIn = true;
      state.user = userData;
      localStorage.setItem("loggedInUser", JSON.stringify(state));
    },
    logoutUser: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem("loggedInUser");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
