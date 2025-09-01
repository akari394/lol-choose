// ============================================
// Data モジュール（チャンピオン情報管理）
// ============================================

export const version = "15.17.1"; // DragonAPI データバージョン
export const apiURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/champion.json`;

// チャンピオン名リスト・データ・現在表示対象のチャンピオン
export let championsName = [];         // 英語IDのリスト
export let championData = {};          // 英語ID -> チャンピオン情報
export let currentChampionList = [];   // 日本語名ベース（CSVと同じ表記）

// 日本語名 -> 英語ID のマップ（モジュール内スコープ）
let jaToEngMap = {}; 

// ============================================
// DragonAPI からチャンピオン情報を取得
// ============================================
export async function fetchChampionData() {
  try {
    const resp = await fetch(apiURL);
    const json = await resp.json();
    championData = json.data;                   // 英語ID -> チャンピオン情報
    championsName = Object.keys(championData); // 英語IDリスト

    // 日本語名 -> 英語ID の変換マップ作成
    jaToEngMap = {};
    for (const engName in championData) {
      const jaName = championData[engName].name;
      jaToEngMap[jaName] = engName;
    }

    // 初期状態では全チャンピオンを currentChampionList に入れる（日本語名）
    currentChampionList = Object.values(championData).map(c => c.name);
  } catch (e) {
    console.error("チャンピオンデータの取得に失敗:", e);
  }
}

// ============================================
// ロール + CC 条件で currentChampionList を更新
// role: "ALL" | "TOP" | "JUG" | "MID" | "BOT" | "SUP"
// ccType: "ALL" | "なくていい" | "ちょっとでいい" | "たくさん欲しい"
// ============================================
export async function loadChampionByRoleAndCC(role, ccType) {
  try {
    // まずロールCSVを取得
    const roleResp = await fetch(`./public/role/${role}.csv`);
    if (!roleResp.ok) throw new Error(`role CSV 読み込み失敗: ${role}`);
    let roleList = (await roleResp.text())
      .trim()
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    // CCがALLでない場合、CC CSVを取得して絞り込み
    if (ccType !== "ALL") {
      const ccMap = {
        "なくていい": "NOCC",
        "ちょっとでいい": "ONECC",
        "たくさん欲しい": "AOECC",
      };
      const ccFile = ccMap[ccType];
      const ccResp = await fetch(`./public/cc/${ccFile}.csv`);
      if (!ccResp.ok) throw new Error(`cc CSV 読み込み失敗: ${ccFile}`);
      const ccList = (await ccResp.text())
        .trim()
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);

      // 日本語名ベースで積集合
      roleList = roleList.filter(name => ccList.includes(name));
    }

    // 条件に合うチャンピオンだけ currentChampionList にセット
    currentChampionList = roleList;
  } catch (e) {
    console.error("CSV読み込みエラー:", e);
    currentChampionList = [];
  }
}

// ============================================
// 2体のチャンピオンをランダムに選ぶ関数
// ・選ばれなかった回数が2回以上のチャンピオンは除外
// ・currentChampionList は日本語名ベース
// ・voteCounts / appearCounts は英語IDベース
// ============================================
export function getTwoRandomChampions(_role, _cc, voteCounts, appearCounts) {
  // 除外条件を適用
  const filtered = currentChampionList.filter(jaName => {
    const eng = jaToEngMap[jaName];            // 日本語名 -> 英語ID
    if (!eng) return false;                    // 変換できなければ除外
    const appears = appearCounts?.[eng] || 0;  // 表示された回数
    const votes = voteCounts?.[eng] || 0;      // 選ばれた回数
    return (appears - votes) < 2;              // 選ばれなかった回数 < 2 なら残す
  });

  if (filtered.length < 2) return [null, null]; // 2体未満ならnull

  // シャッフルして2体選ぶ
  const shuffled = filtered.slice().sort(() => 0.5 - Math.random());
  const leftEng = jaToEngMap[shuffled[0]] || null;
  const rightEng = jaToEngMap[shuffled[1]] || null;

  // 念のため同一除外
  if (!leftEng || !rightEng || leftEng === rightEng) return [null, null];

  return [leftEng, rightEng];
}

// ============================================
// チャンピオン画像URLを返す
// ============================================
export function getChampionImageURL(engName) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${engName}.png`;
}
