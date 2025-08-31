import { fetchChampionData, getTwoRandomChampions, loadChampionCSV } from './data.js';
import { showTwoChampions, updateRanking, createQuestionForm, setupRoleChangeListener } from './ui.js';

let voteCounts = {};  // 投票記録
let currentRole = 'ALL';  // 現在選ばれているロール（初期はALL）

window.addEventListener('DOMContentLoaded', async () => {
  await fetchChampionData();

  const startBtn = document.getElementById('start-reset-btn');
  const container = document.querySelector('.center-panel .container');
  const rankingContainer = document.getElementById('ranking-list'); // ランキングエリア

  // 初期状態ではチャンピオン画像とランキングを非表示にしておく
  container.style.display = 'none';
  rankingContainer.style.display = 'none';

  let started = false;

  createQuestionForm();
  setupRoleChangeListener(handleRoleChange);

  // ロール選択が変更されたときに呼ばれる関数
  function handleRoleChange(selectedRole) {
    currentRole = selectedRole;  // 現在のロールを更新
    resetVoting();  // ロール変更時にリセット
  }

  function resetVoting() {
    // 投票データをリセット
    voteCounts = {};
    updateRanking(voteCounts);  // ランキングを更新（初期化）

    // ロールに対応するチャンピオンリストをロード
    loadChampionCSV(currentRole).then(() => {
      // 新しいロールに対応したペアを表示
      showNextPair();
    });

    // 画像とランキングを非表示にし、スタートボタンのみ表示
    container.style.display = 'none';
    rankingContainer.style.display = 'none';
    startBtn.textContent = 'スタート';
    started = false;
  }

  startBtn.addEventListener('click', () => {
    if (!started) {
      container.style.display = 'flex';  // チャンピオン画像を表示
      rankingContainer.style.display = 'block'; // ランキングを表示
      startBtn.textContent = 'リセット';
      started = true;
      showNextPair();
    } else {
      // ここで画像とランキングを非表示にしてリセット
      container.style.display = 'none';
      rankingContainer.style.display = 'none';
      startBtn.textContent = 'スタート';
      started = false;

      voteCounts = {};  // 投票のリセット
      updateRanking(voteCounts);  // ランキングをリセット
    }
  });

  document.getElementById('left').addEventListener('click', () => {
    handleVote(document.getElementById('left').alt);
  });

  document.getElementById('right').addEventListener('click', () => {
    handleVote(document.getElementById('right').alt);
  });
});

function handleVote(name) {
  voteCounts[name] = (voteCounts[name] || 0) + 1;
  showNextPair();
  updateRanking(voteCounts);
}

function showNextPair() {
  const [left, right] = getTwoRandomChampions(currentRole); // 現在選択されたロールに基づいてペアを表示
  if (left && right) {
    showTwoChampions(left, right);
  }
}
