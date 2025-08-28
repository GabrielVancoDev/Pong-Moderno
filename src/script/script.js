// Coletando elementos do HTML

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const computadorScoreEl = document.getElementById('computerScore');
const gameOverEl = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const pauseIndicator = document.getElementById('pauseIndicator');
const currentDifficultyEl = document.getElementById('currentDifficulty');

// Configurações de dificuldade