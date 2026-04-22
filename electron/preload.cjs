const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        once: (channel, listener) => ipcRenderer.once(channel, listener),
        removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
    },
    platform: process.platform
});

// 添加插件管理 API
contextBridge.exposeInMainWorld('electronAPI', {
    // 插件管理
    getExtensions: () => ipcRenderer.invoke('get-extensions'),
    getExtensionsDetailed: () => ipcRenderer.invoke('get-extensions-detailed'),
    reloadExtensions: () => ipcRenderer.invoke('reload-extensions'),
    openExtensionsDir: () => ipcRenderer.invoke('open-extensions-dir'),
    openExtensionPopup: (extensionId) => ipcRenderer.invoke('open-extension-popup', extensionId),
    installExtension: (extensionPath) => ipcRenderer.invoke('install-extension', extensionPath),
    uninstallExtension: (extensionId, extensionDir) => ipcRenderer.invoke('uninstall-extension', extensionId, extensionDir),
    validateExtension: (extensionPath) => ipcRenderer.invoke('validate-extension', extensionPath),
    getExtensionsDirectory: () => ipcRenderer.invoke('get-extensions-directory'),
    ensureExtensionsDirectory: () => ipcRenderer.invoke('ensure-extensions-directory'),
    installPluginFromZip: (zipPath) => ipcRenderer.invoke('install-plugin-from-zip', zipPath),
    installPluginFromUrl: (downloadUrl, extensionId = '', extensionDir = '') => ipcRenderer.invoke('install-plugin-from-url', {
        downloadUrl,
        extensionId,
        extensionDir,
    }),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    openMvWindow: (url) => ipcRenderer.invoke('open-mv-window', url),
});
