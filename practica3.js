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
        sheet: "marioR",
        frame: 0,
        x: 1850,
        y: 380
      });

      this.add("2d, platformerControls");

      this.on("hit.sprite", function(collision) {
        //TODO
      });
    },

    step: function(dt) {
      if (this.p.y >= 700) {
        this.p.sheet = "marioR";
        this.p.frame = 0;
        this.p.x = 150;
        this.p.y = 380;
      }
    }
  });

  ////////// Load Goomba Sprite //////////
  Q.Sprite.extend("Goomba", {
    init: function(p) {
      this._super(p, {
        sheet: "goomba",
        frame: 0,
        x: 1600,
        y: 380,
        vx: 100
      });

      this.add("2d, aiBounce");

      this.on("bump.left,bump.right,bump.bottom", function(collision) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 1, { label: "You Died" });
          collision.obj.destroy();
        }
      });

      this.on("bump.top", function(collision) {
        if (collision.obj.isA("Mario")) {
          this.destroy();
          collision.obj.p.vy = -300;
        }
      });
    }
  });

  ////////// Load Bloopa Sprite //////////
  Q.Sprite.extend("Bloopa", {
    init: function(p) {
      this._super(p, {
        sheet: "bloopa",
        frame: 0,
        x: 1700,
        y: 380,
        vx: 50
      });

      this.add("2d, aiBounce");

      this.on("bump.left,bump.right,bump.bottom", function(collision) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("endGame", 1, { label: "You Died" });
          collision.obj.destroy();
        }
      });

      this.on("bump.top", function(collision) {
        if (collision.obj.isA("Mario")) {
          this.destroy();
          collision.obj.p.vy = -300;
        }
      });
    }
  });

  ////////// Load Princess Sprite //////////
  Q.Sprite.extend("Princess", {
    init: function(p) {
      this._super(p, {
        asset: "princess.png",
        x: 2000,
        y: 380
      });

      this.add("2d");

      this.on("bump.left,bump.right,bump.bottom, bump.top", function(
        collision
      ) {
        if (collision.obj.isA("Mario")) {
          Q.stageScene("winGame", 1, { label: "You Won" });
        }
      });
    }
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
      Q.stageScene("level1");
    });

    container.fit(20);
  });

  ////////// Win Game Screen //////////
  Q.scene("winGame", function(stage) {
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
      Q.stageScene("level1");
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

    button.on("click", function() {
      Q.clearStages();
      Q.stageScene("level1");
    });

    container.fit(20);
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
  });

  Q.loadTMX(
    "level.tmx, mario_small.json, mario_small.png, goomba.json, goomba.png, bloopa.json, bloopa.png, princess.png, mainTitle.png",
    function() {
      Q.compileSheets("mario_small.png", "mario_small.json");
      Q.compileSheets("goomba.png", "goomba.json");
      Q.compileSheets("bloopa.png", "bloopa.json");
      Q.compileSheets("princess.png");
      Q.compileSheets("mainTitle.png");
      Q.stageScene("mainTitle");
    }
  );
};
