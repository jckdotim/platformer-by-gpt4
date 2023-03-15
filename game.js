const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;

let gameOver = false;
let gameWon = false;

class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 0.5;
        this.jumpForce = 15;
        this.grounded = false;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity;
        this.checkGroundCollision();
        this.draw();
    }

    jump() {
        if (this.grounded) {
            this.dy = -this.jumpForce;
        }
    }

    checkGroundCollision() {
        if (this.y + this.height > canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            this.dy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
    }
}

class Enemy {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dead = false;
    }

    draw() {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.dead) return;
        this.x -= this.speed;
        this.checkBounds();
        this.checkCollision();
        this.draw();
    }

    checkBounds() {
        if (this.x < -this.width) {
            this.x = canvas.width;
        }
    }

    checkCollision() {
        if (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        ) {
            if (player.y + player.height < this.y + this.height / 2) {
                this.dead = true;
                player.dy = -player.jumpForce / 2;
            } else {
                gameOver = true;
            }
        }
    }
}

const groundHeight = 50;
const player = new Player(100, 300, 50, 50);
const enemies = [
    new Enemy(600, canvas.height - groundHeight - 50, 50, 50, 3),
    new Enemy(1200, canvas.height - groundHeight - 50, 50, 50, 3),
    new Enemy(1800, canvas.height - groundHeight - 100, 50, 50, 3)
];

const jumpPoints = [
    { x: 900, y: canvas.height - groundHeight - 100, width: 50, height: 50 },
    { x: 1600, y: canvas.height - groundHeight - 100, width: 50, height: 50 }
];

const endGoal = { x: 2200, y: canvas.height - groundHeight - 100, width: 50, height: 100 };

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(player.x - canvas.width / 2, canvas.height - groundHeight, canvas.width * 3, groundHeight);
}

function drawJumpPoints() {
    ctx.fillStyle = "orange";
    for (const point of jumpPoints) {
        ctx.fillRect(point.x, point.y, point.width, point.height);
    }
}

function drawEndGoal() {
    ctx.fillStyle = "blue";
    ctx.fillRect(endGoal.x, endGoal.y, endGoal.width, endGoal.height);
}

function checkJumpPoints() {
    if (player.grounded) return;

    for (const point of jumpPoints) {
        if (
            player.x < point.x + point.width &&
            player.x + player.width > point.x &&
            player.y + player.height >= point.y - 1 &&
            player.y + player.height <= point.y + 1 &&
            player.dy >= 0
        ) {
            player.grounded = true;
            player.y = point.y - player.height;
            return;
        }
    }
}


function checkEndGoal() {
    if (
        player.x < endGoal.x + endGoal.width &&
        player.x + player.width > endGoal.x &&
        player.y < endGoal.y + endGoal.height &&
        player.y + player.height > endGoal.y
    ) {
        gameWon = true;
    }
}

function updateCamera() {
    const cameraOffset = -player.x + canvas.width / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(cameraOffset, 0);
}

function animate() {
    if (gameOver) {
        showGameOver();
        return;
    }
    if (gameWon) {
        showGameWon();
        return;
    }

    updateCamera();
    ctx.clearRect(player.x - canvas.width / 2, 0, canvas.width, canvas.height);
    drawGround();
    drawJumpPoints();
    drawEndGoal();
    player.update();
    checkEndGoal();
    for (const enemy of enemies) {
        enemy.update();
    }
    checkJumpPoints();
    requestAnimationFrame(animate);
}

function showGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(player.x - canvas.width / 2, 0, canvas.width, canvas.height);

    ctx.font = "48px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", player.x, canvas.height / 2);

    ctx.font = "24px sans-serif";
    ctx.fillText("Press R to Restart", player.x, canvas.height / 2 + 40);
}

function showGameWon() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(player.x - canvas.width / 2, 0, canvas.width, canvas.height);

    ctx.font = "48px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("YOU WON!", player.x, canvas.height / 2);

    ctx.font = "24px sans-serif";
    ctx.fillText("Press R to Restart", player.x, canvas.height / 2 + 40);
}

function restartGame() {
    player.x = 100;
    player.y = 300;
    player.dx = 0;
    player.dy = 0;
    player.grounded = false;

    enemies.forEach((enemy) => {
        enemy.x += 600;
        enemy.dead = false;
    });

    gameOver = false;
    gameWon = false;
    animate();
}

document.addEventListener("keydown", (e) => {
    if ((gameOver || gameWon) && e.code === "KeyR") {
        restartGame();
    } else if (e.code === "Space") {
        player.jump();
    } else if (e.code === "ArrowLeft") {
        player.dx = -player.speed;
    } else if (e.code === "ArrowRight") {
        player.dx = player.speed;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        player.dx = 0;
    }
});

animate();
