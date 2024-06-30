// Initial health and turn values
let playerHealth = 100;
let enemyHealth = 100;
let turns = 0;
let playerTurn = true; // Flag to track player's turn
let healCooldown = 0; // Cooldown counter for heal action
const healCooldownPeriod = 3; // Cooldown period in turns
let defendCooldown = 0; // Cooldown counter for defend action
const defendCooldownPeriod = 2; // Cooldown period in turns

let currentOpponent = null;

// Opponents data
const opponents = {
  goblin: {
    name: "Goblin",
    health: 80,
    attack: () => Math.floor(Math.random() * 6) + 3,
    heal: () => Math.floor(Math.random() * 11) + 5,
    strategy: "quickAttack"
  },
  orc: {
    name: "Orc",
    health: 100,
    attack: () => Math.floor(Math.random() * 9) + 4,
    heavyAttack: () => Math.floor(Math.random() * 16) + 8,
    strategy: "heavyAttack"
  },
  dragon: {
    name: "Dragon",
    health: 120,
    attack: () => Math.floor(Math.random() * 8) + 4,
    fireBreath: () => Math.floor(Math.random() * 21) + 15,
    strategy: "fireBreath"
  }
};

// References to HTML elements
const playerHealthElement = document.getElementById("playerHealth");
const enemyHealthElement = document.getElementById("enemyHealth");
const playerHealthBar = document.getElementById("playerHealthBar");
const enemyHealthBar = document.getElementById("enemyHealthBar");
const playerAttackButton = document.getElementById("playerAttack");
const playerHeavyAttackButton = document.getElementById("playerHeavyAttack");
const playerQuickAttackButton = document.getElementById("playerQuickAttack");
const playerHealButton = document.getElementById("playerHeal");
const playerDefendButton = document.getElementById("playerDefend");
const turnCounter = document.getElementById("turnCounter");
const opponentSelectButtons = document.querySelectorAll(".opponent-select");
const actionLogElement = document.getElementById("actionLog");

// Audio elements
const attackSound = document.getElementById('attackSound');
const heavyAttackSound = document.getElementById('heavyAttackSound');
const quickAttackSound = document.getElementById('quickAttackSound');
const healSound = document.getElementById('healSound');
const defendSound = document.getElementById('defendSound');

// Function to select opponent
function selectOpponent(opponent) {
  currentOpponent = opponents[opponent];
  enemyHealth = currentOpponent.health;
  playerHealth = 100;
  turns = 0;
  playerTurn = true;
  healCooldown = 0;
  defendCooldown = 0;
  updateHealth();
  turnCounter.textContent = `Turn: ${turns}`;
  actionLogElement.innerHTML = `<p>You are now fighting a ${currentOpponent.name}!</p>`;
}

// Function to handle player attack
function playerAttack() {
  if (playerTurn && currentOpponent) {
    const damage = Math.floor(Math.random() * 11) + 5;
    enemyHealth -= damage;
    if (enemyHealth < 0) enemyHealth = 0;
    updateHealth();
    logAction(`You attacked the ${currentOpponent.name} and dealt ${damage} damage.`);
    attackSound.play();
    endTurn();
  }
}

// Function to handle player heavy attack
function playerHeavyAttack() {
  if (playerTurn && currentOpponent) {
    const damage = Math.floor(Math.random() * 21) + 10;
    enemyHealth -= damage;
    if (enemyHealth < 0) enemyHealth = 0;
    updateHealth();
    logAction(`You used a heavy attack on the ${currentOpponent.name} and dealt ${damage} damage.`);
    heavyAttackSound.play();
    endTurn();
  }
}

// Function to handle player quick attack
function playerQuickAttack() {
  if (playerTurn && currentOpponent) {
    const damage = Math.floor(Math.random() * 6) + 3;
    enemyHealth -= damage;
    if (enemyHealth < 0) enemyHealth = 0;
    updateHealth();
    logAction(`You used a quick attack on the ${currentOpponent.name} and dealt ${damage} damage.`);
    quickAttackSound.play();
    endTurn();
  }
}

// Function to handle player heal
function playerHeal() {
  if (playerTurn && currentOpponent && healCooldown === 0) {
    const healAmount = Math.floor(Math.random() * 16) + 10;
    playerHealth += healAmount;
    if (playerHealth > 100) playerHealth = 100;
    healCooldown = healCooldownPeriod;
    updateHealth();
    logAction(`You healed yourself for ${healAmount} health.`);
    healSound.play();
    endTurn();
  } else {
    logAction(`Heal is on cooldown. ${healCooldown} turn(s) remaining.`);
  }
}

