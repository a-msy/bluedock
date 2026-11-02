import type { Job } from '@pieris/shared';

// 「旅の手帳」っぽい落ち着いた配色。生成り色の紙に、インクと朱色。
export const colors = {
  bg: '#F6EFE2',
  card: '#FFFBF3',
  ink: '#2B2A33',
  sub: '#6E6A73',
  line: '#E3D8C4',
  accent: '#D2553A',
  accentInk: '#FFFFFF',
  gold: '#B8862A',
  good: '#3E9C7E',
  bad: '#C0504D',
  hp: '#4CAF7A',
  hpLow: '#D9822B',
  mp: '#4F7BD8',
  locked: '#B9B2A6',
  overlay: 'rgba(43, 42, 51, 0.45)',
  enemyBg: '#2F2B3A',
  enemyInk: '#F6EFE2',
};

export const jobColors: Record<Job, string> = {
  swordsman: '#C0504D',
  mage: '#4F6BC8',
  priest: '#3E9C7E',
  dancer: '#D58A2E',
};

/** アバターの色（サーバーの AVATAR_COUNT と同じ8色） */
export const avatarColors = ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#6D597A', '#4EA8DE', '#E5989B', '#9C6644'];

export const space = (n: number) => n * 8;
export const radius = { sm: 8, md: 14, lg: 20 };
