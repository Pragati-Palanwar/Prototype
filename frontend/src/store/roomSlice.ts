import { createSlice, PayloadAction, configureStore } from "@reduxjs/toolkit";

interface RoomState {
  id: string | null;
  code: string;
  suggestion: string | null;
}

const initialState: RoomState = { id: null, code: "", suggestion: null };

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string>) { state.id = action.payload; },
    setCode(state, action: PayloadAction<string>) { state.code = action.payload; },
    setSuggestion(state, action: PayloadAction<string | null>) { state.suggestion = action.payload; }
  }
});

export const { setRoomId, setCode, setSuggestion } = roomSlice.actions;

const store = configureStore({
  reducer: {
    room: roomSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
