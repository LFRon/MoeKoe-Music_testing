// MoeKoe Music Helper - 内容脚本
(function() {
  'use strict';
  
  console.log('MoeKoe Music Helper 内容脚本已加载');
  
  let currentTrack = null;
  
  // 检测 MoeKoe Music 播放器
  function detectMoeKoePlayer() {
    // 查找播放器相关元素
    const playerElements = {
      title: document.querySelector('.song-title, .track-title, [class*="title"]'),
      artist: document.querySelector('.song-artist, .track-artist, [class*="artist"]'),
      album: document.querySelector('.song-album, .track-album, [class*="album"]'),
      playButton: document.querySelector('.play-button, [class*="play"]'),
      progressBar: document.querySelector('.progress-bar, [class*="progress"]'),
      currentTime: document.querySelector('.current-time, [class*="current"]'),
      duration: document.querySelector('.duration, [class*="duration"]')
    };
    
    return playerElements;
  }
  
  // 提取音乐信息
  function extractTrackInfo() {
    const elements = detectMoeKoePlayer();
    
    const trackInfo = {
      title: elements.title?.textContent?.trim() || '未知歌曲',
      artist: elements.artist?.textContent?.trim() || '未知艺术家',
      album: elements.album?.textContent?.trim() || '未知专辑',
      currentTime: parseTime(elements.currentTime?.textContent) || 0,
      duration: parseTime(elements.duration?.textContent) || 0,
      timestamp: Date.now()
    };
    
    return trackInfo;
  }
  
  // 解析时间格式 (mm:ss 或 hh:mm:ss)
  function parseTime(timeStr) {
    if (!timeStr) return 0;
    
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // mm:ss
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    }
    return 0;
  }
  
  // 监听播放状态变化
  function monitorPlaybackState() {
    const elements = detectMoeKoePlayer();
    
    if (elements.playButton) {
      // 监听播放按钮点击
      elements.playButton.addEventListener('click', () => {
        setTimeout(() => {
          const newTrackInfo = extractTrackInfo();
          updateTrackInfo(newTrackInfo);
        }, 100);
      });
    }
    
    // 监听键盘快捷键
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && (event.ctrlKey || event.metaKey)) {
        setTimeout(() => {
          const newTrackInfo = extractTrackInfo();
          updateTrackInfo(newTrackInfo);
        }, 100);
      }
    });
  }
  
  // 更新音乐信息到后台脚本
  function updateTrackInfo(trackInfo) {
    if (JSON.stringify(trackInfo) !== JSON.stringify(currentTrack)) {
      currentTrack = trackInfo;
      
      chrome.runtime.sendMessage({
        action: 'updateTrackInfo',
        data: trackInfo
      }, (response) => {
        if (response?.status === 'success') {
          console.log('音乐信息已更新:', trackInfo);
        }
      });
    }
  }
  
  // 添加插件控制面板
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'moekoe-helper-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 250px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 10000;
      display: none;
    `;
    
    panel.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">🎵 MoeKoe Helper</div>
      <div id="track-info">点击刷新按钮获取音乐信息</div>
      <div style="margin-top: 10px;">
        <button id="translate-btn" style="margin-right: 5px;">翻译歌词</button>
        <button id="identify-btn">识别音乐</button>
      </div>
      <div style="margin-top: 5px;">
        <button id="toggle-panel" style="font-size: 10px;">隐藏面板</button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // 绑定按钮事件
    document.getElementById('translate-btn').addEventListener('click', translateCurrentLyrics);
    document.getElementById('identify-btn').addEventListener('click', identifyCurrentMusic);
    document.getElementById('toggle-panel').addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    return panel;
  }
  
  // 翻译当前歌词
  function translateCurrentLyrics() {
    const lyricsElement = document.querySelector('.lyrics, [class*="lyric"]');
    const lyrics = lyricsElement?.textContent || '没有找到歌词';
    
    chrome.runtime.sendMessage({
      action: 'translateLyrics',
      lyrics: lyrics
    }, (response) => {
      if (response?.status === 'success') {
        alert('翻译结果:\n' + response.translation);
      }
    });
  }
  
  // 识别当前音乐
  function identifyCurrentMusic() {
    chrome.runtime.sendMessage({
      action: 'identifyMusic'
    }, (response) => {
      if (response?.status === 'success') {
        const info = response.data;
        alert(`音乐识别结果:\n歌曲: ${info.title}\n艺术家: ${info.artist}\n专辑: ${info.album}\n置信度: ${(info.confidence * 100).toFixed(1)}%`);
      }
    });
  }
  
  // 初始化
  function init() {
    
    // 创建控制面板
    const panel = createControlPanel();
    
    // 监听播放状态
    monitorPlaybackState();
    
    // 手动刷新音乐信息
    function refreshTrackInfo() {
      const trackInfo = extractTrackInfo();
      updateTrackInfo(trackInfo);
      
      // 更新面板显示
      const trackInfoElement = document.getElementById('track-info');
      if (trackInfoElement) {
        trackInfoElement.innerHTML = `
          <div>🎵 ${trackInfo.title}</div>
          <div>👤 ${trackInfo.artist}</div>
          <div>💿 ${trackInfo.album}</div>
        `;
      }
    }
    
    // 添加刷新按钮到控制面板
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 刷新信息';
    refreshButton.style.cssText = 'margin-top: 5px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;';
    refreshButton.addEventListener('click', refreshTrackInfo);
    panel.appendChild(refreshButton);
    
    // 初始刷新一次
    refreshTrackInfo();
    
    // 添加快捷键显示/隐藏面板 (Ctrl+Shift+H)
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyH') {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    });
    
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();