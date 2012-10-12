var App = function(debug) {
  this.debug = debug || false;

  this.config = {
    speed: {
      star: 80,
      diver: 20
    },

    borders: {
      bottom: 0,
      rope: 0
    }
  }

  this.init = function() {
    console.log('app init');

    this.canvas = document.getElementById('app');
    this.ctx = this.canvas.getContext('2d');
    this.config.borders.bottom = this.canvas.height - 50;
    this.config.borders.rope = this.canvas.width - 100;

    this.canvas.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    }, false);

    this.canvas.addEventListener('mousedown', function(event) {
      var x = event.x;
      var y = event.y;
      var rating = Math.round(Math.random()*9+1);
      new_star = new Star(x, y, 46, 43);
      new_star.setImage(rating);
      app.stars.push(new_star);
    });

    this.divers = new Array();
    this.stars = new Array();

    //TODO make buttons
  }

  this.test = function() {
    console.log(this)
  }

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.clear();
    this.draw();
  }

  this.draw = function() {
    for (var i = 0; i < this.stars.length; ++i) {
      this.stars[i].draw();
    };
  }
  
  this.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}


window.onload = function() {
  app = new App(true);
  app.init();
  app.animate();
  gebi('click').addEventListener('click', function(){ app.test.apply(app) } );
}


var Thing = (function() {
  function Thing(x, y) {
    this.x = x;
    this.y = y;
  }

  Object.extend(Thing.prototype, {
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
  }

  Object.extend(Star.prototype, {
    width: 46,
    height: 43,
    setImage: function(rating) {
      if(typeof rating == 'undefined') {
        throw { message: 'rating not set', code: 1 }
          this.rating = 1;
        }
        this.rating = rating;
        this.image = new Image();
        this.image.src = 'images/tf-star' + rating + '.png';
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
      var dy = speed/interval;
      var intr = setInterval(function() {
        if(this.y <= app.config.borders.bottom) {
          this.y ++;
        } else {
          clearInterval(intr);
        }
      }.bind(this), interval);
    }
  });

  return Star;
})(Thing)
