// Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { setLanguage } from '../store/setting'
import { translations, type Language, type TranslationKey } from '../i18n'

type I18nContextType = {
  lang: Language
  t: (key: TranslationKey, fallback?: string) => string
  setLang: (lang: Language) => void
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: (key, fallback) => fallback ?? key,
  setLang: () => {}
})

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const language = useSelector((state: RootState) => state.setting?.language ?? 'en')

  const t = useCallback(
    (key: TranslationKey, fallback?: string) => {
      const dict = translations[language as keyof typeof translations]
      return (dict?.[key] as string | undefined) ?? fallback ?? key
    },
    [language]
  )

  const setLang = useCallback(
    (lang: Language) => {
      dispatch(setLanguage(lang))
    },
    [dispatch]
  )

  return (
    <I18nContext value={{ lang: language as Language, t, setLang }}>
      {children}
    </I18nContext>
  )
}

export const useI18n = () => useContext(I18nContext)