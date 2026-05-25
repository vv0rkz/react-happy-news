import { Skeleton as MantineSkeleton, Stack } from '@mantine/core'

interface SkeletonProps {
  count?: number
  type?: 'banner' | 'item'
  height?: string
}

const DEFAULT_HEIGHTS: Record<'banner' | 'item', string> = {
  banner: '520px',
  item: '100px',
}

export const Skeleton = ({ count = 1, type = 'banner', height }: SkeletonProps): React.ReactNode => {
  const h = height ?? DEFAULT_HEIGHTS[type]

  return (
    <Stack gap="sm">
      {[...Array(count)].map((_, index) => (
        <MantineSkeleton key={index} height={h} radius="md" />
      ))}
    </Stack>
  )
}
