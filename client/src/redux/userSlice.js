import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        updateCredits: (state, action) => {
            if (state.userData) {
                state.userData.credits = action.payload;
            }
        },
        updateDailyAiUsage: (state, action) => {
            if (state.userData) {
                Object.assign(state.userData, action.payload);
            }
        }
    },
});

export const { setUserData, updateCredits, updateDailyAiUsage } = userSlice.actions;
export default userSlice.reducer;