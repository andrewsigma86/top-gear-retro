// Variables del juego
let gameArea = document.getElementById('game-area');
let player = document.getElementById('player');
let scoreElement = document.getElementById('score');
let livesElement = document.getElementById('lives');
let gameOverScreen = document.getElementById('game-over');
let finalScoreElement = document.getElementById('final-score');
let startBtn = document.getElementById('start-btn');
let restartBtn = document.getElementById('restart-btn');
let leftBtn = document.getElementById('left-btn');
let rightBtn = document.getElementById('right-btn');

// Elementos de audio
let bgMusic = document.getElementById('bg-music');
let engineSound = document.getElementById('engine-sound');
let crashSound = document.getElementById('crash-sound');
let gameOverSound = document.getElementById('game-over-sound');

let gameRunning = false;
let score = 0;
let lives = 3;
let playerPosition = 180; // Posición inicial del jugador
let obstacles = [];
let gameSpeed = 5;
let obstacleFrequency = 100; // Menor = más obstáculos
let frameCount = 0;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
leftBtn.addEventListener('mousedown', () => movePlayer('left'));
leftBtn.addEventListener('touchstart', () => movePlayer('left'));
rightBtn.addEventListener('mousedown', () => movePlayer('right'));
rightBtn.addEventListener('touchstart', () => movePlayer('right'));
document.addEventListener('keydown', movePlayer);

// Configurar audios
function setupAudio() {
    // Configurar volúmenes
    bgMusic.volume = 0.3;
    engineSound.volume = 0.4;
    crashSound.volume = 0.7;
    gameOverSound.volume = 0.8;
    
    // Mensaje para el usuario
    console.log("=== Instrucciones para agregar sonidos ===");
    console.log("1. Coloca tus archivos de audio en la carpeta del proyecto");
    console.log("2. Usa los siguientes nombres:");
    console.log("   - bg-music.mp3 (música de fondo)");
    console.log("   - engine-sound.mp3 (sonido del motor)");
    console.log("   - crash-sound.mp3 (sonido de choque)");
    console.log("   - game-over-sound.mp3 (sonido de game over)");
    console.log("3. Descomenta las líneas <source> en el HTML para cada sonido");
}

// Inicializar configuración de audio
setupAudio();

function startGame() {
    gameRunning = true;
    startBtn.style.display = 'none';
    
    // Iniciar música de fondo
    bgMusic.play().catch(e => {
        console.log("No se pudo reproducir la música de fondo. Verifica el archivo 'bg-music.mp3'");
    });
    
    // Iniciar sonido del motor
    engineSound.play().catch(e => {
        console.log("No se pudo reproducir el sonido del motor. Verifica el archivo 'engine-sound.mp3'");
    });
    
    gameLoop();
}

function restartGame() {
    // Reiniciar variables
    score = 0;
    lives = 3;
    playerPosition = 180;
    obstacles = [];
    gameSpeed = 5;
    frameCount = 0;
    
    // Actualizar UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    gameOverScreen.classList.add('hidden');
    player.style.left = playerPosition + 'px';
    
    // Limpiar obstáculos
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    
    // Reiniciar audios
    bgMusic.currentTime = 0;
    engineSound.currentTime = 0;
    
    // Iniciar audios
    bgMusic.play().catch(e => {
        console.log("No se pudo reproducir la música de fondo. Verifica el archivo 'bg-music.mp3'");
    });
    
    engineSound.play().catch(e => {
        console.log("No se pudo reproducir el sonido del motor. Verifica el archivo 'engine-sound.mp3'");
    });
    
    // Iniciar juego
    startGame();
}

function movePlayer(e) {
    if (!gameRunning) return;
    
    let direction = '';
    
    if (typeof e === 'string') {
        direction = e;
    } else if (e.key === 'ArrowLeft') {
        direction = 'left';
    } else if (e.key === 'ArrowRight') {
        direction = 'right';
    }
    
    if (direction === 'left' && playerPosition > 0) {
        playerPosition -= 20;
    } else if (direction === 'right' && playerPosition < 340) {
        playerPosition += 20;
    }
    
    player.style.left = playerPosition + 'px';
}

function createObstacle() {
    let obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Posición aleatoria en la carretera
    let position = Math.floor(Math.random() * 8) * 50; // 0, 50, 100, ..., 350
    obstacle.style.left = position + 'px';
    obstacle.style.top = '-60px';
    
    gameArea.appendChild(obstacle);
    obstacles.push({
        element: obstacle,
        position: position,
        top: -60
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.top += gameSpeed;
        obstacle.element.style.top = obstacle.top + 'px';
        
        // Eliminar obstáculos que salen de la pantalla
        if (obstacle.top > 400) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
            score += 10;
            scoreElement.textContent = score;
        }
        
        // Detectar colisiones
        if (
            obstacle.top > 320 && 
            obstacle.top < 380 && 
            Math.abs(obstacle.position - playerPosition) < 40
        ) {
            // Colisión!
            lives--;
            livesElement.textContent = lives;
            obstacle.element.remove();
            obstacles.splice(index, 1);
            
            // Reproducir sonido de choque
            crashSound.currentTime = 0;
            crashSound.play().catch(e => {
                console.log("No se pudo reproducir el sonido de choque. Verifica el archivo 'crash-sound.mp3'");
            });
            
            // Efecto visual de colisión
            player.classList.add('crash-animation');
            setTimeout(() => {
                player.classList.remove('crash-animation');
            }, 800);
            
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

function gameLoop() {
    if (!gameRunning) return;
    
    frameCount++;
    
    // Crear obstáculos
    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }
    
    // Aumentar dificultad
    if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
        obstacleFrequency = Math.max(50, obstacleFrequency - 5);
    }
    
    updateObstacles();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    
    // Detener música de fondo y sonido del motor
    bgMusic.pause();
    engineSound.pause();
    
    // Reproducir sonido de game over
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(e => {
        console.log("No se pudo reproducir el sonido de game over. Verifica el archivo 'game-over-sound.mp3'");
    });
}