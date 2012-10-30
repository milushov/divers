/*
 * author Milushov Roman
 * vk.com/milushov
 */

window.onload = function() {
  (function() {
    var debug = isDebug();

    var config = {
      speed: {
        star: debug ? 900 : 80,
        diver: debug ? 800 : 20,
        air: debug ? .25 : .05,
        air_speed_with_star: debug ? .01 : .001
      },

      objects: {
        bottom: 0, // y coord of bottom
        rope: null, // x coord of rope
        boat: null, // y coord of boat
        emersion_parts: null
      },

      options: {
        for_star: .05, // the amount of air, which need for emersing with star
        for_ballast: .05, // ... which need for compensation balast
        air_diver: 20, // the amount of air in diver's ballone (in litres)
        air_compressor: 3, // the amount of air per second (in litres)
        width_view: null, // will be set on start
        min_width: 762,
        min_height: debug ? 350 : 685, // because my display small :-(
        ratio_sky_water: 1/6
      }
    };

    app = new App(config, debug);
    app.load(function() {
      //bg = new Background(config, debug);
      //bg.init();
      //bg.animate();

      app.init();
      app.animate();
      app.compressor();
      app.addDiver();

      ai = new Ai();
      ai.init();
    });
  })()
};

function App(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('app init');

    this.canvas = document.getElementById('app');
    this.canvas.width = wwh()[0];
    this.canvas.height = wwh()[1];
    this.ctx = this.canvas.getContext('2d');
    var objs = this.config.objects;
    objs.bottom = this.canvas.height - 70;
    objs.rope = this.canvas.width - Math.round((this.canvas.width - 40) / 5) + 20;

    var ratio = this.config.options.ratio_sky_water;
    objs.boat = Math.round((this.canvas.height - (60 + 20)) * ratio) + 60;

    var em = objs.bottom - objs.boat; // emersion height
    objs.emersion_parts = {
      1: { y: objs.bottom - em * 1/3, time: debug ? 500 : 5000 },
      2: { y: objs.bottom - em * 2/3, time: debug ? 1000 : 10000 },
      3: { y: objs.bottom - em * 4/5, time: debug ? 1500 : 15000 }
    }
    this.config.options.width_view = this.canvas.width * 1/3;

    $('#menu').style.width = this.canvas.width + 'px';// get it!!1

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
      rating: $('#rating span'),
      count: $('#count span')
    };
  };

  this.addStar = function(event) {
    var x = event.layerX || event.offsetX,
      y = event.layerY || event.offsetY,
      rating = Math.round(Math.random()*9+1),
      new_star = new Star(x, y, 46, 43);

    new_star.setImage(rating);
    app.stars.push(new_star);
  };

  this.addDiver = function() {
    var x = app.config.objects.rope,
      y = app.config.objects.boat,
      new_diver = new Diver(x, y);

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
    this.stars_on_board_image = images['ship-load.png'];
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

        // if diver is need air greater than
        // compressor can generate per one minute
        if(need_air >= air_compressor) {
          diver.air += air_compressor;
        } else {
          rest_air = air_compressor - need_air;
          diver.air += need_air;

          // throw out diver overboard
          this.boat.splice(0, 1);
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
    // if first update
    if(!this.stars_on_board.length) this.showResultsPanel();
    this.info.rating.innerText = this.stars_rating;
    this.info.count.innerText = this.stars_on_board;
  };

  this.load = function(callback, act) {
    if(act || __images.length === 0) callback.call();

    var cover = document.createElement('div'),
      counter = 0;

    cover.id = 'cover';
    cover.style.width = wwh()[0]+'px';
    cover.style.height = wwh()[1]+'px';
    cover.innerHTML = ' \
      <span>Загружено изображений:</span> \
      <span id="load_percent">0%</span>';
    $('body').appendChild(cover);

    var load_percent = $('#load_percent'),
      prct = '';

    images = new Object();

    for (var i = 0; i < __images.length; i++) {
      var key = __images[i].split('/').last();
      images[key] = new Image();

      images[key].onload = function() {
        counter ++;

        prct = (parseFloat((counter/__images.length).toFixed(2)) * 100).toFixed() + '%';
        load_percent.innerHTML =  prct;
        document.title =  prct;

        if(counter === __images.length) {
          document.title = 'Водолазы';
          $('body').removeChild(cover);
          callback.call();
        }
      }

      images[key].src = __images[i];
    }
  };

  this.showResultsPanel = function() {
    var info = $('#info');
    info.children[0].style.display = 'none';
    info.style.marginTop = '-10px';
    info.style.minWidth = '175px';
    info.children[1].style.display = 'block';
    info.children[2].style.display = 'block';
  };
};


