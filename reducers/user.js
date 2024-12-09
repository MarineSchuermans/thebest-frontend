import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: {userName: '', places:'', favorites: [] }
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
        }
    }
});

export const { addLocationToStore, addFavoritesToStore, removeFavoritesToStore } = userSlice.actions;
export default userSlice.reducer;