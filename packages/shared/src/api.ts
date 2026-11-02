// サーバーとアプリの間でやり取りするデータの型

import type { BattleSetup, BattleStatus, HelperSnapshot } from './battle';
import type { Job } from './jobs';
import type { LevelProgress } from './level';

export interface RegisterResponse {
  token: string;
}

export interface MeResponse {
  name: string | null;
  avatar: number;
  job: Job | null;
  progress: LevelProgress;
  clearedArea: number;
  today: {
    date: string;
    encounters: number;
    encounterCap: number;
    travelers: number;
    travelerCap: number;
    steps: number;
    distanceMeters: number;
  };
  /** まだ届いていない（配信待ちの）すれちがいの人数 */
  pending: number;
  /** 届いていて、まだ使っていない助っ人の人数 */
  available: number;
}

export interface ProfileRequest {
  name?: string;
  avatar?: number;
  /** ジョブは最初の1回だけ設定できる */
  job?: Job;
}

export interface PingRequest {
  /** 7桁のジオハッシュ（端末内で丸めたもの） */
  cell: string;
}

export interface PingResponse {
  accepted: boolean;
  /** 受け付けなかった時、次に送れるまでのミリ秒 */
  retryAfterMs?: number;
  /** この送信で増えた移動距離（m） */
  addedDistanceMeters: number;
  /** この送信で加わった旅人の人数 */
  newTravelers: number;
}

export interface StepsRequest {
  date: string;
  steps: number;
}

export interface StepsResponse {
  steps: number;
  newTravelers: number;
}

export interface HelperCard extends HelperSnapshot {
  /** 届いた日（日本時間） */
  metDate: string;
  /** まだ開いていない（NEW） */
  isNew: boolean;
}

export interface HelpersResponse {
  helpers: HelperCard[];
  pending: number;
}

export interface StartAdventureRequest {
  areaId: number;
  helperIds: string[];
}

export interface StartAdventureResponse {
  adventureId: string;
  seed: number;
  setup: BattleSetup;
}

export interface FinishAdventureRequest {
  actions: unknown[];
}

export interface FinishAdventureResponse {
  status: Exclude<BattleStatus, 'ongoing'> | 'ongoing';
  clearedArea: number;
  newlyCleared: boolean;
}

export interface BlockRequest {
  helperId: string;
}

export interface ReportRequest {
  helperId: string;
  reason: string;
}

export interface ApiError {
  error: string;
  message: string;
}
