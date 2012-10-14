window.onload = function() {
  app = new App(isDebug()); // parametr true enables debug mode
  app.init();
  app.load();
  app.animate();
  app.compressor();
};

function App(debug) {
  this.debug = debug || false;

  this.config = {
    speed: {
      star: debug ? 350 : 80,
      diver: debug ? 200 : 20,
      air: .05,
      air_speed_with_star: .001
    },

    objects: {
      bottom: 0, // y coord of bottom
      rope: 0, // x coord of rope
      boat: 170, // y coord of boat 
      emersion_parts: null
    },

    options: {
      for_star: .05, // the amount of air, which need for emersing with star
      for_ballast: .05, // ... which need for compensation balast
      air_diver: 20, // the amount of air in diver's ballone (in litres)
      air_compressor: 3 // the amount of air per second (in litres)
    }
  };

  this.init = function() {
    console.log('app init');

    this.canvas = document.getElementById('app');
    this.ctx = this.canvas.getContext('2d');
    var objs = this.config.objects;
    objs.bottom = this.canvas.height - 70;
    objs.rope = this.canvas.width - 150;
    var emersion_height = objs.bottom - objs.boat;
    objs.emersion_parts = {
      1: { y: objs.bottom - emersion_height * 1/3, time: 5000 },
      2: { y: objs.bottom - emersion_height * 2/3, time: 10000 },
      3: { y: objs.bottom - emersion_height * 4/5, time: 15000 }
    }

    /* this is NOT jQuery :-) */
    $('#add-diver').addEventListener('click',
      function(){ app.addDiver.apply(this) }
    );
    $('#delete-diver').addEventListener('click',
      function(){ app.deleteDiver.apply(this) }
    );

    this.canvas.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    }, false);

    this.canvas.addEventListener('mousedown',
      this.addStar.bind(this)
    );

    this.divers = new Array();
    this.stars = new Array();
    this.boat = new Array();
    this.stars_on_board = 0;
    this.stars_rating = 0;
    this.info = {
      rating: $('#rating'),
      count: $('#count')
    };
  };

  this.addStar = function(event) {
    var x = event.layerX;
    var y = event.layerY;
    var rating = Math.round(Math.random()*9+1);
    var new_star = new Star(x, y, 46, 43);
    new_star.setImage(rating);
    app.stars.push(new_star);
  };

  this.addDiver = function() {
    var x = app.config.objects.rope;
    var y = app.config.objects.boat;
    var new_diver = new Diver(x, y);
    new_diver.setImage('up');
    new_diver.ducking();
    new_diver.breathe();
    app.divers.push(new_diver);
  };

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.clear();
    this.draw();
  };

  this.draw = function() {
    for (var i = 0; i < this.stars.length; ++i) {
      this.stars[i].draw();
    }

    for (var i = 0; i < this.divers.length; ++i) {
      this.divers[i].draw();
      if(this.divers[i].stars.length !== 0) {
        for (var j = 0; j < this.divers[i].stars.length; j++) {
          this.divers[i].stars[j].draw();
        }
      }
    }
  };
  
  this.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.compressor = function() {
    var air_diver = app.config.options.air_diver,
      air_compressor = app.config.options.air_compressor,
      diver = null,
      need_air = null,
      rest_first = null,
      rest_last = null;

    var intr = setInterval(function() {
      if(this.boat.length !== 0) {
        diver = this.boat[0];
        need_air = air_diver - diver.air;

        if(need_air >= air_compressor) {
          diver.air += air_compressor;
        } else {
          rest_first = air_compressor - need_air;
          rest_last = air_compressor - rest_first;
          diver.air += rest_first;

          // throw out diver overboard
          this.boat.splice(0, 1);
          diver.setImage('up');
          diver.ducking();
          diver.breathe();

          // give the rest part of air to next diver if he is on the board
          if(this.boat.length !== 0) {
            diver = this.boat[0];
            need_air = air_diver - diver.air;
            if(need_air <= rest_last) {
              diver.air += rest_last;
            }
          }
        }
      }
    }.bind(this), 1000); 
  };

  this.updateRatin = function() {
    this.info.rating.innerHTML = this.stars_rating;
    this.info.count.innerHTML = this.stars_on_board;
  };

  this.load = function(act) { /* if set act we skip loading */
    if(act || __images.length === 0) return false;

    var cover = document.createElement('div'),
      wwh = window.wwh(),
      images = __images,
      counter = 0;

    cover.id = 'cover';
    cover.style.width = wwh[0]+'px';
    cover.style.height = wwh[1]+'px';
    $('body').appendChild(cover);

    for (var i = 0; i < images.length; ++i) {
      var img = new Image();
      img.onload = function() {
        counter ++;
        if(counter === images.length - 1) {
          $('body').removeChild($('#cover'));
        }
      }
      img.src = images[i];
    }
  };
};


