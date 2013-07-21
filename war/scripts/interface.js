



//(function($) {
//	$.fn.spin = function(opts, color) {
//		var presets = {
//			"tiny": { lines: 8, length: 2, width: 2, radius: 3 },
//			"small": { lines: 8, length: 4, width: 3, radius: 5 },
//			"large": { lines: 10, length: 8, width: 4, radius: 8 }
//		};
//		if (Spinner) {
//			return this.each(function() {
//				var $this = $(this),
//					data = $this.data();
//
//				if (data.spinner) {
//					data.spinner.stop();
//					delete data.spinner;
//				}
//				if (opts !== false) {
//					if (typeof opts === "string") {
//						if (opts in presets) {
//							opts = presets[opts];
//						} else {
//							opts = {};
//						}
//						if (color) {
//							opts.color = color;
//						}
//					}
//					data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
//				}
//			});
//		} else {
//			throw "Spinner class not available.";
//		}
//	};
//})(jQuery);



//<style type="text/css">
//#whitebg, #blackbg {
//  position: relative;
//  border-radius: 16px;
//  box-shadow: 0px 1px 3px rgba(0,0,0,0.75);
//  width: 200px;
//  height: 200px;
//  display: inline-block;
//  margin-right: 8px;
//  -webkit-transform: translateZ(0);
//  overflow: hidden;
//  -webkit-transition-duration: 0.5s;
//  -moz-transition-duration: 0.5s;
//  -ms-transition-duration: 0.5s;
//  -o-transition-duration: 0.5s;
//  vertical-align: top;
//}
//img {
//  border-radius: 16px;
//  -webkit-transition-duration: 0.5s;
//  -moz-transition-duration: 0.5s;
//  -ms-transition-duration: 0.5s;
//  -o-transition-duration: 0.5s;
//  cursor: pointer;
//  opacity: 0;
//}
//#whitebg {
//  background-color: white;
//}
//#blackbg {
//  background-color: black;
//}
//.fadeOut {
//  opacity: 0;
//}
//.fadeIn {
//  opacity: 1;
//}
//</style>

//window.onload = function() {
//    createSlideshow( document.getElementById('whitebg'), polaroidCounter(), 'black' );
//    createSlideshow( document.getElementById('blackbg'), polaroidCounter(), 'white' );
//  };
//<script type="text/javascript">
//var createSlideshow = function(container, nextURLFunc, color) {
//  var img = new Image();
//  var w = container;
//  var wspinner = new Spinner(w, color);
//  w.appendChild(img);
//  img.onload = function() {
//    var self = this;
//    w.style.width = self.width + 'px';
//    w.style.height = self.height + 'px';
//    wspinner.hide();
//  };
//  wspinner.onhide = function() {
//    img.className = 'fadeIn'; 
//  };
//  wspinner.onshow = function() {
//    img.src = nextURLFunc();
//  };
//  var advanceTimeout = null;
//  var advance = function() {
//    img.className = 'fadeOut';
//    wspinner.show();
//    if (advanceTimeout != null) {
//      clearTimeout(advanceTimeout);
//      advanceTimeout = null;
//    }
//    advanceTimeout = setTimeout(function(){advance();}, 5000);
//  };
//  container.onclick = advance;
//  setTimeout(function(){advance();}, 5000);
//  wspinner.show();
//  img.src = nextURLFunc();
//};
//var polaroidCounter = function() {
//  var c = -1;
//  return function() {
//     c = (c + 1) % 8;
//     return 'examples/polaroids/'+(c+1)+'.jpg';
//  };
//};
//window.onload = function() {
//  createSlideshow( document.getElementById('whitebg'), polaroidCounter(), 'black' );
//  createSlideshow( document.getElementById('blackbg'), polaroidCounter(), 'white' );
//};
//</script>