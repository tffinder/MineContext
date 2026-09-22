// Copyright (c) 2025 Beijing Volcano Engine Technology Co., Ltd.
// SPDX-License-Identifier: Apache-2.0

import { FC, useMemo, useEffect } from 'react'
import { Form, Button, Select, Input, Typography, Spin, Message, Radio } from '@arco-design/web-react'
import { find, get, isEmpty, pick } from 'lodash'

import ModelRadio from './components/modelRadio/model-radio'
import { ModelTypeList, BaseUrl, embeddingModels, ModelInfoList } from './constants'
import {
  getModelInfo,
  ModelConfigProps,
  updateModelSettingsAPI,
  setPromptLanguage
} from '../../services/Settings'
import { useMemoizedFn, useMount, useRequest } from 'ahooks'
import { useI18n } from '../../context/I18nProvider'

const FormItem = Form.Item
const { Text } = Typography

interface SettingsProps {
  closeSetting?: () => void
  init?: boolean
}
export interface InputPrefixProps {
  label: string
}
const InputPrefix: FC<InputPrefixProps> = (props) => {
  const { label } = props
  return <div className="flex w-[73px] items-center">{label}</div>
}
export interface CustomFormItemsProps {
  prefix: string
}
const CustomFormItems: FC<CustomFormItemsProps> = (props) => {
  const { prefix } = props
  const { t } = useI18n()
  return (
    <>
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col gap-[8px]">
          <span className="text-[#0B0B0F] font-roboto text-base font-normal leading-[22px] ">
            {t('settings.visionLanguageModel')}
          </span>
          <FormItem
            field={`${prefix}-modelId`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input
              addBefore={<InputPrefix label={t('settings.modelName')} />}
              placeholder="A VLM model with visual understanding capabilities is required."
              allowClear
              className="[&_.arco-input-inner-wrapper]: !w-[574px]"
            />
          </FormItem>
          <FormItem
            field={`${prefix}-baseUrl`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input
              addBefore={<InputPrefix label={t('settings.baseUrl')} />}
              placeholder={t('settings.enterBaseUrl')}
              allowClear
              className="[&_.arco-input-inner-wrapper]: !w-[574px]"
            />
          </FormItem>
          <FormItem
            field={`${prefix}-apiKey`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input.Password
              addBefore={<InputPrefix label={t('settings.apiKey')} />}
              placeholder={t('settings.enterApiKey')}
              allowClear
              className="!w-[574px]"
              defaultVisibility={false}
            />
          </FormItem>
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-[#0B0B0F] font-roboto text-base font-normal leading-[22px]">{t('settings.embeddingModel')}</span>
          <FormItem
            field={`${prefix}-embeddingModelId`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input
              addBefore={<InputPrefix label={t('settings.modelName')} />}
              placeholder={t('settings.enterApiKey')}
              allowClear
              className="!w-[574px]"
            />
          </FormItem>
          <FormItem
            field={`${prefix}-embeddingBaseUrl`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input
              addBefore={<InputPrefix label={t('settings.baseUrl')} />}
              placeholder={t('settings.enterBaseUrl')}
              allowClear
              className="!w-[574px]"
            />
          </FormItem>
          <FormItem
            field={`${prefix}-embeddingApiKey`}
            className="!mb-0"
            rules={[{ required: true, message: t('common.cannotBeEmpty') }]}
            requiredSymbol={false}>
            <Input.Password
              addBefore={<InputPrefix label={t('settings.apiKey')} />}
              placeholder={t('settings.enterApiKey')}
              allowClear
              className="!w-[574px]"
              defaultVisibility={false}
            />
          </FormItem>
        </div>
      </div>
    </>
  )
}
export interface StandardFormItemsProps {
  modelPlatform: ModelTypeList
  prefix: string
}
const StandardFormItems: FC<StandardFormItemsProps> = (props) => {
  const { modelPlatform, prefix } = props
  const { t } = useI18n()
  const option = useMemo(() => {
    const foundItem = find(ModelInfoList, (item) => item.value === modelPlatform)
    return foundItem ? foundItem.option : []
  }, [modelPlatform])

  return (
    <>
      <FormItem
        label={t('settings.selectModel')}
        field={`${prefix}-modelId`}
        requiredSymbol={false}
        rules={[
          {
            validator(value, callback) {
              if (!value) {
                callback(t('common.pleaseSelect'))
              } else {
                callback()
              }
            }
          }
        ]}>
        <Select allowCreate placeholder={t('common.pleaseSelect')} options={option} className="!w-[574px]" />
      </FormItem>
      <FormItem
        requiredSymbol={false}
        label={t('settings.apiKey')}
        field={`${prefix}-apiKey`}
        extra={
          <div className="flex items-center text-[#6E718C] text-[14px] ">
            You can get the API Key Here:
            <Button
              onClick={() => {
                const url =
                  modelPlatform === ModelTypeList.Doubao
                    ? 'https://www.volcengine.com/docs/82379/1541594'
                    : 'https://platform.openai.com/settings/organization/api-keys'
                window.open(`${url}`)
              }}
              type="text">
              {modelPlatform === ModelTypeList.Doubao ? 'Get Doubao API Key' : 'Get OpenAI API Key'}
            </Button>
          </div>
        }
        rules={[
          {
            validator(value, callback) {
              if (!value) {
                callback(t('common.pleaseEnter'))
              } else {
                callback()
              }
            }
          }
        ]}>
        <Input.Password
          autoFocus
          placeholder={t('settings.enterApiKey')}
          allowClear
          className="!w-[574px]"
          defaultVisibility={false}
        />
      </FormItem>
    </>
  )
}

// 1. Add showCheckIcon state
export interface SettingsFormBase {
  modelPlatform: string
}

export type SettingsFormProps = SettingsFormBase & {
  [K in ModelTypeList as `${K}-modelId` | `${K}-apiKey`]?: string
} & {
  [K in
    | `${ModelTypeList.Custom}-embeddingModelId`
    | `${ModelTypeList.Custom}-embeddingBaseUrl`
    | `${ModelTypeList.Custom}-embeddingApiKey`]?: string
}
const Settings: FC<SettingsProps> = (props) => {
  const { closeSetting, init } = props
  const { t, lang, setLang } = useI18n()

  const [form] = Form.useForm<SettingsFormProps>()
  const { run: getInfo, loading: getInfoLoading, data: modelInfo } = useRequest(getModelInfo, { manual: true })

  const { run: updateModelSettings, loading: updateLoading } = useRequest(updateModelSettingsAPI, {
    manual: true,
    onSuccess() {
      Message.success('Your API key saved successfully')
      getInfo()
      if (init) {
        closeSetting?.()
      }
    },
    onError(e: Error) {
      const errMsg = get(e, 'response.data.message') || get(e, 'message') || 'Failed to save settings'
      Message.error(errMsg)
    }
  })
  const submit = useMemoizedFn(async () => {
    try {
      await form.validate()
      const values = form.getFieldsValue()
      const isCustom = values.modelPlatform === ModelTypeList.Custom
      if (!values.modelPlatform) {
        Message.error('Please select Model Platform')
        return
      }
      const commonKey = [
        'modelPlatform',
        `${values.modelPlatform}-modelId`,
        `${values.modelPlatform}-apiKey`,
        `${values.modelPlatform}-baseUrl`,
        `${values.modelPlatform}-embeddingModelId`,
        `${values.modelPlatform}-embeddingBaseUrl`,
        `${values.modelPlatform}-embeddingApiKey`
      ]
      const data = pick(values, commonKey)
      const formatData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key.replace(`${values.modelPlatform}-`, ''), value])
      )

      // 各平台的默认 base_url 与默认 embedding 模型映射
      const platformBaseUrl: Record<string, string> = {
        [ModelTypeList.Doubao]: BaseUrl.DoubaoUrl,
        [ModelTypeList.OpenAI]: BaseUrl.OpenAIUrl,
        [ModelTypeList.Ollama]: BaseUrl.OllamaUrl,
        [ModelTypeList.Generic]: BaseUrl.GenericUrl
      }
      const platformEmbeddingModel: Record<string, string> = {
        [ModelTypeList.Doubao]: embeddingModels.DoubaoEmbeddingModelId,
        [ModelTypeList.OpenAI]: embeddingModels.OpenAIEmbeddingModelId,
        [ModelTypeList.Ollama]: embeddingModels.OllamaEmbeddingModelId,
        [ModelTypeList.Generic]: embeddingModels.GenericEmbeddingModelId
      }

      const params = isCustom
        ? formatData
        : {
            ...formatData,
            baseUrl: platformBaseUrl[values.modelPlatform] ?? BaseUrl.OpenAIUrl,
            embeddingModelId: platformEmbeddingModel[values.modelPlatform] ?? embeddingModels.OpenAIEmbeddingModelId
          }

      updateModelSettings(params as unknown as ModelConfigProps)
    } catch (error: any) {}
  })

  useMount(() => {
    getInfo()
  })
  useEffect(() => {
    const config = get(modelInfo, 'config')
    if (!getInfoLoading && !isEmpty(config) && !init) {
      const settingsValue = new Map<keyof SettingsFormProps, string>()
      const prefix = config.modelPlatform as ModelTypeList
      settingsValue.set(`modelPlatform`, prefix)
      Object.keys(config).reduce((acc, key) => {
        if (!acc.has(`${prefix}-${key}` as keyof SettingsFormProps) && !!config[key]) {
          acc.set(`${prefix}-${key}` as keyof SettingsFormProps, config[key])
        }
        return acc
      }, settingsValue)
      form.setFieldsValue(Object.fromEntries(settingsValue))
    }
  }, [modelInfo, getInfoLoading])

const handleLanguageChange = useMemoizedFn(async (value: string) => {
    const newLang = value as 'zh' | 'en'
    setLang(newLang)
    try {
      await setPromptLanguage(newLang)
      Message.success(t('settings.languageChanged'))
    } catch {
      // 后端切换失败不影响前端
    }
  })

  return (
    <Spin loading={getInfoLoading} block className="[&_.arco-spin-children]:!h-full !h-full">
      <div className="top-0 left-0 flex flex-col h-full overflow-y-hidden py-2 pr-2 relative">
        <div className="bg-white rounded-[16px] pl-6 flex flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-2">
          <div className="mb-[12px]">
            <div className="flex justify-between items-center mt-[26px]">
              <div className="text-[24px] font-bold text-[#000]">{t('settings.title')}</div>
              <Radio.Group
                value={lang}
                onChange={handleLanguageChange}
                type="button"
                size="small"
                style={{ marginRight: 24 }}>
                <Radio value="zh">{t('settings.languageChinese')}</Radio>
                <Radio value="en">{t('settings.languageEnglish')}</Radio>
              </Radio.Group>
            </div>
            <Text type="secondary" className="text-[13px]">
              {t('settings.subtitle')}
            </Text>
          </div>

          <div>
            <Form
              autoComplete="off"
              layout={'vertical'}
              form={form}
              initialValues={{
                modelPlatform: ModelTypeList.Doubao,
                [`${ModelTypeList.Doubao}-modelId`]: 'doubao-seed-1-6-flash-250828',
                [`${ModelTypeList.OpenAI}-modelId`]: 'gpt-5-nano'
              }}>
              <FormItem label={t('settings.modelPlatform')} field={'modelPlatform'} requiredSymbol={false}>
                <ModelRadio />
              </FormItem>
              <FormItem
                shouldUpdate={(prevValues, currentValues) => prevValues.modelPlatform !== currentValues.modelPlatform}
                noStyle>
                {(values) => {
                  const modelPlatform = values.modelPlatform
                  if (modelPlatform === ModelTypeList.Custom) {
                    return <CustomFormItems prefix={ModelTypeList.Custom} />
                  } else if (modelPlatform === ModelTypeList.Ollama) {
                    return <CustomFormItems prefix={ModelTypeList.Ollama} />
                  } else if (modelPlatform === ModelTypeList.Generic) {
                    return <CustomFormItems prefix={ModelTypeList.Generic} />
                  } else if (modelPlatform === ModelTypeList.Doubao) {
                    return <StandardFormItems modelPlatform={modelPlatform} prefix={ModelTypeList.Doubao} />
                  } else if (modelPlatform === ModelTypeList.OpenAI) {
                    return <StandardFormItems modelPlatform={modelPlatform} prefix={ModelTypeList.OpenAI} />
                  } else {
                    return null
                  }
                }}
              </FormItem>
            </Form>
            <Spin loading={updateLoading}>
              <Button type="primary" onClick={submit} disabled={updateLoading} className="!bg-[#000]">
                {init ? t('settings.getStarted') : t('settings.save')}
              </Button>
            </Spin>
          </div>
        </div>
      </div>
    </Spin>
  )
}

export default Settings
