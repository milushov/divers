function Background(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('bg init');

    Object.extend(this.config, {
      speed: {
        clouds: 10,
        fishes: 30,
        waves: [2, 6, 10]
      },

      objects: {
        water: null,
        waves: [],
        island: null
      },

      options: {
        ratio_sky_water: 1/6,
        sand_height: 90,
        crabs_count: 4,
        stars_count: 5
      }
    });

    this.canvas = document.getElementById('background');
    this.canvas.width = wwh()[0];
    this.canvas.height = wwh()[1];
    this.ctx = this.canvas.getContext('2d');

    this.fishes = new Array();
    this.clouds = new Array();
    this.waves = new Array();

    // tune
    this.config.objects.water = getWaterY.call(this);
    this.config.objects.waves = getWavesY.call(this);
    this.config.objects.island = getIslandCoords.call(this);

    this.startClouds();
    this.startWaves();
  };

  function getWaterY() {
    var ratio = this.config.options.ratio_sky_water;
    return Math.round((this.canvas.height - (60 + 20)) * ratio) + 60;
  }

  function getWavesY() {
    var water = this.config.objects.water;
    return [water - 10, water, water + 10];
  }

  function getIslandCoords() {
    var water = this.config.objects.water;
    return [200, water - 47];
  }

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.clear();
    this.draw();
  };

  this.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.draw = function() {
    this.static.drawSky.call(this);
    this.static.drawSea.call(this);
    this.drawSun();

    for (var i = 0; i < this.clouds.length; ++i) {
      this.clouds[i].draw(this.ctx);
    }

    this.static.drawIsland.call(this);

    for (var i = 0; i < this.waves.length; ++i) {
      this.waves[i].draw();
      // if wave is penultimate
      if(i === this.waves.length - 2) {
        this.static.drawBoat.call(this);
      }
    }

    this.static.bottom.call(this);

    for (var i = 0; i < this.fishes.length; ++i) {
      if(this.fishes[i].behind_the_rope) {
        this.fishes[i].draw(this.ctx);
      }
    }

    this.static.drawRope.call(this);

    for (var i = 0; i < this.fishes.length; ++i) {
      if(!this.fishes[i].behind_the_rope) {
        this.fishes[i].draw(this.ctx);
      }
    }

    this.static.drawCrabsAndStars.call(this);
    this.static.drawFrame.call(this);
  };

  this._cache = { crabs: [], stars: [] };

  this.static = new Object();

  this.startClouds = function() {
    var w = this.canvas.width,
      h = this.config.objects.water,
      x = 0, y = 60,
      // TODO make the count dependent on the width canvas
      cc = rand(5,7), // clouds count
      cloud = null,
      dir = Math.round(Math.random()) ? 'left' : 'right';

    for (var i = 0; i < cc; ++i) {
      cloud = new Cloud(rand(0, w), rand(60, h-50));
      cloud.behind_the_sun = false;
      cloud.setImage(rand(1,2));
      cloud.move(dir);
      this.clouds.push(cloud);
    }
  };
  
  this.drawSun = function() {
    this.ctx.drawImage(images['sun.png'], 100, 65);
  };

  this.static.drawFrame = function() {
    var w = this.canvas.width/2,
      h = this.canvas.height,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h),
      x = 0, y = 0, r = 20;

    gradient.addColorStop(0,'01afd1');
    gradient.addColorStop(1,'01519a');

    this.ctx.fillStyle = gradient;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    this.ctx.lineTo(w, y);
    this.ctx.lineTo(w, y + 60);
    this.ctx.lineTo(x + 20 + r, y + 60);
    this.ctx.quadraticCurveTo(x + 20, y + 60, x + 20, y + 60 + r);
    this.ctx.lineTo(x + 20, h - 20 - r);
    this.ctx.quadraticCurveTo(x + 20, h - 20, x + 20 + r, h - 20);
    this.ctx.lineTo(w, h - 20);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(x, h);
    this.ctx.lineTo(x, y);

    this.ctx.closePath();
    this.ctx.fill();


    this.ctx.beginPath();
    this.ctx.moveTo(w*2, y);

    w --;
    this.ctx.lineTo(w, y);
    this.ctx.lineTo(w, y + 60);
    this.ctx.lineTo(w*2 - 20 - r, y + 60);
    this.ctx.quadraticCurveTo(w*2 - 20, y + 60, w*2 - 20, y + 60 + r);
    this.ctx.lineTo(w*2 - 20, h - 20 - r);
    this.ctx.quadraticCurveTo(w*2 - 20, h - 20, w*2 - 20 - r, h - 20);
    this.ctx.lineTo(w, h - 20);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(w*2, h);
    this.ctx.lineTo(w*2, y);

    this.ctx.closePath();
    this.ctx.fill();
  };

  this.static.drawCrabsAndStars = function() {
    var sand_height = this.config.options.sand_height,
      cw = this.canvas.width, ch = this.canvas.height,
      left = 20, right = cw - 20,
      cc = this.config.options.crabs_count,
      cs = this.config.options.stars_count,
      x = null, y = null, image = {},
      crabs = this._cache.crabs,
      stars = this._cache.stars;

    // crabs
    if(!crabs.length) {
      for (var i = 0; i < cc; ++i) {
        image = {};
        image.image = images['crab'+rand(1,2)+'.png'];
        image.x = rand(left, right);
        image.y = rand(ch - 20 - sand_height, ch - 20);
        this.ctx.drawImage(image.image, image.x, image.y);
        this._cache.crabs.push(image);
      }
    } else {
      for (var i = 0; i < crabs.length; ++i) {
        image = crabs[i].image;
        x = crabs[i].x; y = crabs[i].y;
        this.ctx.drawImage(image, x, y);
      }
    }

    // stars
    if(!stars.length) {
      for (var i = 0; i < cc; ++i) {
        image = {};
        image.image = images['star'+rand(1,4)+'.png'];
        image.x = rand(left, right);
        image.y = rand(ch - 20 - sand_height, ch - 20);
        this.ctx.drawImage(image.image, image.x, image.y);
        this._cache.stars.push(image);
      }
    } else {
      for (var i = 0; i < stars.length; ++i) {
        image = stars[i].image;
        x = stars[i].x; y = stars[i].y;
        this.ctx.drawImage(image, x, y);
      }
    }
  };

  this.static.drawSky = function() {
    var ratio = this.config.options.ratio_sky_water,
      w = this.canvas.width - 40,
      h = Math.round((this.canvas.height - 80) * ratio),
      x = 20, y = 60,
      x1 = this.canvas.width/2, y1 = h/2 + 100 + 60, r1 = 0,
      x2 = this.canvas.width/2, y2 = h/2 + 100 + 60, r2 = 500,
      gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.75, "#87F1FF");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);
  };

  this.static.drawIsland = function() {
    var image = images['island.png'],
      x = this.config.objects.island[0],
      y = this.config.objects.island[1];
    this.ctx.drawImage(image, x, y);
  };

  this.startWaves = function() {
    var w = this.canvas.width,
      water = this.config.objects.water,
      positions = this.config.objects.waves,
      waves = [
        { i: images['wave1.png'], w: 25, h: 63, x: 0, y: positions[0] },
        { i: images['wave2.png'], w: 50, h: 48, x: 0, y: positions[1] },
        { i: images['wave3.png'], w: 24, h: 44, x: 0, y: positions[2] }
      ], new_wave = {}, w = {};

    for (var i = 0; i < waves.length; i++) {
      w = waves[i];
      new_wave = new Wave(w.x, w.y, w.w, w.h);
      new_wave.setImage(i+1);
      new_wave.move('left');
      this.waves.push(new_wave);
    }
  };

  this.static.drawBoat = function() {
    var image = images['ship.png'],
      x = this.config.objects.rope - 100,
      y = this.config.objects.boat - 95;
    this.ctx.drawImage(image, x, y);
  };

  this.static.drawRope = function() {
    var image = images['rope.png'],
      x = this.config.objects.rope,
      y = this.config.objects.water;
    this.ctx.drawImage(image, x, y);
  };

  this.static.drawSea = function() {
    var w = this.canvas.width - 40,
      h = this.canvas.height - this.config.objects.water - 20,
      y = this.config.objects.water,
      gradient = this.ctx.createLinearGradient(0, y, 0, h);

    gradient.addColorStop(0,'85e2ff');
    gradient.addColorStop(.1,'85e2ff');
    gradient.addColorStop(.2,'7cd9f8');
    gradient.addColorStop(1,'1873c4');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(20, y, w, h);
  };

  this.static.bottom = function() {
    var left = {i: images['sand_left.png'], w: 358, h: 71},
      center = {i: images['sand_center.png'], w: 19, h: 71},
      right = {i: images['sand_right.png'], w: 347, h: 71};

    left.x = 20;
    left.y = this.canvas.height - (left.h + 20);

    center.x = left.x + left.w;
    center.y = left.y;

    right.x = this.canvas.width - (right.w + 20);
    right.y = this.canvas.height - (right.h + 20);

    this.ctx.drawImage(left.i, left.x, left.y);

    var count = Math.ceil((right.x - (left.x + left.w)) / center.w);
    for (var i = 0; i < count; ++i) {
      this.ctx.drawImage(center.i, center.x + center.w * i, center.y);
    }

    this.ctx.drawImage(right.i, right.x, right.y);
 }
}


