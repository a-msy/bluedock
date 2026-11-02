-- 擬似すれちがいRPG: 初期スキーマ
-- 方針: 生の緯度経度は持たない。位置記録（pings）は48時間で消す。

-- プレイヤー（端末ごとの匿名アカウント）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,      -- 認証トークンのSHA-256（トークンそのものは持たない）
  name TEXT,                            -- 表示名（唯一の自由入力）
  avatar INTEGER NOT NULL DEFAULT 0,    -- アバターの色
  job TEXT,                             -- swordsman / mage / priest / dancer（最初に1回だけ選ぶ）
  cleared_area INTEGER NOT NULL DEFAULT 0,
  last_ping_at INTEGER,                 -- 移動距離の計算と送信間隔の制限に使う
  last_ping_cell TEXT,                  -- 48時間を過ぎたら定期処理で消す
  created_at INTEGER NOT NULL
);

-- 位置記録: 7桁のジオハッシュと時刻だけ。48時間で削除
CREATE TABLE pings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  cell7 TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX idx_pings_cell_ts ON pings (cell7, ts);
CREATE INDEX idx_pings_ts ON pings (ts);

-- すれちがい（＝届く助っ人）。1回のすれちがいで双方に1行ずつ。旅人（NPC）は other_id が NULL
-- 相手の名前・ジョブ・レベルは、すれちがった時点の写しを持つ（相手のIDはアプリに渡さない）
CREATE TABLE encounters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,                -- 受け取る人
  other_id TEXT,                        -- すれちがった相手（旅人は NULL）
  npc INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  avatar INTEGER NOT NULL,
  job TEXT NOT NULL,
  level INTEGER NOT NULL,
  met_date TEXT NOT NULL,               -- 日本時間の日付。時刻と場所は残さない
  created_at INTEGER NOT NULL,
  visible_at INTEGER NOT NULL,          -- この時刻を過ぎたら届く（1〜3時間の遅延）
  opened_at INTEGER,
  used_at INTEGER,                      -- 冒険で力を借りたら使い切り
  adventure_id TEXT
);
CREATE UNIQUE INDEX uq_encounters_pair_day ON encounters (user_id, other_id, met_date) WHERE other_id IS NOT NULL;
CREATE INDEX idx_encounters_user_visible ON encounters (user_id, visible_at);
CREATE INDEX idx_encounters_user_day ON encounters (user_id, met_date, npc);

-- 移動距離ボーナス: 1日1行
CREATE TABLE bonuses (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  distance_m INTEGER NOT NULL DEFAULT 0,
  travelers INTEGER NOT NULL DEFAULT 0, -- その日にすでに加えた旅人の人数
  PRIMARY KEY (user_id, date)
);

-- 冒険: 開始時にシードを決め、終了時に行動を再生して勝敗を確かめる
CREATE TABLE adventures (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  area_id INTEGER NOT NULL,
  seed INTEGER NOT NULL,
  setup TEXT NOT NULL,                  -- BattleSetup の JSON
  status TEXT NOT NULL,                 -- ongoing / won / lost / fled / abandoned
  created_at INTEGER NOT NULL,
  finished_at INTEGER
);
CREATE INDEX idx_adventures_user ON adventures (user_id, status);

-- ブロック: ブロックした相手とは以後すれちがわない
CREATE TABLE blocks (
  user_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, blocked_id)
);
CREATE INDEX idx_blocks_blocked ON blocks (blocked_id);

-- 通報: 不適切な表示名など
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  encounter_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
