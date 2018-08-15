/*
simple last.fm jQuery plugin
shows recently played tracks
Athor: Ringo Rohe
       - with much help from Douglas Neiner

*/

(function($) {

  //地址栏获取参数，照抄 https://blog.csdn.net/FungLeo/article/details/49404789
  (function($) {
    $.getUrlParam = function(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return 'finer04';
    }

  })(jQuery);


  //监听 show 按钮,事件类

  $('#showtrack').on("click",function() {
    showtrack('3month');
  });

  $('#refresh').click(function() {
    refresh();
  });

  $('#tagfix').click(function() {
    tagfix();
  });

  $('#saveinfo').click(function() {
    var account = $("#settinguser").val();
    var live = $('input:radio:checked').val();
    if (account.length == 0) {
      account = 'finer04';
    } else {
      window.open("https://now.goubi.me/?username=" + account + "&liveplay=" + live);
    }
  });


  //移动端模拟 hover 效果，参考 https://blog.csdn.net/Maximus_ckp/article/details/78021362
  document.body.addEventListener('touchstart', function() {});
  var myLinks = document.querySelectorAll('#prebg');
  for (var i = 0; i < myLinks.length; i++) {
    myLinks[i].addEventListener('touchstart', function() {
      this.className = "prebg-on";
    }, false);
    myLinks[i].addEventListener('touchend', function() {
      this.className = "prebg";
    }, false);
  }


  //加载图像完毕才淡入到背景，参考 https://www.jianshu.com/p/629ce1f9253f
  function addbgimage(url) {
    var background = new Image();
    background.src = url;
    background.onload = function() {
      appendbg(background.src);
    }
  }

  function appendbg(url) {
    var $bg = $("<div>", {
      id: 'bg',
      style: "background : linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),url(" + url + ") fixed no-repeat center center; animation-name: fadein ; background-size:cover; "
    }).appendTo('#prebg');
  }

  //修改图片信息，过滤300x300，让专辑图像还原原图分辨率。替换又拍云节点，识别浏览器传输 webp 或 png

  function repic(url) {
    var str = url;
    var bg = str.replace(/300x300\//, "").replace(/lastfm-img2.akamaized.net/, "lastfmimg.umi.pw");
    return bg;
  }

  //检查字数，防止超出
  function checksong(songname) {
    var checkname = songname;
    var checklength = songname.length;
    var num = 45;
    if (checklength > num) {
      songname = songname.substring(0, num) + '...';
      return songname;
    } else {
      return songname;
    }
  }

  //首字母大写，因为用 text-transform: capitalize 会将 's 变成大写
  function firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
  }

  //ajax 获取该用户的 lastfm 信息
  var useravater;
  $.ajax({
    type: "GET",
    url: "https://ws.goubi.me/2.0/?method=user.getinfo&user=" + $.getUrlParam('username') + "&api_key=6fedfd312dc47a4de168502018c02ca3&format=json",
    dataType: "json",
    async: false,
    success: function(data) {
      var user = "<div class='container'>";
      $.each(data, function(i, n) {
        useravater = n.image[2]['#text'];
        $('#info-img').attr('src', useravater);
        $('<img src="' + useravater + '" width="30" height="30" class="d-inline-block align-top rounded-circle mx-2" id="navimg" alt="">').insertBefore('.navbar-brand')
        $('#info-username').append(n.name);
        $('#info-scrobbles').append(n.playcount + ' 次');
      });
    }
  });

  $('#navimg').bind({
    mouseover: function() {
      $(this).addClass('animated shake');
    },
    mouseout: function() {
      $(this).removeClass('animated shake');
    }
  });


//点击 show toptrack 按钮事件
var check = false; //默认关闭showtrack状态
var open = false;
function showtrack(date) {
  if (!check) {
    $('.lastfm').fadeOut(400);
    $('.toptrack').animateCss('zoomIn').show();
    $('#refresh').html('Back');
    $('animated zoomIn').removeClass('animated zoomIn');

    if (!open){
    open = true;
    setTimeout(function() {
    $(".toptrack h2").append(firstUpperCase($.getUrlParam('username')) + '\'s Top Tracks Ranking');
    $(".toptrack p:first").append('Default: Last 90 days (Top 12)');

    //生成选项组

    var days = ['Last 7 days','Last 30 days','Last 180 days','Last 365 days','All time'];
    var p ;
    /*
    for( p in days) {
    $('<button>',{
      type : 'button',
      class : 'btn btn-secondary',
      html : days[p],
      id : 'date' + p,
    }).appendTo('#group');
  }*/
  }, 200);
    check = true; //已开启showtrack
  }
}
gettoptrack(date);
}

function refresh() {
  if (check) {
      $('.toptrack').hide(1500);
      $('.lastfm').fadeIn(1400);
      $('#prebg').fadeIn(300);
      $('#refresh').html('Refresh');
      $('.toptrack p:first,.toptrack h2,#group').empty();
      $('.top-list').empty();
      check = false;
      open = false;
  } else if (!check) {
    init();
  }
}


//获取用户专辑排名
var imgload = 1;

  function gettoptrack(date) {
  var limit = 12;
  $.ajax({
    type: "GET",
    url: "https://ws.goubi.me/2.0/?method=user.gettopalbums&limit=" + limit + "&period=" + date +"&user=" + $.getUrlParam('username') + "&api_key=6fedfd312dc47a4de168502018c02ca3&format=json",
    dataType: "json",
    async: false,
    success: function(data) {
      $.each(data, function(i, rank) {
        //对图片进行尺寸更改，并且检验是否无图
        function checkimg(url) {
          url = url.replace(/lastfm-img2.akamaized.net/, "lastfmimg.umi.pw");
          return (!url) ? 'img/no.jpg' : url;
        }

          //生成模板
          for (var i = 0; i < limit; i++) {
            makelist(rank.album[i].name, rank.album[i].artist.name, rank.album[i].playcount, checkimg(rank.album[i].image[3]['#text']));
          }

          //当所有专辑图片加载完毕后才显示排名
          var imgloading = new Array();
          for (var i = 0; i < limit; i++) {
            imgloading[i] = new Image();
            imgloading[i].src = checkimg(rank.album[i].image[3]['#text']);
            imgloading[i].onload = function() {
              imgload++;
              if (imgload > limit) {
                $('.spinner').hide();
                $('.top-list').attr('style', '').addClass('animated fadeIn');
              }
            }
        }
      });
    }
  });
}


//生成排行榜模板
var x = 0;

function makelist(songname, artist, playtimes, img) {

  var info = {
    name: "<h4>" + songname + '</h4>',
    singer: '<p class="lead">' + artist + '</p>',
    count: '<p class="lead">' + playtimes + ' plays </p>',
  };

  var $imgp = $("<img>", {
    class: 'col top-track-pic',
    src: img,
  }).wrap('<div class="col-md-3 top-track-pic"></div>');

  var $rankinfo = $('<div>', {
    class: 'col top-track-info pt-2',
    html: info.name + info.singer + info.count,
  });

  $("<li>", {
    class: 'col-md-3 mt-5 px-3'
  }).append($imgp).append($rankinfo).appendTo('.top-list');

  //$('.top-list li').eq(x).append($imgp).append($rankinfo);

  x++;
}



//主体功能
var recentTracksClass = function(elem, options) {

  var $myDiv = elem,
    lasttime = 0,
    refresh = parseInt(options.refresh, 10),
    $list, timer, lastCurrentPlaying = false,
    lastfmLinkPrefix = 'http://www.last.fm/music/';

  function error(message) {
    $("<p>", {
      class: "error",
      html: message
    }).appendTo('.loading');
    window.clearInterval(timer);
  }

  function makeTwo(i) {
    return i < 10 ? '0' + i : i;
  }

  function doLastPlayedStuff() {

    // remove error div if exists
    $myDiv.children('.error').remove();

    //create URL，nowplaying用
    //为什么要加上callback，因为防止json的缓存
    var url = 'https://ws.goubi.me/2.0/?callback=?',
      params = {
        method: "user.getrecenttracks",
        format: "json",
        limit: options.limit,
        user: options.username,
        api_key: options.apikey
      };

    //sending request
    $.getJSON(url, params, function(data) {

      var foundCurrentPlayingTrack = false;

      //check for errors
      if (!data || !data.recenttracks) {
        return error('Username "' + options.username + '" does not exist!');
      } else if (!data.recenttracks.track) {
        return error('"' + options.username + '" has no tracks to show!');
      }

      //create ul if not exists
      $list = $myDiv.children('ul');
      if (!$list.length) {
        $list = $("<ul>").appendTo($myDiv.html(''));
      }

      $(data.recenttracks.track.reverse()).each(function() {
        var track = this;
        var tracktime, tracknowplaying, ts, listitem, dateCont;


        if (track.date && track.date.uts > lasttime) {
          tracktime = parseInt(track.date.uts, 10);
        }


        if (track['@attr'] && track['@attr'].nowplaying === 'true') {
          foundCurrentPlayingTrack = true;
          if (lastCurrentPlaying.name !== track.name) {
            lastCurrentPlaying = track;
            tracknowplaying = true;
            $list.children('li.nowplaying').remove();
            $('.tag-artist').remove();
            $('.tag-songname').remove();
            $('.pre-album-img img').remove();
            $('.pre-album').removeClass('fadeOutLeft');
            $('#prebg').empty();
            NProgress.start();
            NProgress.inc();
          }
        }


        if (tracktime > lasttime || (tracknowplaying && options.shownowplaying)) {

          // 创造界面
          listitem = $("<li>", {
            class: tracknowplaying ? "nowplaying animated fadeIn" : ""
          });

          //---前一首曲子---
          if (tracknowplaying) {
            var predata = data.recenttracks.track[0];
            $('.pre-album').addClass('animated fadeInLeft');

            var preani;
            $(function() {
            preani =  setTimeout(function() {
                $('.pre-album').removeClass('fadeInLeft').addClass('fadeOutLeft');
              }, 5000);

            })
            clearTimeout(preani);

            var prealbum = $('.pre-album-tag');

            var tagsn = $('<p>', {
              class: 'tag-songname',
              html: checksong(predata.name),
            }).appendTo(prealbum);

            var tagartist = $('<p>', {
              class: 'lead tag-artist',
              html: predata.artist['#text'],
            }).appendTo(prealbum);


            //如果前一张专辑没有图像，则输出 no.jpg
            if (predata.image[3]['#text']) {
              var prebg1 = $('<img>', {
                class: 'float-left',
                src: repic(predata.image[3]['#text']),
              }).appendTo('.pre-album-img');
            } else {
              var prebg1 = $('<img>', {
                class: 'float-left',
                src: repic('img/no.jpg'),
              }).appendTo('.pre-album-img');
            }
          }

          //同步播放，由于手头没有国内服务器，故作为实验性功能

          if ($.getUrlParam('liveplay') == 'on') {
            searchkeyword(track.name, track.artist['#text']);
            const ap = new APlayer({
              container: document.getElementById('aplayer'),
              mini: true,
              autoplay: true,
              audio: [{
                name: track.name,
                artist: track.artist['#text'],
                url: realmusic,
                cover: repic(track.image[3]['#text']),
              }]
            });
          }


            $('#navimg').animateCss('flip');
          // ----------------- IMAGE -----------------
          //如果存在图像，给img标签添加属性，用lazyload给addbgimage赋该图像的地址（否则在外面会获取到两个值）
          if (options.cover) {
            if (track.image[3]['#text']) {
              var nowbg = track.image[3]['#text'];
              var $cover = $("<img>", {
                alt: track.artist['#text'],
                'data-original': repic(nowbg),
                src: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
                class: "lazy trackimg animated infinite pulse ",
                draggable: "false",
              }).lazyload({
                effect: "fadeIn",
                load: function() {
                  NProgress.done();
                  addbgimage(repic(nowbg));
                }
              }).appendTo(listitem);

              if (options.coverlinks) {
                var coverpath = [
                  track.artist['#text'], '/', track.album['#text']
                ].join('').replace(/[\s]/gi, '+');

                $cover.wrap($("<a>", {
                  href: lastfmLinkPrefix + coverpath,
                  target: options.linktarget
                }));
              }


            }
          }

          // ---------------- DATE -------------------
          if (options.datetime) {

            if (tracknowplaying) {
              dateCont = options.username + ' is listening to...';

            } else {
              ts = new Date(parseInt(tracktime * 1000));
              var month = new Array(12)
              month[0] = "January"
              month[1] = "February"
              month[2] = "March"
              month[3] = "April"
              month[4] = "May"
              month[5] = "June"
              month[6] = "July"
              month[7] = "August"
              month[8] = "September"
              month[9] = "October"
              month[10] = "November"
              month[11] = "December"
              dateCont = 'Last played : ' + month[ts.getMonth()] + '  ' + ts.getDate() + ', ' + ts.getFullYear() + ' / ' + ts.getHours() + ':' + makeTwo(ts.getMinutes());
            }

            $("<div>", {
              class: "date lead animated fadeInDown",
              html: dateCont
            }).appendTo(listitem);
          }


          // ----------------- TRACK -----------------
          var $track = $("<div>", {
            class: 'track animated fadeIn px-1 mt-3',
            html: '<p>' + checksong(track.name) + '</p>'
          }).appendTo(listitem);

          var $title = $(document).attr("title", '▶ ' + track.name + ' by ' + track.artist['#text']);
          $(function() {
            setTimeout(function() {
              NProgress.done();
            }, 3000);
          })


          if (options.tracklinks) {
            var trackpath = [
              track.artist['#text'], '/', track.album['#text'], '/', track.name
            ].join('').replace(/[\s]/gi, '+');

            $track.wrapInner($("<a>", {
              href: lastfmLinkPrefix + trackpath,
              target: options.linktarget
            }));
          }

          // ---------------- ARTIST -----------------
          var $artist = $("<div>", {
            class: 'artist animated fadeIn text-center',
            html: '<p>' + track.artist['#text'] + '</p>'
          }).appendTo(listitem);

          if (options.artistlinks) {
            $artist.wrapInner($("<a>", {
              href: lastfmLinkPrefix + (track.artist['#text'].replace(/[\s]/gi, '+')),
              target: options.linktarget
            }));
          }



          // ---------------- ALBUM ------------------
          var $album = $("<div>", {
            class: 'album animated fadeInUp w-100 text-truncate mx-1',
            html: 'Album : ' + track.album['#text']
          }).appendTo(listitem);

          if (options.artistlinks) {
            var artistpath = [
              track.artist['#text'], '/', track.album['#text']
            ].join('').replace(/[\s]/gi, '+');

            $album.wrapInner($("<a>", {
              href: lastfmLinkPrefix + artistpath,
              target: options.linktarget
            }));
          }

          //add listitem to list
          $list.prepend(listitem);

          if (!tracknowplaying) {
            lasttime = tracktime;
          }
        }

      });


      if (!foundCurrentPlayingTrack) {
        lastCurrentPlaying = false;
        //remove old nowplaying entry
        $list.children('li.nowplaying').remove();
        $('.tag-artist').remove();
        $('.tag-songname').remove();
        $('.pre-album-img').remove();
      }

      //检查ul元素内有没有内容，如果没有就刷新，每10秒检测一次
      setInterval(function() {
        if ($('#lastBox ul li').length == 0) {
          $('#bg').remove();
          init();
        }
      }, 10000);

      //对背景图重复添加进行监控，如果超过两个背景就删除
      setInterval(function() {
        $("#prebg #bg").eq(1).remove();
      }, 1000);


      //throw old entries away
      if (options.grow === false) {
        while ($list.children().length > options.limit) {
          $list.children('li').last().remove();
        }
      }

    });

  }

  if (refresh > 0) {
    timer = window.setInterval(function() {
      doLastPlayedStuff();
    }, refresh * 1000);
  }

  doLastPlayedStuff();
};

/* ######################## Recent Tracks Class ends here ################################# */

/* ##################################### Recent Tracks Function ########################### */

$.fn.lastplayed = function(options) {
  var opts = $.extend({}, $.fn.lastplayed.defaults, options);

  if (typeof(options.username) === "undefined") {
    return this;
  }

  if (typeof(options.apikey) === "undefined") {
    return this;
  }

  return this.each(function() {
    recentTracksClass($(this), opts);
  });

};

$.fn.lastplayed.defaults = {
  limit: 20,
  refresh: 0,
  cover: true,
  coversize: 64,
  datetime: true,
  grow: false,
  shownowplaying: true,
  albumlinks: false,
  coverlinks: false,
  artistlinks: false,
  tracklinks: false,
  linktarget: '_blank'
};



/* ################################# Now Playing Function ################################ */

$.fn.nowplaying = function(options) {
  var opts = $.extend({}, $.fn.nowplaying.defaults, options);

  if (typeof(options.username) === "undefined") {
    return this;
  }

  if (typeof(options.apikey) === "undefined") {
    return this;
  }

  return this.each(function() {
    nowPlayingClass($(this), opts);
  });

};

$.fn.nowplaying.defaults = {
  refresh: 0,
  icon: false,
  hide: false,
  notplayingtext: 'nothing playing'
};

$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});

}(jQuery));
