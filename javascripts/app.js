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
      star: debug ? 900 : 80,
      diver: debug ? 800 : 20,
      air: debug ? .25 : .05,
      air_speed_with_star: debug ? .01 : .001
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
      1: { y: objs.bottom - emersion_height * 1/3, time: debug ? 500 : 5000 },
      2: { y: objs.bottom - emersion_height * 2/3, time: debug ? 1000 : 10000 },
      3: { y: objs.bottom - emersion_height * 4/5, time: debug ? 1500 : 15000 }
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

  this.deleteDiver = function() {
    if(app.boat.length !== 0) {
      last_diver = app.boat.pop();
      last_diver.stopBreathe();
      ind = app.divers.indexOf(last_diver);
      app.divers.splice(ind, 1);
    }
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

      if(this.divers[i].wait) {
        var d = this.divers[i],
          w = d.wait;
        app.ctx.drawImage(w, d.x - 100, d.y - 50);
      }

      if(app.stars_on_board > 0) {
        var s = app.stars_on_board_image,
          x = app.config.objects.rope,
          y = app.config.objects.boat;

        app.ctx.drawImage(s, x + 27, y - 75);
      }
    }
  };

  this.showStarsOnBoardImage = function() {
    this.stars_on_board_image = new Image()
    this.stars_on_board_image.src = 'images/stars/ship-load.png';
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

    setInterval(function() {
      if(this.boat.length !== 0) {
        diver = this.boat[0];
        diver.stopBreathe();
        need_air = air_diver - diver.air; // 20 - 7

        // if diver is need air greater than compressor can generate per one minute
        if(need_air >= air_compressor) {
          diver.air += air_compressor;
        } else {
          rest_air = air_compressor - need_air;
          diver.air += need_air;

          // throw out diver overboard
          this.boat.splice(0, 1);
          diver.setImage('up');
          diver.breathe();
          diver.ducking();

          // give the rest part of air to next diver if he is on the board
          if(this.boat.length !== 0) {
            diver = this.boat[0];
            need_air = air_diver - diver.air;
            if(need_air <= rest_air) {
              diver.air += rest_air;
            }
          }
        }
      }
    }.bind(this), 1000); 
  };

  this.updateRating = function() {
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
          throw new Error('rating not set');
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
      var speed = app.config.speed.star,
        interval = 1000 / speed,
        startX = this.x,
        position = this.x,
        amplitude = Math.round(Math.random()*10+3),
        rand_botton = app.config.objects.bottom +
        Math.round(Math.random()*20)-10;
      var intr = setInterval(function() {
        if(this.y <= rand_botton) {
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
    this.stars = [];
    this.checklist = { 1: false, 2: false, 3:false };
    this.intr_id = null;
    this.breathe_intr_id = null;
    this.start_emersion = false;
    return Diver.__super__.constructor.apply(this, arguments);
  }


  Object.extend(Diver.prototype, {
    width: 46,
    height: 73,
    dirs: ['up', 'left', 'right'],
    air: 20,
    cur_part: 1,

    setImage: function(dir) {
      if(typeof dir === 'undefined' || this.dirs.indexOf(dir) === -1) {
          throw new Error('dir not set');
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

      // compensation star rating
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

        if(this.checklist[this.cur_part]) {
          if(this.cur_part < this.checklist.size()) this.cur_part ++;
        }

        if(this.y >= app.config.objects.boat) {
          if( eql(this.y, parts[this.cur_part].y) && !this.checklist[this.cur_part] ) {
            this.stop();
            this.checklist[this.cur_part] = true;
            this.toggleWaitBubble();
            setTimeout(function(){
              this.toggleWaitBubble();
              this.emersion();
            }.bind(this), parts[this.cur_part].time);
          } else {
            this.y --;
            this.withStar();
          }
        } else {
          this.stop();
          app.boat.push(this);
          this.dump();
          app.showStarsOnBoardImage();
        }
      }.bind(this), interval);
    },

    toggleWaitBubble: function() {
      if(this.wait) {
        this.wait = null;
      } else {
        this.wait = new Image();
        this.wait.src = 'images/thought.png';
      }
    },

    breathe: function() {
      var speed = app.config.speed.air,
        interval = 1000,
        asws = app.config.speed.air_speed_with_star;
      this.breathe_intr_id = setInterval( function() {
        console.log(this.id + '  ' + this.air);
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
            throw new Error('diver have too much stars on hands');
          }
        } else {
          this.stopBreathe();
          console.log('diver' + this.id + ' died..');
        }
      }.bind(this), interval);
    },

    stopBreathe: function() {
      // i mean stopping breath process only from air balloon of course :-)
      // i don't want to kill diver
      clearInterval(this.breathe_intr_id);
      this.breathe_intr_id = null;
    },

    goToStar: function(id) {
      this.stop();
      var star = app.stars.find(id);
      if(!star) {
        throw new Error('star not found');
        return false;
      }
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
            this.pickUp(star.id);
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
            this.pickUp(star.id);
          }
        }.bind(this), interval);
      }
    },

    goHome: function() {
      this.stop();
      var speed = app.config.speed.diver,
        interval = 1000 / speed,
        home = app.config.objects.rope;
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
      if(typeof(star) === 'number') {
        if(app.stars.find(star)) {
          star = app.stars.find(star);
        } else {
          throw new Error('star not found');
          return false;
        }
      }
      star_ind = app.stars.indexOf(star);
      app.stars.splice(star_ind, 1);
      this.stars.push(star);
      this.goHome();
    },

    drop: function(star) {
      if(typeof(star) === 'number') {
        if(this.stars.find(star)) {
          star = this.stars.find(star);
        } else {
          throw new Error('star not found');
        }
      } else if(typeof(star) == 'string') {
        if(star === 'first') {
          star = this.stars[0];
        } else if(star === 'second') {
          star = this.stars[1];
        } else {
          throw new Error('wrong argument');
        }
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
      app.updateRating();
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
