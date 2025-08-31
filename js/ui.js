import { getChampionImageURL, championData, loadChampionCSV } from './data.js';

// 画像を表示する関数
export function showTwoChampions(leftName, rightName) {
  const leftImg = document.getElementById('left');
  const rightImg = document.getElementById('right');

  leftImg.src = getChampionImageURL(leftName);
  leftImg.alt = leftName;

  rightImg.src = getChampionImageURL(rightName);
  rightImg.alt = rightName;
}

// ランキングを表示する関数
export function updateRanking(voteCounts) {
  const rankingList = document.getElementById('ranking-list');
  rankingList.innerHTML = ''; // 現在のランキングをクリア

  const sortedChampions = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedChampions.forEach(([name, count]) => {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = getChampionImageURL(name);
    img.alt = name;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.verticalAlign = 'middle';
    img.style.marginRight = '10px';
    img.style.borderRadius = '5px';

    const jaName = championData[name]?.name || name;

    li.appendChild(img);
    li.appendChild(document.createTextNode(`${jaName} — 選択回数: ${count}`));
    rankingList.appendChild(li);
  });
}

// 質問の内容
const questions = [
  {
    text: "ロール",
    name: "role",
    options: ["ALL", "TOP", "JUG", "MID", "BOT", "SUP"]
  },
//   {
//     text: "CCはあった方がいい？",
//     name: "cc",
//     options: ["なくていい", "あった方がいい", "対象指定がいい"]
//   },
//   {
//     text: "操作難易度",
//     name: "difficulty",
//     options: ["簡単", "そこそこ", "難しくても大丈夫"]
//   }
];

// 質問フォームを作成する関数
export function createQuestionForm() {
  const form = document.createElement('form');

  questions.forEach(q => {
    const p = document.createElement('p');
    p.textContent = q.text;
    form.appendChild(p);

    q.options.forEach(option => {
      const label = document.createElement('label');
      label.style.display = 'block';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = q.name;
      input.value = option;

      // `ALL`が最初に選択されるようにchecked属性を追加
      if (option === 'ALL') {
        input.checked = true;
      }

      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      form.appendChild(label);
    });
  });

  const leftPanel = document.querySelector('.left-panel');
  if (leftPanel) {
    leftPanel.appendChild(form);
  }
}

// ロール変更の監視
export function setupRoleChangeListener(onRoleChange) {
  const roleInputs = document.querySelectorAll('input[name="role"]');
  roleInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const selectedRole = e.target.value;
      console.log('選択されたロール:', selectedRole);
      
      await loadChampionCSV(selectedRole); // ロールに対応するCSVを読み込む
      if (typeof onRoleChange === 'function') {
        onRoleChange(selectedRole); // onRoleChangeコールバック関数を呼び出し
      }
    });
  });
}
