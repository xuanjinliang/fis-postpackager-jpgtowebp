### 安装

```javascript
   npm install fis-postpackager-jpgtowebp
```

### 使用

```javascript
    //fis2配置
    modules : {
    	postpackager : 'jpgtowebp'
    },
    settings : {
    	postpackager : {
    		'jpg-towebp' : {
                quality: 50 //压缩值，默认50
            }
    	}
    }
    
    //fis3配置
    .match('::package', {
        postpackager: fis.plugin('jpgtowebp',{
            quality: 60
        })
    })
```

项目中的JPG图会对应生成一个新的webp格式的图（名字和路径跟原来的jpg保持一致）。

当浏览器支持webp就加载webp，否则就加载jpg。

### 全局变量

`window.__isWebp` 表示当前浏览器是否支持webp，true为支持，false为不支持。

(注：0.0.8修复页面加载时，由于页面重定向css样式，导致页面先显示没有样式的页面，后正常的问题就是会闪屏，所以添加了判断css是否加载完成，加载完成才显示页面)

(欢迎反馈BUG，方便提升插件的质量)

