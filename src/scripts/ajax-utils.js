// Get the browser-specific request object, either for
// Firefox, Safari, Opera, Mozilla, Netscape, or IE 7 (top entry);
// or for Internet Explorer 5 and 6 (bottom entry). 

function getRequestObject() {
  if (window.XMLHttpRequest) {
    return(new XMLHttpRequest());
  } else if (window.ActiveXObject) { 
    return(new ActiveXObject("Microsoft.XMLHTTP"));
  } else {
    return(null); 
  }
}

// Make an HTTP request to the given address. 
// Display result in the HTML element that has given ID.

function ajaxResult(address, search) {
//alert("ready to lauch...");
  var request = getRequestObject();
  request.onreadystatechange = 
    function() { showResponseText(request, search); };
  request.open("GET", address, true);
  request.send(null);
//alert("lauched...");
}

// Make an HTTP request to the given address. 
// Display result in the HTML element that has given ID.
// Use POST. 

function ajaxResultPost(address, data, search) {
//alert("ready to lauch...");
  var request = getRequestObject();
  request.onreadystatechange = 
    function() { showResponseText(request, 
                                  search); };
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
//alert("lauched...");
}

// Put response text in the HTML element that has given ID.

function showResponseText(request, search) {
  if ((request.readyState == 4) &&
      (request.status == 200)) {
	  var rawData = request.responseText;
	  //alert("raw data get");
	  var data = eval("(" + rawData + ")");
	  //alert("data get");
	  search.X = data.X;
	  search.oldX = data.oldX;
	  search.oldy = data.oldy;
	  search.loadModels();
	  //var table = getTable(data);
	  //htmlInsert(resultRegion, table);
	  
	  //htmlInsert(resultRegion, rawData);
  }
}

// Insert the html data into the element that has the specified id.

function htmlInsert(id, htmlData) {
  document.getElementById(id).innerHTML = htmlData;
}

// Return escaped value of textfield that has given id.
// The builtin "escape" function converts < to &lt;, etc.

function getValue(id) {
  return(escape(document.getElementById(id).value));
}



// temporary matlab i/o
function ajaxWrite(address, data) {
	//alert("ready to lauch...");
	  var request = getRequestObject();
	  request.onreadystatechange = 
	    function(){};
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type", 
	                           "application/x-www-form-urlencoded");
	  request.send(data);
	//alert("lauched...");
	}

function ajaxRead(address, search) {
	//alert("ready to lauch...");
	  var request = getRequestObject();
	  request.onreadystatechange = 
	    function(){showNewModel(request, 
                search); };
	  request.open("POST", address, true);
	  request.setRequestHeader("Content-Type", 
	                           "application/x-www-form-urlencoded");
	  request.send();
	//alert("lauched...");
	}

function showNewModel(request, search){
if ((request.readyState == 4) &&
	      (request.status == 200)) {
		  var rawData = request.responseText;
		  //alert("raw data get");
		  var data = eval("(" + rawData + ")");
		  //alert("data get");
		  search.X = data.X;
		  search.loadModels();
	  }
	}