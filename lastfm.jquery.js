/*
simple last.fm jQuery plugin
shows recently played tracks
Athor: Ringo Rohe
       - with much help from Douglas Neiner
	   
*/

(function($) {

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
			console.log('当前backgroud.src为：' + background.src);
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
		var num = 50;
		if (checklength > num) {
			songname = songname.substring(0, num) + '...';
			return songname;
		} else {
			return songname;
		}
	}

	//ajax 获取该用户的 lastfm 信息
	var useravater;
	$.ajax({
		type: "GET",
		url: "https://ws.goubi.me/2.0/?method=user.getinfo&user=finer04&api_key=6fedfd312dc47a4de168502018c02ca3&format=json",
		dataType: "json",
		async: true,
		success: function(data) {
			var user = "<div class='container'>";
			$.each(data, function(i, n) {
				useravater = n.image[2]['#text'];
				user += "<div class='row'><div class='col-md5' style='margin-left:15px;'>" + "<img src=" + n.image[2]['#text'] + '" title="profile photo" data-toggle="tooltip" data-placement="bottom"></div>';
				user += "<div class='col-md-1'></div><div class='col-md-6'>" + "<h3>Username</h3>" + "<p>" + n.name + "</p><br>";
				user += "<h3>Scrobbles</h3>" + "<p>" + n.playcount + " 次</p></div></div>";
			});
			$('#result').append(user);
		}
	});

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

				//create URL
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

							// ------------ create list item -----------
							listitem = $("<li>", {
								class: tracknowplaying ? "nowplaying animated fadeIn" : ""
							});

							console.log("目前播放曲子：" + track.name + "\n 歌手：" + track.artist['#text']);

							//---前一首曲子---
							if (tracknowplaying) {
								var predata = data.recenttracks.track[0];
								$('.pre-album').addClass('animated fadeInLeft');

								$(function() {
									setTimeout(function() {
										$('.pre-album').removeClass('fadeInLeft').addClass('fadeOutLeft');
									}, 5000);
								})

								var prealbum = $('.pre-album-tag');

								var tagsn = $('<p>', {
									class: 'tag-songname',
									html: predata.name,
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

									console.log(nowbg);


									if (options.coverlinks) {
										var coverpath = [
										track.artist['#text'], '/', track.album['#text']].join('').replace(/[\s]/gi, '+');

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
									dateCont = '<img src="' + useravater + '" class="rounded-circle" height="26" width="26">' + options.username + ' is listening to...';

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
								class: 'track animated fadeIn',
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
								track.artist['#text'], '/', track.album['#text'], '/', track.name].join('').replace(/[\s]/gi, '+');

								$track.wrapInner($("<a>", {
									href: lastfmLinkPrefix + trackpath,
									target: options.linktarget
								}));
							}

							// ---------------- ARTIST -----------------
							var $artist = $("<div>", {
								class: 'artist animated fadeIn',
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
								class: 'album animated fadeInUp',
								html: 'Album : ' + track.album['#text']
							}).appendTo(listitem);

							if (options.artistlinks) {
								var artistpath = [
								track.artist['#text'], '/', track.album['#text']].join('').replace(/[\s]/gi, '+');

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

}(jQuery));