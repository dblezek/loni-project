goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.mesh');
goog.require('X.matrix');
goog.require('X.volume');
goog.require('X.cube');

/**
 * Setup all UI elements once the loading was completed.
 */
function setupUi() {

  // VOLUME
  if (_data.volume.file != null) {
    
    // update threshold slider
    jQuery('#threshold-volume').dragslider("option", "max", volume.max);
    jQuery('#threshold-volume').dragslider("option", "min", volume.min);
    jQuery('#threshold-volume').dragslider("option", "values",
        [4, volume.max]);
    volume.lowerThreshold = 4;
    
    // update window/level slider
    jQuery('#windowlevel-volume').dragslider("option", "max", volume.max);
    jQuery('#windowlevel-volume').dragslider("option", "min", volume.min);
    jQuery('#windowlevel-volume').dragslider("option", "values",
        [volume.min, volume.max]);
    
    // update 3d opacity
    jQuery('#opacity-volume').slider("option", "value", 5);
    volume.opacity = 0.05; // re-propagate
    volume.modified();
    
    // update 2d slice sliders
    var dim = volume.dimensions;
    jQuery("#yellow_slider").slider("option", "disabled", false);
    jQuery("#yellow_slider").slider("option", "min", 0);
    jQuery("#yellow_slider").slider("option", "max", dim[0] - 1);
    jQuery("#yellow_slider").slider("option", "value", volume.indexX);
    jQuery("#red_slider").slider("option", "disabled", false);
    jQuery("#red_slider").slider("option", "min", 0);
    jQuery("#red_slider").slider("option", "max", dim[1] - 1);
    jQuery("#red_slider").slider("option", "value", volume.indexY);
    jQuery("#green_slider").slider("option", "disabled", false);
    jQuery("#green_slider").slider("option", "min", 0);
    jQuery("#green_slider").slider("option", "max", dim[2] - 1);
    jQuery("#green_slider").slider("option", "value", volume.indexZ);
    
    jQuery('#volume .menu').removeClass('menuDisabled');
    
	jQuery('#volume .menu').stop().animate({
	 'marginLeft': '-2px'
	}, 1000);
	has_volume = true;
    
  } else {
    
    if (!has_volume) {
	    // no volume
	    jQuery('#volume .menu').addClass('menuDisabled');
	    jQuery("#yellow_slider").slider("option", "disabled", true);
	    jQuery("#red_slider").slider("option", "disabled", true);
	    jQuery("#green_slider").slider("option", "disabled", true);
    }
	
  }
  
  // LABELMAP
  if (_data.labelmap.file != null) {
    
    jQuery('#labelmapSwitch').show();
    
    jQuery('#opacity-labelmap').slider("option", "value", 40);
    volume.labelmap.opacity = 0.4; // re-propagate
    

  } else {
    
    // no labelmap
    jQuery('#labelmapSwitch').hide();
    
  }

  // MESH
  if (_data.mesh.file != null) {
    
    jQuery('#opacity-mesh').slider("option", "value", 100);
    mesh.opacity = 1.0; // re-propagate
    
    mesh.color = [0, 0, 1];
    
    jQuery('#mesh .menu').removeClass('menuDisabled');
    
	jQuery('#mesh .menu').stop().animate({
	 'marginLeft': '-2px'
	}, 1000);
	has_mesh = true;
    
  } else {
    
    if (!has_mesh) {
	    // no mesh
	    jQuery('#mesh .menu').addClass('menuDisabled');
    }
  
  }
  
  // SCALARS
  if (_data.scalars.file != null) {
    
    var combobox = document.getElementById("scalars-selector");
    combobox.value = 'Scalars 1';
    
    jQuery("#threshold-scalars").dragslider("option", "disabled", false);
    jQuery("#threshold-scalars").dragslider("option", "min",
        mesh.scalars.min * 100);
    jQuery("#threshold-scalars").dragslider("option", "max",
        mesh.scalars.max * 100);
    jQuery("#threshold-scalars").dragslider("option", "values",
        [mesh.scalars.min * 100, mesh.scalars.max * 100]);
    
  } else {
    
    var combobox = document.getElementById("scalars-selector");
    combobox.disabled = true;
    jQuery("#threshold-scalars").dragslider("option", "disabled", true);
    
  }
  
  // FIBERS
  if (_data.fibers.file != null) {
    
    jQuery('#fibers .menu').removeClass('menuDisabled');
    
    jQuery("#threshold-fibers").dragslider("option", "min", fibers.scalars.min);
    jQuery("#threshold-fibers").dragslider("option", "max", fibers.scalars.max);
    jQuery("#threshold-fibers").dragslider("option", "values",
        [fibers.scalars.min, fibers.scalars.max]);
	jQuery('#fibers .menu').stop().animate({
	 'marginLeft': '-2px'
	}, 1000);
	has_fibers = true;
    
  } else {
    
    if (!has_fibers) {
	    // no fibers
	    jQuery('#fibers .menu').addClass('menuDisabled');
    }
    
  }
  
  	// Set up initial color
	var elem = document.getElementById('colorId');
	elem.value = losp_slices._brush._colorid;

	var colors = volume.labelmap._colortable._map.get(losp_slices._brush._colorid);

	if (colors == null) {
		document.getElementById("labelName").innerHTML = "Error: Does not exist";
		return;
	}

	var name = colors[0];
	var red = colors[1] * 255.0;
	var green = colors[2] * 255.0;
	var blue = colors[3] * 255.0;
	var trans = colors[4] * 255.0;

	elem.style.backgroundColor = "rgba(" + red + "," + green + "," + blue + "," + trans + ")";
	document.getElementById("labelName").innerHTML = name;


	// Set up slice number
	document.getElementById('sliceXNum').innerHTML = "Sagittal (Yellow) Slide Number: " + Math.floor(losp_slices._Xslice._currentSlice);
	document.getElementById('sliceYNum').innerHTML = "Coronal (Red) Slide Number: " + Math.floor(losp_slices._Yslice._currentSlice);
	document.getElementById('sliceZNum').innerHTML = "Axial (Green) Slide Number: " + Math.floor(losp_slices._Zslice._currentSlice);
	
	// Set initial paint brush size
	var e = document.getElementById('paintBrushSize');
	var selectedView = e.options[e.selectedIndex].value;
	losp_slices._brush._size = selectedView;

	// Initialize undo stack
 	losp_addUndoRedo('U', volume._labelmap);
}

