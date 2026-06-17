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

// 내장 웹 오디오 시스템 준비
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const gameArea = document.getElementById('game-area');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
const hearts = document.querySelectorAll('.heart');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const rankingList = document.getElementById('ranking-list');

let activeInvaders = [];

// 🔊 1. 레이저 격추 소리 효과음 함수 (주파수를 빠르게 높여 뿅! 소리 연출)
function playLaserSound() {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) { console.log("오디오 재생 오류"); }
}

// 🔊 2. 충돌/하트 감소 경고음 함수 (묵직한 로우 톤으로 쿠궁- 소리 연출)
function playExplosionSound() {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) { console.log("오디오 재생 오류"); }
}

// 🔊 3. 게임 오버 멜로디 함수 (점점 낮아지는 패배 연출)
function playGameOverSound() {
    try {
        const notes = [300, 240, 180];
        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime + index * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.2 + 0.18);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + index * 0.2);
            osc.stop(audioCtx.currentTime + index * 0.2 + 0.18);
        });
    } catch(e) { console.log("오디오 재생 오류"); }
}

document.getElementById('start-btn').addEventListener('click', function() {
    // 브라우저 보안 정책상 사용자가 버튼을 누르는 순간 오디오 시스템을 깨워야 합니다.
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const inputName = document.getElementById('player-name
