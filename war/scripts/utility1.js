function getRequestObject() {
  if (window.XMLHttpRequest) {
    return(new XMLHttpRequest());
  } else if (window.ActiveXObject) { 
    return(new ActiveXObject("Microsoft.XMLHTTP"));
  } else {
    return(null); 
  }
}

function ajaxResult(address, search) {
  var request = getRequestObject();
  request.onreadystatechange = 
    function() { showResponseText(request, search); };
  request.open("GET", address, true);
  request.send(null);
}

function ajaxTrainPost(address, data, search, i) {
  var request = getRequestObject();
  request.onreadystatechange = 
    function() { showResponse(request, 
                                  search); };
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
}

function ajaxStorePost(address, data, search) {
  var request = getRequestObject();
  request.onreadystatechange = 
    function(){};
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
}

function ajaxReadPost(address, data, result) {
  var request = getRequestObject();
  request.onreadystatechange = 
    function(){parseData(request, data, result)};
  request.open("POST", address, true);
  request.setRequestHeader("Content-Type", 
                           "application/x-www-form-urlencoded");
  request.send(data);
}

function parseData(request, data, result) {
  if ((request.readyState == 4) &&
      (request.status == 200)) {
	  var rawData = request.responseText;
	  if (data == "query=all"){
		  listData(parseInt(rawData));
	  }
	  else{
		  result.dataArray=eval("(" + rawData + ")");
		  result.showTestIter();
	  }
//	  var dataArrayString = rawData.split(";");
//	  var numTest = dataArrayString.length;
//	  for (i = 0; i<numTest; i++){
//		  result.dataArray.push(eval("(" + dataArrayString[i] + ")"));
//	  }
  }
}

function htmlInsert(id, htmlData) {
  document.getElementById(id).innerHTML = htmlData;
}

// Return escaped value of textfield that has given id.
// The builtin "escape" function converts < to &lt;, etc.
function getValue(id) {
  return(escape(document.getElementById(id).value));
}

function showNewModel(request, search){
if ((request.readyState == 4) &&
	      (request.status == 200)) {
		  var rawData = request.responseText;
		  var data = eval("(" + rawData + ")");
		  search.X = data.X;
		  search.loadModels();
	  }
	}

function listData(n){
	var str = "";
	for (i = 0; i<n; i++){
		str = str.concat("<a onclick='readtest("+i+")'>Test"+i+"</a>\n");
	}
	htmlInsert("datalistframe",str);
	
}