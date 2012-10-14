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
    console.log(key);
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


window.__images = ["images/buttons/delete-diver.png","images/buttons/add-diver.png","images/buttons/add-diver-hover.png","images/buttons/delete-diver-hover.png","images/divers/right.png","images/divers/up.png","images/divers/left.png","images/back.jpg","images/fishes.png","images/stars/tf-star6.png","images/stars/tf-star2.png","images/stars/tf-star9.png","images/stars/tf-star3.png","images/stars/tf-star8.png","images/stars/ship-load.png","images/stars/tf-star7.png","images/stars/tf-star1.png","images/stars/tf-star5.png","images/stars/tf-star4.png","images/stars/tf-star10.png","images/thought.png"]


function wwh() {
  var w = window, de = document.documentElement;

  return [
    Math.max(parseInt(w.innerWidth), parseInt(de.clientWidth)),
    Math.max(parseInt(w.innerHeight), parseInt(de.clientHeight))
  ]
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

__id = 0;
function getId() {
  return ++__id;
}
