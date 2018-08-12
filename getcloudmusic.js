//首先要搭建网易云音乐的node.js的api平台方可使用
/*
个人想法：
1. 在主页的nowplaying获取歌手和歌名
2. 将两个变量使用searchkeyword方法，用ajax获取云音乐的搜索结果
3. 默认使用第一个json值，可能准确率是最高的
4. 将第一个的json值的id传入url，获取mp3文件
5. appendto到主页播放

然而我太zz了，还是在ajax传到另一个ajax方法
*/
var nowid;

// Stuff to do as soon as the DOM is ready

function searchkeyword(name, artist) {
  $.ajax({
    type: "GET",
    url: "https://api.fil.fi:444/search?",
    data: {
    'keywords': name +' '+ artist //加空格以便提高准确率
    },
    xhrFields: {
      withCredentials: true
   },
    dataType: "json",
    async: false,
    success: function(result) {
        songid = result.result.songs[0].id;
        initmusic(songid);
    }
  });
}

var realmusic ;
function initmusic(id) {
  $.ajax({
    type: "GET",
    url: "https://api.fil.fi:444/music/url?",
    data: {
      'id': id
    },
    xhrFields: {
      withCredentials: true
   },
    async: false,
    dataType: "json",
    success: function(data) {
      str = data.data[0].url;
      fix = str.replace(/http:/, "https:");
      realmusic = fix;
    }
  });
}
