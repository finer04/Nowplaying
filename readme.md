# Nowplaying

核心代码基于 [dcneiner/lastfm-recent-tracks-jquery-plugin](https://github.com/dcneiner/lastfm-recent-tracks-jquery-plugin) 进行二次改造。

利用 Last.fm API 获取用户正在聆听的歌曲信息，实时展示自己正在听什么音乐。

## 介绍

详情介绍：[自己的 Last.fm 实时播放的同步页面](https://fil.fi/archives/make-lastfm-nowplaying-page.html)

预览：https://now.goubi.me/

## 说明

1. 官方原版的 API 接口地址是 HTTP 1.1 的 HTTPS，我嫌可能影响速度，故使用自己的服务器反代。
2. 在原版 API 的专辑图像，最高的分辨率只有 `300x300`，不能满足全高清的要求。刚好 Last.fm 的专辑图是使用 Akamai CDN，可以在 URL 地址提供的参数修改，所以我改成使用原图的原分辨率
3. 正由于改成原分辨率，PNG 格式的专辑图可能过大，所以想使用 WebP 加快加载速度。但本人能力有限暂时无法用 JS 适配 Chrome 和 Firefox 。故使用又拍云的 CDN 进行适配，同时可以缓存下来加快速度