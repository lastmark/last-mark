import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: null,
    username: "",
    avatar: "",
    bio: "",
    token: null,
    admin: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            return { ...state, ...action.payload };
        },
        updateUser(state, action) {
            return { ...state, ...action.payload }; 
        },
        clearUser() {
            return initialState;
        },
    },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