var Cloud = (function(_super) {
  extend(Cloud, _super);

  function Cloud() {
    return Cloud.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Cloud.prototype, {
    setImage: function(id) {
      this.image = images['cloud'+id+'.png'];
      //this.x = this.x - this.width / 2
      //this.y = this.y - this.height / 2
      bg.ctx.drawImage(this.image, this.x, this.y);
    },

    move: function(dir) {
      var speed = app.config.speed.clouds + rand(-5, 10),
        interval = 1000 / speed,
        w = bg.canvas.width;

      setInterval(function() {
        if(dir === 'left') {
          if(this.x < -50) {
            this.x = w + 50;
          } else {
            this.x --;
          }
        } else {
          if(this.x > w + 50) {
            this.x = -50;
          } else {
            this.x ++;
          }
        }
      }.bind(this), interval);
    }
  });

  return Cloud;
})(Thing);


var Wave = (function(_super) {
  extend(Wave, _super);

  function Wave() {
    this.start_position = arguments[0];
    this.width = arguments[2];
    this.height = arguments[3];
    return Wave.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Wave.prototype, {
    setImage: function(id) {
      this.type = id || 1;
      this.image = images['wave'+id+'.png'];
      bg.ctx.drawImage(this.image, this.x, this.y);
    },

    move: function(dir) {
      var speed = app.config.speed.waves[this.type-1] + rand(-1, 2),
        interval = 1000 / speed,
        start = this.start_position,
        offset = this.width;

      setInterval(function() {
        if(dir === 'left') {
          if(this.x > start - offset) {
            this.x --;
          } else {
            this.x = start;
          }
        } else {
          if(this.x < start + offset) {
            this.x ++;
          } else {
            this.x = start;
          }
        }
      }.bind(this), interval);
    },

    // overwrite prototype draw method
    // for performance reasons should choose image with bigger size
    draw: function() {
      var w = bg.canvas.width,
        count = Math.ceil(w / this.width) + 3;

      for (var i = 0; i < count; ++i) {
        bg.ctx.drawImage(this.image, this.x + this.width * i, this.y);
      }
    }
  });

  return Wave;
})(Thing);
