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
        x: 150,
        y: 380
      });

      this.add("2d, platformerControls");

      this.on("hit.sprite", function(collision) {
        //TODO
      });
    },
    step: function(dt) {
      if (this.p.y != 400) {
        this.p.x = 150;
        this.p.y = 380;
      }
    }
  });

  ////////// Load TMX level //////////
  Q.scene("level1", function(stage) {
    Q.stageTMX("level.tmx", stage);

    const player = stage.insert(new Q.Mario());
    stage.add("viewport").follow(player);
    //stage.add("viewport").centerOn(150, 380);
  });

  Q.loadTMX("level.tmx, mario_small.json, mario_small.png", function() {
    Q.compileSheets("mario_small.png", "mario_small.json");
    Q.stageScene("level1");
  });
};
