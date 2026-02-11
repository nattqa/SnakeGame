const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameOverElement = document.getElementById('gameOver');

// Game constants
const GRID_SIZE = 25;
const CELL_SIZE = 20;
const MOVE_SPEED = 160;
const SPEED_INCREASE = 10;  // Speed increase in milliseconds per level
const FOODS_PER_LEVEL = 5;  // Number of foods needed to level up

// Game state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food;
let obstacles = [];
let score = 0;
let level = 1;
let foodEaten = 0;
let gameRunning = true;
let gameLoop;

// Initialize game
function init() {
    food = generateFood();
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
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
             obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y));
    return newFood;
}

// Generate random obstacle
function generateObstacle() {
    let newObstacle;
    do {
        newObstacle = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newObstacle.x && segment.y === newObstacle.y) ||
             (food.x === newObstacle.x && food.y === newObstacle.y) ||
             obstacles.some(obstacle => obstacle.x === newObstacle.x && obstacle.y === newObstacle.y));
    return newObstacle;
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

    // Check obstacle collision
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        foodEaten++;
        
        // Level up every FOODS_PER_LEVEL foods
        if (foodEaten % FOODS_PER_LEVEL === 0) {
            level++;
            levelElement.textContent = level;
            obstacles.push(generateObstacle());
            
            // Increase speed by 10ms (decrease interval)
            clearInterval(gameLoop);
            startGameLoop();
        }
        
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

    // Draw obstacles
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 8;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * CELL_SIZE, obstacle.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
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
    const currentSpeed = MOVE_SPEED - ((level - 1) * SPEED_INCREASE);
    gameLoop = setInterval(gameStep, Math.max(currentSpeed, 40)); // Minimum speed of 40ms
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
    obstacles = [];
    score = 0;
    level = 1;
    foodEaten = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    gameRunning = true;
    gameOverElement.style.visibility = 'hidden';
    clearInterval(gameLoop);
    startGameLoop();
}

// Start the game
init();