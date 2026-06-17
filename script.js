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
let spawnInterval, loopInterval;

const gameArea = document.getElementById('game-area');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
const hearts = document.querySelectorAll('.heart');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');

let activeInvaders = [];

function createInvader() {
    if (isGameOver) return;
    const randomElement = elementDatabase[Math.floor(Math.random() * elementDatabase.length)];
    
    const invaderElement = document.createElement('div');
    invaderElement.classList.add('invader');
    invaderElement.innerText = randomElement.name; 
    
    const randomX = Math.floor(Math.random() * 300);
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
    if (isGameOver) return;
    
    for (let i = activeInvaders.length - 1; i >= 0; i--) {
        let invader = activeInvaders[i];
        invader.top += 1.8; // 하강 속도
        invader.element.style.top = invader.top + 'px';
        
        // 중요: 하단 입력창(경계선 부근인 440px)에 닿았을 때
        if (invader.top > 440) {
            invader.element.remove();
            activeInvaders.splice(i, 1);
            decreaseLife(); // 목숨 감소 함수 실행
        }
    }
}

// 목숨 감소 및 게임 오버 판정 로직
function decreaseLife() {
    lives--;
    // 하트 색 지우기 (뒤에서부터 lost 클래스 추가)
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
    
    // 화면에 남은 운석 전부 지우기
    activeInvaders.forEach(invader => invader.element.remove());
    activeInvaders = [];
    
    // 점수판 작동 및 결과 모달 띄우기
    finalScoreDisplay.innerText = "최종 점수: " + score + "점";
    gameOverScreen.classList.remove('hidden');
    userInput.disabled = true; // 입력창 잠그기
}

userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !isGameOver) {
        const inputText = userInput.value.trim();
        const targetIndex = activeInvaders.findIndex(invader => invader.code === inputText);
        
        if (targetIndex !== -1) {
            // 파괴 성공 이펙트 (네온 컬러로 순간 번쩍인 뒤 삭제)
            activeInvaders[targetIndex].element.style.background = '#00f2fe';
            activeInvaders[targetIndex].element.style.color = '#060713';
            activeInvaders[targetIndex].element.style.borderColor = '#00f2fe';
            
            setTimeout(() => {
                if(activeInvaders[targetIndex]) {
                    activeInvaders[targetIndex].element.remove();
                    activeInvaders.splice(targetIndex, 1);
                }
            }, 150);

            score += 10;
            scoreDisplay.innerText = score;
        }
        userInput.value = ''; 
    }
});

// 타이머 설정
spawnInterval = setInterval(createInvader, 1800); // 1.8초마다 생성
loopInterval = setInterval(gameLoop, 30);
