import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value : []
};

export const restoSlice = createSlice({
    name: 'restoFiltred',
    initialState,
    reducers : {
        initializeFiltreToStore: (state, action) => {
            state.value = []
        },
        addRestoFiltredToStore: (state, action) => {
            state.value.push(action.payload)
        }
    }
})

export const { initializeFiltreToStore, addRestoFiltredToStore } = restoSlice.actions;
export default restoSlice.reducer;