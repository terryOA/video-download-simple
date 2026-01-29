// api/parse-video.js
const ytdlp = require('yt-dlp-exec');
const { PassThrough } = require('stream');

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, quality } = req.body;
    if (!url || !quality) {
      return res.status(400).json({ success: false, message: '缺少链接或画质参数' });
    }

    // 配置 yt-dlp 参数
    const ytdlpArgs = [
      url,
      '-f', quality === 'audio' ? 'bestaudio[ext=m4a]/bestaudio' : `bestvideo[height<=${quality.slice(0, -1)}]+bestaudio/best[height<=${quality.slice(0, -1)}]`,
      '--get-url', // 仅获取真实下载链接
      '--no-playlist', // 不解析播放列表
    ];

    // 执行 yt-dlp 解析
    const downloadUrl = await ytdlp(null, ytdlpArgs);

    if (!downloadUrl) {
      return res.status(404).json({ success: false, message: '未找到对应画质的下载链接' });
    }

    // 返回解析结果
    res.status(200).json({
      success: true,
      downloadUrl: downloadUrl.trim(),
      quality,
    });
  } catch (err) {
    console.error('解析失败：', err);
    res.status(500).json({
      success: false,
      message: `解析失败：${err.message || '平台不支持或链接无效'}`,
    });
  }
};
