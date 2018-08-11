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
// searchkeyword('オレンジ色の決意', "yuiko");

function searchkeyword(name, artist) {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:3000/search?",
    data: {
      'keywords': name + artist
    },
    dataType: "json",
    async: true,
    success: function(data) {
      $.each(data, function(i, a) {
       songid = a.songs[0].id;
        init(songid);
      });
    }
  });
}


function init(id) {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:3000/music/url?",
    data: {
      'id': id
    },
    dataType: "json",
    success: function(data) {
      $.each(data, function(i, a) {
        $('audio').attr("src", a[0].url);
      });
    }
  });
}
