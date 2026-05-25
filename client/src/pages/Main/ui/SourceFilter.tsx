import { SourceName, allSourceNames } from '@entities/news/api/apiNews/utils/transforms.types'
import { Chip, Group } from '@mantine/core'

const SOURCE_LABELS: Record<SourceName, string> = {
  [SourceName.Guardian]: 'Guardian',
  [SourceName.PositiveNews]: 'Positive News',
  [SourceName.ReasonsToBeCheerful]: 'Reasons to be Cheerful',
  [SourceName.Upworthy]: 'Upworthy',
  [SourceName.Mongabay]: 'Mongabay',
  [SourceName.TheConversation]: 'The Conversation',
  [SourceName.AtlasObscura]: 'Atlas Obscura',
  [SourceName.ScienceAlert]: 'ScienceAlert',
}

interface SourceFilterProps {
  selectedSources: SourceName[]
  onToggle: (source: SourceName) => void
}

export const SourceFilter = ({ selectedSources, onToggle }: SourceFilterProps): React.ReactNode => {
  return (
    <Group gap="xs">
      {allSourceNames.map((source) => (
        <Chip
          key={source}
          checked={selectedSources.includes(source)}
          onChange={() => onToggle(source)}
          color="indigo"
          size="sm"
        >
          {SOURCE_LABELS[source]}
        </Chip>
      ))}
    </Group>
  )
}
