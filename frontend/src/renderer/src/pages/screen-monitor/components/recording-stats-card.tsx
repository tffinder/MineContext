import React, { useState } from 'react'
import { Tooltip, Image, Button, Message } from '@arco-design/web-react'
import { IconSync } from '@arco-design/web-react/icon'
import { pathToFileURL } from '@renderer/utils/file'
import { useI18n } from '@renderer/context/I18nProvider'

export interface RecordingStats {
  processed_screenshots: number
  failed_screenshots: number
  generated_activities: number
  next_activity_eta_seconds: number
  recent_errors: Array<{
    error_message: string
    processor_name: string
    timestamp: string
  }>
  recent_screenshots: string[]
}

interface RecordingStatsCardProps {
  stats: RecordingStats | null
  onRetry?: () => Promise<any>
}

const RecordingStatsCard: React.FC<RecordingStatsCardProps> = ({ stats, onRetry }) => {
  const { t } = useI18n()
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry || retrying) return
    setRetrying(true)
    try {
      const result = await onRetry()
      if (result?.retried > 0) {
        Message.success(`${t('screenMonitor.retried')}: ${result.retried}`)
      } else {
        Message.info(t('screenMonitor.noFailedToRetry'))
      }
    } catch {
      Message.error(t('screenMonitor.retryFailed'))
    } finally {
      setRetrying(false)
    }
  }

  if (!stats) return null

  return (
    <div className="mt-2">
      {/* Recent screenshots display */}
      {stats.recent_screenshots && stats.recent_screenshots.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          <Image.PreviewGroup infinite className="[&_.arco-image-preview-img]:!scale-80">
            {stats.recent_screenshots.map((path, index) => (
              <Image
                key={index}
                src={pathToFileURL(path)}
                width={110}
                height={60}
                alt={`screenshot-${index + 1}`}
                className="cursor-pointer rounded-[8px] overflow-hidden"
              />
            ))}
          </Image.PreviewGroup>
        </div>
      )}

      {/* Stats text */}
      <div className="text-xs text-[#86909C]">
        <span className="text-[#00B42A] font-medium">{stats.processed_screenshots}</span>
        <span>{t('screenMonitor.screenshotsProcessed')}</span>
        {stats.failed_screenshots > 0 && (
          <>
            <span className="mx-[2px]">•</span>
            <span className="text-[#FF4D4F] font-medium">{stats.failed_screenshots}</span>
            <span>{t('screenMonitor.screenshotsFailed')}</span>
            <Button
              type="text"
              size="mini"
              icon={<IconSync spin={retrying} />}
              onClick={handleRetry}
              loading={retrying}
              className="!text-[#165DFF] !text-xs ml-1"
              style={{ padding: '0 4px', height: 20 }}>
              {t('screenMonitor.retry')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default RecordingStatsCard