// Function to handle player defend
function playerDefend() {
  if (playerTurn && currentOpponent && defendCooldown === 0) {
    defendCooldown = defendCooldownPeriod;
    logAction(`You defend yourself, reducing damage taken next turn.`);
    defendSound.play();
    endTurn(true);
  } else {
    logAction(`Defend is on cooldown. ${defendCooldown} turn(s) remaining.`);
  }
}

// Function to handle enemy turn
function enemyTurn(isPlayerDefending = false) {
  if (!playerTurn && currentOpponent && enemyHealth > 0) {
    let damage = 0;
    if (currentOpponent.strategy === "heavyAttack" && currentOpponent.heavyAttack) {
      damage = currentOpponent.heavyAttack();
      logAction(`The ${currentOpponent.name} used a heavy attack and dealt ${damage} damage.`);
      heavyAttackSound.play();
    } else if (currentOpponent.strategy === "quickAttack" && currentOpponent.attack) {
      damage = currentOpponent.attack();
      logAction(`The ${currentOpponent.name} used a quick attack and dealt ${damage} damage.`);
      quickAttackSound.play();
    } else if (currentOpponent.strategy === "fireBreath" && currentOpponent.fireBreath) {
      damage = currentOpponent.fireBreath();
      logAction(`The ${currentOpponent.name} used fire breath and dealt ${damage} damage.`);
      attackSound.play();
    } else {
      damage = currentOpponent.attack();
      logAction(`The ${currentOpponent.name} attacked and dealt ${damage} damage.`);
      attackSound.play();
    }

    if (isPlayerDefending) {
      damage = Math.floor(damage / 2); // Reduce damage if player is defending
      logAction(`Damage reduced by half due to defense!`);
    }

    playerHealth -= damage;
    if (playerHealth < 0) playerHealth = 0;
    updateHealth();
    checkGameOver(); // Check game over after enemy turn
    if (playerHealth > 0) {
      endTurn();
    }
  }
}

// Function to update health values in the DOM
function updateHealth() {
  playerHealthElement.textContent = playerHealth;
  enemyHealthElement.textContent = enemyHealth;

  // Update health bars
  playerHealthBar.style.width = `${(playerHealth / 100) * 100}%`;
  enemyHealthBar.style.width = `${(enemyHealth / currentOpponent.health) * 100}%`;
}

// Function to log actions
function logAction(action) {
  const p = document.createElement("p");
  p.textContent = action;
  actionLogElement.appendChild(p);
  actionLogElement.scrollTop = actionLogElement.scrollHeight; // Scroll to the latest action
}

// Function to check if the game is over
function checkGameOver() {
  if (playerHealth <= 0) {
    logAction("Game over! You lose.");
    alert("Game over! You lose.");
    resetGame();
  } else if (enemyHealth <= 0) {
    logAction("Congratulations! You win!");
    alert("Congratulations! You win!");
    resetGame();
  }
}

// Function to end the current turn
function endTurn(isPlayerDefending = false) {
  playerTurn = !playerTurn; // Toggle player's turn
  turns++;
  turnCounter.textContent = `Turn: ${turns}`;
  if (healCooldown > 0) healCooldown--; // Decrease heal cooldown
  if (defendCooldown > 0) defendCooldown--; // Decrease defend cooldown
  if (!playerTurn && currentOpponent && enemyHealth > 0) {
    setTimeout(() => enemyTurn(isPlayerDefending), 1000); // Start the enemy's turn after player's turn with delay
  } else if (playerTurn) {
    checkGameOver(); // Check game over after enemy turn
  }
}

// Function to reset the game
function resetGame() {
  playerHealth = 100;
  if (currentOpponent) {
    enemyHealth = currentOpponent.health;
  } else {
    enemyHealth = 100;
  }
  turns = 0;
  playerTurn = true; // Reset turn to player's turn
  healCooldown = 0; // Reset heal cooldown
  defendCooldown = 0; // Reset defend cooldown
  updateHealth();
  turnCounter.textContent = `Turn: ${turns}`;
  actionLogElement.innerHTML = "";
}

// Event listeners for player actions
playerAttackButton.addEventListener("click", playerAttack);
playerHeavyAttackButton.addEventListener("click", playerHeavyAttack);
playerQuickAttackButton.addEventListener("click", playerQuickAttack);
playerHealButton.addEventListener("click", playerHeal);
playerDefendButton.addEventListener("click", playerDefend);
opponentSelectButtons.forEach(button => {
  button.addEventListener("click", () => selectOpponent(button.dataset.opponent));
});
