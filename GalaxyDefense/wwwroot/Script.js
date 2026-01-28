const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreBoard');
const finalScoreEl = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

let gameActive = false;
let score = 0;
let frames = 0;
let lives = 5; 

const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false,
    " ": false
};

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);


class Player {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = 8; 
        this.color = '#00ffff';
        this.cooldown = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if ((keys.ArrowUp || keys.w) && this.y > 0) this.y -= this.speed;
        if ((keys.ArrowDown || keys.s) && this.y < canvas.height - this.height) this.y += this.speed;
        if ((keys.ArrowLeft || keys.a) && this.x > 0) this.x -= this.speed;
        if ((keys.ArrowRight || keys.d) && this.x < canvas.width - this.width) this.x += this.speed;

        if (keys[" "] && this.cooldown <= 0) {
            projectiles.push(new Projectile(this.x + this.width / 2, this.y));
            this.cooldown = 15;
        }
        if (this.cooldown > 0) this.cooldown--;
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = 10;
        this.color = '#ff0';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y -= this.speed;
    }
}

class Enemy {

    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 2 + 2;
        this.color = '#ff4444';
        this.passed = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5);
    }

    update() {
        this.y += this.speed;
    }
}

let player;
let projectiles = [];
let enemies = [];
let animationId;

function init() {
    player = new Player();
    projectiles = [];
    enemies = [];
    score = 0;
    frames = 0;
    lives = 5; 
    scoreEl.innerText = 'Score: ' + score;
}

function drawLives() {
    ctx.fillStyle = '#00ffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Vidas: ' + '♥'.repeat(lives), canvas.width - 20, 40);
    ctx.textAlign = 'left';
}

window.startGame = function () {
    init();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameActive = true;
    animate();
};

window.showMenu = function () {
    cancelAnimationFrame(animationId);
    gameActive = false;
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'block';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    finalScoreEl.innerText = score;
    gameOverScreen.style.display = 'block';
}

function animate() {
    if (!gameActive) return;

    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLives();

    player.update();
    player.draw();

    projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();
        if (projectile.y + projectile.radius < 0) {
            setTimeout(() => projectiles.splice(index, 1), 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.height + player.y > enemy.y
        ) {
            setTimeout(() => {
                enemies.splice(index, 1);
                lives--;
                if (lives <= 0) {
                    gameOver();
                }
            }, 0);
        }


        if (enemy.y > canvas.height) {
            lives--;
            if (lives <= 0) {
                gameOver();
            }
            setTimeout(() => enemies.splice(index, 1), 0);
        }

        projectiles.forEach((projectile, pIndex) => {
            if (
                projectile.x - projectile.radius < enemy.x + enemy.width &&
                projectile.x + projectile.radius > enemy.x &&
                projectile.y - projectile.radius < enemy.y + enemy.height &&
                projectile.y + projectile.radius > enemy.y
            ) {
                setTimeout(() => {
                    enemies.splice(index, 1);
                    projectiles.splice(pIndex, 1);
                    score++;
                    scoreEl.innerText = 'Score: ' + score;
                }, 0);
            }
        });
    });

    frames++;
    if (frames % 60 === 0) {
        enemies.push(new Enemy());
    }
}

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);