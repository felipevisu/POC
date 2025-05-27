const grid = document.querySelector('.grid');
const results = document.querySelector('.results');
let currentShooterIndex = 202;
let invadersId;
let isGoingRight = true;
let direction = 1
let score = 0;

const width = 15;
const height = 15;

for (let i = 0; i < width * height; i++) {
    const square = document.createElement('div');
    square.id = i;
    grid.appendChild(square);
}

const squares = Array.from(document.querySelectorAll('.grid div'));

let enemies = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
]

function draw() {
    enemies.forEach(enemy => {
        squares[enemy].classList.add('enemy');
    })
}

draw();

squares[currentShooterIndex].classList.add('shooter');

function moveShooter(e) {
    squares[currentShooterIndex].classList.remove('shooter');
    switch (e.key) {
        case 'ArrowLeft':
            if (currentShooterIndex % width !== 0) currentShooterIndex--;
            break;
        case 'ArrowRight':
            if (currentShooterIndex % width < width - 1) currentShooterIndex++;
    }
    squares[currentShooterIndex].classList.add('shooter');
}

document.addEventListener('keydown', moveShooter);

function remove() {
    enemies.forEach(enemy => {
        squares[enemy].classList.remove('enemy');
    })
}

function moveInvaders() {
    const leftEdge = enemies[0] % width === 0;
    const rightEdge = enemies[enemies.length - 1] % width === width - 1;
    remove();

    if (rightEdge && isGoingRight) {
        enemies = enemies.map(enemy => enemy + width + 1);
        direction = -1
        isGoingRight = false
    }

    if (leftEdge && !isGoingRight) {
        enemies = enemies.map(enemy => enemy + width - 1);
        direction = 1
        isGoingRight = true
    }

    enemies = enemies.map(enemy => enemy + direction);

    draw();

    if (squares[currentShooterIndex].classList.contains('enemy')) {
        results.innerHTML = 'You Lost';
        clearInterval(invadersId);
    }

    if (enemies.length === 0) {
        results.innerHTML = 'You Won';
        clearInterval(invadersId);
    }
}

invadersId = setInterval(moveInvaders, 500);

function shoot(e) {
    let laserId;
    let currentLaserIndex = currentShooterIndex;

    function moveLaser() {
        squares[currentLaserIndex].classList.remove('shoot');
        currentLaserIndex -= width;
        squares[currentLaserIndex].classList.add('shoot');

        if (squares[currentLaserIndex].classList.contains('enemy')) {
            squares[currentLaserIndex].classList.remove('enemy');
            squares[currentLaserIndex].classList.remove('shoot');
            squares[currentLaserIndex].classList.add('boom');
            enemies = enemies.filter(enemy => enemy !== currentLaserIndex);
            score++;
            results.innerHTML = `Score: ${score}`;

            setTimeout(() => {
                squares[currentLaserIndex].classList.remove('boom');
            }, 200);
            clearInterval(laserId);
        }
    }

    switch (e.key) {
        case 'ArrowUp':
            laserId = setInterval(moveLaser, 50);
            break;
    }
}

document.addEventListener('keydown', shoot);