// MoeKoe Music Helper - 弹窗脚本
document.addEventListener('DOMContentLoaded', function() {
  const statusEl = document.getElementById('status');
  const statusTextEl = document.getElementById('statusText');
  const trackTitleEl = document.getElementById('trackTitle');
  const trackArtistEl = document.getElementById('trackArtist');
  const trackAlbumEl = document.getElementById('trackAlbum');
  const trackDurationEl = document.getElementById('trackDuration');
  
  const translateBtn = document.getElementById('translateBtn');
  const identifyBtn = document.getElementById('identifyBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  
  // 格式化时间
  function formatTime(seconds) {
    if (!seconds || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 更新状态显示
  function updateStatus(isActive, text) {
    statusEl.className = `status ${isActive ? 'active' : 'inactive'}`;
    statusTextEl.textContent = text;
  }
  
  // 更新音乐信息显示
  function updateTrackInfo(trackInfo) {
    if (trackInfo && trackInfo.title !== '未知歌曲') {
      trackTitleEl.textContent = trackInfo.title || '-';
      trackArtistEl.textContent = trackInfo.artist || '-';
      trackAlbumEl.textContent = trackInfo.album || '-';
      trackDurationEl.textContent = formatTime(trackInfo.duration);
      
      updateStatus(true, '✅ 已连接到 MoeKoe Music');
    } else {
      trackTitleEl.textContent = '-';
      trackArtistEl.textContent = '-';
      trackAlbumEl.textContent = '-';
      trackDurationEl.textContent = '-';
      
      updateStatus(false, '⚠️ 未检测到音乐播放');
    }
  }
  
  // 获取当前音乐信息
  function getCurrentTrackInfo() {
    chrome.runtime.sendMessage({
      action: 'getTrackInfo'
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('获取音乐信息失败:', chrome.runtime.lastError);
        updateStatus(false, '❌ 插件连接失败');
        return;
      }
      
      if (response && response.status === 'success') {
        updateTrackInfo(response.data);
      } else {
        updateStatus(false, '⚠️ 获取信息失败');
      }
    });
  }
  
  // 翻译歌词
  function translateLyrics() {
    translateBtn.disabled = true;
    translateBtn.textContent = '🔄 翻译中...';
    
    // 获取当前标签页
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // 向内容脚本发送消息
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getLyrics'
        }, function(response) {
          const lyrics = response?.lyrics || '示例歌词: Hello, this is a beautiful song about love and dreams.';
          
          // 发送到后台脚本进行翻译
          chrome.runtime.sendMessage({
            action: 'translateLyrics',
            lyrics: lyrics
          }, function(response) {
            translateBtn.disabled = false;
            translateBtn.textContent = '🌐 翻译歌词';
            
            if (response && response.status === 'success') {
              // 显示翻译结果
              const popup = document.createElement('div');
              popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                max-width: 300px;
                z-index: 10000;
                border: 2px solid #007bff;
              `;
              
              popup.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #007bff;">翻译结果</h4>
                <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.4;">${response.translation}</p>
                <button onclick="this.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">关闭</button>
              `;
              
              document.body.appendChild(popup);
              
              // 3秒后自动关闭
              setTimeout(() => {
                if (popup.parentElement) {
                  popup.remove();
                }
              }, 3000);
            } else {
              alert('翻译失败，请稍后重试');
            }
          });
        });
      }
    });
  }
  
  // 识别音乐
  function identifyMusic() {
    identifyBtn.disabled = true;
    identifyBtn.textContent = '🔍 识别中...';
    
    chrome.runtime.sendMessage({
      action: 'identifyMusic'
    }, function(response) {
      identifyBtn.disabled = false;
      identifyBtn.textContent = '🔍 识别音乐';
      
      if (response && response.status === 'success') {
        const info = response.data;
        const popup = document.createElement('div');
        popup.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 300px;
          z-index: 10000;
          border: 2px solid #28a745;
        `;
        
        popup.innerHTML = `
          <h4 style="margin: 0 0 15px 0; color: #28a745;">🎵 音乐识别结果</h4>
          <div style="font-size: 13px; line-height: 1.6;">
            <p><strong>歌曲:</strong> ${info.title}</p>
            <p><strong>艺术家:</strong> ${info.artist}</p>
            <p><strong>专辑:</strong> ${info.album}</p>
            <p><strong>类型:</strong> ${info.genre}</p>
            <p><strong>年份:</strong> ${info.year}</p>
            <p><strong>置信度:</strong> ${(info.confidence * 100).toFixed(1)}%</p>
          </div>
          <button onclick="this.parentElement.remove()" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 10px;">关闭</button>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
          if (popup.parentElement) {
            popup.remove();
          }
        }, 3000);
      } else {
        alert('音乐识别失败，请稍后重试');
      }
    });
  }
  
  // 绑定按钮事件
  translateBtn.addEventListener('click', translateLyrics);
  identifyBtn.addEventListener('click', identifyMusic);
  refreshBtn.addEventListener('click', getCurrentTrackInfo);
  
  // 初始化
  getCurrentTrackInfo();
  
  console.log('MoeKoe Music Helper 弹窗已初始化');
});