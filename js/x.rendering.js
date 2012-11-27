goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.mesh');
goog.require('X.matrix');
goog.require('X.volume');
goog.require('X.cube');



function initializeRenderers(){
  
  if (ren3d) {
    // do this only once
    return;
  }
  
  // create the XTK renderers
  ren3d = new X.renderer3D();
  ren3d.container = '3d';
  ren3d.init();    
  
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();

  sliceY = new X.renderer2D();
  sliceY.container = 'sliceY';
  sliceY.orientation = 'Y';
  sliceY.init();  
  
  sliceZ = new X.renderer2D();
  sliceZ.container = 'sliceZ';
  sliceZ.orientation = 'Z';
  sliceZ.init();  
  
  

  ren3d.onShowtime = function() {
    
    window.console.log('Loading completed.');
    
    if (_data.volume.file != null) {
      
      // show any volume also in 2d
      sliceX.add(volume);
      sliceY.add(volume);
      sliceZ.add(volume);
	  //debugger;
      sliceX.render();
      sliceY.render();
      sliceZ.render();
      
    }
    
    setupUi();
    configurator();
    
    // render();
    
  };
  
  //
  // LINK THE RENDERERS
  //
  // link the 2d renderers to the 3d one by setting the onScroll
  // method. this means, once you scroll in 2d, it upates 3d as well
  var _updateThreeDX = function() {
    if (_data.volume.file != null) {
      jQuery('#yellow_slider').slider("option", "value",volume.indexX);
    }
  };
  
  var _updateThreeDY = function() {
    if (_data.volume.file != null) {
      jQuery('#red_slider').slider("option", "value",volume.indexY);
    }
  };
  var _updateThreeDZ = function() {
    if (_data.volume.file != null) {
      jQuery('#green_slider').slider("option", "value",volume.indexZ);
    }
  };
  
  sliceX.onScroll = _updateThreeDX;
  sliceY.onScroll = _updateThreeDY;
  sliceZ.onScroll = _updateThreeDZ;  
  
};

function createData() {
  

  // we support here max. 1 of the following
  //
  // volume (.nrrd,.mgz,.mgh)
  // labelmap (.nrrd,.mgz,.mgh)
  // colortable (.txt,.lut)
  // mesh (.stl,.vtk,.fsm,.smoothwm,.inflated,.sphere,.pial,.orig)
  // scalars (.crv)
  // fibers (.trk)
  
  //
  // the data holder for the scene
  // includes the file object, file data and valid extensions for each object
  _data = {
   'volume': {
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH', 'NII', 'GZ', 'IMG']
   },
   'volhdr': {
     'file': null,
     'filedata': null,
     'extensions': ['HDR']
   },
   'labelmap': {
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH']
   },
   'colortable': {
     'file': null,
     'filedata': null,
     'extensions': ['TXT', 'LUT']
   },
   'mesh': {
     'file': null,
     'filedata': null,
     'extensions': ['STL', 'VTK', 'FSM', 'SMOOTHWM', 'INFLATED', 'SPHERE',
                    'PIAL', 'ORIG', 'DX']
   },
   'scalars': {
     'file': null,
     'filedata': null,
     'extensions': ['CRV']
   },
   'fibers': {
     'file': null,
     'filedata': null,
     'extensions': ['TRK']
   },
  };  
  
}

//
// Reading files using the HTML5 FileReader.
//
function read(files) {
    
  createData();
  
  for ( var i = 0; i < files.length; i++) {
   
   var f = files[i];
   var _fileName = f.name;
   var _fileExtension = _fileName.split('.').pop().toUpperCase();
   var _fileSize = f.size;
   
   // check which type of file it is
   if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this can be either the volume or the labelmap
     
     // if we already have a volume, check if the current one is smaller
     // then, set it as a label map, else wise switch them
     if (_data['volume']['file']) {
       
       if (_data['volume']['file'].size < _fileSize) {
         // switcharoo
         _data['labelmap']['file'] = _data['volume']['file'];
         _data['volume']['file'] = f;
         
       } else {
         
         _data['labelmap']['file'] = f;
         
       }
       
     } else {
       
       // no volume yet
       _data['volume']['file'] = f;
       
     }
     
  
   } else if (_data['volhdr']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a scalars file
     _data['volhdr']['file'] = f;
     
   } else if (_data['colortable']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a color table
     _data['colortable']['file'] = f;
     
   } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a mesh
     _data['mesh']['file'] = f;
     
   } else if (_data['scalars']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a scalars file
     _data['scalars']['file'] = f;
     
   } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a fibers file
     _data['fibers']['file'] = f;
     
   }
   
  }

  // we now have the following data structure for the scene
  window.console.log('New data', _data);
  
  var _types = Object.keys(_data);
  
  // number of total files
  var _numberOfFiles = files.length;
  var _numberRead = 0;
  window.console.log('Total new files:', _numberOfFiles);
  
  //
  // the HTML5 File Reader callbacks
  //
  
  // setup callback for errors during reading
  var errorHandler = function(e) {
  
   console.log('Error:' + e.target.error.code);
   
  };
  
  // setup callback after reading
  var loadHandler = function(type) {
  
   return function(e) {
  
     // reading complete
     var data = e.target.result;
     /*
     var base64StartIndex = data.indexOf(',') + 1;
     data = window.atob(data.substring(base64StartIndex));
*/
     
     // attach the data to our scene
     _data[type]['filedata'] = data;
     
     _numberRead++;
     if (_numberRead == _numberOfFiles) {
       
       // all done, start the parsing
       parse(_data);
       
     }
   };
  };


  //
  // start reading
  //
  _types.forEach(function(v) {
  
   if (_data[v]['file']) {
     
     var reader = new FileReader();
     
     reader.onerror = errorHandler;
     reader.onload = (loadHandler)(v); // bind the current type
     
     // start reading this file
     reader.readAsArrayBuffer(_data[v]['file']);
   }
   
  });

};

