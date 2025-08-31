// MoeKoe Music Helper - 后台脚本
console.log('MoeKoe Music Helper 插件已加载');

// 存储当前播放的音乐信息
let currentTrack = {
  title: '',
  artist: '',
  album: '',
  duration: 0,
  currentTime: 0
};

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  switch (request.action) {
    case 'updateTrackInfo':
      currentTrack = { ...currentTrack, ...request.data };
      console.log('更新音乐信息:', currentTrack);
      sendResponse({ status: 'success' });
      break;
      
    case 'getTrackInfo':
      sendResponse({ status: 'success', data: currentTrack });
      break;
      
    case 'translateLyrics':
      // 模拟歌词翻译功能
      const translatedLyrics = translateText(request.lyrics);
      sendResponse({ status: 'success', translation: translatedLyrics });
      break;
      
    case 'identifyMusic':
      // 模拟音乐识别功能
      identifyCurrentMusic().then(result => {
        sendResponse({ status: 'success', data: result });
      });
      return true; // 保持消息通道开放
      
    default:
      sendResponse({ status: 'error', message: '未知操作' });
  }
});

// 模拟歌词翻译功能
function translateText(text) {
  // 这里可以集成真实的翻译 API
  const translations = {
    'Hello': '你好',
    'Love': '爱',
    'Music': '音乐',
    'Dream': '梦想',
    'Heart': '心'
  };
  
  let translated = text;
  Object.keys(translations).forEach(key => {
    translated = translated.replace(new RegExp(key, 'gi'), translations[key]);
  });
  
  return translated;
}

// 模拟音乐识别功能
async function identifyCurrentMusic() {
  // 模拟 API 调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    title: '示例歌曲',
    artist: '示例歌手',
    album: '示例专辑',
    genre: 'Pop',
    year: 2024,
    confidence: 0.95
  };
}

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('MoeKoe Music Helper 插件已安装');
  
  // 设置默认配置
  chrome.storage.local.set({
    autoTranslate: false,
    preferredLanguage: 'zh-CN',
    enableNotifications: true
  });
});