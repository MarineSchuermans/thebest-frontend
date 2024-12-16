import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value : []
};

export const restoSlice = createSlice({
    name: 'resto',
    initialState,
    reducers : {
        initializeRestoToStore: (state, action) => {
            state.value = []
        },
        addRestoToStore: (state, action) => {
            state.value.push(action.payload)
        }
    }
})

export const { addRestoToStore, initializeRestoToStore } = restoSlice.actions;
export default restoSlice.reducer;