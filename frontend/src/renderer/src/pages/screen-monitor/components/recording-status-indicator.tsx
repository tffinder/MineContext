import React from 'react'
import { Typography } from '@arco-design/web-react'
import { SCREEN_INTERVAL_TIME } from '../constant'
import { useI18n } from '@renderer/context/I18nProvider'

const { Text } = Typography

interface RecordingStatusIndicatorProps {
  isMonitoring: boolean
  canRecord: boolean
  isToday: boolean
}

const RecordingStatusIndicator: React.FC<RecordingStatusIndicatorProps> = ({ isMonitoring, canRecord, isToday }) => {
  const { t } = useI18n()
  if (!isToday) return null

  return (
    <>
      {isMonitoring ? (
        canRecord ? (
          <div className="w-full text-sm">
            <Text className="[&_.arco-typography]: !font-bold [&_.arco-typography]: !text-[#5252FF] [&_.arco-typography]: !text-xs">
              {t('screenMonitor.recordingScreen')}
            </Text>
            <div className="text-[#C9C9D4]">
              {t('screenMonitor.everyNMinutes').replace('{n}', String(SCREEN_INTERVAL_TIME))}
            </div>
          </div>
        ) : (
          <div className="w-full text-sm">
            <Text className="[&_.arco-typography]: !font-bold [&_.arco-typography]: !text-[#FF4D4F] [&_.arco-typography]: !text-xs">
              {t('screenMonitor.recordingStopped')}
            </Text>
            <div className="text-[#C9C9D4]">
              {t('screenMonitor.recordingStoppedHours')}
            </div>
          </div>
        )
      ) : (
        <div style={{ width: '100%', fontSize: 14 }}>
          <Text style={{ fontWeight: 'bold', color: '#FF4D4F', fontSize: 12 }}>{t('screenMonitor.recordingStopped')}</Text>
          <div style={{ color: '#C9C9D4' }}>{t('screenMonitor.recordingStoppedManually')}</div>
        </div>
      )}
    </>
  )
}

export default RecordingStatusIndicator
