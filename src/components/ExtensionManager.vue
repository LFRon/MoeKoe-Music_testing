<template>
    <div class="extensions-content" v-if="isElectron()">
        <div class="extensions-actions">
            <button @click="refreshExtensions" class="extension-btn primary" :disabled="extensionsLoading">
                <i class="fas fa-sync-alt"></i>
                {{ extensionsLoading ? '加载中...' : '刷新插件' }}
            </button>
            <button @click="openExtensionsDir" class="extension-btn secondary">
                <i class="fas fa-folder-open"></i>
                打开插件目录
            </button>
            <button @click="installPlugin" class="extension-btn success" :disabled="extensionsLoading">
                <i class="fas fa-upload"></i>
                安装插件
            </button>
            <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept=".zip"
                webkitdirectory="false"
                @change="handleFileSelect"
            />
        </div>

        <!-- 插件列表 -->
        <div v-if="!extensionsLoading && extensions.length > 0" class="extensions-list">
            <div v-for="extension in extensions" :key="extension.id" class="extension-item">
                <div class="extension-info">
                    <div class="extension-icon">
                        <img v-if="extension.iconData" :src="extension.iconData" :alt="extension.name" 
                             @error="handleIconError" class="extension-icon-img" />
                        <i v-else class="fas fa-puzzle-piece"></i>
                    </div>
                    <div class="extension-details">
                        <h4>{{ extension.name }}</h4>
                        <p class="extension-version">版本: {{ extension.version }}</p>
                        <p class="extension-id">ID: {{ extension.id }}</p>
                        <p v-if="extension.description" class="extension-description">{{ extension.description }}</p>
                    </div>
                </div>
                <div class="extension-actions">
                    <span class="extension-status enabled">已启用</span>
                    <button @click="openExtensionPopup(extension.id, extension.name)" class="extension-btn secondary small"
                        :disabled="extensionsLoading">
                        打开弹窗
                    </button>
                    <button @click="uninstallExtension(extension.id, extension.name)" class="extension-btn danger small"
                        :disabled="extensionsLoading">
                        卸载
                    </button>
                </div>
            </div>
        </div>

        <div v-else-if="!extensionsLoading && extensions.length === 0" class="extensions-empty">
            <div class="empty-icon">
                <i class="fas fa-puzzle-piece"></i>
            </div>
            <h4>暂无插件</h4>
            <p>将插件文件夹放入插件目录中，然后点击刷新按钮</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="extensionsLoading" class="extensions-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载插件...</p>
        </div>
    </div>
    <div v-else class="extensions-empty">
        <div class="empty-icon">
            <i class="fas fa-puzzle-piece"></i>
        </div>
        <h4>Web端请直接在浏览器插件中心`chrome://extensions/`进行管理</h4>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const extensions = ref([])
const extensionsLoading = ref(false)
const fileInput = ref(null)

// 刷新插件
const refreshExtensions = async () => {
    extensionsLoading.value = true
    try {
        const result = await window.electronAPI?.getExtensions()
        if (result?.success) {
            extensions.value = result.extensions || []
        } else {
            console.error('获取插件列表失败:', result?.error)
        }
    } catch (error) {
        console.error('刷新插件时出错:', error)
    } finally {
        extensionsLoading.value = false
    }
}

// 打开插件目录
const openExtensionsDir = async () => {
    try {
        const result = await window.electronAPI?.openExtensionsDir()
        if (result?.success) {
        } else {
            console.error('打开插件目录失败:', result?.error)
        }
    } catch (error) {
        console.error('打开插件目录时出错:', error)
    }
}

// 打开插件弹窗
const openExtensionPopup = async (extensionId, extensionName) => {
    try {
        const result = await window.electronAPI.openExtensionPopup(extensionId, extensionName)
        if (result?.success) {
        } else {
            alert('打开插件弹窗失败: ' + (result?.message || '未知错误'))
        }
    } catch (error) {
        alert('打开插件弹窗失败: ' + error.message)
    }
}

// 卸载插件
const uninstallExtension = async (extensionId, extensionName) => {
    try {
        if (confirm(`确定要卸载插件 "${extensionName}" 吗？`)) {
            const result = await window.electronAPI?.uninstallExtension(extensionId)
            if (result?.success) {
                await refreshExtensions()
            } else {
                alert('卸载插件失败: ' + (result?.error || '未知错误'))
            }
        }
    } catch (error) {
        alert('卸载插件时出错: ' + error.message)
    }
}

// 处理图标加载错误
const handleIconError = (event) => {
    event.target.style.display = 'none'
    const iconContainer = event.target.parentElement
    if (iconContainer) {
        const fallbackIcon = iconContainer.querySelector('i')
        if (!fallbackIcon) {
            const icon = document.createElement('i')
            icon.className = 'fas fa-puzzle-piece'
            iconContainer.appendChild(icon)
        }
    }
}

// 触发文件选择
const installPlugin = async () => {
    try {
        const result = await window.electronAPI?.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: '插件包', extensions: ['zip'] }
            ]
        });

        if (result?.filePath) {
            await handlePluginInstall(result.filePath);
        }
    } catch (error) {
        alert('选择文件失败: ' + error.message);
    }
};

// 处理插件安装
const handlePluginInstall = async (filePath) => {
    try {
        extensionsLoading.value = true;
        const result = await window.electronAPI?.installPluginFromZip(filePath);
        if (result?.success) {
            alert('插件安装成功！');
            await refreshExtensions();
        } else {
            alert('安装插件失败: ' + (result?.message || '未知错误'));
        }
    } catch (error) {
        alert('安装插件时出错: ' + error.message);
    } finally {
        extensionsLoading.value = false;
    }
};

const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};

onMounted(() => {
    if(isElectron()){
        refreshExtensions()
    }
})
</script>

<style scoped>
.extensions-content {
    padding: 20px;
}

.extensions-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.extension-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.extension-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.extension-btn.primary {
    background: #007bff;
    color: white;
}

.extension-btn.primary:hover:not(:disabled) {
    background: #0056b3;
}

.extension-btn.success {
    background: #28a745;
    color: white;
}

.extension-btn.success:hover:not(:disabled) {
    background: #218838;
}

.extension-btn.secondary {
    background: #6c757d;
    color: white;
}

.extension-btn.secondary:hover:not(:disabled) {
    background: #545b62;
}

.extension-btn.danger {
    background: #dc3545;
    color: white;
}

.extension-btn.danger:hover:not(:disabled) {
    background: #c82333;
}

.extension-btn.small {
    padding: 4px 8px;
    font-size: 12px;
}

.extensions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.extension-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
}

.extension-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.extension-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 8px;
    font-size: 20px;
    overflow: hidden;
}

.extension-icon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
}

.extension-details h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #333;
}

.extension-details p {
    margin: 2px 0;
    font-size: 12px;
    color: #666;
}

.extension-description {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.extension-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.extension-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.extension-status.enabled {
    background: #d4edda;
    color: #155724;
}

.extensions-empty {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.empty-icon {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 16px;
}

.extensions-empty h4 {
    margin: 0 0 8px 0;
    color: #333;
}

.extensions-empty p {
    margin: 0 0 20px 0;
}

.extensions-loading {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.extensions-loading i {
    font-size: 24px;
    margin-bottom: 12px;
}

</style>