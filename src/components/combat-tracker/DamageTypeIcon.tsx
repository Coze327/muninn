import {
  PiSword,
  PiArrowUp,
  PiHammer,
  PiFlame,
  PiSnowflake,
  PiLightning,
  PiSpeakerHigh,
  PiDrop,
  PiSkull,
  PiSun,
  PiBrain,
  PiMagicWand,
} from 'react-icons/pi';

type DamageTypeIconProps = {
  damageType: string | undefined;
  size?: number;
};

export function DamageTypeIcon({ damageType, size = 14 }: DamageTypeIconProps) {
  if (!damageType) return null;

  const type = damageType.toLowerCase();
  const iconProps = { size };

  switch (type) {
    case 'slashing':
      return <PiSword {...iconProps} />;
    case 'piercing':
      return <PiArrowUp {...iconProps} />;
    case 'bludgeoning':
      return <PiHammer {...iconProps} />;
    case 'fire':
      return <PiFlame {...iconProps} />;
    case 'cold':
      return <PiSnowflake {...iconProps} />;
    case 'lightning':
      return <PiLightning {...iconProps} />;
    case 'thunder':
      return <PiSpeakerHigh {...iconProps} />;
    case 'acid':
      return <PiDrop {...iconProps} />;
    case 'poison':
      return <PiSkull {...iconProps} />;
    case 'necrotic':
      return <PiSkull {...iconProps} />;
    case 'radiant':
      return <PiSun {...iconProps} />;
    case 'psychic':
      return <PiBrain {...iconProps} />;
    case 'force':
      return <PiMagicWand {...iconProps} />;
    default:
      return <PiMagicWand {...iconProps} />;
  }
}
