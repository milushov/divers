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
  child._super = parent.prototype;

  return child;
};

