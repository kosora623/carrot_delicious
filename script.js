const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const countdownScreen = document.getElementById('countdown-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const rabbit = document.getElementById('rabbit');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');

let score = 0;
let timeLeft = 20;
let gameActive = false;
let items = [];
let spawnTimer;
let gameTimer;
let rabbitX = 155; // ウサギの初期X座標（90px幅の中央）

// マウスとタッチ両方でうさぎを動かす
function moveRabbit(e) {
    if (!gameActive) return;
    e.preventDefault(); // タッチ時のスクロール防止
    
    const rect = gameContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = clientX - rect.left - (rabbit.offsetWidth / 2);
    
    // 画面外に出ないように制限
    if (x < 0) x = 0;
    if (x > rect.width - rabbit.offsetWidth) x = rect.width - rabbit.offsetWidth;
    rabbit.style.left = x + 'px';
    rabbitX = x;
}

// 矢印キーでウサギを動かす
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    const moveAmount = 15; // 1回の移動量
    const rect = gameContainer.getBoundingClientRect();
    const maxX = rect.width - rabbit.offsetWidth;
    
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rabbitX = Math.max(0, rabbitX - moveAmount);
        rabbit.style.left = rabbitX + 'px';
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rabbitX = Math.min(maxX, rabbitX + moveAmount);
        rabbit.style.left = rabbitX + 'px';
    }
});

gameContainer.addEventListener('mousemove', moveRabbit);
gameContainer.addEventListener('touchstart', moveRabbit, {passive: false});
gameContainer.addEventListener('touchmove', moveRabbit, {passive: false});

// スタートボタンクリック
document.getElementById('start-button').addEventListener('click', startCountdown);
document.getElementById('retry-button').addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

function startCountdown() {
    startScreen.classList.add('hidden');
    countdownScreen.classList.remove('hidden');
    let count = 3;
    const countDisplay = document.getElementById('countdown-number');
    countDisplay.textContent = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countDisplay.textContent = count;
        } else {
            clearInterval(timer);
            startGame();
        }
    }, 1000);
}

function startGame() {
    countdownScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // 初期化
    score = 0;
    timeLeft = 20;
    gameActive = true;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    // ゲームタイマー開始
    gameTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);

    // アイテム生成ループ
    spawnItems();
    requestAnimationFrame(updateItems);
}

function spawnItems() {
    if (!gameActive) return;

    // スピードに応じて出現間隔を短くする（オプション）
    const spawnRate = Math.max(300, 800 - (20 - timeLeft) * 20);

    const item = document.createElement('div');
    const isCarrot = Math.random() > 0.3; // 70%の確率で人参
    
    item.classList.add('item');
    item.classList.add(isCarrot ? 'carrot' : 'daikon');
    item.style.left = Math.random() * (gameContainer.offsetWidth - 40) + 'px';
    item.style.top = '-50px';
    
    gameScreen.appendChild(item);
    items.push({
        el: item,
        y: -50,
        type: isCarrot ? 'carrot' : 'daikon'
    });

    spawnTimer = setTimeout(spawnItems, spawnRate);
}

function updateItems() {
    if (!gameActive) return;

    // 時間経過とともに落下速度を上げる (基本速度 3 + 経過秒数/5)
    const speed = 3 + (20 - timeLeft) * 0.2;

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += speed;
        item.el.style.top = item.y + 'px';

        // 当たり判定
        const rabbitRect = rabbit.getBoundingClientRect();
        const itemRect = item.el.getBoundingClientRect();

        if (
            itemRect.bottom > rabbitRect.top &&
            itemRect.top < rabbitRect.bottom &&
            itemRect.right > rabbitRect.left &&
            itemRect.left < rabbitRect.right
        ) {
            // キャッチ成功
            if (item.type === 'carrot') {
                score += 100;
            } else {
                score = Math.max(0, score - 50); // 大根はマイナス（0以下にはならない）
            }
            scoreDisplay.textContent = score;
            removeItem(i);
            continue;
        }

        // 画面外に落ちた場合
        if (item.y > 600) {
            removeItem(i);
        }
    }

    requestAnimationFrame(updateItems);
}

function removeItem(index) {
    items[index].el.remove();
    items.splice(index, 1);
}

function endGame() {
    gameActive = false;
    clearTimeout(spawnTimer);
    clearInterval(gameTimer);
    
    // 残っているアイテムをすべて削除
    items.forEach(item => item.el.remove());
    items = [];

    finalScoreDisplay.textContent = score;
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
}