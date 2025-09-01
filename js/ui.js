import { getChampionImageURL, championData } from './data.js';

// ============================================
// チャンピオン画像を2体表示する関数
// ============================================
export function showTwoChampions(leftName, rightName) {
  const leftImg = document.getElementById('left');   // 左側画像
  const rightImg = document.getElementById('right'); // 右側画像

  // 画像URLを設定
  leftImg.src = getChampionImageURL(leftName);
  leftImg.alt = leftName;

  rightImg.src = getChampionImageURL(rightName);
  rightImg.alt = rightName;
}

// ============================================
// ランキング表示の更新
// voteCounts = { "ChampionEngName": 回数, ... }
// ============================================
export function updateRanking(voteCounts) {
  const rankingList = document.getElementById('ranking-list');
  rankingList.innerHTML = ''; // 前回のランキングをクリア

  // 選択回数が多い順にソートして上位10体のみ表示
  const sorted = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // ランキングリストに追加
  sorted.forEach(([engName, count]) => {
    const li = document.createElement('li');

    // チャンピオン画像
    const img = document.createElement('img');
    img.src = getChampionImageURL(engName);
    img.alt = engName;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.verticalAlign = 'middle';
    img.style.marginRight = '10px';
    img.style.borderRadius = '5px';

    // 日本語名を取得できれば表示、無ければ英語名
    const jaName = championData[engName]?.name || engName;

    li.appendChild(img);
    li.appendChild(document.createTextNode(`${jaName} — 選択回数: ${count}`));
    rankingList.appendChild(li);
  });
}

// ============================================
// 質問フォーム（ラジオボタン）設定
// ============================================
const questions = [
  { text: "ロール", name: "role", options: ["ALL", "TOP", "JUG", "MID", "BOT", "SUP"] },
  { text: "CCはあった方がいい？", name: "cc", options: ["ALL", "なくていい", "ちょっとでいい", "たくさん欲しい"] },
  // { text: "操作難易度", name: "difficulty", options: ["簡単", "そこそこ", "難しくても大丈夫"] } // 一旦コメントアウト
];

export function createQuestionForm() {
  const form = document.createElement('form');

  // 各質問ごとにラベルとラジオボタンを作成
  questions.forEach(q => {
    const p = document.createElement('p');
    p.textContent = q.text;  // 質問文
    form.appendChild(p);

    q.options.forEach(option => {
      const label = document.createElement('label');
      label.style.display = 'block'; // 縦並びに表示

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = q.name;    // 質問名
      input.value = option;   // 選択値

      // 初期状態でALLを選択
      if (option === 'ALL') input.checked = true;

      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      form.appendChild(label);
    });
  });

  // フォームを左パネルに追加
  const leftPanel = document.querySelector('.left-panel');
  if (leftPanel) leftPanel.appendChild(form);
}

// ============================================
// ロールラジオボタンの変更監視
// 引数 onRoleChange: 選択変更時に呼ばれるコールバック関数
// ============================================
export function setupRoleChangeListener(onRoleChange) {
  document.querySelectorAll('input[name="role"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      if (typeof onRoleChange === 'function') onRoleChange(selectedRole);
    });
  });
}

// ============================================
// CCラジオボタンの変更監視
// 引数 onCCChange: 選択変更時に呼ばれるコールバック関数
// ============================================
export function setupCCChangeListener(onCCChange) {
  document.querySelectorAll('input[name="cc"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const selectedCC = e.target.value;
      if (typeof onCCChange === 'function') onCCChange(selectedCC);
    });
  });
}
