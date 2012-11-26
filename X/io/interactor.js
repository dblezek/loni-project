/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

goog.provide('X.interactor');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.event.HoverEvent');
goog.require('X.event.HoverEndEvent');
goog.require('X.event.RotateEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.ResetViewEvent');
goog.require('X.event.ZoomEvent');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math.Vec2');



/**
 * Create an interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.base
 */
X.interactor = function(element) {

  // check if we have a valid element
  if (!goog.isDefAndNotNull(element) || !(element instanceof Element)) {
    
    throw new Error('Could not add interactor to the given element.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor';
  
  /**
   * The observed DOM element of this interactor.
   * 
   * @type {!Element}
   * @protected
   */
  this._element = element;
  
  /**
   * The listener id for mouse wheel observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseWheelListener = null;
  
  /**
   * The listener id for mouse down observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseDownListener = null;
  
  /**
   * The listener id for mouse up observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseUpListener = null;
  
  /**
   * The listener id for mouse move observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseMoveListener = null;
  
  /**
   * The listener id for mouse out observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseOutListener = null;
  
  /**
   * The browser independent mouse wheel handler.
   * 
   * @type {?goog.events.MouseWheelHandler}
   * @protected
   */
  this._mouseWheelHandler = null;
  
  /**
   * Indicates if the mouse is inside the element.
   * 
   * @type {boolean}
   * @protected
   */
  this._mouseInside = true;
  
  /**
   * Indicates if the left mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._leftButtonDown = false;
  
  /**
   * Indicates if the middle mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._middleButtonDown = false;
  
  /**
   * Indicates if the right mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._rightButtonDown = false;
  
  /**
   * The current mouse position.
   * 
   * @type {!Array}
   * @protected
   */
  this._mousePosition = [0, 0];
  
  /**
   * The previous mouse position.
   * 
   * @type {!goog.math.Vec2}
   * @protected
   */
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  /**
   * The configuration of this interactor.
   * 
   * @enum {boolean}
   */
  this._config = {
    'MOUSEWHEEL_ENABLED': true,
    'MOUSECLICKS_ENABLED': true,
    'KEYBOARD_ENABLED': true,
    'HOVERING_ENABLED': true,
    'CONTEXTMENU_ENABLED': false
  };
  
};
// inherit from X.base
goog.inherits(X.interactor, X.base);


/**
 * Access the configuration of this interactor. Possible settings and there
 * default values are:
 * 
 * <pre>
 *  config.MOUSEWHEEL_ENABLED: true
 *  config.MOUSECLICKS_ENABLED: true
 *  config.KEYBOARD_ENABLED: true
 *  config.HOVERING_ENABLED: true
 *  config.CONTEXTMENU_ENABLED: false 
 * </pre>
 * 
 * @return {Object} The configuration.
 */
X.interactor.prototype.__defineGetter__('config', function() {

  return this._config;
  
});


/**
 * Get the state of the left mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('leftButtonDown', function() {

  return this._leftButtonDown;
  
});


/**
 * Get the state of the middle mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('middleButtonDown', function() {

  return this._middleButtonDown;
  
});


/**
 * Get the state of the right mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('rightButtonDown', function() {

  return this._rightButtonDown;
  
});


/**
 * Observe mouse wheel interaction on the associated DOM element.
 */
X.interactor.prototype.init = function() {

  if (this._config['MOUSEWHEEL_ENABLED']) {
    
    // we use the goog.events.MouseWheelHandler for a browser-independent
    // implementation
    this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);
    
    this._mouseWheelListener = goog.events.listen(this._mouseWheelHandler,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel_
            .bind(this));
    
  } else {
    
    // remove all mouse wheel observers, if they exist..
    goog.events.unlistenByKey(this._mouseWheelListener);
    
    this._mouseWheelHandler = null;
    
  }
  
  if (this._config['MOUSECLICKS_ENABLED']) {
    
    // mouse down
    this._mouseDownListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEDOWN, this.onMouseDown_.bind(this));
    
    // mouse up
    this._mouseUpListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEUP, this.onMouseUp_.bind(this));
    
  } else {
    
    // remove the observer, if it exists..
    // goog.events.unlisten(this._element, goog.events.EventType.MOUSEDOWN);
    goog.events.unlistenByKey(this._mouseDownListener);
    
    // remove the observer, if it exists..
    goog.events.unlistenByKey(this._mouseUpListener);
    
  }
  
  if (!this._config['CONTEXTMENU_ENABLED']) {
    
    // deactivate right-click context menu
    // found no way to use goog.events for that? tried everything..
    // according to http://help.dottoro.com/ljhwjsss.php, this method is
    // compatible with all browsers but opera
    this._element.oncontextmenu = function() {

      return false;
      
    };
    
  } else {
    
    // re-activate right-click context menu
    this._element.oncontextmenu = null;
  }
  
  if (this._config['KEYBOARD_ENABLED']) {
    
    // the google closure way did not work, so let's do it this way..
    window.onkeydown = this.onKey_.bind(this);
    
  } else {
    
    // remove the keyboard observer
    window.onkeydown = null;
    
  }
  
  //
  // we always listen to mouse move events since they are essential for the
  // other events
  // we do make sure, we add them only once
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseMoveListener);
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseOutListener);
  
  // mouse movement inside the element
  this._mouseMoveListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEMOVE, this.onMouseMovementInside_.bind(this));
  
  // mouse movement outside the element
  this._mouseOutListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEOUT, this.onMouseMovementOutside_.bind(this));
      
};


