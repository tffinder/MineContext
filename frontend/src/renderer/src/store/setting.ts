// Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ApplyToDays = 'weekday' | 'everyday'

export const defaultScreenSettings = {
  recordInterval: 15,
  enableRecordingHours: false,
  recordingHours: ['08:00:00', '20:00:00'] as [string, string],
  applyToDays: 'weekday' as ApplyToDays
};

export type ScreenSettings = typeof defaultScreenSettings;

export type AppLanguage = 'zh' | 'en'

const initialState = {
  screenSettings: defaultScreenSettings,
  language: 'zh' as AppLanguage
}

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setScreenSettings(state, action: PayloadAction<Partial<ScreenSettings>>) {
      state.screenSettings = { ...state.screenSettings, ...action.payload }
    },
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      state.language = action.payload
    }
  }
})

export const { setScreenSettings, setLanguage } = settingSlice.actions

export default settingSlice.reducer
