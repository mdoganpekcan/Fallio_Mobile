export type FortuneType = 'coffee' | 'tarot' | 'palm' | 'dream' | 'love' | 'card' | 'color';

export interface FortuneTypeInfo {
  id: FortuneType;
  name: string;
  icon: string;
  description: string;
  detailedDescription: string;
  credit: number;
  imageUrl?: string;
}

export const fortuneTypes: FortuneTypeInfo[] = [
  {
    id: 'coffee',
    name: 'Kahve Falı',
    icon: '☕',
    description: 'Geleneksel kahve falı geleneğini keşfedin',
    detailedDescription: 'Geleneksel kahve falı geleneğini gerçek yorumcularla keşfedin. Fotoğraflarını gönder, kişisel fal yorumunu al.',
    credit: 50,
  },
  {
    id: 'tarot',
    name: 'Tarot Falı',
    icon: '🃏',
    description: 'Tarot kartlarıyla geleceğinizi öğrenin',
    detailedDescription: 'Bu fal, aşk hayatınızdaki potansiyelleri ve zorlukları anlamanıza yardımcı olur.',
    credit: 150,
  },
  {
    id: 'palm',
    name: 'El Falı',
    icon: '🖐',
    description: 'Avucunuzdaki çizgilerin sırlarını keşfedin',
    detailedDescription: 'Avucunuzun içindeki çizgilerin sırlarını keşfedin ve kaderiniz hakkında neler söylediğini öğrenin.',
    credit: 150,
  },
  {
    id: 'dream',
    name: 'Rüya Yorumu',
    icon: '🌙',
    description: 'Rüyalarınızın anlamını öğrenin',
    detailedDescription: 'Rüyanı Anlat, Yorumlayalım. Hayallerinin ardındaki sırları keşfetmek için rüyanı bizimle paylaş.',
    credit: 5,
  },
  {
    id: 'love',
    name: 'Aşk Falı',
    icon: '❤️',
    description: 'Aşk hayatınız hakkında bilgi edinin',
    detailedDescription: 'Romantik hayatınız, ilişkileriniz ve gelecekteki partneriniz hakkında derinlemesine içgörüleri keşfedin. Kalbinizin yolculuğuna yıldızların rehberlik etmesine izin verin.',
    credit: 100,
  },
  {
    id: 'card',
    name: 'İskambil Falı',
    icon: '🎴',
    description: 'İskambil kartlarıyla falınıza bakın',
    detailedDescription: 'İskambil kartları ile geleneksel fal bakma sanatını keşfedin.',
    credit: 75,
  },
  {
    id: 'color',
    name: 'Renk Falı',
    icon: '🎨',
    description: 'Renklerle ruhunuzu keşfedin',
    detailedDescription: 'Sana en yakın gelen renge odaklan ve enerjini yansıtacak rengi seç.',
    credit: 15,
  },
];

export const getFortuneTypeInfo = (type: FortuneType): FortuneTypeInfo => {
  return fortuneTypes.find(ft => ft.id === type) || fortuneTypes[0];
};
