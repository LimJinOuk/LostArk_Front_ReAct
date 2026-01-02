
import { RaidInfo, MariItem, CharacterInfo } from './types';

export const RAIDS: RaidInfo[] = [
  {
    id: 'thaemine',
    name: '카멘 (Thaemine)',
    difficulties: [
      { type: 'Normal', gold: 13000, extraRewardCost: 3500, mandatoryDrops: ['어둠의 불', '마력의 결정'] },
      { type: 'Hard', gold: 30000, extraRewardCost: 6000, mandatoryDrops: ['어둠의 불', '빛의 인도'] },
    ]
  },
  {
    id: 'echidna',
    name: '에키드나 (Echidna)',
    difficulties: [
      { type: 'Normal', gold: 14500, extraRewardCost: 4000, mandatoryDrops: ['아그리스의 눈', '상급 재련 재료'] },
      { type: 'Hard', gold: 20000, extraRewardCost: 5500, mandatoryDrops: ['알키오네의 눈', '상급 재련 재료'] },
    ]
  },
  {
    id: 'behemoth',
    name: '베히모스 (Behemoth)',
    difficulties: [
      { type: 'Normal', gold: 18000, extraRewardCost: 5000, mandatoryDrops: ['폭풍의 파편', '초월 재료'] },
    ]
  }
];

export const MARI_ITEMS: MariItem[] = [
  { id: '1', name: '전설 ~ 영웅 카드 팩 III', price: 230, quantity: 10 },
  { id: '2', name: '영웅 보조 재료 상자', price: 150, quantity: 5 },
];

export const MOCK_CHARACTER: CharacterInfo = {
  name: '치킨버거사주세요',
  server: '카단',
  class: '블레이드',
  title: '맛있는',
  itemLevel: 1704.2,
  battleLevel: 70,
  expeditionLevel: 179,
  combatPower: 2153.65, // 만 단위 표기 시 2153만 6500
  guildName: '슈퍼스티어링정우',
  pvpGrade: 'Diamond',
  ranking: {
    overall: 238887,
    overallPercent: 5.62,
    class: 13782,
    classPercent: 6.94
  },
  arkPassiveEnabled: true,
  arkPassivePoints: {
    evolution: 148,
    enlightenment: 101,
    leap: 78
  },
  gear: [
    { slot: '머리', name: 'T4 고대', honingLevel: 18, quality: 100, isT4: true, trans: '7단계' },
    { slot: '어깨', name: 'T4 고대', honingLevel: 19, quality: 85, isT4: true, trans: '7단계' },
    { slot: '상의', name: 'T4 고대', honingLevel: 19, quality: 98, isT4: true, trans: '7단계' },
    { slot: '하의', name: 'T4 고대', honingLevel: 19, quality: 98, isT4: true, trans: '7단계' },
    { slot: '장갑', name: 'T4 고대', honingLevel: 19, quality: 87, isT4: true, trans: '7단계' },
    { slot: '무기', name: 'T4 고대', honingLevel: 19, quality: 94, isT4: true, trans: '7단계' },
  ],
  accessories: [
    { slot: '목걸이', name: 'T4 고대', stats: '특화 1037 / 치명 678', quality: 83 },
    { slot: '귀걸이', name: 'T4 고대', stats: '특화', quality: 84 },
    { slot: '귀걸이', name: 'T4 고대', stats: '특화', quality: 79 },
    { slot: '반지', name: 'T4 고대', stats: '특화', quality: 97 },
    { slot: '반지', name: 'T4 고대', stats: '특화', quality: 95 },
  ],
  engravings: [
    { name: '예리한 둔기', level: 4, isActive: true, isArkPassive: true },
    { name: '기습의 대가', level: 3, isActive: true, isArkPassive: true },
    { name: '원한', level: 3, isActive: true, isArkPassive: true },
    { name: '돌격대장', level: 3, isActive: true, isArkPassive: true },
    { name: '아드레날린', level: 3, isActive: true, isArkPassive: true },
  ],
  innerStats: {
    crit: 678,
    specialization: 1837,
    swiftness: 0,
    domination: 0,
    endurance: 0,
    expertise: 0,
  },
  arkGridCores: [
    { name: '질서의 핵 코어: 블레이드 버스트', points: 20 },
    { name: '질서의 별 코어: 데스 블리츠', points: 18 },
    { name: '질서의 별 코어: 암기', points: 10 },
  ],
  arkGridEffects: [
    { name: '아군 피해 강화', level: 15, value: '아군 피해량 강화 효과 +0.78%' },
    { name: '공격력', level: 21, value: '공격력 +0.77%' },
    { name: '추가 피해', level: 25, value: '추가 피해 +2.02%' },
  ],
  collections: [
    { name: '섬의 마음', percent: 8 },
    { name: '거인의 심장', percent: 100 },
    { name: '오르페우스의 별', percent: 70 },
    { name: '미술품', percent: 35 },
    { name: '모코코 씨앗', percent: 100 },
  ],
  social: {
    today: 1,
    total: 118
  },
  specialSummary: {
    elixir: '40 (달인)',
    trans: '126단계',
    evolution: '진화 완료 (T4)',
    enlightenment: '깨달음 완료'
  },
  cards: ['세상을 구하는 빛 30각'],
  gems: [
    { slot: 1, type: 'Damage', level: 7, originalLevel: 7, skillName: '버스트' },
    { slot: 2, type: 'Damage', level: 7, originalLevel: 7, skillName: '데스 슬래쉬' },
    { slot: 3, type: 'Damage', level: 7, originalLevel: 7, skillName: '블리츠 러시' },
    { slot: 4, type: 'Damage', level: 10, originalLevel: 10, skillName: '블레이드 댄스' },
    { slot: 5, type: 'Cooldown', level: 7, originalLevel: 7, skillName: '버스트' },
    { slot: 6, type: 'Cooldown', level: 7, originalLevel: 7, skillName: '데스 슬래쉬' },
    { slot: 7, type: 'Cooldown', level: 8, originalLevel: 8, skillName: '블리츠 러시' },
    { slot: 8, type: 'Cooldown', level: 8, originalLevel: 8, skillName: '블레이드 댄스' },
    { slot: 9, type: 'Cooldown', level: 8, originalLevel: 8, skillName: '터닝 슬래쉬' },
    { slot: 10, type: 'Cooldown', level: 8, originalLevel: 8, skillName: '어스 슬래쉬' },
    { slot: 11, type: 'Cooldown', level: 8, originalLevel: 8, skillName: '윈드 컷' },
  ],
  skills: [
    { name: '버스트', level: 14, tripods: ['빠른 준비', '지속력 강화', '경기 폭발'], activeTripodIndices: [0, 1, 2], rune: '풍요', damageContribution: 45 },
    { name: '블레이드 댄스', level: 14, tripods: ['암흑 공격', '약점 포착', '난도질'], activeTripodIndices: [0, 1, 2], rune: '질풍', damageContribution: 15 },
    { name: '블리츠 러시', level: 14, tripods: ['강화된 일격', '올라운드', '쉐도우 러시'], activeTripodIndices: [0, 1, 2], rune: '질풍', damageContribution: 12 },
    { name: '터닝 슬래쉬', level: 13, tripods: ['약점 노출', '강인함', '집중 공격'], activeTripodIndices: [0, 1, 2], rune: '배신', damageContribution: 8 },
  ]
};
