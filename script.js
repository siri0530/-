const elementDatabase = [
    { name: "수소", code: "H" }, { name: "헬륨", code: "He" }, { name: "리튬", code: "Li" },
    { name: "베릴륨", code: "Be" }, { name: "붕소", code: "B" }, { name: "탄소", code: "C" },
    { name: "질소", code: "N" }, { name: "산소", code: "O" }, { name: "플루오린", code: "F" },
    { name: "네온", code: "Ne" }, { name: "나트륨", code: "Na" }, { name: "마그네슘", code: "Mg" },
    { name: "알루미늄", code: "Al" }, { name: "규소", code: "Si" }, { name: "인", code: "P" },
    { name: "황", code: "S" }, { name: "염소", code: "Cl" }, { name: "아르곤", code: "Ar" },
    { name: "칼륨", code: "K" }, { name: "칼슘", code: "Ca" }
];

let score = 0;
let lives = 3;
let isGameOver = false;
let isGameStarted = false; 
let playerName = "무명전사";
let spawnInterval, loopInterval;

let selectedDifficulty = "low"; 
let gameSpeed = 1.5;            // 하 레벨 속도 1.5로 상향 조정!
let spawnTime = 2000;           // 하 레벨 간격 2초로 쾌적하게 조정!

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const gameArea = document.getElementById('game-area');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
const hearts = document.querySelectorAll('.heart');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const rankingList = document.getElementById('ranking-list');

const levelLowBtn = document.getElementById('level-low-btn');
const levelHighBtn = document.getElementById('level-high-btn');

let activeInvaders = [];

function playLaserSound() {
    try {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    } catch(e){}
}
function playExplosionSound() {
    try {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } catch(e){}
}
function playGameOverSound() {
    try {
        const notes = [300, 240, 180];
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.type = 'square'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime + index * 0.2); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.2 + 0.18);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + index * 0.2); osc.stop(audioCtx.currentTime + index * 0.2 + 0.18);
        });
    } catch(e){}
}

levelLowBtn.addEventListener('click', function() {
    selectedDifficulty = "low";
    levelLowBtn.style.background = "#00f2fe"; levelLowBtn.style.color = "#060713";
    levelHighBtn.style.background = "transparent"; levelHighBtn.style.color = "#ff4b72";
});
levelHighBtn.addEventListener('click', function() {
    selectedDifficulty = "high";
    levelHighBtn.style.background = "#ff4b72"; levelHighBtn.style.color = "#060713";
    levelLowBtn.style.background = "transparent"; levelLowBtn.style.color = "#00f2fe";
});

document.getElementById('start-btn').addEventListener('click', function() {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }

    const inputName = document.getElementById('player-name').value.trim();
    if(inputName !== "") { playerName = inputName; }
    
    // ★ 밸런스 정밀 튜닝 분기점
    if (selectedDifficulty === "high") {
        gameSpeed = 2.0;   // 기존의 스릴 넘치는 속도 그대로 (상)
        spawnTime = 1300;  // 1.3초 간격
        playerName += "(상)";
    } else {
        gameSpeed = 1.5;   // 너무 느리지 않고 딱 적당한 속도 (하)
        spawnTime = 2000;  // 2초 간격으로 여유 부여
        playerName += "(하)";
    }

    startScreen.classList.add('hidden');
    userInput.disabled = false;
    userInput.focus();
    isGameStarted = true;
    
    spawnInterval = setInterval(createInvader, spawnTime); 
    loopInterval = setInterval(gameLoop, 25);
});

function createInvader() {
    if (isGameOver || !isGameStarted) return;
    const randomElement = elementDatabase[Math.floor(Math.random() * elementDatabase.length)];
    
    const invaderElement = document.createElement('div');
    invaderElement.classList.add('invader');
    invaderElement.innerText = randomElement.name; 
    
    const randomX = Math.floor(Math.random() * 360);
    invaderElement.style.left = randomX + 'px';
    invaderElement.style.top = '0px';
    
    gameArea.appendChild(invaderElement);
    
    activeInvaders.push({
        code: randomElement.code,
        element: invaderElement,
        top: 0
    });
}

