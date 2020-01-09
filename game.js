let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade"
  },
  scene: {
    // fonction de la scene ce qu'on va implementer
    preload: preload,
    create: create,
    update: update
  },
  audio: {
    disableWebAudio: true
  }
};
let zenitsu;
let inosuke;
let cursors;
let caillou;
let cailloux;
let ennemies;
let thunder;
let explosionAnimation;
let game = new Phaser.Game(config);
let timerInosukeShoot;
let ennemiesTimerShot

function preload() {
  this.load.image("zenitsu", "assets/zenitsu.png");
  this.load.image("inosuke", "assets/inosuke.png");
  this.load.image("thunder", "assets/thunder.png");
  this.load.image("caillou", "assets/katana.png");
  //this.load.image("tiles", "./assets/background.json");
  //this.load.tilemapTiledJSON("backgroundMap", "background.json");
  this.load.spritesheet("boom", "assets/explosion.png", {
    frameWidth: 128,
    frameHeight: 128
  });
  this.load.spritesheet("ennemy", "assets/shuriken.png", {
    frameWidth: 32,
    frameHeight: 32
  });
  this.load.image("bg", "assets/fond.png");
  //this.load.audio("bgSound", "./assets/Sleepwalker.mp3");
}

function create() {
  // const map = this.make.tilemap({
  // key: "backgroundMap"
  // });
  //var tiles = map.addTilesetImage("Sci-fi", "tiles", 16, 16, 0, 0);
  //var layer = map.createStaticLayer(0, tiles, 0, 0);
  // Background
  this.add.sprite(200, 200, "bg");
  zenitsu = this.physics.add.image(100, 100, "zenitsu");
  inosuke = this.physics.add.image(700, 300, "inosuke");
  cursors = this.input.keyboard.createCursorKeys();
  inosuke.setVelocityX(Phaser.Math.Between(100, -100));
  inosuke.setVelocityY(Phaser.Math.Between(100, -100));
  //bgSound = this.sound.add("BgSound");
  //bgSound.play();
  inosuke.lives = 200;
  zenitsu.lives = 5;
  zenitsu.invincible = false;
  inosuke.alive = true;
  // this.add.sprite(positionX, positionY, "zenitsu");

  // groupe d'objets
  cailloux = this.physics.add.group({
    classType: Phaser.GameObjects.Sprite,
    defaultKey: "caillou",
    active: true,
    maxSize: -1
  });

  timerInosukeShoot = this.time.addEvent({
    delay: 1000,
    callback: inosukeShot,
    callbackScope: this,
    repeat: -1
  });

  let inosukeTimer = this.time.addEvent({
    delay: 1000,
    callback: inosukeMoveRandom,
    callbackScope: this,
    repeat: -1 //infini
  });
  // CREATION DE L ANIMATION
  explosionAnimation = this.anims.create({
    key: "explode",
    frames: this.anims.generateFrameNumbers("boom"),
    //frameRate -> image par seconde
    frameRate: 10,
    repeat: 0,
    hideOnComplete: true
  });
  // CREATION DE L ANIMATION DE L ENNEMY
  ennemyAnimation = this.anims.create({
    key: "animateEnnemy",
    frames: this.anims.generateFrameNumbers("ennemy"),
    //frameRate -> image par seconde
    frameRate: 20,
    repeat: -1,
    hideOnComplete: true
  });
  // créer ennemi
  let ennemyMove = this.physics.add.sprite(900, zenitsu.y, "ennemy");
  ennemyMove.setVelocityX(-100);
  ennemyMove.play("animateEnnemy");
  // creer group d'ennemi
  ennemies = this.physics.add.group({
    classType: Phaser.GameObjects.Sprite,
    defaultKey: "ennemyMove",
    defauktFrame: null,
    active: true,
    maxSize: 10
  });

  function ennemiesSpawn() {
    let ennemy = ennemies.get();
    if (ennemy) {
      ennemy.setPosition(900, zenitsu.y);
      ennemy.body.velocity.x = -100;
      ennemy.play("animateEnnemy");
    }
  }
  // timer de creation
  ennemiesTimerShot = this.time.addEvent({
    delay: 2000,
    callback: ennemiesSpawn,
    callbackScope: this,
    repeat: 10 //infini
  });
}

