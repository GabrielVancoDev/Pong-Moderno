// Coletando elementos do HTML

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerScoreEl = document.getElementById("playerScore");
const computadorScoreEl = document.getElementById("computerScore");
const gameOverEl = document.getElementById("gameOver");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverMessage = document.getElementById("gameOverMessage");
const pauseIndicator = document.getElementById("pauseIndicator");
const currentDifficultyEl = document.getElementById("currentDifficulty");

// Configurações de dificuldade

const difficultySettings = {
  easy: {
    name: "Fácil",
    aiSpeed: 0.04,
    aiReactionTime: 30,
    maxBallSpeed: 10,
    aiAccuaru: 0.7,
  },
  normal: {
    name: "Normal",
    aiSpeed: 0.08,
    aiReactionTime: 20,
    maxBallSpeed: 12,
    aiAccuaru: 0.7,
  },
  hard: {
    name: "Difícil",
    aiSpeed: 0.12,
    aiReactionTime: 10,
    maxBallSpeed: 15,
    aiAccuaru: 0.95,
  },
  insane: {
    name: "Insano",
    aiSpeed: 0.16,
    aiReactionTime: 5,
    maxBallSpeed: 18,
    aiAccuaru: 0.99,
  },
};

let currentDifficulty = "normal";

// Estado do Jogo

let gameState = {
  running: true,
  paused: false,
  playerScore: 0,
  computerScore: 0,
  maxScore: 10,
};

// Objetos do Jogo

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  velocityX: 5,
  velocityY: 3,
  maxSpeed: 12,
  trail: [],
};

const playerPaddle = {
  x: 10,
  y: canvas.height / 2 - 50,
  width: 10,
  height: 100,
  speed: 8,
  targetY: canvas.height / 2 - 50,
};

const computerPaddle = {
  x: canvas.width - 22,
  y: canvas.height / 2 - 50,
  width: 12,
  height: 100,
  speed: 6,
  reactCounter: 0,
};

const controls = {
  up: false,
  down: false,
};
