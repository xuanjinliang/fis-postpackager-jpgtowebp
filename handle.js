(function(){

    var data_attri,
        funs = [],
        d = document;
	
	var html = document.getElementsByTagName('html')[0];
	html.style.visibility = 'hidden';
		
    check_webp_feature(function(result){
        
        data_attri = result ? 'data-webpNew' : 'data-webpOriginal';
        assign('href', document.getElementsByTagName('link'));
        
        ready(function(){
            //console.log('dom加载完成');
            assign('src', document.getElementsByTagName('img'));
			html.setAttribute('style',html.getAttribute('style').replace(/visibility.+;/g,""));
        });
        
    });

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
    function assign(attribute, arr){
        for(var i = arr.length; i--;){
            if(arr[i].getAttribute(data_attri)){
                arr[i].setAttribute(attribute,arr[i].getAttribute(data_attri));
            }
        }
    }
    function ready(fn){

        if (funs.push(fn) > 1) return;

        if(d.addEventListener) {

            d.addEventListener('DOMContentLoaded', function() {
                //注销事件, 避免反复触发
                d.removeEventListener('DOMContentLoaded',arguments.callee, false);
                fn();            //执行函数
            }, false);

        }else if(d.attachEvent) {        //IE

            //使用doScroll方法来检测DOM树是否渲染完成

            var bTop = false;

            try {
                //处于iframe中，使用doScroll方法并不代表DOM加载完毕
                bTop = window.frameElement == null;
            } catch(e) {

            }
            //用bTop标识是否使用doScroll来触发ready函数
            if ( d.documentElement.doScroll && bTop ) {
                (function(){
                    try{
                        d.documentElement.doScroll('left');
                        fn();
                    }catch(e){
                        setTimeout( arguments.callee, 0 );
                    }
                    
                })();
            }
        }
        
    }


})();



