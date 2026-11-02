import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from './constants';

// 表示名はゲーム内で唯一の自由入力。連絡先の交換や誹謗中傷に使われないよう最低限の確認をする。

/** 名前のどこかに含まれていたら弾く語 */
const NG_SUBSTRINGS = [
  // 連絡先・外部誘導
  'ライン', 'http', 'www', '.com', '.jp', 'insta', 'インスタ', 'twitter', 'ツイッター',
  'discord', 'tiktok', 'gmail', 'メアド', 'でんわ', '電話',
  // 誹謗中傷・性的な語（最小限。運用しながら足す）
  'しね', '死ね', 'ころす', '殺す', 'きもい', 'キモい', 'ばか', 'バカ', 'あほ', 'アホ',
  'ちんこ', 'まんこ', 'セックス', 'fuck', 'shit', 'nigger', 'ガイジ',
];

/** 英単語として現れたら弾く語（Caroline の line などを誤って弾かないよう単語単位で見る） */
const NG_ASCII_WORDS = ['line', 'tel', 'dm', 'sex', 'id'];

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

/** 全角英数を半角に、カタカナはそのまま、前後の空白を削る */
export function normalizeName(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateDisplayName(raw: unknown): NameCheck {
  if (typeof raw !== 'string') return { ok: false, reason: '名前を入力してください' };
  const name = normalizeName(raw);
  const length = [...name].length;
  if (length < NAME_MIN_LENGTH) return { ok: false, reason: '名前を入力してください' };
  if (length > NAME_MAX_LENGTH) {
    return { ok: false, reason: `名前は${NAME_MAX_LENGTH}文字までです` };
  }
  if (/@/.test(name)) return { ok: false, reason: 'その記号は使えません' };
  if (/\d{4,}/.test(name)) return { ok: false, reason: '数字を4つ以上続けることはできません' };
  const lower = name.toLowerCase();
  const compact = lower.replace(/[\s._\-・]/g, '');
  for (const w of NG_SUBSTRINGS) {
    if (lower.includes(w) || compact.includes(w)) {
      return { ok: false, reason: 'その名前は使えません' };
    }
  }
  for (const w of NG_ASCII_WORDS) {
    if (new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(lower)) {
      return { ok: false, reason: 'その名前は使えません' };
    }
  }
  return { ok: true, name };
}

/** 旅人（NPCの助っ人）の名前 */
export const TRAVELER_NAMES = [
  'ミント', 'ロカ', 'ハル', 'ソラ', 'ナギ', 'ユキ', 'リオ', 'カイ', 'モモ', 'ツバキ',
  'アオイ', 'レン', 'ヒナ', 'トワ', 'イブキ', 'コハク', 'シオン', 'ルカ', 'サク', 'ノア',
];