/**
 * Callback for mouse down events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseDown_ = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = true;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = true;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = true;
    
  }
  
  eval("this.onMouseDown(" + this._leftButtonDown + "," +
      this._middleButtonDown + "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse down (button press).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseDown = function(left, middle, right) {

  // do nothing
  
};


/**
 * Callback for mouse up events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseUp_ = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = false;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = false;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = false;
    
  }
  
  if (this instanceof X.interactor2D) { 
  	//debugger;
  	// create a new paint event
  	var e = new X.event.PaintEvent();
  	
    e._x = event.offsetX;
    e._y = event.offsetY;
    
	this.dispatchEvent(e);
  }
  
  eval("this.onMouseUp(" + this._leftButtonDown + "," + this._middleButtonDown +
      "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Get the current mouse position (offsetX, offsetY) relative to the viewport.
 * 
 * @return {!Array} The mouse position as an array [x,y].
 */
X.interactor.prototype.__defineGetter__('mousePosition', function() {

  return this._mousePosition;
  
});


/**
 * Overload this function to execute code on mouse up (button release).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseUp = function(left, middle, right) {

  // do nothing
  
};


/**
 * Callback for mouse movement events outside the associated DOM element. This
 * resets all internal interactor flags.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseMovementOutside_ = function(event) {  
  
  // reset the click flags
  this._mouseInside = false;
  if (this._config['KEYBOARD_ENABLED']) {
    
    // if we observe the keyboard, remove the observer here
    // this is necessary if there are more than one renderer in the document
    window.onkeydown = null;
    
  }
  
  this._leftButtonDown = false;
  this._middleButtonDown = false;
  this._rightButtonDown = false;
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse movement.
 * 
 * @param {Event} event The browser fired mousemove event.
 */
X.interactor.prototype.onMouseMove = function(event) {

  // do nothing
  
};


