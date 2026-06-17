// 원자 번호 1번부터 20번까지의 원소 데이터셋 (순서대로 정렬)
const elementDatabase = [
    { name: "수소", code: "H" },     // 1번
    { name: "헬륨", code: "He" },    // 2번
    { name: "리튬", code: "Li" },    // 3번
    { name: "베릴륨", code: "Be" },  // 4번
    { name: "붕소", code: "B" },     // 5번
    { name: "탄소", code: "C" },     // 6번
    { name: "질소", code: "N" },     // 7번
    { name: "산소", code: "O" },     // 8번
    { name: "플루오린", code: "F" },  // 9번
    { name: "네온", code: "Ne" },    // 10번
    { name: "나트륨", code: "Na" },  // 11번
    { name: "마그네슘", code: "Mg" },// 12번
    { name: "알루미늄", code: "Al" },// 13번
    { name: "규소", code: "Si" },    // 14번
    { name: "인", code: "P" },       // 15번
    { name: "황", code: "S" },       // 16번
    { name: "염소", code: "Cl" },    // 17번
    { name: "아르곤", code: "Ar" },  // 18번
    { name: "칼륨", code: "K" },     // 19번
    { name: "칼슘", code: "Ca" }     // 20번
];

let score = 0;
const gameArea = document.getElementById('game-area');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
let activeInvaders = [];

// 원소 운석 생성
function createInvader() {
    const randomElement = elementDatabase[Math.floor(Math.random() * elementDatabase.length)];
    
    const invaderElement = document.createElement('div');
    invaderElement.classList.add('invader');
    invaderElement.innerText = randomElement.name; 
    
    // 좌우 위치 무작위 지정 (가장자리 탈출 방지)
    const randomX = Math.floor(Math.random() * 320);
    invaderElement.style.left = randomX + 'px';
    invaderElement.style.top = '0px';
    
    gameArea.appendChild(invaderElement);
    
    activeInvaders.push({
        code: randomElement.code,
        element: invaderElement,
        top: 0
    });
}

// 운석 하강 시스템
function gameLoop() {
    for (let i = activeInvaders.length - 1; i >= 0; i--) {
        let invader = activeInvaders[i];
        invader.top += 1.5; // 떨어지는 속도 (너무 빠르면 숫자를 낮추세요)
        invader.element.style.top = invader.top + 'px';
        
        // 바닥에 닿으면 소멸
        if (invader.top > 520) {
            invader.element.remove();
            activeInvaders.splice(i, 1);
        }
    }
}

// 엔터키 입력 시 정답 판정
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const inputText = userInput.value.trim();
        
        // 화면에 떠 있는 운석 중 매칭되는 기호 찾기 (대소문자 엄격히 구분)
        const targetIndex = activeInvaders.findIndex(invader => invader.code === inputText);
        
        if (targetIndex !== -1) {
            // 이펙트 효과를 주며 격추
            activeInvaders[targetIndex].element.style.backgroundColor = '#66fcf1';
            activeInvaders[targetIndex].element.style.color = '#0b0c10';
            
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

// 게임 시작 사이클 설정
setInterval(createInvader, 2000); // 2초마다 행성 투하
setInterval(gameLoop, 30);        // 프레임 드랍 방지 루프
