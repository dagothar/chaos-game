"use strict";

var Chaos = (function() {
  
  /**
   * @brief Chaos class constructor.
   */
  function Chaos(startPoint, points, stepSize, testFunction) {
    this._startPoint = startPoint;
    this._points = points;
    this._stepSize = stepSize;
    this._current = this._startPoint;
    this._testFunction = testFunction
  }
  
  
  Chaos.prototype.setStartPoint   = function(startPoint)  { this._startPoint = startPoint; }
  Chaos.prototype.setPoints       = function(points)      { this._points = points; }
  Chaos.prototype.addPoint        = function(point)       { this._points.push(point); }
  Chaos.prototype.clearPoints     = function()            { this._points = []; }
  Chaos.prototype.setStepSize     = function(stepSize)    { this._stepSize = stepSize; }
  Chaos.prototype.setTestFunction = function(testFunction){ this._testFunction = testFunction; }
  
  
  /**
   * @brief tests if the new location is allowed.
   */
  Chaos.prototype._test = function(x, y) {
    if (this._testFunction !== undefined) {
      return this._testFunction(x, y);
    } else {
      return true;
    }
  }
  

  /**
   * @brief Returns new Chaos Game point.
   */
  Chaos.prototype.update = function(context) {
    var x, y;
    
    if (this._points.length == 0) return false;
    
    do {
      /* pick the new target */
      var idx = Math.floor(Math.random() * this._points.length);
      var target = this._points[idx];
      //if (!target) return null;
      
      /* calculate new position */
      x = (1.0-this._stepSize) * this._current.x + this._stepSize * target.x;
      y = (1.0-this._stepSize) * this._current.y + this._stepSize * target.y;
      
      //console.log('!');
    } while (!this._test(x, y));
    
    this._current = {x: x, y: y};
    
    return this._current;
  }
  
  
  return Chaos;
} ());