function volumerenderingOnOff(bool) {

  if (!volume) {
    return;
  }
  
  volume.volumeRendering = bool;
  

}

function thresholdVolume(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.lowerThreshold = ui.values[0];
  volume.upperThreshold = ui.values[1];
  

}

function windowLevelVolume(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.windowLow = ui.values[0];
  volume.windowHigh = ui.values[1];
  

}

function opacity3dVolume(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.opacity = ui.value / 100;
  

}

function volumeslicingX(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.indexX = Math
      .floor(jQuery('#yellow_slider').slider("option", "value"));
  
  // For showing current slide number
  document.getElementById('sliceXNum').innerHTML = "Sagittal (Yellow) Slide Number: " 
  	+ Math.floor(losp_slices._Xslice._currentSlice);
}

function volumeslicingY(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.indexY = Math.floor(jQuery('#red_slider').slider("option", "value"));
  
  // For showing current slide number
  document.getElementById('sliceYNum').innerHTML = "Coronal (Red) Slide Number: " 
  	+ Math.floor(losp_slices._Yslice._currentSlice);
}

function volumeslicingZ(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.indexZ = Math.floor(jQuery('#green_slider').slider("option", "value"));
  
  // For showing current slide number
  document.getElementById('sliceZNum').innerHTML = "Axial (Green) Slide Number: " 
  	+ Math.floor(losp_slices._Zslice._currentSlice);
}

function fgColorVolume(hex, rgb) {

  if (!volume) {
    return;
  }
  
  volume.maxColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  

}

