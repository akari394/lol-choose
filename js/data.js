// data.js
export const version = "15.17.1";
export const apiURL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/champion.json`;

export let championsName = [];
export let championData = {};
export let currentChampionList = [];

// 投票記録はmain.jsで管理する想定なのでここには入れません

let jaToEngMap = {};

export async function fetchChampionData() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    championData = data.data;
    championsName = Object.keys(championData);

    // 日本語名 → 英語IDマップ作成
    jaToEngMap = {};
    for (const engName in championData) {
      const jaName = championData[engName].name;
      jaToEngMap[jaName] = engName;
    }

    // ★ 初期状態では全チャンピオンを currentChampionList に入れておく
    currentChampionList = Object.values(championData).map(c => c.name);

  } catch (error) {
    console.error("チャンピオンデータの取得に失敗しました:", error);
  }
}

export async function loadChampionCSV(role) {
  try {
    if (role === 'ALL') {
      // 'ALL'が選択された場合は、全チャンピオンリストを設定
      currentChampionList = Object.values(championData).map(champ => champ.name);
    } else {
      const response = await fetch(`./public/${role}.csv`);
      if (!response.ok) throw new Error('CSVの読み込みに失敗しました');
      const text = await response.text();
      currentChampionList = text.trim().split('\n').map(line => line.trim());
    }
  } catch (error) {
    console.error('CSV読み込みエラー:', error);
    currentChampionList = [];
  }
}

export function getTwoRandomChampions() {
  if (currentChampionList.length < 2) {
    return [null, null];
  }
  const shuffled = currentChampionList.sort(() => 0.5 - Math.random());

  // 日本語名→英語IDに変換
  const left = jaToEngMap[shuffled[0]] || null;
  const right = jaToEngMap[shuffled[1]] || null;

  return [left, right];
}

export function getChampionImageURL(name) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`;
}
