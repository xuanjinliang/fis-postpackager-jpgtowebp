(function () {

	var data_attri,
	funs = [],
	cssNum = 0,
	d = document;

	var html = document.getElementsByTagName('html')[0];
	html.style.visibility = 'hidden';

	check_webp_feature(function (result) {

		data_attri = result ? 'data-webpNew' : 'data-webpOriginal';
		var link = d.getElementsByTagName('link');
		if(link.length > 0){
			assign('href', link);
			setTimeout(display, 50000);
		}else{
			display();
		}

		ready(function () {
			//console.log('dom加载完成');
			assign('src', d.getElementsByTagName('img'));
		});

	});
	
	function display(){
		html.setAttribute('style', html.getAttribute('style').replace(/visibility\s?:[^:;]+;/g, ""));
	}

	function check_webp_feature(callback) {
		var kTestImages = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
		var img = new Image();
		img.onload = function () {
			var result = (img.width > 0) && (img.height > 0);
			window.__isWebp = true;
			callback(result);
		};
		img.onerror = function () {
			window.__isWebp = false;
			callback(false);
		};
		img.src = "data:image/webp;base64," + kTestImages;
	}

	//塞内容
	function assign(attribute, arr) {
		for (var i = arr.length; i--; ) {
			if (arr[i].getAttribute(data_attri)) {
				arr[i].setAttribute(attribute, arr[i].getAttribute(data_attri));
				if (attribute == 'href') {
					cssNum += 1;
					loadCss(arr[i], function () {
						cssNum -= 1;
						if (cssNum <= 0) {
							display();
						}
					});
				}
			}
		}
	}

	function loadCss(ele, fn) {
		if (!ele) {
			return;
		}
		var node = ele;
		if (node.attachEvent) {
			node.attachEvent('onload', function () {
				fn(null, node)
			});
		} else {
			setTimeout(function () {
				poll(node, fn);
			}, 0); // for cache
		}
		function poll(node, callback) {
			var isLoaded = false;
			if (/webkit/i.test(navigator.userAgent)) { //webkit
				if (node['sheet']) {
					isLoaded = true;
				}
			} else if (node['sheet']) { // for Firefox
				try {
					if (node['sheet'].cssRules) {
						isLoaded = true;
					}
				} catch (ex) {
					// NS_ERROR_DOM_SECURITY_ERR
					if (ex.code === 1000) {
						isLoaded = true;
					}
				}
			}
			if (isLoaded) {
				setTimeout(function () {
					callback(null, node);
				}, 1);
			} else {
				setTimeout(function () {
					poll(node, callback);
				}, 10);
			}
		}
		node.onLoad = function () {
			fn(null, node);
		}
	}

	function ready(fn) {

		if (funs.push(fn) > 1)
			return;

		if (d.addEventListener) {
			var runFun = function () {
				fn(); //执行函数
				//注销事件, 避免反复触发
				d.removeEventListener('DOMContentLoaded', runFun, false);
			};

			if (/complete|loaded|interactive/.test(d.readyState) && d.body) {
				fn();
			} else {
				d.addEventListener('DOMContentLoaded', runFun, false)
			}
		} else if (d.attachEvent) { //IE

			//使用doScroll方法来检测DOM树是否渲染完成

			var bTop = false;

			try {
				//处于iframe中，使用doScroll方法并不代表DOM加载完毕
				bTop = window.frameElement == null;
			} catch (e) {}
			//用bTop标识是否使用doScroll来触发ready函数
			if (d.documentElement.doScroll && bTop) {
				(function () {
					try {
						d.documentElement.doScroll('left');
						fn();
					} catch (e) {
						setTimeout(arguments.callee, 1);
					}

				})();
			}
		}

	}
})();