function bgColorVolume(hex, rgb) {

  if (!volume) {
    return;
  }
  
  volume.minColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  

}

//
// LABELMAP
//
function opacityLabelmap(event, ui) {

  if (!volume) {
    return;
  }
  
  volume.labelmap.opacity = ui.value / 100;
  

}

function toggleLabelmapVisibility() {

  if (!volume) {
    return;
  }
  
  volume.labelmap.visible = !volume.labelmap.visible;

}

////////////////////////////////////////////////
// TODO: Additional Options
////////////////////////////////////////////////

function colorIdChange() {
	
	if (!volume) {
		return;
	}
	
	var elem = document.getElementById('colorId');
	var input = elem.value;
	
	if (input == '') {
		return;
	}
	
	var colors = volume.labelmap._colortable._map.get(input);
	
	if (colors == null) {
		document.getElementById("labelName").innerHTML = "Error: Does not exist";
		return;
	}
	
	var name =  colors[0];
	var red =   colors[1]*255.0;
	var green = colors[2]*255.0;
	var blue =  colors[3]*255.0;
	var trans = colors[4]*255.0;
	
	elem.style.backgroundColor = "rgba(" + red + "," + green + "," + blue + "," + trans + ")";
	document.getElementById("labelName").innerHTML = name;
	
	// Set id to appropriate color
	losp_slices._brush._colorid = input;
}

function paintBrushSize() {
	
	if (!volume) {
		return;
	}
	
	var e = document.getElementById('paintBrushSize');
	var selectedView = e.options[e.selectedIndex].value;
	losp_slices._brush._size = selectedView;
}

function eraserOption() {
	
	if (!volume) {
		return;
	}
	
	if ($('#eraserOption').prop('checked')) {
		losp_slices._brush._eraser = true;
	} else {
		losp_slices._brush._eraser = false;
	}
	
}

function toggleUndoOption() {

	if (!volume) {
		return;
	}

	// Need to call function twice if boolean true
	if (losp_slices._undoRedo._first) {
		losp_performUndoRedo('U', volume._labelmap);
		losp_slices._undoRedo._first = false;
	}
	
	losp_performUndoRedo('U', volume._labelmap);
}

function toggleRedoOption() {

	if (!volume) {
		return;
	}

	losp_performUndoRedo('R', volume._labelmap);
	losp_slices._undoRedo._first = false;
}

// function colorOption(hex, rgba) {
// 
	// if (!volume) {
		// return;
	// }
// 
	// var rgbaColor = [rgba.r, rgba.g, rgba.b, rgba.a];
	// //window.console.log(rgbaColor);
// 
// }

function toggleClobberOption() {

	if (!volume) {
		return;
	}

	if ($('#clobberOption').prop('checked')) {
		losp_slices._brush._clobber = true;
	} else {
		losp_slices._brush._clobber = false;
	}

}

function toggle2dBucketOption() {

	if (!volume) {
		return;
	}

	// TODO: Do nothing for now
	if ($('#2dBucketOption').prop('checked')) {
		//document.body.style.cursor = "url('../gfx/paint.png'), default";
		losp_slices._brush._mode = 2;
		document.getElementById('3dBucketOption').disabled = true;
	} else {
		//document.body.style.cursor = 'default';
		losp_slices._brush._mode = 1;
		document.getElementById('3dBucketOption').disabled = false;
	}

}

function toggle3dBucketOption() {

	if (!volume) {
		return;
	}

	// TODO: Do nothing for now
	if ($('#3dBucketOption').prop('checked')) {
		//document.body.style.cursor = "url('../gfx/paint.png'), default";
		
		document.getElementById('2dBucketOption').disabled = true;
	} else {
		//document.body.style.cursor = 'default';
		
		document.getElementById('2dBucketOption').disabled = false;
	}

}

