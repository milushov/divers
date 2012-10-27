function Background(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('bg init');

    Object.extend(this.config, {
      speed: {
        clouds: 10,
        fish: 30,
        waves: [2, 6, 10]
      },

      objects: {
        water: null,
        waves: [],
        island: null
      },

      options: {
        sand_height: 80,
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

    this.wind = Math.round(Math.random()) ? 'left' : 'right';
    this.startClouds();
    this.startWaves();
    this.startFishes();
  };

  function getWaterY() {
    var ratio = this.config.options.ratio_sky_water;
    return Math.round((this.canvas.height - (60 + 20)) * ratio) + 60;
  }

  function getWavesY() {
    var water = this.config.objects.water;
    return [water - 15, water, water + 15];
  }

  function getIslandCoords() {
    var water = this.config.objects.water,
      x = Math.ceil((this.canvas.width - 40) / 5) + 20,
      y = water - 53;
    return [x, y];
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
      dir = this.wind;

    for (var i = 0; i < cc; ++i) {
      cloud = new Cloud(rand(0, w), rand(60, h-50));
      cloud.behind_the_sun = false;
      cloud.setImage(rand(1,2));
      cloud.move(dir);
      this.clouds.push(cloud);
    }
  };

  this.startFishes = function() {
    var w = this.canvas.width;
      new_fish = {},
      fl = rand(2,4),
      fr = rand(1,2);

    for (var i = 0; i < fl; ++i) {
      new_fish = new Fish('left');
      new_fish.start();
      this.fishes.push(new_fish);
    }

    for (var i = 0; i < fr; ++i) {
      new_fish = new Fish('right');
      new_fish.start();
      this.fishes.push(new_fish);
    }
  };

  this.drawSun = function() {
    var x = Math.ceil((this.canvas.width - 40) / 7) + 20,
      y = Math.ceil((this.config.objects.water - 60)/3) + 60;
    this.ctx.drawImage(images['sun.png'], x, y);
  };

  this.static.drawFrame = function() {
    var w = Math.floor(this.canvas.width/2),
      h = this.canvas.height,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h),
      x = 0, y = 0, r = 20;

    gradient.addColorStop(0,'02b0cf');
    gradient.addColorStop(1,'014f96');

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
        image.x = rand(left + 30, right - 30);
        image.y = rand(ch - 20 - sand_height, ch - 40);
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
      x1 = this.canvas.width/2, y1 = h/2 + 120 + 60, r1 = 0,
      x2 = this.canvas.width/2, y2 = h/2 + 120 + 60, r2 = Math.round(w/2),
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
        { i: images['wave1.png'], w: 271, h: 33, x: -300, y: positions[0] },
        { i: images['wave2.png'], w: 247, h: 25, x: -300, y: positions[1] },
        { i: images['wave3.png'], w: 295, h: 28, x: -300, y: positions[2] }
      ], new_wave = {}, w = {},
      dir = this.wind;

    for (var i = 0; i < waves.length; i++) {
      w = waves[i];
      new_wave = new Wave(w.x, w.y, w.w, w.h);
      new_wave.setImage(i+1);
      new_wave.move(dir);
      this.waves.push(new_wave);
    }
  };

  this.static.drawBoat = function() {
    var image = images['ship.png'],
      x = this.config.objects.rope - 77,
      y = this.config.objects.boat - 85;
    this.ctx.drawImage(image, x, y);
  };

  this.static.drawRope = function() {
    var image = images['rope.png'],
      x = this.config.objects.rope,
      y = this.config.objects.water - 23;
    this.ctx.drawImage(image, x, y);
  };

  this.static.drawSea = function() {
    var w = this.canvas.width - 40,
      h = this.canvas.height - this.config.objects.water - 20,
      y = this.config.objects.water + 43,
      gradient = this.ctx.createLinearGradient(0, y, 0, h);

    gradient.addColorStop(0,'85e2ff');
    gradient.addColorStop(1,'1b6bc1');
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


var Fish = (function(_super) {
  extend(Fish, _super);

  function Fish(dir) {
    this.points = new Array();
    var dir = (dir === 'left') ? 'left' : 'right',
      dots = this.routes[dir][rand(0, this.routes[dir].length-1)];

    this.image = images['fish_'+dir+'_'+((dir==='left')?rand(1,2):1)+'.png'];

    var data = dots.split('x'),
      point = null,
      width = bg.canvas.width, // FIXME proper width and height
      height = bg.canvas.height;

    // saving points to this
    for (var i = 1; i < data.length; ++i){
      var point = data[i].split('y');
      this.points.push({
        x: parseFloat((width/parseFloat(point[0])).toFixed(2)),
        y: parseFloat((height/parseFloat(point[1])).toFixed(2))
      });
    }

    this.x = this.points[0].x;
    this.y = this.points[0].y;

    return Fish.__super__.constructor.apply(this, [this.x, this.y]);
  };

  Object.extend(Fish.prototype, {
    start: function(dir) {
      var speed = app.config.speed.fish,
        speed = rand(speed-10, speed+10),
        interval = 1000 / speed,
        steps = 250,
        step = 0;

      setInterval(function() {
        var epoch = step/steps;
        var point = getPointBetween.call(this, epoch, this.points);

        this.x = point.x;
        this.y = point.y;

        step ++;
      }.bind(this), interval);

      // recursively determines the epoch point
      function getPointBetween(epoch, points){
        var foundPoints = [],
          point = {x: 0, y: 0}; // tempt point

        if (points.length > 1) {
          for (var i = 0; i < points.length - 1; ++i) {
            point = {};

            //B(t) = P0 + t(P1 - P0)
            point.x = points[i].x + epoch * (points[i + 1].x - points[i].x);
            point.y = points[i].y + epoch * (points[i + 1].y - points[i].y);

            foundPoints.push(point);
          }

          //Recurse with new points
          return getPointBetween.call(this, epoch, foundPoints);
        } else {
          return points[0];
        }
      }
    },

    routes: {
      left: [
        'x1.02y12.15x1.2y7.72x1.05y2.28x1.3y2.86x1.83y3.42x1.51y1.94x1.07y1.67x1.08y1.3x1.36y1.13x1.93y1.19x1.43y1.55x2.32y1.6x2.14y1.98x2.11y4.23x3y4.82x3.16y1.91x2.82y1.38x1.69y1.67x2.7y1.15x6.35y1.08x11.43y1.42x38.1y1.34',
        'x1.07y1.85x1.29y1.1x1.62y1.23x1.4y1.52x1.66y1.81x1.18y2.65x1.75y6.37x1.32y7.54x2.65y9.94x2.6y3.51x1.66y2.79x1.91y1.79x3.15y1.2x1.86y1.15x4.48y1.75x16.93y1.4x24.79y1.96',
        'x1.01y1.14x1.56y1.11x1.16y1.4x1.34y1.87x1.14y2.52x1y3.26x1.58y3.31x2.42y3.42x1.46y2.32x1.61y1.75x2.39y1.56x3.4y2.25x5.67y3.04x4.61y1.36x8.77y2.1x14.17y1.13x184.25y3',
        'x1.04y1.33x1.11y1.13x1.66y1.09x1.39y1.36x1.25y1.94x1.71y7.27x2.15y1.89x2.3y1.2x4.59y1.06x76.7y1.25',
        'x1.05y1.92x1.22y1.77x1.29y5.7x2.05y1.18x3.37y1.61x2.57y3x172.5y4.02'
      ],

      right: [
        'x21.2y1.24x8.71y2.6x3.16y1.19x2.8y2.13x2.36y3.17x4.1y2.69x2.01y1.22x1.4y2.34x1.42y4.4x1.09y1.52x1.05y1.95',
        'x17.89y2.53x6.64y1.09x2.79y1.06x5.92y1.45x3.43y1.73x28.38y4.02x2.88y6.19x2.84y2.24x2.42y1.2x2.04y2.52x2.02y1.09x1.56y1.45x1.22y2.33x1.59y3.25x1.68y1.85x1.3y1.21x1.16y1.6x1.06y1.19x1y1.48',
        'x84.56y1.11x4.53y1.07x8.01y1.44x2.56y1.17x23.06y3x2.7y1.64x2.05y2.24x1.85y1.26x1.56y1.04x1.18y1.11x1.22y1.43x1.47y1.82x1.19y2.85x1.08y2.38x1.05y1.85x1.05y1.19x1.03y1.08x1y1.15',
        'x36.06y7.29x7.38y1.19x3.16y1.19x3.19y1.63x2.56y2.54x1.62y4x1.98y1.53x1.44y1.2x1.18y1.2x1.02y1.1',
        'x144.25y2.08x8.01y5.05x2.79y2.82x6.14y1.74x2.66y1.5x1.58y1.93x1.19y1.99x1.44y1.2x1.18y1.2x1.01y1.78'
      ]
    }
  });

  return Fish;
})(Thing);