//
// Parse file data and setup X.objects
//
function parse(data) {
  
  // initialize renderers
  initializeRenderers();
  
  if (data['volume']['file']) {
   
   // we have a volume
   volume = new X.volume();
   volume.file = data['volume']['file'].name;
   volume.filedata = data['volume']['filedata'];
   
   if (data['volhdr']['file']) {
   	 volume.hdrfile = data['volhdr']['file'].name;
   	 volume.hdrfiledata = data['volhdr']['filedata'];
   }
   
   var colortableParent = volume;
   
   if (data['labelmap']['file']) {
     
     // we have a label map
     volume.labelmap.file = data['labelmap']['file'].name;
     volume.labelmap.filedata = data['labelmap']['filedata'];
     colortableParent = volume.labelmap;
     
   }
   
   if (data['colortable']['file']) {
     
     // we have a color table
     colortableParent.colortable.file = data['colortable']['file'].name;
     colortableParent.colortable.filedata = data['colortable']['filedata'];
     
   }
   
   // add the volume
   ren3d.add(volume);
    
    
   ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
   
  }
  
  if (data['mesh']['file']) {
   
   // we have a mesh
   mesh = new X.mesh();
   mesh.file = data['mesh']['file'].name;
   mesh.filedata = data['mesh']['filedata'];
   
   mesh.transform.matrix = new X.matrix(
	  [[1, 0, 0, -103], [0, 1, 0, -115],
	  [0, 0, 1, -100], [0, 0, 0, 1]]);
	  
   if (data['scalars']['file']) {
     
     // we have scalars
     mesh.scalars.file = data['scalars']['file'].name;
     mesh.scalars.filedata = data['scalars']['filedata'];
     
   }
   
   // add the mesh
   ren3d.add(mesh);
    
   ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
   
  }
  
  if (data['fibers']['file']) {
   
   // we have fibers
   fibers = new X.fibers();
   fibers.file = data['fibers']['file'].name;
   fibers.filedata = data['fibers']['filedata'];
   /*
fibers.transform.matrix = new X.matrix(
	  [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -130],
	  [0, -1, 6.123031769111886e-17, 130], [0, 0, 0, 1]]);
*/
   fibers.modified();

   // add the fibers
   ren3d.add(fibers);
   
/*
ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
*/
   
  }
  
  //ren3d.resetRender();
  
  ren3d.render();
  
  ren3d.onShowtime = function() {
  	window.console.log('Loading completed.');
    
    if (_data.volume.file != null) {
      
      // show any volume also in 2d
      sliceX.add(volume);
      sliceY.add(volume);
      sliceZ.add(volume);
      sliceX.render();
      sliceY.render();
      sliceZ.render();
      
    }
    
    setupUi();

  }

};


function closeDialog() {
	$("#dialog-modal").dialog('close');
}

function saveFile() {
	if (volume.file == null) {
		return;
	}
	
	jQuery("#saveFileButton").attr("disabled", "disabled");
	jQuery("#saveFileInfo").html("Preparing file...<img src=\"gfx/ajax-loader.gif\">");
	
	// get volume info
	var z = volume.image.length;
	var y = volume.image[0].length;
	var x = volume.image[0][0].length;
	var pixx = volume.spacing[0];
	var pixy = volume.spacing[1];
	var pixz = volume.spacing[2];
	
	// get image volume data in an array,
	// each slice is stored as string, as an element of the array,
	// each point has an integer value to represent intensity,
	// on each slice, points ordered from the left upper corner
	// to the right lower corner, and separated by lines.
	// Points are separated by comma ","
	// lines are separated by semicolon ";"
	// if all the points in an entire line are all 0, 
	// you can optionally use a single 0 to save space. 
	var myarr = new Array();
	for (var i = 0; i < z; i++) {
		var image2 = volume.image[i];
		var slice = "";
		for (var j = 0; j < y; j++) {
			var image3 = image2[j];
			var line = "";
			var all_zero = true;
			for (var k = 0; k < x; k++) {
				line += image3[k] + ",";
				if (all_zero && image3[k] != 0) {
					all_zero = false;
				}
			}
			if (all_zero) {
				slice += "0;";
			} else {
				slice += line+";";
			}
		}
		myarr.push(slice);
	}
	
	// debugging info
	window.console.log("x=" + x + ", y=" + y + ", z=" + z);
	window.console.log("pixx=" + pixx + ", pixy=" + pixy + ", pixz=" + pixz);
	window.console.log(myarr);
	
	// send request to generate file
	jQuery.post("http://ec2-184-73-98-217.compute-1.amazonaws.com/download.php", { 'x': x, 'y': y, 'z':z, 'pixx': pixx, 'pixy': pixy, 'pixz':pixz, 'data': myarr  } , function(data) {
  		jQuery("#saveFileButton").removeAttr("disabled");
		jQuery("#saveFileInfo").html(data);
	}).error(function() { 
		jQuery("#saveFileButton").removeAttr("disabled");
		jQuery("#saveFileInfo").html("Error");
	});
	
}