function copyNextOption() {

	if (!volume) {
		return;
	}

	var e = document.getElementById('copyPasteOption');
	var selectedView = e.options[e.selectedIndex].value;
	// yellow, red or green
	
	var retVal = null;
	
	switch(selectedView) {
		case 'yellow':
			retVal = losp_copy(true, 'x', volume._labelmap, 0);
			break;
		case 'red':
			retVal = losp_copy(true, 'y', volume._labelmap, 0);
			break;
		case 'green':
			retVal = losp_copy(true, 'z', volume._labelmap, 0);
			break;
		default:
			window.console.log("Error: selected plane not recognized");
			break;
	}
	
	if (retVal != null) {
		document.getElementById('functionMessage').innerHTML = 'Copied to slice # ' + retVal;
	} else {
		document.getElementById('functionMessage').innerHTML = 'Copy unsuccessful';
	}
	
}

function copyPrevOption() {

	if (!volume) {
		return;
	}

	var e = document.getElementById('copyPasteOption');
	var selectedView = e.options[e.selectedIndex].value;
	// yellow, red or green
	
	var retVal = null;

	switch(selectedView) {
		case 'yellow':
			retVal = losp_copy(false, 'x', volume._labelmap, 0);
			break;
		case 'red':
			retVal = losp_copy(false, 'y', volume._labelmap, 0);
			break;
		case 'green':
			retVal = losp_copy(false, 'z', volume._labelmap, 0);
			break;
		default:
			window.console.log("Error: selected plane not recognized");
			break;
	}
	
	if (retVal != null) {
		document.getElementById('functionMessage').innerHTML = 'Copied to slice # ' + retVal;
	} else {
		document.getElementById('functionMessage').innerHTML = 'Copy unsuccessful';
	}
	
}

function sliceNumOption(e) {
	
	if (!volume) {
		return;
	}
	
	// keyCode 13 is Enter key
	if (e.keyCode == 13) {
		
		var elem = document.getElementById('sliceNum');
		var slice = elem.value;
		
		var e = document.getElementById('copyPasteOption');
		var selectedView = e.options[e.selectedIndex].value;
		// yellow, red or green
	
		var retVal = null;
	
		switch(selectedView) {
			case 'yellow':
				retVal = losp_copy(false, 'x', volume._labelmap, slice);
				break;
			case 'red':
				retVal = losp_copy(false, 'y', volume._labelmap, slice);
				break;
			case 'green':
				retVal = losp_copy(false, 'z', volume._labelmap, slice);
				break;
			default:
				window.console.log("Error: selected plane not recognized");
				break;
		}
		
		if (retVal != null) {
			document.getElementById('functionMessage').innerHTML = 'Copied to slice # ' + retVal;
		} else {
			document.getElementById('functionMessage').innerHTML = 'Copy unsuccessful';
		}
		
		elem.value = ''; // Change input to blank after done
	}
}

/////////////////////////////////////////////
// TODO: end of added functions
/////////////////////////////////////////////

//
// MESH
//
function toggleMeshVisibility() {

  if (!mesh) {
    return;
  }
  
  mesh.visible = !mesh.visible;
  

}

function meshColor(hex, rgb) {

  if (!mesh) {
    return;
  }
  
  mesh.color = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  

}

function opacityMesh(event, ui) {

  if (!mesh) {
    return;
  }
  
  mesh.opacity = ui.value / 100;
  

}

function thresholdScalars(event, ui) {

  if (!mesh) {
    return;
  }
  
  mesh.scalars.lowerThreshold = ui.values[0] / 100;
  mesh.scalars.upperThreshold = ui.values[1] / 100;
  

}

function scalarsMinColor(hex, rgb) {

  if (!mesh) {
    return;
  }
  
  mesh.scalars.minColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  

}

function scalarsMaxColor(hex, rgb) {

  if (!mesh) {
    return;
  }
  
  mesh.scalars.maxColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  

}

//
// Fibers
//
function toggleFibersVisibility() {

  if (!fibers) {
    return;
  }
  
  fibers.visible = !fibers.visible;
  

}

function thresholdFibers(event, ui) {

  if (!fibers) {
    return;
  }
  
  fibers.scalars.lowerThreshold = ui.values[0];
  fibers.scalars.upperThreshold = ui.values[1];
  

}
