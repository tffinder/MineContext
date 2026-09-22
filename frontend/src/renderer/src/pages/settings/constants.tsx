import { ReactNode } from 'react'
import openAI from '../../assets/images/settings/OpenAI.png'
import doubao from '../../assets/images/settings/doubao.png'
import custom from '../../assets/images/settings/custom.svg'

export enum ModelTypeList {
  Doubao = 'doubao',
  OpenAI = 'openai',
  Ollama = 'ollama',
  Generic = 'generic',
  Custom = 'custom'
}

export enum embeddingModels {
  DoubaoEmbeddingModelId = 'doubao-embedding-vision-250615',
  OpenAIEmbeddingModelId = 'text-embedding-3-large',
  OllamaEmbeddingModelId = 'nomic-embed-text',
  GenericEmbeddingModelId = 'qwen3-embedding'
}
export enum BaseUrl {
  DoubaoUrl = 'https://ark.cn-beijing.volces.com/api/v3',
  OpenAIUrl = 'https://api.openai.com/v1',
  OllamaUrl = 'http://localhost:11434/v1',
  GenericUrl = 'https://t.eshore.cn:10443/v1/gdai/api/3vq9d7t42l8g/model/common'
}
export interface OptionInfo {
  value: string
  label: string
}
export interface ModelInfo {
  icon: ReactNode
  key: string
  value: string
  option?: OptionInfo[]
}

export const ModelInfoList = [
  {
    icon: <img src={doubao} className="!max-w-none w-[24px] h-[24px]" />,
    key: 'Doubao',
    value: 'doubao',
    option: [
      {
        value: 'doubao-seed-1-6-flash-250828',
        label: 'doubao-seed-1.6-flash'
      },
      {
        value: 'doubao-1-5-vision-pro-250328',
        label: 'doubao-1.5-vision-pro'
      },
      {
        value: 'doubao-1-5-vision-lite-250315',
        label: 'doubao-1.5-vision-lite'
      }
    ]
  },
  {
    icon: <img src={openAI} className="!max-w-none w-[24px] h-[24px]" />,
    key: 'OpenAI',
    value: 'openai',
    option: [
      {
        value: 'gpt-5',
        label: 'GPT-5'
      },
      {
        value: 'gpt-5-mini',
        label: 'GPT-5 Mini'
      },
      {
        value: 'gpt-5-nano',
        label: 'GPT-5 Nano'
      },
      {
        value: 'gpt-4o',
        label: 'GPT-4o'
      }
    ]
  },
  {
    icon: <img src={custom} className="!max-w-none w-[18px] h-[18px]" />,
    key: 'Ollama',
    value: 'ollama',
    option: [
      {
        value: 'llama3.2-vision',
        label: 'llama3.2-vision (11B)'
      },
      {
        value: 'qwen2.5-vl',
        label: 'qwen2.5-vl (7B)'
      },
      {
        value: 'minicpm-v',
        label: 'MiniCPM-V (8B)'
      },
      {
        value: 'gemma3',
        label: 'gemma3 (12B)'
      }
    ]
  },
  {
    icon: <img src={custom} className="!max-w-none w-[18px] h-[18px]" />,
    key: 'Generic',
    value: 'generic',
    option: [
      {
        value: 'Qwen3.5-397B-A17B',
        label: 'Qwen3.5-397B-A17B'
      },
      {
        value: 'deepseek-v3',
        label: 'DeepSeek-V3'
      },
      {
        value: 'glm-4-plus',
        label: 'GLM-4-Plus'
      }
    ]
  },
  {
    icon: <img src={custom} className="!max-w-none w-[18px] h-[18px]" />,
    key: 'Custom',
    value: 'custom'
  }
]