var Thing = (function() {
  function Thing(x, y) {
    this.id = getId();
    this.x = x;
    this.y = y;
  };

  Object.extend(Thing.prototype, {
    id: null,
    x: 0,
    y: 0,
    draw: function() {
      app.ctx.drawImage(this.image, this.x, this.y);
    }
  });

  return Thing;
})();


var Star = (function(_super) {
  extend(Star, _super);

  function Star() {
    return Star.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Star.prototype, {
    width: 46,
    height: 43,
    setImage: function(rating) {
      if(typeof rating === 'undefined') {
          throw { message: 'rating not set', code: 1 }
          this.rating = 1;
        }
        this.rating = rating;
        this.image = new Image();
        this.image.src = 'images/stars/tf-star' + rating + '.png';
        this.image.onload = function() {
          this.x = this.x - this.width / 2
          this.y = this.y - this.height / 2
          app.ctx.drawImage(this.image, this.x, this.y);
          this.fall();
      }.bind(this) // bind context of star object to onload handler
    },

    fall: function() {
      var speed = app.config.speed.star;
      var interval = 1000 / speed;
      var startX = this.x;
      var position = this.x;
      var amplitude = Math.round(Math.random()*10+3);
      var intr = setInterval(function() {
        if(this.y <= app.config.objects.bottom) {
          startX += .1;
          this.x = position + Math.sin(startX) * amplitude;
          this.y ++;
        } else {
          clearInterval(intr);
        }
      }.bind(this), interval);
    }
  });

  return Star;
})(Thing);


