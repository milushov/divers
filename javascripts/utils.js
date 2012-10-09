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
