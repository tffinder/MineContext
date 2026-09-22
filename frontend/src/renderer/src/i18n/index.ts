// Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
// SPDX-License-Identifier: Apache-2.0

import { zh } from './zh'
import { en } from './en'

export type Language = 'zh' | 'en'

export const translations = { zh, en }

export type TranslationKey = keyof typeof zh
