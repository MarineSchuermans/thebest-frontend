import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: {username: '', places: '', favorites: [], token: '', avatarUrl: '' }
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addLocationToStore: (state, action) => {
            state.value.places = action.payload 
        },
        addFavoritesToStore: (state, action) => {
            state.value.favorites.push(action.payload)
        },
        removeFavoritesToStore: (state, action) => {
            state.value.favorites = state.value.favorites.filter(favorite => favorite.id !== action.payload.id)
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
    }
});

export const { addLocationToStore, login, logout, addFavoritesToStore, removeFavoritesToStore } = userSlice.actions;
export default userSlice.reducer;