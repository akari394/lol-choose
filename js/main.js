import { fetchChampionData, getTwoRandomChampions, loadChampionByRoleAndCC, currentChampionList } from './data.js';
import { showTwoChampions, updateRanking, createQuestionForm, setupRoleChangeListener, setupCCChangeListener } from './ui.js';

// 投票数や未選択回数などのデータを保持する変数
let voteCounts = {};      // 選ばれた回数
let missCounts = {};      // 選ばれなかった回数
let currentRole = 'ALL';  // 現在選択されているロール
let currentCC = 'ALL';    // 現在選択されているCC量
let remainingChoices = 0; // 残り選択可能回数
let started = false;      // ゲーム開始状態

window.addEventListener('DOMContentLoaded', async () => {
  // チャンピオンデータを取得（DragonAPIから）
  await fetchChampionData();

  // DOM要素の取得
  const startBtn = document.getElementById('start-reset-btn');           // スタート／リセットボタン
  const container = document.querySelector('.center-panel .container'); // チャンピオン画像表示エリア
  const rankingContainer = document.getElementById('ranking-list');     // ランキング表示エリア
  const counter = document.getElementById('remaining-counter');         // 残り選択回数表示
  const messageDiv = document.getElementById('no-champion-message');    // チャンピオンがいない時のメッセージ表示

  // 初期状態では画像・ランキング・カウンター・メッセージを非表示
  container.style.display = 'none';
  rankingContainer.style.display = 'none';
  counter.style.display = 'none';
  messageDiv.textContent = "";

  // 質問フォーム（ロールやCCなど）を作成
  createQuestionForm();

  // ラジオボタン変更時に監視する関数をセット
  setupRoleChangeListener(handleRoleChange);
  setupCCChangeListener(handleCCChange);

  // ロール選択変更時の処理
  async function handleRoleChange(selectedRole) {
    currentRole = selectedRole;    // 現在のロールを更新
    resetVoting();                 // 投票データや表示をリセット
    await checkChampionAvailability(); // 選択条件でチャンピオンが存在するか確認
  }

  // CC量変更時の処理
  async function handleCCChange(selectedCC) {
    currentCC = selectedCC;        // 現在のCC量を更新
    resetVoting();                 // 投票データや表示をリセット
    await checkChampionAvailability(); // 選択条件でチャンピオンが存在するか確認
  }

  // 投票データや表示をリセットする関数
  function resetVoting() {
    voteCounts = {};               // 選ばれた回数を初期化
    missCounts = {};               // 選ばれなかった回数を初期化
    updateRanking(voteCounts);     // ランキング表示を初期化

    // 画像・ランキング・残り回数表示・メッセージを非表示
    container.style.display = 'none';
    rankingContainer.style.display = 'none';
    counter.style.display = 'none';
    messageDiv.textContent = "";

    startBtn.textContent = 'スタート'; // ボタン表示を「スタート」に戻す
    started = false;                  // スタート前状態に戻す
  }

  // 選択条件でチャンピオンが存在するか確認してメッセージ表示
  async function checkChampionAvailability() {
    await loadChampionByRoleAndCC(currentRole, currentCC); // 条件に合わせたチャンピオンCSVを読み込む
    if (currentChampionList.length === 0) {
      // 表示できるチャンピオンがいない場合、メッセージ表示
      messageDiv.textContent = "表示可能なチャンピオンがいません。条件を変更してください。";
    } else {
      // チャンピオンが存在する場合はメッセージ消去
      messageDiv.textContent = "";
    }
  }

  // スタート／リセットボタン押下時の処理
  startBtn.addEventListener('click', async () => {
    if (!started) {
      // スタート時：条件に合わせたチャンピオンリストを取得
      await loadChampionByRoleAndCC(currentRole, currentCC);

      // チャンピオンが存在しない場合はメッセージ表示して処理中断
      if (currentChampionList.length === 0) {
        messageDiv.textContent = "表示可能なチャンピオンがいません。条件を変更してください。";
        return;
      }

      // チャンピオンが存在する場合はメッセージ消去
      messageDiv.textContent = "";

      // チャンピオン画像・ランキング・残り回数表示を表示
      container.style.display = 'flex';
      rankingContainer.style.display = 'block';
      counter.style.display = 'block';

      // 残り選択回数 = 表示可能なチャンピオン数 × 2
      remainingChoices = currentChampionList.length * 2;
      updateRemainingCounter();

      startBtn.textContent = 'リセット'; // ボタン表示を「リセット」に変更
      started = true;                    // ゲーム開始状態に
      showNextPair();                    // 最初のペアを表示
    } else {
      // リセット時の処理：全て非表示に戻す
      container.style.display = 'none';
      rankingContainer.style.display = 'none';
      counter.style.display = 'none';
      messageDiv.textContent = "";
      startBtn.textContent = 'スタート';
      started = false;

      // 投票データも初期化
      voteCounts = {};
      missCounts = {};
      updateRanking(voteCounts);
    }
  });

  // 左画像クリック時
  document.getElementById('left').addEventListener('click', () => {
    handleVote(document.getElementById('left').alt, document.getElementById('right').alt);
  });

  // 右画像クリック時
  document.getElementById('right').addEventListener('click', () => {
    handleVote(document.getElementById('right').alt, document.getElementById('left').alt);
  });
});

// 投票処理
function handleVote(selected, notSelected) {
  voteCounts[selected] = (voteCounts[selected] || 0) + 1;   // 選ばれた回数を増やす
  missCounts[notSelected] = (missCounts[notSelected] || 0) + 1; // 選ばれなかった回数を増やす

  remainingChoices -= 1;           // 残り回数を減らす
  updateRemainingCounter();        // 残り回数表示を更新

  if (remainingChoices > 0) {
    showNextPair();                // 次のペアを表示
    updateRanking(voteCounts);     // ランキング更新
  } else {
    endGame();                      // 残り回数0でゲーム終了
  }
}

// ペア表示
function showNextPair() {
  const [left, right] = getTwoRandomChampions();
  if (left && right) {
    showTwoChampions(left, right); // 画像を更新
  }
}

// 残り回数表示更新
function updateRemainingCounter() {
  const counter = document.getElementById('remaining-counter');
  counter.textContent = `残り選択回数: ${remainingChoices}`;
}

// ゲーム終了処理
function endGame() {
  alert("ゲーム終了！お疲れさまでした。");
}