/**
 * Callback for mouse movement events inside the associated DOM element. This
 * distinguishes by pressed mouse buttons, key accelerators etc. and fires
 * proper X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
 
  function Losp_Slice() {
	this._init = false;
	this._sliceWidth = null;
	this._sliceHeight = null;
	this._width = null;
	this._height = null;
	this._currentSlice = null;
}
 function Losp_Slices() {
	this._Xslice = new Losp_Slice();
	this._Yslice = new Losp_Slice();
	this._Zslice = new Losp_Slice();
 }
 
 var losp_slices = new Losp_Slices(); //global var used to give slice data to this part of the code from renderer2D.js

 
 
 
 
 
 function losp_2Dpixfill (rawData, index, red, green, blue, trans) {
	//window.console.log('Previous pixel color: r' + rawData[index] + ', g' + rawData[index+1] + ', b' + rawData[index+2]);
	rawData[index] = red;
	rawData[index+1] = green;
	rawData[index+2] = blue;
	rawData[index+3] = trans;
}

//change a 3D pixel to a new tissue of type 'id' in labelmap at (x, y, z)
function losp_change_pixel(x, y, z, id, labelmap) {
	
	//find dimensions						//same as  \/
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	//check dimensions in texture._width/hieght?
	
	if (x_width < 1 || x_width < 1 || x_width < 1) {
		window.console.log('Error, non valid array size');
		return -1; //error
	}
	
	if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
		window.console.log('Error, non valid coordinates');
		return -1; //error
	}
	
	if (!labelmap._colortable._map.containsKey(id)) {
		window.console.log('Error, non valid color id');
		return -1; //error
	}
	
	//look up red, blue, green from colormapping	
	var colors = labelmap._colortable._map.get(id);
	var name =  colors[0];
	var red =   colors[1]*255.0;
	var green = colors[2]*255.0;
	var blue =  colors[3]*255.0;
	var trans = colors[4]*255.0;
	
	
	
	//.containsKey(key)
	//.get(key, 0); //0 is the value to return if key is not found
	
	//image: this 3D array is never used but i am going to update it anyway
//	if (!labelmap._image.length == 0) {
//		labelmap._image[z][y][x] = id;
//	}
	//2D:	
	losp_2Dpixfill(labelmap._slicesX._children[x]._texture._rawData, (z*y_width+y)*4, red, green, blue, trans); //set pixel in X plane
	losp_2Dpixfill(labelmap._slicesY._children[y]._texture._rawData, (z*x_width+x)*4, red, green, blue, trans); //Y plane
	losp_2Dpixfill(labelmap._slicesZ._children[z]._texture._rawData, (y*x_width+x)*4, red, green, blue, trans); //Z Plane
			//2D; this code has the identical effect:
			//losp_2Dpixfill(labelmap._children[0]._children[x]._texture._rawData, (z*y_width+y)*4, red, green, blue, trans); //set pixel in X plane
			//losp_2Dpixfill(labelmap._children[1]._children[y]._texture._rawData, (z*x_width+x)*4, red, green, blue, trans); //Y plane
			//losp_2Dpixfill(labelmap._children[2]._children[z]._texture._rawData, (y*x_width+x)*4, red, green, blue, trans); //Z Plane
	
	
	//3D:
	//set pixel in X plane
	//Y plane
	//Z Plane


} 

//radius of 1 is single pixel, view is 'x', 'y', or 'z'
function losp_planerDot (x, y, z, view, radius, id, labelmap) {
	var r = radius - 1;
	var i, j;
	switch (view)
	{
	case 'x': //*/
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				losp_change_pixel(x, y+i, z+j, id, labelmap);
			}
		}
		break;
	case 'y':
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				losp_change_pixel(x+i, y, z+j, id, labelmap);
			}
		}
		break;
	case 'z':
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				debugger;
				losp_change_pixel(x+i, y+j, z, id, labelmap); //z-1
			}
		}
		break;
	default:
		window.console.log('Error: invalid view.');
	}
}

 
 
 
 
 
 
 
X.interactor.prototype.onMouseMovementInside_ = function(event) {
	
	
	
/////////////////////////////////start add
if (this instanceof X.interactor2D && this._leftButtonDown) {
							
	
	window.console.log('_pX: ' + event.offsetX + '  _pY: ' + event.offsetY);
	window.console.log('_Volume: ' + volume);

	
	//if (losp_sliceHeight!=null)
	//	window.console.log('losp_sliceHeight: ' + losp_sliceHeight);
	
	
	var slicedata = null;
	var view = null;
	switch (this._id)
	{
	case 10:
		slicedata = losp_slices._Xslice;
		view = 'x';
	  break;
	case 17:
		slicedata = losp_slices._Yslice;
		view = 'y';
	  break;
	case 24:
		slicedata = losp_slices._Zslice;
		view = 'z';
	  break;
	default:
	  window.console.log('Error: bad _camera._id');
	}
	
	
	
	if (0==Math.floor(Math.random()*10))
		debugger;
	
	
	
	
	
	var _paintX = event.offsetX;
	var _paintY = event.offsetY;
	
	
  var _paintSliceX = 0;
  var _paintSliceY = 0;
  
  if (_paintX * _paintY > 0) {

  	var _sliceRatio = slicedata._sliceWidth/slicedata._sliceHeight;
  	var _viewRatio = slicedata._width/slicedata._height;
    
  	if (_viewRatio < _sliceRatio) {
  		// letter boxed with black regions on top and bottom
  		var _zoomRatio = slicedata._sliceWidth / slicedata._width;
  		var _zoomedSliceHeight = slicedata._sliceHeight / _zoomRatio;
  		var _margin = (slicedata._height - _zoomedSliceHeight)/2;
  		_paintSliceY = _paintY - _margin;
  		_paintSliceY = _paintSliceY * _zoomRatio;
  		_paintSliceX = _paintX * _zoomRatio;
  	} else {
  		// letter boxed with black regions on sides
  		var _zoomRatio = slicedata._sliceHeight / slicedata._height;
  		var _zoomedSliceWidth = slicedata._sliceWidth / _zoomRatio;
  		var _margin = (slicedata._width - _zoomedSliceWidth)/2;
  		_paintSliceX = _paintX - _margin;
  		_paintSliceX = _paintSliceX * _zoomRatio;
  		_paintSliceY = _paintY * _zoomRatio;
  	}
  	
  	if (_paintSliceX * _paintSliceY > 0) {
  		_paintSliceX = Math.floor(_paintSliceX+0.5);
  		_paintSliceY = Math.floor(_paintSliceY+0.5);
		_paintSliceZ = Math.floor(slicedata._currentSlice+0.5);
		
		//keyword
		//find dimensions						//same as  \/
		var x_width = volume._labelmap._dimensions[0]; //labelmap._children[0]._children.length;
		var y_width = volume._labelmap._dimensions[1]; //labelmap._children[1]._children.length;
		var z_width = volume._labelmap._dimensions[2]; //labelmap._children[2]._children.length;
		//*
		
		var xx, yy, zz, plane;
		switch (view)
		{
		case 'x':
			x = _paintSliceZ
			y = y_width - _paintSliceX;
			z = z_width - _paintSliceY;
		  break;
		case 'y':
			x = x_width - _paintSliceX;
			y = _paintSliceZ;
			z = z_width - _paintSliceY;
		  break;
		case 'z':
			x = x_width - _paintSliceX;
			y = y_width - _paintSliceY;
			z = _paintSliceZ;
		  break;
		default:
		  window.console.log('Error: bad _camera._id');
		}
		//debugger;
		losp_planerDot (x, y, z, view, 2, 25, volume._labelmap);
		
		
  	}
  }
	//*/
	
	
	
	
	
	
	
	
	
	
	

										
}
//////////////////////////////////////////end add
	
  this['mousemoveEvent'] = event; // we need to buffer the event to run eval in
  // advanced compilation
  eval("this.onMouseMove(this['mousemoveEvent'])");
  
  this._mouseInside = true;
  
  if (this._config['KEYBOARD_ENABLED'] && window.onkeydown == null) {
    
    // we re-gained the focus, enable the keyboard observer again!
    window.onkeydown = this.onKey_.bind(this);
    

  }
  
  // prevent any other actions by the browser (f.e. scrolling, selection..)
  event.preventDefault();
  
  // is shift down?
  var shiftDown = event.shiftKey;
  
  // grab the current mouse position
  this._mousePosition = [event.offsetX, event.offsetY];
  var currentMousePosition = new goog.math.Vec2(this._mousePosition[0],
      this._mousePosition[1]);
  
  // get the distance in terms of the last mouse move event
  var distance = this._lastMousePosition.subtract(currentMousePosition);
  
  // save the current mouse position as the last one
  this._lastMousePosition = currentMousePosition.clone();
  
  // 
  // hovering, if enabled..
  //
  if (this._config['HOVERING_ENABLED']) {
    
    if (Math.abs(distance.x) > 0 || Math.abs(distance.y) > 0 ||
        this._middleButtonDown || this._leftButtonDown || this._rightButtonDown) {
      
      // there was some mouse movement, let's cancel the hovering countdown
      this.hoverEnd_();
      
    }
    
    // start the hovering countdown
    // if the mouse does not move for 2 secs, fire the HoverEvent to initiate
    // picking etc.
    this.hoverTrigger = setTimeout(function() {

      this.hoverEnd_();
      
      var e = new X.event.HoverEvent();
      e._x = currentMousePosition.x;
      e._y = currentMousePosition.y;
      
      this.dispatchEvent(e);
      
      // reset the trigger
      this.hoverTrigger = null;
      
    }.bind(this), 300);
    
  }
  
  // threshold the distance to avoid 'irregular' movement
  if (Math.abs(distance.x) < 2) {
    
    distance.x = 0;
    
  }
  if (Math.abs(distance.y) < 2) {
    
    distance.y = 0;
    
  }
  
  // jump out if the distance is 0 to avoid unnecessary events
  if (distance.magnitude() == 0) {
    
    return;
    
  }
  
  
  //
  // check which mouse buttons or keys are pressed
  //
  if (this._leftButtonDown && !shiftDown) {
    //
    // LEFT MOUSE BUTTON DOWN AND NOT SHIFT DOWN
    //
    
    // create a new rotate event
    var e = new X.event.RotateEvent();
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._middleButtonDown || (this._leftButtonDown && shiftDown)) {
    //
    // MIDDLE MOUSE BUTTON DOWN or LEFT MOUSE BUTTON AND SHIFT DOWN
    //
    
    // create a new pan event
    var e = new X.event.PanEvent();
    
    // panning in general moves pretty fast, so we threshold the distance
    // additionally
    if (distance.x > 5) {
      
      distance.x = 5;
      
    } else if (distance.x < -5) {
      
      distance.x = -5;
      
    }
    if (distance.y > 5) {
      
      distance.y = 5;
      
    } else if (distance.y < -5) {
      
      distance.y = -5;
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._rightButtonDown) {
    //
    // RIGHT MOUSE BUTTON DOWN
    //
    
    // create a new zoom event
    var e = new X.event.ZoomEvent();
    
    // set the zoom direction
    // true if zooming in, false if zooming out
    e._in = (distance.y > 0);
    
    // with the right click, the zoom will happen rather
    // fine than fast
    e._fast = false;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  }
  
};


/**
 * Stop the hover countdown and fire a X.event.HoverEndEvent.
 *
 * @protected
 */
X.interactor.prototype.hoverEnd_ = function() {

  if (this.hoverTrigger) {
    clearTimeout(this.hoverTrigger);
  }
  
  var e = new X.event.HoverEndEvent();
  this.dispatchEvent(e);
  
};


/**
 * Overload this function to execute code on mouse wheel events.
 * 
 * @param {Event} event The browser fired mousewheel event.
 */
X.interactor.prototype.onMouseWheel = function(event) {

  // do nothing
  
};


/**
 * Internal callback for mouse wheel events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseWheel_ = function(event) {

  this['mouseWheelEvent'] = event;
  eval("this.onMouseWheel(this['mouseWheelEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent any other action (like scrolling..)
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.interactor.prototype.onKey = function(event) {

  // do nothing
  
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.interactor.prototype.rotate = function(x, y) {

  
	// create a new rotate event
	var e = new X.event.RotateEvent();

    // attach the distance vector
    e._distance = [x, y];
   	this.dispatchEvent(e);
  
};


/**
 * Callback for keyboard events on the associated DOM element. This fires proper
 * X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onKey_ = function(event) {

  // only listen to key events if the mouse is inside our element
  // this f.e. enables key event listening for multiple renderers
  if (!this._mouseInside) {
    
    return;
    
  }
  
  this['keyEvent'] = event; // buffering..
  eval("this.onKey(this['keyEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // observe the control keys (shift, alt, ..)
  var alt = event.altKey;
  var ctrl = event.ctrlKey;
  var meta = event.metaKey; // this is f.e. the windows or apple key
  var shift = event.shiftKey;
  
  // get the keyCode
  var keyCode = event.keyCode;
  
  if (keyCode == 82 && !alt && !ctrl && !meta && !shift) {
    
    // 'r' but without any other control keys since we do not want to limit the
    // user to press for example CTRL+R to reload the page
    
    // prevent any other actions..
    event.preventDefault();
    
    // fire the ResetViewEvent
    var e = new X.event.ResetViewEvent();
    this.dispatchEvent(e);
    
  } else if (keyCode >= 37 && keyCode <= 40) {
    
    // keyCode <= 37 and >= 40 means the arrow keys
    
    // prevent any other actions..
    event.preventDefault();
    
    var e = null;
    
    if (shift) {
      
      // create a new pan event
      e = new X.event.PanEvent();
      
    } else if (alt) {
      
      // create a new zoom event
      e = new X.event.ZoomEvent();
      
    } else {
      // create a new rotate event for 3D or a new scroll event for 2D
      e = new X.event.RotateEvent();
      if (this instanceof X.interactor2D) {
        e = new X.event.ScrollEvent();
      }
      
    }
    
    if (!e) {
      
      // should not happen but you never know with key interaction
      return;
      
    }
    
    // create a distance vector
    var distance = new goog.math.Vec2(0, 0);
    
    if (keyCode == 37) {
      // '<-' LEFT
      distance.x = 5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._up = true;
        e._in = true;
        e._fast = false;
      }
      
    } else if (keyCode == 39) {
      // '->' RIGHT
      distance.x = -5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = false;
      }
      
    } else if (keyCode == 38) {
      // '^-' TOP
      distance.y = 5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = true;
        e._fast = true;
      }
      
    } else if (keyCode == 40) {
      // '-v' BOTTOM
      distance.y = -5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = true;
      }
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    
  }
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.interactor', X.interactor);
goog.exportSymbol('X.interactor.prototype.init', X.interactor.prototype.init);
goog.exportSymbol('X.interactor.prototype.onMouseDown',
    X.interactor.prototype.onMouseDown);
goog.exportSymbol('X.interactor.prototype.onMouseUp',
    X.interactor.prototype.onMouseUp);
goog.exportSymbol('X.interactor.prototype.onMouseMove',
    X.interactor.prototype.onMouseMove);
goog.exportSymbol('X.interactor.prototype.onMouseWheel',
    X.interactor.prototype.onMouseWheel);
goog.exportSymbol('X.interactor.prototype.onKey', X.interactor.prototype.onKey);
goog.exportSymbol('X.interactor.prototype.rotate', X.interactor.prototype.rotate);