var Diver = (function(_super) {
  extend(Diver, _super);

  function Diver() {
    return Diver.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Diver.prototype, {
    width: 46,
    height: 73,
    dirs: ['up', 'left', 'right'],
    air: 20,
    stars: [],
    checklist: { 1: false, 2: false, 3:false },
    intr_id: null,
    start_emersion: false,

    setImage: function(dir) {
      if(typeof dir === 'undefined' || this.dirs.indexOf(dir) === -1) {
          throw { message: 'dir not set', code: 2 }
          this.dir = 'up';
        }
        this.dir = dir;
        this.image = new Image();
        this.image.src = 'images/divers/' + this.dir + '.png';
        this.image.onload = function() {
          //this.x = this.x - this.width / 2
          //this.y = this.y - this.height / 2
          app.ctx.drawImage(this.image, this.x, this.y);
      }.bind(this) // bind context of star object to onload handler
    },

    ducking: function() {
      this.stop();
      var speed = app.config.speed.diver;
      var interval = 1000 / speed;
      this.intr_id = setInterval(function() {
        if(this.y <= app.config.objects.bottom) {
          this.y ++;
        } else {
          this.stop();
        }
      }.bind(this), interval);
    },

    emersion: function() {
      this.stop();
      var speed = app.config.speed.diver,
        interval = 1000 / speed,
        parts = app.config.objects.emersion_parts,
        fb = app.config.options.for_ballast,
        fs = app.config.options.for_star;

      if(!this.start_emersion) {
        if(this.stars.length === 2) {
          this.air -= this.stars[0].rating * fs + this.stars[1].rating * fs + fb;
        } else if(this.stars.length === 1) {
          this.air -= this.stars[0].rating * fs + fb;
        } else {
          this.air -= fb;
        }
        this.start_emersion = true;
      }

      this.intr_id = setInterval(function() {
        if(this.y >= app.config.objects.boat) {
          if( eql(this.y, parts[1].y) && !this.checklist[1]) {
            clearInterval(this.intr_id);
            this.checklist[1] = true;
            intr = setInterval(function(){
              this.emersion();
            }.bind(this), parts[1].time);
          } else if( eql(this.y, parts[2].y) && !this.checklist[2]) {
            clearInterval(this.intr_id);
            this.checklist[2] = true;
            intr = setInterval(function(){
              this.emersion();
            }.bind(this), parts[2].time);
          } else if( eql(this.y, parts[3].y) && !this.checklist[3]) {
            clearInterval(this.intr_id);
            this.checklist[3] = true;
            intr = setInterval(function(){
              this.emersion();
            }.bind(this), parts[3].time);
          } else {
            this.y --;
            this.withStar();
          }
        } else {
          this.stop();
          app.boat.push(this);
          this.dump();
        }
      }.bind(this), interval);
    },

    breathe: function() {
      var speed = app.config.speed.air,
        interval = 1000,
        asws = app.config.speed.air_speed_with_star;
      var intr = setInterval( function() {
        if(this.air >= 0) {
          if(this.stars.length === 2) {
            this.air -= speed +
              this.stars[0].rating * asws +
              this.stars[1].rating * asws;
          } else if(this.stars.length === 1) {
            this.air -= speed +
              this.stars[0].rating * asws;
          } else if(this.stars.length === 0) {
            this.air -= speed;
          } else {
            throw { message: 'diver have too much stars on hands', code: 3 }
          }
        } else {
          clearInterval(intr);
          console.log('diver died..');
        }
      }.bind(this), interval);
    },

    goToStar: function(id) {
      this.stop();
      var star = app.stars.find(id);
      var speed = app.config.speed.diver;
      var interval = 1000 / speed;
      if(this._star_left(star)) {
        this.setImage('left');
        this.intr_id = setInterval(function() {
          if(this.x >= star.x) {
            this.x --;
            this.withStar();
          } else {
            this.stop();
            this.pickUp(star);
          }
        }.bind(this), interval);
      } else {
        this.setImage('right');
        this.intr_id = setInterval(function() {
          if(this.x <= star.x) {
            this.x ++;
            this.withStar();
          } else {
            this.stop();
            this.pickUp(star);
          }
        }.bind(this), interval);
      }
    },

    goHome: function(id) {
      this.stop();
      var star = app.stars.find(id);
      var speed = app.config.speed.diver;
      var interval = 1000 / speed;
      var home = app.config.objects.rope;
      if(this._home_right()) {
        this.setImage('right');
        this.intr_id = setInterval(function() {
          if(this.x <= home) {
            this.x ++;
            this.withStar();
          } else {
            this.stop();
            this.emersion();
          }
        }.bind(this), interval);
      } else {
        this.setImage('left');
        this.intr_id = setInterval(function() {
          if(this.x >= home) {
            this.x --;
            this.withStar();
          } else {
            this.stop();
            this.emersion();
          }
        }.bind(this), interval);
      }
    },

    _star_left: function(star) {
      if(this.x > star.x) {
        return true;
      } else {
        return false;
      }
    },

    _home_right: function() {
      if(this.x < app.config.objects.rope) {
        return true;
      } else {
        return false;
      }
    },

    stop: function() {
      clearInterval(this.intr_id);
      this.intr_id = null;
    },

    pickUp: function(star) {
      if(typeof(star) === 'number' && app.stars.find(star)) {
        star = app.stars.find(star);
      }
      star_ind = app.stars.indexOf(star);
      app.stars.splice(star_ind, 1);
      this.stars.push(star);
      this.goHome();
    },

    drop: function(star) {
      if(typeof(star) === 'number' && this.stars.find(star)) {
        star = this.stars.find(star);
      }
      star_ind = this.stars.indexOf(star);
      this.stars.splice(star_ind, 1);
      app.stars.push(star);
      star.fall();
    },

    dump: function() {
      if(this.stars.length) {
        for(var i = 0; i < this.stars.length; ++i) {
          app.stars_on_board ++;
          app.stars_rating += this.stars[i].rating;
        }
        this.stars = []; // FIXME
      }
      app.updateRatin();
    },

    withStar: function() {
      if(this.stars.length) {
        for (var i = 0; i < this.stars.length; ++i) {
          this.stars[i].x = this.x + i * 10;
          this.stars[i].y = this.y;
        };
      }
    }
  });

  return Diver;
})(Thing)
