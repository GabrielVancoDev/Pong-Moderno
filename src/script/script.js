const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const playerScoreEl = document.getElementById('playerScore');
        const computerScoreEl = document.getElementById('computerScore');
        const gameOverEl = document.getElementById('gameOver');
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        const pauseIndicator = document.getElementById('pauseIndicator');
        const currentDifficultyEl = document.getElementById('currentDifficulty');

        // Configurações de dificuldade
        const difficultySettings = {
            easy: {
                name: 'Fácil',
                aiSpeed: 0.04,
                aiReactionTime: 30,
                maxBallSpeed: 10,
                aiAccuracy: 0.7
            },
            normal: {
                name: 'Normal', 
                aiSpeed: 0.08,
                aiReactionTime: 20,
                maxBallSpeed: 12,
                aiAccuracy: 0.85
            },
            hard: {
                name: 'Difícil',
                aiSpeed: 0.12,
                aiReactionTime: 10,
                maxBallSpeed: 15,
                aiAccuracy: 0.95
            },
            insane: {
                name: 'Insano',
                aiSpeed: 0.16,
                aiReactionTime: 5,
                maxBallSpeed: 18,
                aiAccuracy: 0.99
            }
        };

        let currentDifficulty = 'normal';

        // Estado do jogo
        let gameState = {
            running: true,
            paused: false,
            playerScore: 0,
            computerScore: 0,
            maxScore: 10
        };

        // Objetos do jogo
        const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 8,
            velocityX: 5,
            velocityY: 3,
            maxSpeed: 12,
            trail: []
        };

        const playerPaddle = {
            x: 10,
            y: canvas.height / 2 - 50,
            width: 12,
            height: 100,
            speed: 8,
            targetY: canvas.height / 2 - 50
        };

        const computerPaddle = {
            x: canvas.width - 22,
            y: canvas.height / 2 - 50,
            width: 12,
            height: 100,
            speed: 6,
            reactionCounter: 0
        };

        // Controles
        const keys = {
            up: false,
            down: false
        };

        // Event listeners
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    keys.up = true;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    keys.down = true;
                    break;
                case 'Space':
                    e.preventDefault();
                    togglePause();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!gameState.running) resetGame();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowUp':
                    keys.up = false;
                    break;
                case 'ArrowDown':
                    keys.down = false;
                    break;
            }
        });

        // Controles por mouse/touch
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            playerPaddle.targetY = mouseY - playerPaddle.height / 2;
        });

        function togglePause() {
            if (!gameState.running) return;
            gameState.paused = !gameState.paused;
            pauseIndicator.style.display = gameState.paused ? 'block' : 'none';
        }

        function updatePlayerPaddle() {
            // Movimento suave com interpolação
            if (keys.up) {
                playerPaddle.targetY -= playerPaddle.speed;
            }
            if (keys.down) {
                playerPaddle.targetY += playerPaddle.speed;
            }

            // Limitar aos bounds
            playerPaddle.targetY = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.targetY));
            
            // Movimento suave
            playerPaddle.y += (playerPaddle.targetY - playerPaddle.y) * 0.15;
        }

        function updateComputerPaddle() {
            const settings = difficultySettings[currentDifficulty];
            const ballCenterY = ball.y;
            const paddleCenterY = computerPaddle.y + computerPaddle.height / 2;
            
            // Sistema de tempo de reação baseado na dificuldade
            computerPaddle.reactionCounter++;
            
            if (computerPaddle.reactionCounter >= settings.aiReactionTime) {
                // Calcular posição alvo com base na precisão da IA
                let targetY = ballCenterY;
                
                // Adicionar imprecisão baseada na dificuldade
                const imprecision = (1 - settings.aiAccuracy) * computerPaddle.height;
                targetY += (Math.random() - 0.5) * imprecision;
                
                // Predição avançada para níveis mais difíceis
                if (currentDifficulty === 'hard' || currentDifficulty === 'insane') {
                    // Prever onde a bola estará
                    const timeToReach = (computerPaddle.x - ball.x) / Math.abs(ball.velocityX);
                    const predictedY = ball.y + (ball.velocityY * timeToReach);
                    targetY = predictedY;
                }
                
                // Movimento suave baseado na velocidade da IA
                const diff = targetY - paddleCenterY;
                if (Math.abs(diff) > 5) {
                    if (diff > 0) {
                        computerPaddle.y += computerPaddle.speed * settings.aiSpeed * 100;
                    } else {
                        computerPaddle.y -= computerPaddle.speed * settings.aiSpeed * 100;
                    }
                }
                
                computerPaddle.reactionCounter = 0;
            }

            // Limitar aos bounds
            computerPaddle.y = Math.max(0, Math.min(canvas.height - computerPaddle.height, computerPaddle.y));
        }

        function updateBall() {
            // Trail da bola
            ball.trail.push({x: ball.x, y: ball.y});
            if (ball.trail.length > 8) ball.trail.shift();

            ball.x += ball.velocityX;
            ball.y += ball.velocityY;

            // Colisão com topo e fundo
            if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
                ball.velocityY = -ball.velocityY;
                // Pequena variação aleatória
                ball.velocityY += (Math.random() - 0.5) * 0.5;
            }

            // Colisão com raquete do jogador
            if (ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
                ball.y >= playerPaddle.y &&
                ball.y <= playerPaddle.y + playerPaddle.height &&
                ball.velocityX < 0) {
                
                const hitPoint = (ball.y - playerPaddle.y - playerPaddle.height / 2) / (playerPaddle.height / 2);
                ball.velocityY = hitPoint * 6;
                ball.velocityX = -ball.velocityX;
                
                // Aumentar velocidade gradualmente até o limite da dificuldade
                const maxSpeed = difficultySettings[currentDifficulty].maxBallSpeed;
                if (Math.abs(ball.velocityX) < maxSpeed) {
                    ball.velocityX *= 1.05;
                }
            }

            // Colisão com raquete do computador
            if (ball.x + ball.radius >= computerPaddle.x &&
                ball.y >= computerPaddle.y &&
                ball.y <= computerPaddle.y + computerPaddle.height &&
                ball.velocityX > 0) {
                
                const hitPoint = (ball.y - computerPaddle.y - computerPaddle.height / 2) / (computerPaddle.height / 2);
                ball.velocityY = hitPoint * 6;
                ball.velocityX = -ball.velocityX;
                
                const maxSpeed = difficultySettings[currentDifficulty].maxBallSpeed;
                if (Math.abs(ball.velocityX) < maxSpeed) {
                    ball.velocityX *= 1.05;
                }
            }

            // Pontuação
            if (ball.x < 0) {
                gameState.computerScore++;
                computerScoreEl.textContent = gameState.computerScore;
                resetBall();
                checkGameEnd();
            } else if (ball.x > canvas.width) {
                gameState.playerScore++;
                playerScoreEl.textContent = gameState.playerScore;
                resetBall();
                checkGameEnd();
            }
        }

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
            ball.velocityY = (Math.random() - 0.5) * 6;
            ball.trail = [];
        }

        function checkGameEnd() {
            if (gameState.playerScore >= gameState.maxScore) {
                endGame('Parabéns!', 'Você venceu!', '#00ff88');
            } else if (gameState.computerScore >= gameState.maxScore) {
                endGame('Que pena!', 'O computador venceu!', '#ff4444');
            }
        }

        function endGame(title, message, color) {
            gameState.running = false;
            gameOverTitle.textContent = title;
            gameOverTitle.style.color = color;
            gameOverMessage.textContent = message;
            gameOverEl.style.display = 'block';
        }

        function resetGame() {
            gameState.running = true;
            gameState.paused = false;
            gameState.playerScore = 0;
            gameState.computerScore = 0;
            playerScoreEl.textContent = '0';
            computerScoreEl.textContent = '0';
            gameOverEl.style.display = 'none';
            pauseIndicator.style.display = 'none';
            
            playerPaddle.y = canvas.height / 2 - 50;
            playerPaddle.targetY = canvas.height / 2 - 50;
            computerPaddle.y = canvas.height / 2 - 50;
            computerPaddle.reactionCounter = 0;
            resetBall();
        }

        function setDifficulty(difficulty) {
            currentDifficulty = difficulty;
            currentDifficultyEl.textContent = difficultySettings[difficulty].name;
            
            // Atualizar botões visuais
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Resetar contador de reação da IA
            computerPaddle.reactionCounter = 0;
            
            // Se o jogo estiver rodando, aplicar mudanças imediatamente
            if (gameState.running) {
                ball.maxSpeed = difficultySettings[difficulty].maxBallSpeed;
            }
        }

        function drawRect(x, y, w, h, color, glow = false) {
            ctx.fillStyle = color;
            if (glow) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
            }
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
        }

        function drawCircle(x, y, radius, color, glow = false) {
            ctx.fillStyle = color;
            if (glow) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
            }
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        function drawDashedLine() {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function render() {
            // Limpar canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Linha central
            drawDashedLine();

            // Trail da bola
            ball.trail.forEach((point, i) => {
                const alpha = i / ball.trail.length;
                const size = ball.radius * alpha * 0.7;
                ctx.globalAlpha = alpha * 0.3;
                drawCircle(point.x, point.y, size, '#00ff88');
            });
            ctx.globalAlpha = 1;

            // Raquetes
            drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff88', true);
            drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff4488', true);

            // Bola
            drawCircle(ball.x, ball.y, ball.radius, '#ffffff', true);

            // Indicador de pausa
            if (gameState.paused) {
                ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⏸️ PAUSADO', canvas.width / 2, canvas.height / 2);
            }
        }

        function gameLoop() {
            if (gameState.running && !gameState.paused) {
                updatePlayerPaddle();
                updateComputerPaddle();
                updateBall();
            }
            
            render();
            requestAnimationFrame(gameLoop);
        }

        // Iniciar jogo
        resetBall();
        gameLoop();