function update() {
  zenitsu.setVelocity(0, 0);

  if (cursors.left.isDown) {
    zenitsu.setVelocityX(-400); // pour aller vers la gauche
  } else if (cursors.right.isDown) {
    zenitsu.setVelocityX(400);
  }
  if (cursors.up.isDown) {
    zenitsu.setVelocityY(-400);
  } else if (cursors.down.isDown) {
    zenitsu.setVelocityY(400);
  }
  // bloque le personnage si il va trop a gauche ou a droite
  if (zenitsu.x < 50) {
    zenitsu.x = 50;
  }
  if (zenitsu.y < 50) {
    zenitsu.y = 50;
  }
  if (zenitsu.x > 750) {
    zenitsu.x = 750;
  }
  if (zenitsu.y > 550) {
    zenitsu.y = 550;
  }

  this.physics.add.collider(zenitsu, cailloux, detectZenitsu, null, this);
  this.physics.add.collider(inosuke, thunder, detectInosuke, null, this);
  this.physics.add.collider(zenitsu, ennemies, detectZenitsu, null, this);
  this.physics.add.collider(ennemies, thunder, detectEnnemy, null, this);

  if (cursors.space.isDown) {
    thunder = this.physics.add.image(
      zenitsu.x + 25,
      zenitsu.y,
      "thunder"
    );
    thunder.setVelocityX(300);
  }
  if (inosuke.y < 10) {
    inosuke.setVelocityY(100);
  }
  if (inosuke.y > 550) {
    inosuke.setVelocityY(-100);
  }
  if (inosuke.x < 10) {
    inosuke.setVelocityX(100);
  }
  if (inosuke.x > 750) {
    inosuke.setVelocityX(-100);
  }
}
function inosukeShot() {
  let caillou = cailloux.get();
  if (caillou) {
    caillou.setPosition(inosuke.x, inosuke.y);
    // calcul pour tirer et quel force
    let directionX = zenitsu.x - inosuke.x;
    let directionY = zenitsu.y - inosuke.y;
    let distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );
    let caillouX = (200 * directionX) / distance;
    let caillouY = (200 * directionY) / distance;
    caillou.body.velocity.x = caillouX;
    caillou.body.velocity.y = caillouY;
  }
}
function inosukeMoveRandom() {
  inosuke.setVelocityX(Phaser.Math.Between(100, -100));
  inosuke.setVelocityY(Phaser.Math.Between(100, -100));
}
// fonction qui sert a detecter le player et le caillou
function detectZenitsu(_zenitsu, _caillou) {
  if (!zenitsu.invincible) {
    _zenitsu.lives--;
    // reduira l'opacité
    _zenitsu.alpha = 0.5;
    _zenitsu.invincible = true;
    setTimeout(function() {
      zenitsu.alpha = 1;
      zenitsu.invincible = false;
    }, 1000);

    if (_zenitsu.lives == 0) {
      let explosion = this.add.sprite(_zenitsu.x, _zenitsu.y, "boom");
      explosion.play("explode");
      _zenitsu.setVisible(false);
      swal({
        title: "Game Over",
        text: "Seems like it's over for you...",
        icon: "error",
        button: "retry"
      }).then(function() {
        window.location = "game.html";
      });
    }
  }
  _caillou.destroy();
}

function detectInosuke(_inosuke, _thunder) {
  if (inosuke.lives == 0) {
  var explosion = this.add.sprite(_inosuke.x, _inosuke.y, "boom");
  explosion.play("explode");
  _thunder.destroy();
  inosuke.alive = false;
  } else {
    inosuke.lives--;
    _thunder.destroy();
  }
  
  if (!inosuke.alive) {
    _inosuke.setVisible(false);
    timerInosukeShoot.paused = true;
    ennemiesTimerShot.paused = true;
    zenitsu.y = -10;
    swal({
      title: "You won",
      text: "Let's see what did you win !",
      icon: "success",
      button: "yay!"
    }).then(function() {
      window.location = "win.html";
    });
  }
}

function detectEnnemy(_ennemy, _thunder) {
  var explosion = this.add.sprite(_ennemy.x, _ennemy.y, "boom");
  explosion.play("explode");
  _thunder.destroy();
  _ennemy.destroy();
}