function gameLoop() {
    if (isGameOver || !isGameStarted) return;
    
    for (let i = activeInvaders.length - 1; i >= 0; i--) {
        let invader = activeInvaders[i];
        invader.top += gameSpeed; 
        invader.element.style.top = invader.top + 'px';
        
        if (invader.top + 65 > 480) {
            invader.element.remove();
            activeInvaders.splice(i, 1);
            decreaseLife();
        }
    }
}

function decreaseLife() {
    if (isGameOver) return;
    lives--;
    playExplosionSound();
    if (hearts[lives]) { hearts[lives].classList.add('lost'); }
    if (lives <= 0) { endGame(); }
}

function endGame() {
    isGameOver = true;
    clearInterval(spawnInterval); clearInterval(loopInterval);
    playGameOverSound();
    
    activeInvaders.forEach(invader => invader.element.remove());
    activeInvaders = [];
    
    finalScoreDisplay.innerText = "최종 점수: " + score + "점";
    
    let localRankings = JSON.parse(localStorage.getItem('schoolRankings')) || [];
    const existingPlayerIndex = localRankings.findIndex(player => player.name === playerName);
    
    if (existingPlayerIndex !== -1) {
        if (score > localRankings[existingPlayerIndex].score) {
            localRankings[existingPlayerIndex].score = score;
        }
    } else {
        localRankings.push({ name: playerName, score: score });
    }
    
    localRankings.sort((a, b) => b.score - a.score);
    localRankings = localRankings.slice(0, 5);
    localStorage.setItem('schoolRankings', JSON.stringify(localRankings));
    
    renderRankingList(localRankings);
    gameOverScreen.classList.remove('hidden');
    userInput.value = ''; userInput.disabled = true; 
}

function renderRankingList(rankings) {
    rankingList.innerHTML = "";
    if (rankings.length === 0) {
        rankingList.innerHTML = "<li style='list-style:none; text-align:center; color:#888;'>등록된 기록이 없습니다.</li>";
        return;
    }
    rankings.forEach((player, index) => {
        const li = document.createElement('li');
        if(player.name === playerName && player.score === score) {
            li.innerHTML = `<strong>${index + 1}등. ${player.name} - ${player.score}점 ★내기록</strong>`;
            li.style.color = "#00f2fe";
        } else {
            li.innerText = `${index + 1}등. ${player.name} - ${player.score}점`;
        }
        rankingList.appendChild(li);
    });
}

document.getElementById('reset-ranking-btn').addEventListener('click', function() {
    const password = prompt("기록을 전체 삭제하려면 교사 비밀번호를 입력하세요.");
    if (password === "과학123") {
        localStorage.removeItem('schoolRankings');
        alert("모든 학교 랭킹 기록이 초기화되었습니다.");
        renderRankingList([]);
    } else if (password !== null) { alert("비밀번호가 틀렸습니다."); }
});

userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !isGameOver && isGameStarted) {
        const inputText = userInput.value.trim();
        const targetIndex = activeInvaders.findIndex(invader => invader.code === inputText);
        
        if (targetIndex !== -1) {
            playLaserSound();
            activeInvaders[targetIndex].element.style.background = '#00f2fe';
            activeInvaders[targetIndex].element.style.borderColor = '#00f2fe';
            activeInvaders[targetIndex].element.style.color = '#060713';
            
            setTimeout(() => {
                if(activeInvaders[targetIndex]) {
                    activeInvaders[targetIndex].element.remove();
                    activeInvaders.splice(targetIndex, 1);
                }
            }, 100);
            score += 10; scoreDisplay.innerText = score;
        }
        userInput.value = ''; 
    }
});
