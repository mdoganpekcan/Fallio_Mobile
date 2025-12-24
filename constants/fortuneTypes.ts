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
    name: 'fortuneTypes.coffee.name',
    icon: '☕',
    description: 'fortuneTypes.coffee.description',
    detailedDescription: 'fortuneTypes.coffee.detailedDescription',
    credit: 50,
  },
  {
    id: 'tarot',
    name: 'fortuneTypes.tarot.name',
    icon: '🃏',
    description: 'fortuneTypes.tarot.description',
    detailedDescription: 'fortuneTypes.tarot.detailedDescription',
    credit: 150,
  },
  {
    id: 'palm',
    name: 'fortuneTypes.palm.name',
    icon: '🖐',
    description: 'fortuneTypes.palm.description',
    detailedDescription: 'fortuneTypes.palm.detailedDescription',
    credit: 150,
  },
  {
    id: 'dream',
    name: 'fortuneTypes.dream.name',
    icon: '🌙',
    description: 'fortuneTypes.dream.description',
    detailedDescription: 'fortuneTypes.dream.detailedDescription',
    credit: 5,
  },
  {
    id: 'love',
    name: 'fortuneTypes.love.name',
    icon: '❤️',
    description: 'fortuneTypes.love.description',
    detailedDescription: 'fortuneTypes.love.detailedDescription',
    credit: 100,
  },
  {
    id: 'card',
    name: 'fortuneTypes.card.name',
    icon: '🎴',
    description: 'fortuneTypes.card.description',
    detailedDescription: 'fortuneTypes.card.detailedDescription',
    credit: 75,
  },
  {
    id: 'color',
    name: 'fortuneTypes.color.name',
    icon: '🎨',
    description: 'fortuneTypes.color.description',
    detailedDescription: 'fortuneTypes.color.detailedDescription',
    credit: 15,
  },
];

export const getFortuneTypeInfo = (type: FortuneType): FortuneTypeInfo => {
  return fortuneTypes.find(ft => ft.id === type) || fortuneTypes[0];
};
