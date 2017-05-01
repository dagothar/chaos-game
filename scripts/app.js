"use strict";

var App = (function() {
  
  
  function drawDot(ctx, point, size, color) {
    ctx.save();
    
    ctx.fillStyle = color;
    
    ctx.beginPath();
      ctx.arc(point.x, point.y, size/2.0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  var POINT_ID = 10;
  
  function Point(x, y) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.hovered = false;
    this.key = ++POINT_ID;
  }
  
  
  /**
   * @brief App class constructor.
   */
  function App() {
    var self = this;
    
    this._updateTimer   = undefined;
    this._running       = false;
    
    this._points        = [];
    this._pointsHash    = [];
    this._hashPoints();
    this._hovered       = null;
    this._selected      = null;
    this._currentPoint  = new Point(400, 300);
    
    this._viewContainer = $('#view').get(0);
    this._view = new Concrete.Viewport({
      container: this._viewContainer,
      width: 800,
      height: 600
    });
    this._pointsLayer = new Concrete.Layer(); this._pointsLayer.setSize(800, 600);
    this._gameLayer = new Concrete.Layer(); this._gameLayer.setSize(800, 600);
    this._paintLayer = new Concrete.Layer(); this._paintLayer.setSize(800, 600);
    this._view.add(this._paintLayer).add(this._gameLayer).add(this._pointsLayer);
    
    this._dots          = 0;
    this._speed         = 10;
    this._dotSize       = 5;
    this._stepSize      = 0.5;
    this._dotColor      = '#000000';
    this._brushSize     = 10;
    this._painting      = false;
    this._paintColor    = '#00ff00';
    this._brushSize     = 10;
    this._dotsPerStep   = 1;
    
    this._game = new Chaos({x: 400, y: 300}, this._points, this._stepSize, function(x, y) { return self._testDotPosition(x, y); });
  };
  
  
  App.prototype._hashPoints = function() {
    var self = this;
    
    this._pointsHash = [];
    this._points.forEach(function(p) {
      self._pointsHash[p.key] = p;
    });
  }
  
  
  App.prototype._removePoint = function(point) {
    var self = this;
    
    var idx = this._points.findIndex(function(p) { return p.key == point.key; })
    this._points.splice(idx, 1);
    this._hashPoints();
  }
  
  
  /**
   * @brief Adds a new control point.
   */
  App.prototype._addPoint = function(x, y) {
    var newPoint = new Point(x, y);
    this._points.push(newPoint);
    this._hashPoints();
  }
  
  
  App.prototype._bindUiActions = function() {
    var self = this;

    $('.button-start').show();
    $('.button-stop').hide();
    $('.slider-speed').val(100);
    $('.parameter-dot-size').val(this._dotSize);
    $('.slider-step').val(50);
    $('.slider-brush').val(10);
    $('input[name=ngon]').val(3);
    $('input[name=dot-color]').val(this._dotColor);
    $('input[name=paint-color]').val(this._paintColor);
    
    $('.button-reset').click(function() { self._clear(); });
    $('.button-start').click(function() { self._start(); });
    $('.button-stop').click(function() { self._stop(); });
    $('.button-step').click(function() { self._step(); });
    $('.button-download').click(function() { self._download(); });
    $('.slider-speed').on('input change', function() { self._changeSpeed($(this).val()); });
    $('.parameter').on('input change', function() { self._updateParameters(); });
    $('input[name=dot-color]').change(function() { self._dotColor = $(this).val(); });
    $('.slider-brush').on('input change', function() { self._brushSize = parseFloat($(this).val()); });
    $('input[name=paint-color]').change(function() { self._paintColor = $(this).val(); });
    $('.button-clear').click(function() { self._clearPaint(); });
    $('.button-ngon').click(function() { self._initialize(250, parseInt($('input[name=ngon]').val())); });
    
    /* control points */
    $('#view').mousemove(_.throttle(function(e) { self._mousemove(e); }, 1));
    $('#view').mouseout(function() { self._mouseout(); });
    $('#view').mousedown(function() { self._mousedown(); });
    $('#view').mouseup(function() { self._mouseup(); });
    $('.button-add').click(function() { self._addPoint(400, 300); });
    $('.button-remove').click(function() { self._clearPoints(); });
    
    this._updateUi();
    this._updateControlPoints();
  }
  
  
  App.prototype._updateUi = function() {
    /* update speed indicator */
    $('.speed').text((10.0/this._speed).toFixed(3) + 'x');
    
    /* update step size */
    $('.step-size').text(this._stepSize.toFixed(2));
    
    /* update current point position */
    $('.point-x').text(this._currentPoint.x.toFixed(0));
    $('.point-y').text(this._currentPoint.y.toFixed(0));
    
    /* update brush size */
    $('.brush-size').text(this._brushSize.toFixed(0));
    
    /* update no of dots */
    $('.dots').text(this._dots);
  }
  
  
  App.prototype._updateParameters = function() {
    /* update dot size */
    this._dotSize = parseFloat($('.parameter-dot-size').val());
    if (this._dotSize < 1) $('.parameter-dot-size').val(1);
    if (this._dotSize > 10) $('.parameter-dot-size').val(10);
    
    /* update step size */
    this._stepSize = 0.01 * parseFloat($('.slider-step').val());
    this._game.setStepSize(this._stepSize);  
    
    this._updateUi();
  }
  
  
  App.prototype._initialize = function(size, n) {
    this._clearPoints();
    
    for (var i = 0; i < 2*Math.PI; i += 2*Math.PI/n) {
      this._addPoint(400+size*Math.sin(i-Math.PI/n), 300+size*Math.cos(i-Math.PI/n));
    }
    
    this._currentPoint = new Point(400, 300);
    this._updateControlPoints();
  }
  
  
  App.prototype._clear = function() {
    this._gameLayer.scene.clear();
    this._dots = 0;
    this._updateUi();
  }
  
  
  App.prototype._update = function() {
    
    for (var i = 0; i < this._dotsPerStep; ++i) {
      var newPoint = this._game.update();
      if (newPoint) {
        drawDot(this._gameLayer.scene.context, newPoint, this._dotSize, this._dotColor);
        this._currentPoint = newPoint;
        ++this._dots;
      }
    }
    
    this._updateUi();
    this._updateControlPoints();
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
  
  
  /*App.prototype._step = function() {
    this._updateControlPoints();
    this._update();
  }*/
  
  
  App.prototype._stop = function() {
    if (this._running) {
      $('.button-start').show();
      $('.button-stop').hide();
    
      this._running = false;
      clearInterval(this._updateTimer);
    }
  }
  
  
  /**
   * @brief Download button callback.
   */
  App.prototype._download = function() {
    this._view.toScene().download({ fileName: 'chaos.png' });
  }
  
  
  App.prototype._changeSpeed = function(val) {
    this._speed = 1000 * Math.pow(1.047129, -val);
    //console.log(this._speed);
    if (this._running) {
      clearInterval(this._updateTimer);
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    } 
    this._updateUi();
  }
  
  
  App.prototype._updateControlPoints = function() {
    var self = this;
    
    var scene = this._pointsLayer.scene;
    var hit = this._pointsLayer.hit;
    
    scene.clear();
    hit.clear();
    
    drawDot(scene.context, this._currentPoint, this._dotSize+3, this._dotColor);
    drawDot(scene.context, this._currentPoint, this._dotSize, 'white');

    this._points.forEach(function(point) {
      drawDot(hit.context, point, 10, hit.getColorFromKey(point.key));
      if (point.hovered) {
        drawDot(scene.context, point, 15, 'black');
        drawDot(scene.context, point, 12, 'red');
      } else {
        drawDot(scene.context, point, 10, 'red');
      }
    });
  }
  
  
  /**
   * @brief Callback for mouse movement in the viewport.
   */
  App.prototype._mousemove = function(e) {
    var boundingRect = this._viewContainer.getBoundingClientRect();
    var x = Math.floor(e.clientX - boundingRect.left);
    var y = Math.floor(e.clientY - boundingRect.top);
    
    //console.log(x, y);
    //var ctx = this._paintLayer.scene.context;
    //console.log(ctx.getImageData(0, 0, 100, 100).data);
    //var color = ctx.getImageData(Math.floor(2*x), Math.floor(2*y), 1, 1).data;
    //console.log(x, y, color, this._paintLayer.scene.canvas.width, this._paintLayer.scene.canvas.height);
    
    if (this._selected) {
      this._selected.x = x;
      this._selected.y = y;
    } else {
      var key = this._view.getIntersection(x, y);
      
      this._points.forEach(function(point) {
        point.hovered = false;
      });
      
      if (key) {
        this._pointsHash[key].hovered = true;
        this._hovered = this._pointsHash[key];
      } else {
        this._hovered = null;
        
        if (this._painting) this._paint(x, y);
      }
    }
    
    this._updateControlPoints();
  }
  
  
  /**
   * @brief Callback for mouseout event.
   */
  App.prototype._mouseout = function(e) {
    //if (!this._isNewPoint) {
      if (this._hovered) { this._hovered.hovered = false; }
      if (this._selected) { this._selected.selected = false; }
      
      if (this._selected) this._removePoint(this._selected);
      
      this._hovered = null;
      this._selected = null;
    //}
    
    this._painting = false;

    this._updateControlPoints();
  }
  
  
  /**
   * @brief Callback for mousedown event.
   */
  App.prototype._mousedown = function() {
    this._selected = this._hovered;
    
    if (!this._selected) {
      this._painting = true;
    }
  }
  
  
  /**
   * @brief Callback for mouseup event.
   */
  App.prototype._mouseup = function() {
    this._selected = null;
    //this._isNewPoint = false;
    this._painting = false;
  }
  
  
  /**
   * @brief Removes all control points.
   */
  App.prototype._clearPoints = function() {
    this._points.splice(0, this._points.length);
    this._updateControlPoints();
  }
  
  
  /**
   * @brief Paints a brush shape.
   */
  App.prototype._paint = function(x, y) {
    var self = this;
    var ctx = this._paintLayer.scene.context;
    
    ctx.save();
    ctx.fillStyle = this._paintColor;
    ctx.beginPath();
      ctx.arc(x, y, this._brushSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    this._game.setTestFunction(function(x, y) { return self._testDotPosition(x, y); });
  }
  
  
  App.prototype._clearPaint = function() {
    this._paintLayer.scene.clear();
  }
  
  
  /**
   * @brief Tests whether the new dot location is allowed.
   */
  App.prototype._testDotPosition = function(x, y) {
    var ctx = this._paintLayer.scene.context;
    var color = ctx.getImageData(Math.floor(2*x), Math.floor(2*y), 1, 1).data;
    return (_.difference(color, [0, 0, 0, 0]).length == 0) ;
  }
  
  
  App.prototype.run = function() {
    this._initialize(250, 3);
    this._bindUiActions();
    this._clear();
  }
  
  
  return App;
} ());

