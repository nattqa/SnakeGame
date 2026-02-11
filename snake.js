const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game constants
const GRID_SIZE = 25;
const CELL_SIZE = 20;
const MOVE_SPEED = 160;

// Game state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = generateFood();
let score = 0;
let gameRunning = true;
let gameLoop;

// Initialize game
function init() {
    document.addEventListener('keydown', handleKeyPress);
    startGameLoop();
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                direction = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                direction = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                direction = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                direction = { x: 1, y: 0 };
            }
            break;
    }
}

// Generate random food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Move snake
function moveSnake() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

// Check collisions
function checkCollisions() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // Self collision
    if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        return true;
    }
    
    return false;
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - brighter
            ctx.fillStyle = '#00ff00';
        } else {
            // Body - slightly dimmer
            ctx.fillStyle = '#00cc00';
        }
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
    
    ctx.shadowBlur = 0;
}

// Game loop
function gameStep() {
    if (!gameRunning) return;
    
    moveSnake();
    render();
}

// Start game loop
function startGameLoop() {
    gameLoop = setInterval(gameStep, MOVE_SPEED);
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    gameOverElement.style.visibility = 'visible';
}

// Restart game
function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    food = generateFood();
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    gameOverElement.style.visibility = 'hidden';
    clearInterval(gameLoop);
    startGameLoop();
}

// Start the game
init();