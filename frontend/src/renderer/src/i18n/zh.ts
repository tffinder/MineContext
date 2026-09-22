// Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
// SPDX-License-Identifier: Apache-2.0

export const zh = {
  'nav.home': '首页',
  'nav.screenMonitor': '屏幕监控',
  'nav.settings': '设置',

  'settings.title': '选择 AI 模型开始',
  'settings.subtitle': '配置 AI 模型和 API Key，即可开启 MineContext 的智能上下文能力',
  'settings.modelPlatform': '模型平台',
  'settings.selectModel': '选择 AI 模型',
  'settings.apiKey': 'API Key',
  'settings.getApiKey': '获取 API Key',
  'settings.enterApiKey': '请输入 API Key',
  'settings.modelName': '模型名称',
  'settings.baseUrl': 'Base URL',
  'settings.enterBaseUrl': '请输入 Base URL',
  'settings.embeddingModel': 'Embedding 模型',
  'settings.visionLanguageModel': '视觉语言模型',
  'settings.language': '语言',
  'settings.languageChinese': '中文',
  'settings.languageEnglish': 'English',
  'settings.save': '保存',
  'settings.getStarted': '开始使用',
  'settings.savedSuccess': 'API Key 保存成功',
  'settings.languageChanged': '语言已切换',

  'common.cannotBeEmpty': '不能为空',
  'common.pleaseSelect': '请选择',
  'common.pleaseEnter': '请输入'
}

export type TranslationKey = keyof typeof zh