function Ai() {
  var interval = 50;

  // start loop function
  this.init = function() {
    setInterval(function() {
      if(app.stars.length) {
        for (var i = app.stars.length - 1; i >= 0 ; --i) {
          if(app.stars[i].wait) {
            this.findStar(app.stars[i]);
          }
        }
      }

    }.bind(this), interval);
  };

  // defining which diver have best position
  // for passed star and setting task for him, if he have
  this.findStar = function(star) {
    var bottom = app.config.objects.bottom,
      potential_hunters = [],
      cur_hunter = null;

    if(app.divers.length) {
      for (var i = 0; i < app.divers.length; ++i) {
        if(app.divers[i].search) {
          // if diver at the bottom
          if(app.divers[i].isOnTheBottom()) {
            if( app.divers[i].isSee(star) ) {
              'diver ' + app.divers[i].id + ' sees star ' + star.id;
              potential_hunters.push(app.divers[i]);
            }
          }

          //TODO check divers on rope
          
          //TODO select diver with most vantage position
          if(potential_hunters.length) {
            cur_hunter =  potential_hunters[0];
            // if that diver doesn't have
            // passed star in task list
            if(cur_hunter.tasks.indexOf(star.id) === -1 ) {
              cur_hunter.tasks.push(star.id);
              // TODO think about this aproach
              // (send diver to star from here in code)
              // if first star
              if(cur_hunter.tasks.length === 1) {
                cur_hunter.goToStar(star.id);
              }
            }
          } else {

          }
        }
      }
    } else {
      // TODO
      // we must not see this error, because 
      // all divers think about his air amount
      throw new Error('all dievers died :-(');
      return false;
    }
  };
}


