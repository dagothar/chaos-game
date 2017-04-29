"use strict";

var App = (function() {
  
  function App() {
    this._updateTimer   = undefined;
    this._running       = false;
    this._game          = undefined;
    this._view          = undefined;
    this._speed         = 100;
  };
  
  
  App.prototype._bindUiActions = function() {
    var self = this;
    
    this._view = $('#view').get(0);
    
    $('.button-start').show();
    $('.button-stop').hide();
    $('.slider-speed').val(0);
    
    $('.button-reset').click(function() { self._reset(); });
    $('.button-start').click(function() { self._start(); });
    $('.button-stop').click(function() { self._stop(); });
    $('.slider-speed').on('input change', function() { self._changeSpeed($(this).val()); });
  }
  
  
  App.prototype._updateUi = function() {
    $('.speed').text((100.0/this._speed).toFixed(1) + 'x');
  }
  
  
  App.prototype._reset = function() {
    this._stop();
    //this._game = new Wator(width, height);
    
    this._updateUi();
  }
  
  
  App.prototype._update = function() {
    this._game.update(this._view);
    this._updateUi();
  }
  
  
  App.prototype._start = function() {
    if (!this._running) {
      $('.button-start').hide();
      $('.button-stop').show();
      
      this._running = true;
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    }
  }
  
  
  App.prototype._stop = function() {
    if (this._running) {
      $('.button-start').show();
      $('.button-stop').hide();
    
      this._running = false;
      clearInterval(this._updateTimer);
    }
  }
  
  
  App.prototype._changeSpeed = function(val) {
    this._speed = 100 * Math.pow(1.258925, -val);
    if (this._running) {
      clearInterval(this._updateTimer);
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    } 
    this._updateUi();
  }
  

  App.prototype.run = function() {
    this._bindUiActions();
    this._reset();
  }
  
  
  return App;
} ());

