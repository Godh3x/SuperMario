const game = function () {
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
    init: function (p) {
      this._super(p, {
        sprite: "mario",
        sheet: "mario",
        frame: 0,
        direction: "right",
        x: 1850,
        y: 380
      });

      this.add("2d, platformerControls, Anim");
      this.add("animation");

      this.on("hit.sprite", function (collision) {
        //TODO
      });

      Q.input.on("up", this, "jump");
    },

    step: function (dt) {
      if (this.p.y >= 700) {
        this.p.sheet = "mario";
        this.p.frame = 0;
        this.p.x = 150;
        this.p.y = 380;
      }

      if (this.p.vx > 0) {
        this.play("run_right");
      } else if (this.p.vx < 0) {
        this.play("run_left");
      } else {
        this.play("stand_" + (this.p.direction === "right" ? "right" : "left"));
      }
    },

    jump: function () {
      this.play("jump_" + (this.p.direction === "right" ? "right" : "left"), 1);
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
  Q.Sprite.extend("Goomba", {
    init: function (p) {
      this._super(p, {
        sheet: "goomba",
        frame: 0,
        x: 1600,
        y: 380,
        vx: 100
      });

      this.add("2d, aiBounce");

      this.on("bump.left,bump.right,bump.bottom", function (collision) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 1, { label: "You Died" });
          collision.obj.destroy();
        }
      });

      this.on("bump.top", function (collision) {
        if (collision.obj.isA("Mario")) {
          this.destroy();
          collision.obj.p.vy = -300;
        }
      });
    }
  });

  ////////// Load Bloopa Sprite //////////
  Q.Sprite.extend("Bloopa", {
    init: function (p) {
      this._super(p, {
        sheet: "bloopa",
        frame: 0,
        // x: 1700,
        x: 1900,
        y: 380,
        //vy: -50,
        gravity: 0.1
      });

      this.add("2d, aiBounce");

      this.on("bump.left,bump.right,bump.bottom", function (collision) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 1, { label: "You Died" });
          collision.obj.destroy();
          this.p.vy = -150;
        } else {
          this.p.vy = -150;
        }
      });

      this.on("bump.top", function (collision) {
        if (collision.obj.isA("Mario")) {
          this.destroy();
          collision.obj.p.vy = -300;
        }
      });


    }
  });

  ////////// Load Princess Sprite //////////
  Q.Sprite.extend("Princess", {
    init: function (p) {
      this._super(p, {
        asset: "princess.png",
        x: 2000,
        y: 380
      });

      this.add("2d");

      this.on("bump.left,bump.right,bump.bottom, bump.top", function (
        collision
      ) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("winGame", 1, { label: "You Won" });
        }
      });
    }
  });

  ////////// End Game Screen //////////
  Q.scene("endGame", function (stage) {
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

    button.on("click", function () {
      Q.clearStages();
      Q.stageScene("level1");
    });

    container.fit(20);
  });

  ////////// Win Game Screen //////////
  Q.scene("winGame", function (stage) {
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

    button.on("click", function () {
      Q.clearStages();
      Q.stageScene("level1");
    });

    container.fit(20);
  });

  ////////// Main Title Screen //////////
  Q.scene("mainTitle", function (stage) {
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

    button.on("click", function () {
      Q.clearStages();
      Q.stageScene("level1");
    });

    container.fit(20);
  });

  ////////// Load TMX level //////////
  Q.scene("level1", function (stage) {
    Q.stageTMX("level.tmx", stage);

    const player = stage.insert(new Q.Mario());

    stage.add("viewport").follow(player);
    stage.viewport.offsetY = 160;
    stage.viewport.offsetX = -130;

    stage.insert(new Q.Goomba());
    stage.insert(new Q.Bloopa());
    stage.insert(new Q.Princess());
  });

  Q.load(
    "princess.png, mainTitle.png, mario_small.json, mario_small.png, goomba.json, goomba.png, bloopa.json, bloopa.png",
    function () {
      Q.compileSheets("mario_small.png", "mario_small.json");
      Q.compileSheets("goomba.png", "goomba.json");
      Q.compileSheets("bloopa.png", "bloopa.json");
      Q.loadTMX(
        "level.tmx",
        function () {
          Q.stageScene("mainTitle");
        }
      );
    });
};
