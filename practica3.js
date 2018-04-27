const game = function() {
  ////////// Load Quintus object //////////
  const Q = (window.Q = Quintus()
    .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D")
    .setup({
      width: 320,
      height: 480
    })
    .controls()
    .touch());

  ////////// Load Player Sprite //////////
  Q.Sprite.extend("Mario", {
    init: function(p) {
      this._super(p, {
        sprite: "mario",
        sheet: "mario",
        direction: "right",
        x: 1850,
        y: 400,
        dead: false
      });

      this.add("2d, platformerControls, animation");

      this.on("hit.sprite", function(collision) {
        //TODO
      });

      Q.input.on("up", this, "jump");
    },

    step: function(dt) {
      if (this.p.y >= 700) {
        this.p.sheet = "mario";
        this.p.frame = 0;
        this.p.x = 150;
        this.p.y = 380;
      }

      if (this.p.vx > 0 && !this.p.dead) {
        this.play("run_right");
      } else if (this.p.vx < 0 && !this.p.dead) {
        this.play("run_left");
      } else if (!this.p.dead) {
        this.play("stand_" + (this.p.direction === "right" ? "right" : "left"));
      } else {
        Q.stage(1).pause();
      }
    },

    jump: function() {
      this.play("jump_" + (this.p.direction === "right" ? "right" : "left"), 1);
    },

    hit: function() {
      this.p.dead = true;
      this.play("die");
    }
  });

  Q.animations("mario", {
    run_right: { frames: [0, 1, 2], rate: 1 / 15 },
    run_left: { frames: [14, 15, 16], rate: 1 / 15 },
    stand_right: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [14], rate: 1 / 5 },
    jump_right: { frames: [4], rate: 1 / 5, next: "stand_right" },
    jump_left: { frames: [18], rate: 1 / 5, next: "stand_left" },
    die: { frames: [12], loop: false }
  });

  ////////// Load Goomba Sprite //////////
  Q.component("defaultEnemy", {
    added: function() {
      this.entity.on("bump.left,bump.right,bump.bottom", function(collision) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 2, { label: "You Died" });
          collision.obj.hit();
        }
      });

      this.entity.on("bump.top", function(collision) {
        if (collision.obj.isA("Mario")) {
          this.play("die");
          this.p.vx = 0;
          this.p.vy = 0;
          setTimeout(
            function() {
              this.destroy();
            }.bind(this),
            500
          );
          collision.obj.p.vy = -300;
        }
      });
    }
  });

  ////////// Load Goomba Sprite //////////
  Q.Sprite.extend("Goomba", {
    init: function(p) {
      this._super(p, {
        sheet: "goomba",
        sprite: "goomba",
        x: 1600,
        y: 380,
        vx: 100
      });

      this.add("2d, aiBounce, animation, defaultEnemy");
    }
  });

  Q.animations("goomba", {
    move: { frames: [0, 1], rate: 1 / 15 },
    die: { frames: [2], loop: false }
  });

  ////////// Load Bloopa Sprite //////////
  Q.Sprite.extend("Bloopa", {
    init: function(p) {
      this._super(p, {
        sheet: "bloopa",
        sprite: "bloopa",
        x: 1900,
        y: 380,
        gravity: 0.1,
        jumping: false
      });

      this.add("2d, aiBounce, animation, defaultEnemy");

      this.on("bump.bottom", function(collision) {
        this.p.jumping = true;
        this.play("down");

        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 2, { label: "You Died" });
          collision.obj.hit();
          this.p.vy = -150;
        } else {
          this.p.vy = -150;
        }
      });
    },
    step: function(dt) {
      if (this.p.jumping && dt > 30) this.p.jumping = false;
      else this.play("up");
    }
  });

  Q.animations("bloopa", {
    up: { frames: [0], loop: false },
    down: { frames: [1, 1], rate: 1 / 30 },
    die: { frames: [2], loop: false }
  });

  ////////// Load Princess Sprite //////////
  Q.Sprite.extend("Princess", {
    init: function(p) {
      this._super(p, {
        asset: "princess.png",
        x: 2000,
        y: 390
      });

      this.add("2d");

      this.on("bump.left,bump.right,bump.bottom, bump.top", function(
        collision
      ) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 2, { label: "You Won" });
          Q.stage(1).pause();
        }
      });
    }
  });

  ////////// Load Coin Sprite //////////
  Q.Sprite.extend("Coin", {
    init: function(p) {
      this._super(p, {
        sheet: "coin",
        frame: 0,
        sprite: "coin",
        x: 1800,
        y: 390,
        gravity: 0,
        sensor: true,
        colided: false
      });

      this.add("tween, animation");

      this.on("sensor", function(collision) {
        if (!this.p.collided && collision.isA("Mario")) {
          Q.state.inc("score", 1);
          this.p.collided = true;
          this.animate({ y: this.p.y - 50 }, 0.2, Q.Easing.Linear, {
            callback: function() {
              this.destroy();
            }
          });
        }
      });
    },
    step: function(p) {
      this.play("color");
    }
  });

  Q.animations("coin", {
    color: { frames: [0, 1, 2], loop: true, rate: 1 / 2 }
  });

  ////////// End Game Screen //////////
  Q.scene("endGame", function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2,
        y: Q.height / 2,
        fill: "rgba(0,0,0,0.5)"
      })
    );

    const button = container.insert(
      new Q.UI.Button({
        x: 0,
        y: 0,
        fill: "#CCCCCC",
        label: "Play Again"
      })
    );

    const label = container.insert(
      new Q.UI.Text({
        x: 10,
        y: -10 - button.p.h,
        label: stage.options.label
      })
    );

    button.on("click", function() {
      Q.clearStages();
      Q.stageScene("mainTitle", 2);
    });

    Q.input.on("confirm", function() {
      Q.clearStages();
      Q.stageScene("mainTitle", 2);
    });

    container.fit(20);
  });

  ////////// Main Title Screen //////////
  Q.scene("mainTitle", function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width,
        y: Q.height
      })
    );

    const button = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2,
        y: -Q.height / 2,
        fill: "#CCCCCC",
        asset: "mainTitle.png"
      })
    );

    button.on("click", newGame);

    Q.input.on("confirm", newGame);

    container.fit(20);
  });

  const newGame = function() {
    Q.clearStages();
    Q.state.reset({ score: 0 });
    Q.stageScene("HUD", 2);
    Q.stageScene("level1", 1);
  };

  ////////// Score HUD //////////
  Q.UI.Text.extend("Score", {
    init: function(p) {
      this._super({
        label: "score: 0",
        x: 60,
        y: 0
      });
      Q.state.on("change.score", this, "score");
    },
    score: function(score) {
      this.p.label = "score: " + score;
    }
  });

  Q.scene("HUD", function(stage) {
    stage.insert(new Q.Score());
  });

  ////////// Load TMX level //////////
  Q.scene("level1", function(stage) {
    Q.stageTMX("level.tmx", stage);

    const player = stage.insert(new Q.Mario());

    stage.add("viewport").follow(player);
    stage.viewport.offsetY = 160;
    stage.viewport.offsetX = -130;

    stage.insert(new Q.Goomba());
    stage.insert(new Q.Bloopa());
    stage.insert(new Q.Princess());
    stage.insert(new Q.Coin());
    stage.insert(new Q.Score());
  });

  Q.load(
    "princess.png, mainTitle.png, mario_small.json, mario_small.png, goomba.json, goomba.png, bloopa.json, bloopa.png,coin.json,coin.png",
    function() {
      Q.compileSheets("mario_small.png", "mario_small.json");
      Q.compileSheets("goomba.png", "goomba.json");
      Q.compileSheets("bloopa.png", "bloopa.json");
      Q.compileSheets("coin.png", "coin.json");
      Q.loadTMX("level.tmx", function() {
        Q.stageScene("mainTitle");
      });
    }
  );
};
