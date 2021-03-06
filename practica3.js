const game = function() {
  ////////// Load Quintus object //////////
  const Q = (window.Q = Quintus()
    .include('Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio')
    .setup({
      width: 320,
      height: 480,
      audioSupported: ['ogg', 'mp3'],
    })
    .controls()
    .touch()
    .enableSound());

  ////////// Load Player Sprite //////////
  Q.Sprite.extend('Mario', {
    init: function(p) {
      this._super(p, {
        sprite: 'mario',
        sheet: 'mario',
        direction: 'right',
        x: 150,
        y: 380,
        dead: false,
        jumpSpeed: -450,
      });

      this.add('2d, platformerControls, animation');

      this.on('hit.sprite', function(collision) {
        //TODO
      });

      Q.input.on('up', this, 'jump');
    },

    step: function(dt) {
      if (this.p.y >= 700) {
        this.p.sheet = 'mario';
        this.p.frame = 0;
        this.p.x = 150;
        this.p.y = 380;
      }

      if (this.p.vx > 0 && !this.p.dead) {
        this.play('run_right');
      } else if (this.p.vx < 0 && !this.p.dead) {
        this.play('run_left');
      } else if (!this.p.dead) {
        this.play('stand_' + (this.p.direction === 'right' ? 'right' : 'left'));
      } else {
        Q.stage(1).pause();
      }
    },

    jump: function() {
      this.play('jump_' + (this.p.direction === 'right' ? 'right' : 'left'), 1);
    },

    hit: function() {
      this.p.dead = true;
      this.play('die');
    },
  });

  Q.animations('mario', {
    run_right: { frames: [0, 1, 2], rate: 1 / 15 },
    run_left: { frames: [14, 15, 16], rate: 1 / 15 },
    stand_right: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [14], rate: 1 / 5 },
    jump_right: { frames: [4], rate: 1 / 5, next: 'stand_right' },
    jump_left: { frames: [18], rate: 1 / 5, next: 'stand_left' },
    die: { frames: [12], loop: false },
  });

  ////////// defaultEnemy Component //////////
  Q.component('defaultEnemy', {
    added: function() {
      this.entity.on('bump.left,bump.right,bump.bottom', function(collision) {
        if (collision.obj.isA('Mario')) {
          Q.stageScene('endGame', 2, {
            label: 'You Died',
            sound: 'music_die.ogg',
          });
          collision.obj.hit();
        }
      });

      this.entity.on('bump.top', function(collision) {
        if (collision.obj.isA('Mario')) {
          this.play('die');
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
    },
  });

  ////////// Load Goomba Sprite //////////
  Q.Sprite.extend('Goomba', {
    init: function(p) {
      this._super(p, {
        sheet: 'goomba',
        sprite: 'goomba',
        vx: 100,
      });

      this.add('2d, aiBounce, animation, defaultEnemy');
      this.play('move');
    },
  });

  Q.animations('goomba', {
    move: { frames: [0, 1], rate: 1 / 5 },
    die: { frames: [2], loop: false },
  });

  ////////// Load Bloopa Sprite //////////
  Q.Sprite.extend('Bloopa', {
    init: function(p) {
      this._super(p, {
        sheet: 'bloopa',
        sprite: 'bloopa',
        gravity: 0.1,
        jumping: false,
      });

      this.add('2d, aiBounce, animation, defaultEnemy');
      this.play('move');

      this.on('bump.bottom', function(collision) {
        if (collision.obj.isA('Mario')) {
          Q.stageScene('endGame', 2, {
            label: 'You Died',
            sound: 'music_die.ogg',
          });
          collision.obj.hit();
          this.p.vy = -150;
        } else {
          this.p.vy = -150;
        }
      });
    },
  });

  Q.animations('bloopa', {
    move: { frames: [0, 1], rate: 1 / 1 },
    die: { frames: [2], loop: false },
  });

  ////////// Load Princess Sprite //////////
  Q.Sprite.extend('Princess', {
    init: function(p) {
      this._super(p, {
        asset: 'princess.png',
      });

      this.add('2d');

      this.on('bump.left,bump.right,bump.bottom, bump.top', function(
        collision
      ) {
        if (collision.obj.isA('Mario')) {
          Q.stageScene('endGame', 2, {
            label: 'You Won',
            sound: 'music_level_complete.ogg',
          });
          Q.stage(1).pause();
        }
      });
    },
  });

  ////////// Load Coin Sprite //////////
  Q.Sprite.extend('Coin', {
    init: function(p) {
      this._super(p, {
        sheet: 'coin',
        frame: 0,
        sprite: 'coin',
        gravity: 0,
        sensor: true,
        colided: false,
      });

      this.add('tween, animation');

      this.on('sensor', function(collision) {
        if (!this.p.collided && collision.isA('Mario')) {
          Q.audio.play('coin.ogg');
          Q.state.inc('score', 50);
          this.p.collided = true;
          this.animate({ y: this.p.y - 50 }, 0.2, Q.Easing.Linear, {
            callback: function() {
              this.destroy();
            },
          });
        }
      });
    },
    step: function(p) {
      this.play('color');
    },
  });

  Q.animations('coin', {
    color: { frames: [0, 1, 2], loop: true, rate: 1 / 2 },
  });

  ////////// End Game Screen //////////
  Q.scene('endGame', function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2,
        y: Q.height / 2,
        fill: 'rgba(0,0,0,0.5)',
      })
    );

    const button = container.insert(
      new Q.UI.Button({
        x: 0,
        y: 0,
        fill: '#CCCCCC',
        label: 'Play Again',
      })
    );

    const label = container.insert(
      new Q.UI.Text({
        x: 10,
        y: -10 - button.p.h,
        label: stage.options.label,
      })
    );

    button.on('click', function() {
      Q.audio.stop();
      Q.audio.play('music_main.ogg', { loop: true });
      Q.state.set('status', 'onHold');
      Q.clearStages();
      Q.stageScene('mainTitle', 2, { sound: 'music_main.ogg' });
    });

    Q.audio.stop();
    Q.audio.play(stage.options.sound);
    container.fit(20);
  });

  ////////// Main Title Screen //////////
  Q.scene('mainTitle', function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width,
        y: Q.height,
      })
    );

    const button = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2,
        y: -Q.height / 2,
        fill: '#CCCCCC',
        asset: 'mainTitle.png',
      })
    );

    const newGame = function() {
      if (Q.state.p.status != 'onHold') return;
      Q.clearStages();
      Q.state.reset({ score: 0, status: 'running' });
      Q.stageScene('HUD', 2);
      Q.stageScene('level1', 1);
    };

    button.on('click', newGame);

    Q.input.on('confirm', newGame);

    Q.audio.stop();
    Q.audio.play(stage.options.sound);
    container.fit(20);
  });

  ////////// Score HUD //////////
  Q.UI.Text.extend('Score', {
    init: function(p) {
      this._super({
        label: 'score: 0',
        x: 100,
        y: 0,
      });
      Q.state.on('change.score', this, 'score');
    },
    score: function(score) {
      this.p.label = 'score: ' + score;
    },
  });

  Q.scene('HUD', function(stage) {
    stage.insert(new Q.Score());
  });

  ////////// Load TMX level //////////
  Q.scene('level1', function(stage) {
    Q.stageTMX('level.tmx', stage);

    const player = stage.insert(new Q.Mario());

    stage.add('viewport').follow(player);
    stage.viewport.offsetY = 160;
    stage.viewport.offsetX = -130;

    stage.insert(new Q.Goomba({ x: 1600, y: 380 }));
    stage.insert(new Q.Bloopa({ x: 850, y: 380 }));
    stage.insert(new Q.Princess({ x: 2000, y: 390 }));
    for (let i = 0; i < 10; i++) {
      stage.insert(new Q.Coin({ x: 200 * i, y: 400 }));
    }

    stage.insert(new Q.Score());
  });

  Q.load(
    'princess.png, mainTitle.png, mario_small.json, mario_small.png, \
    goomba.json, goomba.png, bloopa.json, bloopa.png,coin.json,coin.png, \
    coin.ogg, music_die.ogg, music_level_complete.ogg, music_main.ogg',
    function() {
      Q.compileSheets('mario_small.png', 'mario_small.json');
      Q.compileSheets('goomba.png', 'goomba.json');
      Q.compileSheets('bloopa.png', 'bloopa.json');
      Q.compileSheets('coin.png', 'coin.json');
      Q.loadTMX('level.tmx', function() {
        Q.state.reset({ status: 'onHold' });
        Q.stageScene('mainTitle', 2, { sound: 'music_main.ogg' });
      });
    }
  );
};
