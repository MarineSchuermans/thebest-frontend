import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: {userName: '', places: [] }
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addLocationToStore: (state, action) => {
            state.value.places.push(action.payload)
        }
    }
});

export const { addLocationToStore } = userSlice.actions;
export default userSlice.reducer;