var Star = (function(_super) {
  extend(Star, _super);

  function Star() {
    this.wait = true;
    return Star.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Star.prototype, {
    width: 46,
    height: 43,
    setImage: function(rating) {
      this.rating = rating;
      this.image = images['tf-star'+rating+'.png'];
      this.x = this.x - this.width / 2
      this.y = this.y - this.height / 2
      app.ctx.drawImage(this.image, this.x, this.y);
      this.fall();
    },

    fall: function() {
      var speed = app.config.speed.star,
        interval = 1000 / speed,
        startX = this.x,
        position = this.x,
        amplitude = Math.round(Math.random()*10+3),
        rand_botton = app.config.objects.bottom +
        Math.round(Math.random()*20)-10;

      this.intr_id = setInterval(function() {
        if(this.y <= rand_botton) {
          startX += .1;
          this.x = position + Math.sin(startX) * amplitude;
          this.y ++;
        } else {
          this.stop();
        }
      }.bind(this), interval);
    },

    stop: function() {
      clearInterval(this.intr_id);
      this.intr_id = null;
    },

    isOnTheBottom: function() {
      return (this.intr_id === null) ? true : false;
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
    this.search = true;
    this.tasks = [];
    this.on_the_bottom = false;
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
      this.image = images[this.dir + '.png'];
      app.ctx.drawImage(this.image, this.x, this.y);
    },

    ducking: function() {
      this.stop();

      this.setImage('up');
      this.search = true;
      this.checklist = { 1: false, 2: false, 3: false };
      this.cur_part = 1;
      this.start_emersion = false;
      this.on_the_bottom = false;

      var speed = app.config.speed.diver,
        interval = 1000 / speed;

      this.intr_id = setInterval(function() {
        if(this.y < app.config.objects.bottom) {
          this.y ++;
        } else {
          this.stop();
          if(this.tasks.length) {
            if(typeof this.tasks[0] === 'number') {
              this.goToStar(this.tasks[0]);
            }
          } else {
            this.on_the_bottom = true;
            this.patrol();
          }
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
          this.air -=
            this.stars[0].rating * fs +
            this.stars[1].rating * fs + fb;
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

    isOnTheBottom: function() {
      return this.on_the_bottom;
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
        //console.log(this.id + '  ' + this.air);
        if(this.air > 0) {
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
          // we never must not be here
          this.stop();
          this.stopBreathe();
          app.divers.splice(app.divers.indexOf(this), 1);
          console.log('diver ' + this.id + ' is died..');
        }
      }.bind(this), interval);
    },

    isEnoughAir: function() {
      var rope = app.config.objects.rope,
        ds = app.config.speed.diver,
        as = app.config.speed.air,
        asws = app.config.speed.air_speed_with_star,
        p = Math.abs(rope - this.x) - 20, // for path
        max_rating = 10,
        fb = app.config.options.for_ballast,
        fs = app.config.options.for_star,
        ep = app.config.objects.emersion_parts,
        epath = app.config.objects.bottom -
          app.config.objects.boat;

        star1 = this.stars[0] || max_rating;
        star2 = this.stars[1] || max_rating;

        var path = Math.ceil(p/ds) * as +
          star1 * asws +
          star2 * asws;

        var start_emersion = star1 * fs +
          star2 * fs + fb;

        var emersion = Math.ceil(epath / ds) * as +
          star1 * asws +
          star2 * asws;

        var waiting = 0;
        for(var p in ep) { if(p != 'size') waiting += ep[p].time; }
        waiting = (waiting / 1000) * as;

        var return_trip = path + start_emersion + emersion + waiting;
        console.log(return_trip);

      return (this.air > return_trip) ? true : false;
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
      var speed = app.config.speed.diver,
        interval = 1000 / speed;
      if(this._star_left(star)) {
        this.setImage('left');
        this.intr_id = setInterval(function() {
          if(this.x >= star.x) {
            this.x --;
            this.withStar();
          } else {
            act.call(this);
          }
        }.bind(this), interval);
      } else {
        this.setImage('right');
        this.intr_id = setInterval(function() {
          if(this.x < star.x) {
            this.x ++;
            this.withStar();
          } else {
            act.call(this);
          }
        }.bind(this), interval);
      }

      function act() {
        this.stop();
        if(star.isOnTheBottom()) {
          this.pickUp(star.id);
          this.defineWhatToDo();
        } else {
          this.expect(star.id);
        }
      }
    },

    defineWhatToDo: function() {
      if(this.tasks.length && this.search) {
        this.goToStar(this.tasks[0]);
      } else if(this.tasks.length === 0 && this.search) {
        this.patrol();
      } else if(!this.search) {
        this.goHome();
      }
    },

    isSee: function(star) {
      var width_view = app.config.options.width_view,
        canvas_width = app.canvas.width,
        from = (from = this.x - width_view / 2) > 0 ? from : 0,
        to = (canvas_width - this.x > width_view / 2) ? this.x + width_view / 2 : canvas_width,
        x = star.x;

      if(x >= from && x <= to) {
        return true;
      } else {
        return false;
      }
    },

    patrol: function() {
      this.stop();
      var canvas_width = app.canvas.width,
        speed = app.config.speed.diver,
        a = getDest('a'),
        b = getDest('b'),
        dir = 'left',
        interval = 1000 / speed;

      this.setImage('left');

      this.intr_id = setInterval(function() {
        if(dir === 'left') {
          if(a < this.x) {
            this.x --;
            this.withStar();
          } else {
            dir = 'right';
            a = getDest('a');
            this.setImage('right');
          }
        } else if(dir === 'right') {
          if(this.x < b) {
            this.x ++;
            this.withStar();
          } else {
            dir = 'left';
            b = getDest('b');
            this.setImage('left');
          }
        }
      }.bind(this), interval);

      function getDest(dot) {
        if(dot === 'a') {
          return Math.round(Math.random()*100);
        } else {
          return canvas_width - 150 + Math.round(Math.random()*100);
        }
      }
    },

    // swimming in one place for the expected star
    expect: function(star_id) {
      this.stop();
      var speed = 35 + rand(-10, 10),
        interval = 1000 / speed,
        startY = this.y,
        position = this.y,
        amplitude = Math.round(Math.random()*10+3),
        star = app.stars.find(star_id);

      this.intr_id = setInterval(function() {
        if(star.isOnTheBottom()) {
          this.stop();
          this.pickUp(star);
          this.defineWhatToDo();
        } else {
          startY += .1;
          this.y = position + Math.sin(startY) * amplitude;
          this.withStar();
        }
      }.bind(this), interval);
    },

    goHome: function() {
      this.stop();
      var speed = app.config.speed.diver,
        interval = 1000 / speed,
        home = app.config.objects.rope;
      if(this._home_right()) {
        this.setImage('right');
        this.intr_id = setInterval(function() {
          if(this.x <= home) { // FIXME must be <
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
      if(typeof star === 'number') {
        if(app.stars.find(star)) {
          star = app.stars.find(star);
        } else {
          throw new Error('star not found');
          return false;
        }
      }

      star.wait = false;
      star.stop();

      star_ind = app.stars.indexOf(star);
      app.stars.splice(star_ind, 1);
      this.stars.push(star);

      if(this.stars.length === 2) {
        this.search = false;
      }

      this.tasks.splice(0, 1);
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
