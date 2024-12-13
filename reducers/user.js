import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    username: "",
    places: "",
    favorites: [],
    avatarUrl: "",

    // gerer mod
    token: "",
    isModalVisible: false,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addLocationToStore: (state, action) => {
      state.value.places = action.payload;
    },
    addFavoritesToStore: (state, action) => {
      state.value.favorites.push(action.payload);
    },
    removeFavoritesToStore: (state, action) => {
      state.value.favorites = state.value.favorites.filter(
        (favorite) => favorite !== action.payload
      );
    },
    login: (state, action) => {
      state.value.token = action.payload.token;
      state.value.username = action.payload.username;
      state.value.avatarUrl = action.payload.avatarUrl;
    },
    logout: (state) => {
      state.value.token = null;
      state.value.username = null;
    },
    toggleModal : (state) => {
        //si il est connecter ont bloc la modale (reste fermer)
        if (state.value.token) {
            return
        }
        // la valeur de isModaleVisible s'inverse ex : (connecter => true => alors false => reste fermer|| connecter => false => alors true => isModalVisible)
        state.value.isModalVisible = !state.value.isModalVisible;
    }
  },
});

export const {
  addLocationToStore,
  login,
  logout,
  addFavoritesToStore,
  removeFavoritesToStore,
  toggleModal
} = userSlice.actions;
export default userSlice.reducer;
