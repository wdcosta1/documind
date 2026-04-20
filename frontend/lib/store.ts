// Redux store setup. Only the sample counter slice uses it right now.
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/lib/features/counter/counter-slice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
