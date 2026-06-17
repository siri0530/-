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

const gameArea = document.getElementById('game-area');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
const hearts = document.querySelectorAll('.heart');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const rankingList = document.getElementById('ranking-list');

let activeInvaders = [];

document.getElementById('start-btn').addEventListener('click', function() {
    const inputName = document.getElementById('player-name').value.trim();
    if(inputName !== "") {
        playerName = inputName;
    }
    
    startScreen.classList.add('hidden');
    userInput.disabled = false;
    userInput.focus();
    isGameStarted = true;
    
    spawnInterval = setInterval(createInvader, 1800); // 생성 주기도 1.8초로 쾌적하게 조절
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
        invader.top += 1.1; // ★ 속도를 2.0 -> 1.1로 훨씬 여유롭게 패치
        invader.element.style.top = invader.top + 'px';
        
        // ★ 충돌 경계선 수정: 화면 맨 아래 바닥선(480px)에 완전히 닿았을 때 감지
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
    if (hearts[lives]) {
        hearts[lives].classList.add('lost');
    }
    if (lives <= 0) {
        endGame();
    }
}

function endGame() {
    isGameOver = true;
    clearInterval(spawnInterval);
    clearInterval(loopInterval);
    
    activeInvaders.forEach(invader => invader.element.remove());
    activeInvaders = [];
    
    finalScoreDisplay.innerText = "최종 점수: " + score + "점";
    
    let localRankings = JSON.parse(localStorage.getItem('schoolRankings')) || [];
    localRankings.push({ name: playerName, score: score });
    localRankings.sort((a, b) => b.score - a.score);
    localRankings = localRankings.slice(0, 5);
    localStorage.setItem('schoolRankings', JSON.stringify(localRankings));
    
    rankingList.innerHTML = "";
    localRankings.forEach((player, index) => {
        const li = document.createElement('li');
        if(player.name === playerName && player.score === score) {
            li.innerHTML = `<strong>${index + 1}등. ${player.name} - ${player.score}점 ★내기록</strong>`;
            li.style.color = "#00f2fe";
        } else {
            li.innerText = `${index + 1}등. ${player.name} - ${player.score}점`;
        }
        rankingList.appendChild(li);
    });

    gameOverScreen.classList.remove('hidden');
    userInput.value = '';
    userInput.disabled = true; 
}

userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !isGameOver && isGameStarted) {
        const inputText = userInput.value.trim();
        const targetIndex = activeInvaders.findIndex(invader => invader.code === inputText);
        
        if (targetIndex !== -1) {
            activeInvaders[targetIndex].element.style.background = '#00f2fe';
            activeInvaders[targetIndex].element.style.borderColor = '#00f2fe';
            activeInvaders[targetIndex].element.style.color = '#060713';
            
            setTimeout(() => {
                if(activeInvaders[targetIndex]) {
                    activeInvaders[targetIndex].element.remove();
                    activeInvaders.splice(targetIndex, 1);
                }
            }, 100);

            score += 10;
            scoreDisplay.innerText = score;
        }
        userInput.value = ''; 
    }
});
