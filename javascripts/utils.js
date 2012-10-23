function $(selector) {
  return document.querySelector(selector);
}


function gebi(id) {
  return document.getElementById(id);
}


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
          };
})();


var extend = function(child, parent) {
  for (var key in parent) {
    if(parent.hasOwnProperty(key)) child[key] = parent[key];
  }

  function ctor() {
    this.constructor = child;
  }
  
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;

  return child;
};


Object.extend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};


window.__images = ["images/buttons/delete-diver.png","images/buttons/add-diver.png","images/buttons/add-diver-hover.png","images/buttons/delete-diver-hover.png","images/other/fish3.png","images/other/cloud.png","images/other/fish1.png","images/other/fish2.png","images/other/sun.png","images/other/island.png","images/other/crab2.png","images/other/sand_left.png","images/other/star1.png","images/other/clouds.png","images/other/ship.png","images/other/star4.png","images/other/fish4.png","images/other/sand_center.png","images/other/star2.png","images/other/star3.png","images/other/seaguls.png","images/other/wave2.png","images/other/water.png","images/other/rope.png","images/other/wave1.png","images/other/crab1.png","images/other/wave3.png","images/other/sand_right.png","images/divers/right.png","images/divers/up.png","images/divers/left.png","images/back.jpg","images/fishes.png","images/stars/tf-star6.png","images/stars/tf-star2.png","images/stars/tf-star9.png","images/stars/tf-star3.png","images/stars/tf-star8.png","images/stars/ship-load.png","images/stars/tf-star7.png","images/stars/tf-star1.png","images/stars/tf-star5.png","images/stars/tf-star4.png","images/stars/tf-star10.png","images/thought.png"]


function wwh() {
  var w = window,
    de = document.documentElement,
    mw = app.config.options.min_width || 600,
    mh = app.config.options.min_height || 500,
    cw = Math.min(parseInt(w.innerWidth), parseInt(de.clientWidth)),
    ch = Math.min(parseInt(w.innerHeight), parseInt(de.clientHeight));

  return [
    Math.max(mw, cw),
    Math.max(mh, ch)
  ];
}


function eql(a, b) {
  return parseInt(a) == parseInt(b);
}


if(!Array.prototype.find) {
  Array.prototype.find = function(id) {
    var ret = false;
    for (var i = 0; i < this.length; ++i) {
      if(this[i].id === id) {
        ret = this[i];
      }
    }
    return ret;
  };
}

if(!Object.prototype.size) {
  Object.prototype.size = function() {
    var size = 0, key;
    for (key in this) {
      if (this.hasOwnProperty(key)) size++;
    }
    return size;
  };
}


if(!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  }
}

__id = 0;
function getId() {
  return ++__id;
}


function isDebug() {
  if(document.location.hostname === 'milushov.ru') {
    return false;
  } else {
    return true;
  }
}

if(!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = 
    function(x, y, width, height, radius, fill, stroke) {

    if (typeof stroke == "undefined" ) {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }

    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();

    if (stroke) {
      this.stroke();
    }

    if (fill) {
      this.fill();
    }
  }
}


if(!Array.prototype.last) {
  Array.prototype.last = function() {
    if(this.length !== 0) {
      return this[this.length - 1];
    } else {
      return undefined;
    }
  };
}

function rand(min, max, float_val) {
  var val = min + (Math.random() * (max - min));
  return typeof float_val === 'undefined'
    ? Math.round(val)
    : val.toFixed(float_val);
}
