/*
 * fis
 * http://fis.baidu.com/
 */
'use strict';
var execFile = require('child_process').execFile;
var cwebp = require('cwebp-binLocal');
var fs=require('fs');
var UglifyJS = require("uglify-js");

module.exports = function(ret, conf, settings, opt){
    //ret，打包文件列表的对象
    //conf，参数配置对象
    //settings和opt都用不上
	
    var dirPath = fis.project.getProjectPath();

    //用fis的api来循环遍历每个打包的文件，获取需要的打包文件列表
    fis.util.map(ret.src,function(subpath,file){
        //subpath，文件的相对路径
        //file，fis的文件对象

        var new_img_folder,  //要生成新webp图的文件夹路径
            origin_img_folder,   //原图的文件夹路径
            content,
            quality = settings.quality ? settings.quality : 50;
        
        //判断当前处理文件是否为图片
        if(file.isImage() && !/^_/.test(file.basename)){
            
            if(file.rExt == '.jpg'){
				if(file.release){
					new_img_folder = dirPath + file.release.replace(file.ext,'');
				}else{
					new_img_folder = file.dirname;
				}

				var hash = new_img_folder + fis.media().get('project.md5Connector', '_') + file.getHash();
				if(!fis.util.isDir(new_img_folder)){
					fis.util.mkdir(new_img_folder);
				}
				execFile(cwebp, (file.fullname + ' -q ' + quality +' -o ' + hash+'.webp').split(/\s+/), function(err, stdout, stderr) {
					if(err){
						console.log(err);
					}
				});

            }
        }
        //处理css文件
        else if(file.isCssLike && file.ext == '.css'){
            replaceAllJPG(file.getContent(), file, dirPath + file.release.replace(/\/[^\/]+\.css$/,''));
        }
        //处理html文件
        else if(file.isHtmlLike){
		
            //处理页面，替换图片和样式地址
            htmlHandle(file.getContent(), file);
        }
    });

    
    //遍历合并css文件
    fis.util.map(ret.pkg, function(subpath, pkg, index) {
        var pkgs = {};

        if(pkg.id.indexOf(".css") > -1 ){
            pkgs[pkg.id] = ret.map.pkg["p"+index];			
            replaceAllJPG(pkg._content, pkg, dirPath + pkg.release.replace(/\/[^\/]+\.css$/,''));
        }

    });


    //最后不需要返回，只是需要在上面针对文件内容进行处理即可
}

//替换所有jpg格式为webp，并新建一个css文件
function replaceAllJPG(css_content, file, subpath){
    var file_url,
        reg = /\/+(\w*)(.jpg)/ig;

    css_content = css_content.replace(reg, function (m, $1) {
        if($1){
            return m.replace('.jpg','.webp');
        }
        return m;
    });
    if(!fis.util.isDir(subpath)){
        fis.util.mkdir(subpath);
    }
	
    if(file.useHash){
        file_url = subpath+"/"+file.filename+'_'+file.getHash()+"_webp.css";
    }else{
        file_url = subpath+"/"+file.filename+"_webp.css";
    }
	
	fs.writeFile(file_url, css_content, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

//处理html
function htmlHandle(content, file){
    var reg =/<(img)\s+[\s\S]*?\/?>\s*|<(link)\s+[\s\S]*?["'\s\w\/]>\s*/ig;
    content = content.replace(reg, function (m, $1, $2, $3) {
        var result,
            string = '',
            isCssLink = true;

        //$1为img标签，$2为link标签，$3为head标签
        if($1){

            result = m.match(/(?:\ssrc\s*=\s*)(?:'([^']+)'|"([^"]+)"|[^\s\/>]+)/i);
            
            if (result && result[0]) {

                //仅处理jpg
                if(result[0].match(/\.jpg/i) != null){

                    //data-webpOriginal存放原图路径，data-webpNew存放新的wepb图
                    string = result[0].replace(/\s*/g,'').replace('src=',' data-webpOriginal=');
                    string = string + result[0].replace(/\s*/g,'').replace('src=',' data-webpNew=').replace('.jpg','.webp');
                    return m.replace(result[0], string);
                }
                
            }
            
        }else if($2){

            result = m.match(/(?:\srel\s*=\s*)(?:'([^']+)'|"([^"]+)"|[^\s\/>]+)/i);
            if (result && result[2]) {
                var rel = result[2].replace(/^['"]|['"]$/g, '').toLowerCase();
                isCssLink = rel === 'stylesheet';
            }

            //对rel不是stylesheet的link不处理
            if (!isCssLink) {
                return m;
            }
            result = m.match(/(?:\shref\s*=\s*)(?:'([^']+)'|"([^"]+)"|[^\s\/>]+)/i);
            if(result && result[0]){

                if(result[0].match(/\.css/i) != null){
                    //data-webpOriginal存放原来的，data-webpNew存放对应的新webp样式
                    string = result[0].replace(/\s*/g,'').replace('href=',' data-webpOriginal=');
                    string = string + result[0].replace(/\s*/g,'').replace('href=',' data-webpNew=').replace('.css','_webp.css');
                    return m.replace(result[0], string);
                }
                
            }

        }
        return m;
    });
	
    content = content.replace(/<head[^>]*>[\s\S]*(<\/head>)/i,function(m, $1){
        if($1){
			return m.replace($1,webpJs()+$1);
        }
    });

    file.setContent(content);
}

//头部塞判断是否支持webp的处理js
    
function webpJs(){
    var result = UglifyJS.minify(__dirname+'/handle.js');
    return '<script>'+result.code+'</script>';
}

