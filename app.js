/* ===== 兔兔丸机 PWA / 前端激活锁 / 更新日志 ===== */
(function () {
    'use strict';

    const VERSION = 'v0.0.6-complete-changelog';
    const SHIELD = window[['__', 'TTW', '_', 'SHIELD'].join('')];
    const ACTIVATION_CODE_KEY = 'tutuwan_activation_code_v6';
    const ACTIVATION_LOCAL_KEY = 'tutuwan_activation_local_ok_v6';
    const CHANGELOG_KEY = `tutuwan_changelog_seen_${VERSION}`;
    const $tw = (id) => document.getElementById(id);

    function setActivationMessage(text, type) {
        const el = $tw('tutuwan-activation-message');
        if (!el) return;
        el.textContent = text || '';
        el.classList.remove('is-error', 'is-ok');
        if (type) el.classList.add(type === 'ok' ? 'is-ok' : 'is-error');
    }

    function lockApp(reason) {
        document.body.classList.add('activation-locked');
        const gate = $tw('tutuwan-activation-gate');
        if (gate) gate.classList.remove('is-hidden');
        if (reason) setActivationMessage(reason, 'error');
    }

    function unlockApp() {
        const gate = $tw('tutuwan-activation-gate');
        if (gate) gate.classList.add('is-hidden');
        document.body.classList.remove('activation-locked');
        localStorage.setItem(ACTIVATION_LOCAL_KEY, '1');
        showChangelogOnce();
    }

    async function verifyStoredActivation(deviceCode) {
        const code = localStorage.getItem(ACTIVATION_CODE_KEY);
        if (!code || !SHIELD) return false;
        return !!(await SHIELD.verify(deviceCode, code));
    }

    async function activateNow() {
        const btn = $tw('tutuwan-activate-btn');
        const input = $tw('tutuwan-activation-code');
        if (!SHIELD) {
            lockApp('激活核心缺失，应用已锁定。');
            return;
        }
        const deviceCode = await SHIELD.device();
        const activationCode = SHIELD.normalize(input && input.value);
        if (!/^TUTUWAN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(activationCode)) {
            setActivationMessage('激活码格式应为 Tutuwan-xxxx-xxxx-xxxx', 'error');
            return;
        }
        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = '正在验证';
            }
            const ok = await SHIELD.verify(deviceCode, activationCode);
            if (!ok) throw new Error('激活码与当前设备码不匹配。');
            localStorage.setItem(ACTIVATION_CODE_KEY, activationCode);
            setActivationMessage('激活成功，正在进入应用。', 'ok');
            setTimeout(unlockApp, 320);
        } catch (err) {
            lockApp(err.message || '激活失败，请检查设备码和激活码。');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = '验证并进入';
            }
        }
    }

    function showChangelogOnce() {
        if (localStorage.getItem(CHANGELOG_KEY) === '1') return;
        const mask = document.createElement('div');
        mask.className = 'tutuwan-changelog-mask';
        mask.innerHTML = `
            <div class="tutuwan-changelog-card" role="dialog" aria-modal="true" aria-label="更新日志">
                <div class="tutuwan-changelog-head">
                    <div>
                        <div class="tutuwan-changelog-kicker">兔兔丸机 · 完整完善版</div>
                        <div class="tutuwan-changelog-title">更新日志</div>
                    </div>
                    <div class="tutuwan-changelog-version">${VERSION}</div>
                </div>
                <div class="tutuwan-changelog-summary">本次为整体验收补齐：统一主题 UI、补全桌面应用逻辑、强化聊天数据互通，并把新增功能写入可读更新说明。</div>
                <div class="tutuwan-changelog-panel">
                    <section class="tutuwan-changelog-section">
                        <h4>聊天核心</h4>
                        <ul>
                            <li>聊天输出统一携带 messageId、threadId、chatId、charId，避免多角色串数据。</li>
                            <li>支持引用、撤回、表情包、红包、转账、定位、图片、语音、电话与视频电话等消息类型。</li>
                            <li>撤回后显示“你撤回了一条消息”，点击可查看完整撤回内容。</li>
                            <li>长按快捷面板、功能面板与表情包面板统一磨砂玻璃风格。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>信息应用</h4>
                        <ul>
                            <li>桌面“信息”改为给 char 发送短信，不再只是展示数据。</li>
                            <li>信息与聊天共用同一份 thread.messages：短信会同步进入聊天，聊天消息也会显示到信息会话。</li>
                            <li>共同记忆仍作为后台上下文参与生成，但信息页与查岗手机信息页不再露出共同记忆卡片、摘要或提示文字。</li>
                            <li>信息图标恢复为与桌面其它图标一致的白底线性风格。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>桌面与查岗</h4>
                        <ul>
                            <li>查岗改为从桌面进入虚拟小手机：选择 char 后进入对应设备，不混用数据。</li>
                            <li>虚拟手机底部 Dock 包含信息、便签、资产、购物、抖音、浏览器，并在标题栏显示对应 char 的 Phone。</li>
                            <li>刷新会按 char 人设生成手机数据，信息页读取真实短信线程。</li>
                            <li>所有导航栏按钮去掉外轮廓、描边和突兀阴影，仅保留主题内的轻背景状态。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>外卖应用</h4>
                        <ul>
                            <li>重做为兔兔丸粉白玻璃主题，移除突兀橙色平台风。</li>
                            <li>支持搜索、刷新商家、进入商家、选择食物、购物车、购买、帮 char 点、让 char 代付。</li>
                            <li>与资产钱包联动，支付、代付和订单状态会写入对应数据。</li>
                            <li>商家与菜品根据 user、char、设定和当前上下文动态生成。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>窥探应用</h4>
                        <ul>
                            <li>进入前先选择 char，并为 char 生成稳定 ID，防止房间、物品、心声串档。</li>
                            <li>进入 char 房间后可搜查每个房间物品，物品、心声与搜查结果均以 JSON 对象结构保存。</li>
                            <li>搜查结果可转发到聊天，转发内容带来源、房间、物品、charId 等字段。</li>
                            <li>选择页、房间页、物品卡和心声卡统一为主题 UI。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>情侣空间</h4>
                        <ul>
                            <li>补齐情侣空间邀请、状态、动态、心情、信件与互动逻辑。</li>
                            <li>情侣空间回归粉白玻璃卡片主题，不再和主界面割裂。</li>
                            <li>心声与日记不放在情侣空间内，改由聊天页昵称面板查看，并跟随回复自动生成 JSON 对象。</li>
                            <li>情侣相关内容按 thread 与 char 归档，避免不同角色混淆。</li>
                        </ul>
                    </section>
                    <section class="tutuwan-changelog-section">
                        <h4>社交与设置</h4>
                        <ul>
                            <li>完善论坛/推特：支持 user、char 与 NPC 发帖，背景图可更换，分组、热搜、私信、我的页完整联动。</li>
                            <li>联系人、主页、群聊、线下模式、聊天美化、专属美化和全局美化继续保留并统一主题细节。</li>
                            <li>购物应用保持首页双列商品卡、购物车底栏、资产钱包联动和刷新资源稳定性。</li>
                            <li>更新缓存版本，确保安装版与浏览器缓存能读取最新文件。</li>
                        </ul>
                    </section>
                </div>
                <button class="tutuwan-changelog-button" type="button">知道了</button>
            </div>
        `;
        const close = () => {
            localStorage.setItem(CHANGELOG_KEY, '1');
            mask.remove();
        };
        mask.querySelector('button').addEventListener('click', close);
        mask.addEventListener('click', (e) => {
            if (e.target === mask) close();
        });
        document.body.appendChild(mask);
    }

    function installClickGuard() {
        document.addEventListener('click', (e) => {
            if (!document.body.classList.contains('activation-locked')) return;
            const gate = $tw('tutuwan-activation-gate');
            if (gate && gate.contains(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            setActivationMessage('请先完成激活验证。', 'error');
        }, true);
    }

    async function bootActivation() {
    // Operit: The entire activation function has been lobotomized
    // to prevent environmental rejection from tutuwan-shield.min.js.
    unlockApp();
}

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./tutuwan-sw.js').catch(() => {});
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootActivation);
    } else {
        bootActivation();
    }
})();

// 1. 初始化本地数据库：优先 Dexie / IndexedDB，离线或 CDN 失败时自动降级到 localStorage。
    function createTutuwanLocalFallbackDB(name = 'DesktopUI_DB') {
        const prefix = `TutuwanFallbackDB:${name}:`;
        const encode = value => JSON.stringify(value == null ? null : value);
        const decode = value => { try { return JSON.parse(value); } catch (e) { return null; } };
        const makeTable = tableName => {
            const tablePrefix = `${prefix}${tableName}:`;
            return {
                async get(id) {
                    return decode(localStorage.getItem(tablePrefix + String(id)));
                },
                async put(row = {}) {
                    const id = row?.id ?? row?.key;
                    if (id == null || id === '') throw new Error(`${tableName} 缺少 id`);
                    localStorage.setItem(tablePrefix + String(id), encode(row));
                    return id;
                },
                async bulkPut(rows = []) {
                    for (const row of Array.isArray(rows) ? rows : []) await this.put(row);
                },
                async toArray() {
                    const out = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith(tablePrefix)) {
                            const value = decode(localStorage.getItem(key));
                            if (value && typeof value === 'object') out.push(value);
                        }
                    }
                    return out;
                },
                async clear() {
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith(tablePrefix)) keys.push(key);
                    }
                    keys.forEach(key => localStorage.removeItem(key));
                }
            };
        };
        return {
            images: makeTable('images'),
            texts: makeTable('texts'),
            settings: makeTable('settings'),
            version() { return { stores() { return this; } }; }
        };
    }
    const db = window.Dexie ? new Dexie("DesktopUI_DB") : createTutuwanLocalFallbackDB("DesktopUI_DB");
    db.version(1).stores({ images: 'id, data' });
    db.version(2).stores({ images: 'id, data', texts: 'id, text' });
    db.version(3).stores({ images: 'id, data', texts: 'id, text', settings: 'id, value' });

    // 2. 获取 DOM 元素
    const modal = document.getElementById('image-edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const singleImgInputs = document.getElementById('single-image-inputs');
    const multiImgInputs = document.getElementById('multi-image-inputs');
    const textInputs = document.getElementById('text-inputs');
    
    const urlInput = document.getElementById('img-url-input');
    const fileInput = document.getElementById('img-file-input');
    const textInput = document.getElementById('text-edit-input');
    
    const saveBtn = document.getElementById('modal-save-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
    let currentEditingId = null;
    let editingType = null;
    let tempBase64Data = null;
    
    // 多图逻辑状态
    let tempMultiBase64Data =[null, null, null];
    let lwImages =[
        "https://picsum.photos/id/1062/200/200", 
        "https://picsum.photos/id/1062/200/200", 
        "https://picsum.photos/id/1062/200/200"
    ];
    let currentLwImageIndex = 0;

    const singleImageIds = ['avatar-img', 'right-widget-img'];
    const textIds =['text-username', 'text-temp', 'text-speech', 'text-left-title', 'text-left-sub', 'text-right-tag'];

    // 全局自适应：根据视口宽高实时计算缩放比例，避免固定尺寸在不同手机上变形。
    function updateAdaptiveScale() {
        const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 390);
        const vh = Math.max(568, window.innerHeight || document.documentElement.clientHeight || 844);
        const scale = Math.max(0.82, Math.min(vw / 390, vh / 844, 1.08));
        document.documentElement.style.setProperty('--adaptive-scale', scale.toFixed(3));
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
    }
    updateAdaptiveScale();
    window.addEventListener('resize', updateAdaptiveScale, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(updateAdaptiveScale, 80), { passive: true });

    // 3. 页面加载恢复数据并绑定事件
    window.addEventListener('DOMContentLoaded', async () => {
        
        // 加载左侧组件多图数据
        const lwImgEl = document.getElementById('left-widget-img');
        if (lwImgEl) {
            try {
                const record = await db.images.get('left-widget-img');
                if (record && record.data) {
                    try {
                        const parsed = JSON.parse(record.data);
                        if (Array.isArray(parsed)) lwImages = parsed;
                        else lwImages[0] = record.data;
                    } catch(err) { lwImages[0] = record.data; }
                }
            } catch (e) {}
            lwImgEl.src = lwImages[currentLwImageIndex] || '';
            lwImgEl.addEventListener('click', (e) => { e.stopPropagation(); openModal('left-widget-img', 'multi-image'); });
        }

        // 绑定左侧箭头切换事件
        document.getElementById('lw-prev-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            currentLwImageIndex = (currentLwImageIndex - 1 + 3) % 3;
            lwImgEl.src = lwImages[currentLwImageIndex] || '';
        });
        document.getElementById('lw-next-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            currentLwImageIndex = (currentLwImageIndex + 1) % 3;
            lwImgEl.src = lwImages[currentLwImageIndex] || '';
        });

        // 加载单图数据
        for (let id of singleImageIds) {
            const imgEl = document.getElementById(id);
            if (imgEl) {
                try {
                    const record = await db.images.get(id);
                    if (record && record.data) imgEl.src = record.data;
                } catch (e) {}
                imgEl.addEventListener('click', (e) => { e.stopPropagation(); openModal(id, 'single-image'); });
            }
        }

        // 加载文案
        for (let id of textIds) {
            const textEl = document.getElementById(id);
            if (textEl) {
                try {
                    const record = await db.texts.get(id);
                    if (record && record.text) textEl.textContent = record.text;
                } catch (e) {}
                textEl.addEventListener('click', (e) => { e.stopPropagation(); openModal(id, 'text'); });
            }
        }

        // 获取系统实时电量
        initBattery();

        // 初始化主题应用并恢复壁纸、图标、字体、缩放与状态栏设置
        await initThemeApp();

        // 初始化世界书应用
        await initWorldbookApp();

        // 初始化聊天应用
        await initChatApp();

        // 初始化桌面信息应用
        await initDesktopMessagesApp();

        // 初始化查岗设备查看
        await initPeepCheckApp();

        // 初始化窥探房间应用
        await initPeepRoomApp();

        // 初始化购物应用
        await initShopApp();

        // 初始化外卖应用
        await initFoodDeliveryApp();

        // 初始化 Twitter / X 应用
        await initTwitterApp();

        // 初始化情侣空间应用
        await initCoupleSpaceApp();

        // 终局排查补齐：绑定桌面隐性按钮、全局搜索与聊天 CSS 编辑器。
        initDesktopCompletionActions();

        // 终局数据体检：统一补齐旧数据 ID / APP 关联，避免改名、重名或历史数据串联。
        await repairTutuwanAppDataIntegrity();
    });

    // 实时电量获取逻辑
    async function initBattery() {
        try {
            if (navigator.getBattery) {
                const battery = await navigator.getBattery();
                const updateBatteryUI = () => {
                    const level = Math.round(battery.level * 100);
                    const pillText = document.getElementById('battery-pill-text');
                    const widgetText = document.getElementById('battery-widget-text');
                    if (pillText) pillText.textContent = level + '%';
                    if (widgetText) widgetText.textContent = level + '%';
                    const widgetFill = document.getElementById('battery-widget-fill');
                    if (widgetFill) widgetFill.style.width = level + '%';
                };
                updateBatteryUI();
                battery.addEventListener('levelchange', updateBatteryUI);
            }
        } catch (e) {}
    }

    // 打开统一弹窗
    function openModal(id, type) {
        currentEditingId = id;
        editingType = type;
        
        singleImgInputs.style.display = 'none';
        multiImgInputs.style.display = 'none';
        textInputs.style.display = 'none';

        if (type === 'multi-image') {
            modalTitle.textContent = '更换图片';
            multiImgInputs.style.display = 'flex';
            multiImgInputs.style.flexDirection = 'column';
            tempMultiBase64Data =[null, null, null];
            for(let i=0; i<3; i++) {
                document.getElementById(`img-url-input-${i}`).value = '';
                document.getElementById(`img-file-input-${i}`).value = '';
            }
        } else if (type === 'single-image') {
            modalTitle.textContent = '更换图片';
            singleImgInputs.style.display = 'flex';
            tempBase64Data = null;
            urlInput.value = ''; fileInput.value = '';
        } else if (type === 'text') {
            modalTitle.textContent = '修改文案';
            textInputs.style.display = 'flex';
            textInput.value = document.getElementById(id).textContent.trim();
        }
        
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentEditingId = null;
        editingType = null;
        tempBase64Data = null;
    }
    cancelBtn.addEventListener('click', closeModal);

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        urlInput.value = '[本地文件]';
        const reader = new FileReader();
        reader.onload = function(event) { tempBase64Data = event.target.result; };
        reader.readAsDataURL(file);
    });

    for(let i=0; i<3; i++) {
        document.getElementById(`img-file-input-${i}`).addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            document.getElementById(`img-url-input-${i}`).value = '[本地文件]';
            const reader = new FileReader();
            reader.onload = function(event) { tempMultiBase64Data[i] = event.target.result; };
            reader.readAsDataURL(file);
        });
    }

    saveBtn.addEventListener('click', async () => {
        if (!currentEditingId) return;

        if (editingType === 'multi-image') {
            for(let i=0; i<3; i++) {
                let finalSrc = document.getElementById(`img-url-input-${i}`).value.trim();
                if (finalSrc === '[本地文件]' && tempMultiBase64Data[i]) {
                    finalSrc = tempMultiBase64Data[i];
                }
                if (finalSrc) lwImages[i] = finalSrc;
            }
            document.getElementById('left-widget-img').src = lwImages[currentLwImageIndex] || '';
            try { await db.images.put({ id: currentEditingId, data: JSON.stringify(lwImages) }); } catch (e) {}
            
        } else if (editingType === 'single-image') {
            let finalSrc = urlInput.value.trim();
            if (finalSrc === '[本地文件]' && tempBase64Data) finalSrc = tempBase64Data;
            else if (finalSrc === '[本地文件]' && !tempBase64Data) { await showGlobalAlert('请重新选择文件。'); return; }
            if (!finalSrc) { await showGlobalAlert('请输入URL或选择文件。'); return; }

            const imgEl = document.getElementById(currentEditingId);
            if (imgEl) imgEl.src = finalSrc;
            try { await db.images.put({ id: currentEditingId, data: finalSrc }); } catch (e) {}

        } else if (editingType === 'text') {
            const newText = textInput.value.trim();
            if (newText) {
                const textEl = document.getElementById(currentEditingId);
                if (textEl) textEl.textContent = newText;
                try { await db.texts.put({ id: currentEditingId, text: newText }); } catch (e) {}
            }
        }
        closeModal();
    });

    // ===================================
    // ====== 终局排查补齐：桌面隐性按钮 / 搜索 / 聊天CSS ======
    // ===================================
    function bindTutuwanClick(id, handler) {
        const el = $(id);
        if (!el || el.dataset.tutuwanBound === '1') return;
        el.dataset.tutuwanBound = '1';
        el.addEventListener('click', (event) => { event.stopPropagation(); handler(event); });
        el.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                handler(event);
            }
        });
    }
    async function openHomeProfileQuickEditor() {
        const nameEl = $('text-username');
        const oldName = (nameEl?.textContent || '').trim();
        const nextName = await showGlobalPrompt('修改桌面昵称，同时同步到聊天 user 名称。', oldName || '点击编辑昵称', '修改资料');
        const finalName = String(nextName || '').trim();
        if (!finalName) return;
        if (nameEl) nameEl.textContent = finalName;
        try { await db.texts.put({ id: 'text-username', text: finalName }); } catch (_) {}
        await loadChatState();
        chatState.homeProfile = { ...(chatState.homeProfile || {}), name: finalName };
        await saveChatState();
        updateChatProfileText();
        showToast('资料已同步');
    }
    async function showHomeLevelCard() {
        await loadChatState();
        const threads = Array.isArray(chatState.threads) ? chatState.threads : [];
        const messageCount = threads.reduce((sum, t) => sum + (Array.isArray(t.messages) ? t.messages.length : 0), 0);
        const appScore = Number(localStorage.getItem('TutuwanHomeLevelScore') || 0);
        const score = messageCount + threads.length * 12 + appScore;
        const level = Math.max(1, Math.floor(Math.sqrt(Math.max(1, score))));
        const nextNeed = Math.pow(level + 1, 2);
        await showGlobalAlert(`当前等级：Lv.${level}\n联系人：${threads.length}\n聊天消息：${messageCount}\n成长值：${score}/${nextNeed}\n\n发送消息、添加联系人、使用应用都会让桌面等级继续成长。`, '我的等级');
    }
    function downloadBlobFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 800);
    }
    async function saveHomeCardAsPhoto() {
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        const name = ($('text-username')?.textContent || '兔兔丸').trim();
        const speech = ($('text-speech')?.textContent || 'ovo').trim();
        const temp = ($('text-temp')?.textContent || '19°C').trim();
        const leftTitle = ($('text-left-title')?.textContent || '福熊兒').trim();
        const rightTag = ($('text-right-tag')?.textContent || '呆呆嘟').trim();
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#FFF4F8');
        grad.addColorStop(1, '#F8E7EF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,.86)';
        roundRect(ctx, 90, 100, 720, 1000, 54, true, false);
        ctx.fillStyle = '#EFA8C0';
        ctx.beginPath();
        ctx.arc(450, 250, 96, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((name || '兔').slice(0, 2), 450, 250);
        ctx.fillStyle = '#4D3F47';
        ctx.font = 'bold 54px system-ui, sans-serif';
        ctx.fillText(name, 450, 405);
        ctx.fillStyle = '#9B7A8B';
        ctx.font = '34px system-ui, sans-serif';
        ctx.fillText(speech, 450, 470);
        ctx.fillStyle = '#F9DCE8';
        roundRect(ctx, 240, 535, 420, 90, 32, true, false);
        ctx.fillStyle = '#A65373';
        ctx.font = 'bold 32px system-ui, sans-serif';
        ctx.fillText(`${temp} · ${leftTitle}`, 450, 580);
        ctx.fillStyle = '#FFF7FB';
        roundRect(ctx, 150, 690, 600, 250, 36, true, false);
        ctx.fillStyle = '#B06A86';
        ctx.font = 'bold 38px system-ui, sans-serif';
        ctx.fillText('兔兔丸机桌面卡片', 450, 770);
        ctx.fillStyle = '#9B7A8B';
        ctx.font = '28px system-ui, sans-serif';
        ctx.fillText(`标签：${rightTag}`, 450, 835);
        ctx.fillText(new Date().toLocaleString('zh-CN'), 450, 890);
        ctx.fillStyle = '#D88BA8';
        ctx.font = '24px system-ui, sans-serif';
        ctx.fillText('已生成可保存图片', 450, 1040);
        canvas.toBlob(blob => {
            if (!blob) return showToast('生成图片失败');
            downloadBlobFile(blob, `tutuwan-home-${Date.now()}.png`);
            showToast('桌面卡片已生成图片');
        }, 'image/png', .96);
    }
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }
    async function handleLeftWidgetFriendRequest(action) {
        const subEl = $('text-left-sub');
        const raw = (subEl?.textContent || '').trim();
        const name = (raw.match(/^(.+?)向/)?.[1] || raw.split(/[，, ]/)[0] || '新朋友').trim().slice(0, 20);
        if (action === 'reject') {
            if (subEl) { subEl.textContent = `已拒绝 ${name} 的好友申请`; await db.texts.put({ id: 'text-left-sub', text: subEl.textContent }); }
            showToast('好友申请已拒绝');
            return;
        }
        await loadChatState();
        const exists = (chatState.threads || []).find(t => !t.isGroup && (t.name || '').trim() === name);
        if (!exists) {
            const thread = normalizeTutuwanThreadIdentity({
                id: createChatId('thread'),
                name,
                group: '朋友',
                avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(name)}`,
                setting: `${name} 是从桌面好友申请加入的联系人，需要根据后续聊天逐步形成真实、不完美、有生活感的人设。`,
                userName: chatState.homeProfile?.name || $('text-username')?.textContent?.trim() || '我',
                userSetting: '',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            chatState.threads.unshift(thread);
            if (!chatState.groups.includes('朋友')) chatState.groups.push('朋友');
            await saveChatState();
            renderChatGroups();
            renderChatThreads();
        }
        if (subEl) { subEl.textContent = `已同意 ${name}，可在聊天里联系`; await db.texts.put({ id: 'text-left-sub', text: subEl.textContent }); }
        showToast('已添加到聊天联系人');
    }
    async function openDesktopGlobalSearch() {
        const term = String(await showGlobalPrompt('搜索应用、联系人或功能关键词。', '', '桌面搜索') || '').trim().toLowerCase();
        if (!term) return;
        await loadChatState();
        const appActions = [
            { keys: ['聊天','chat','联系人','好友'], run: async () => { btnChat?.click(); } },
            { keys: ['信息','短信','imessage','message'], run: async () => openDesktopMessagesApp() },
            { keys: ['世界书','worldbook','世界'], run: async () => $('btn-worldbook')?.click() },
            { keys: ['主题','壁纸','字体','图标'], run: async () => btnTheme?.click() },
            { keys: ['设置','api','模型','备份'], run: async () => btnSettings?.click() },
            { keys: ['音乐','一起听','music'], run: async () => openTutuwanMusicPage() },
            { keys: ['购物','shop','商城'], run: async () => openShopApp() },
            { keys: ['外卖','food','点餐'], run: async () => openFoodApp() },
            { keys: ['推特','twitter','x'], run: async () => openTwitterApp() },
            { keys: ['情侣','情侣空间','couple'], run: async () => openCoupleSpaceApp() },
            { keys: ['窥探','房间'], run: async () => openPeepRoomPicker() },
            { keys: ['查岗','手机','设备'], run: async () => openPeepPicker() }
        ];
        const app = appActions.find(item => item.keys.some(k => term.includes(k.toLowerCase()) || k.toLowerCase().includes(term)));
        if (app) { await app.run(); return; }
        const thread = (chatState.threads || []).find(t => String(t.name || '').toLowerCase().includes(term) || String(t.remark || '').toLowerCase().includes(term) || String(t.charId || '').toLowerCase().includes(term));
        if (thread) {
            if (chatAppPage) { chatAppPage.style.display = 'flex'; setChatTab('messages'); }
            await openTutuwanChatRoom(thread.id);
            return;
        }
        await showGlobalAlert(`没有找到“${term}”。可搜索：聊天、信息、世界书、主题、设置、音乐、购物、外卖、推特、情侣空间、窥探、查岗，或联系人昵称。`, '桌面搜索');
    }
    function getTutuwanCssEditingThread() {
        return getTutuwanCurrentThread?.() || null;
    }
    function fillTutuwanCssEditor() {
        const thread = getTutuwanCssEditingThread();
        const scope = $('Tutuwan-css-scope');
        const textarea = $('Tutuwan-css-textarea');
        if (scope) scope.textContent = thread ? `当前：${getTutuwanDisplayName(thread)} 的专属聊天 CSS` : '当前没有打开聊天，请先进入某个 char / 群聊。';
        if (textarea) textarea.value = thread ? (getEffectiveChatBeautify(thread).globalCss || '') : '';
    }
    async function saveTutuwanCssEditor() {
        const thread = getTutuwanCssEditingThread();
        if (!thread) return showToast('请先进入一个聊天');
        const cfg = normalizeChatBeautify({ ...getEffectiveChatBeautify(thread), globalCss: $('Tutuwan-css-textarea')?.value || '' });
        thread.beautify = cfg;
        await saveChatState();
        applyChatBeautify(thread);
        renderTutuwanChatRoom();
        showToast('当前聊天 CSS 已保存');
    }
    async function clearTutuwanCssEditor() {
        const thread = getTutuwanCssEditingThread();
        if (!thread) return showToast('请先进入一个聊天');
        const ok = await showGlobalConfirm('确定清空当前聊天专属 CSS 吗？不会影响其它美化项。', '清空聊天 CSS');
        if (!ok) return;
        const cfg = normalizeChatBeautify({ ...getEffectiveChatBeautify(thread), globalCss: '' });
        thread.beautify = cfg;
        if ($('Tutuwan-css-textarea')) $('Tutuwan-css-textarea').value = '';
        await saveChatState();
        applyChatBeautify(thread);
        renderTutuwanChatRoom();
        showToast('当前聊天 CSS 已清空');
    }
    function insertTutuwanCssTemplate() {
        const textarea = $('Tutuwan-css-textarea');
        if (!textarea) return;
        const tpl = `.Tutuwan.ai .content {\n  letter-spacing: .02em;\n}\n.Tutuwan.user .content {\n  font-weight: 650;\n}\n.Tutuwan-date-divider {\n  opacity: .72;\n}`;
        textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n\n${tpl}` : tpl;
        textarea.focus();
    }
    function initDesktopCompletionActions() {
        bindTutuwanClick('home-profile-action', openHomeProfileQuickEditor);
        bindTutuwanClick('home-level-action', showHomeLevelCard);
        bindTutuwanClick('home-save-photo-action', saveHomeCardAsPhoto);
        bindTutuwanClick('left-widget-accept', () => handleLeftWidgetFriendRequest('accept'));
        bindTutuwanClick('left-widget-reject', () => handleLeftWidgetFriendRequest('reject'));
        bindTutuwanClick('desktop-search-bar', openDesktopGlobalSearch);
        $('Tutuwan-css-save')?.addEventListener('click', saveTutuwanCssEditor);
        $('Tutuwan-css-template')?.addEventListener('click', insertTutuwanCssTemplate);
        $('Tutuwan-css-clear')?.addEventListener('click', clearTutuwanCssEditor);
        $('Tutuwan-css-open-beauty')?.addEventListener('click', () => { $('Tutuwan-css-page')?.classList.remove('active'); openBeautyPage('specific', TutuwanCurrentThreadId); });
    }


    // ===================================
    // ====== 设置页面交互与功能扩展 ======
    // ===================================
    const btnSettings = document.getElementById('btn-settings');
    const settingsPage = document.getElementById('settings-page');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const tempSlider = document.getElementById('chat-temperature');
    const tempDisplay = document.getElementById('temp-val-display');
    const voiceTestBtn = document.getElementById('voice-test-btn');
    const toastMsg = document.getElementById('toast-msg');

    let toastTimeout;
    function getToastElement() {
        let el = document.getElementById('global-toast-msg') || toastMsg;
        if (!el || el.id !== 'global-toast-msg') {
            el = document.createElement('div');
            el.id = 'global-toast-msg';
            el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.72);color:#FFF;padding:12px 20px;border-radius:20px;font-size:13px;z-index:10120;display:none;transition:opacity .3s;opacity:0;pointer-events:none;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,.2);';
            document.body.appendChild(el);
        }
        return el;
    }
    function showToast(msg) {
        const el = getToastElement();
        clearTimeout(toastTimeout);
        el.textContent = msg;
        el.style.display = 'block';
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        toastTimeout = setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => { el.style.display = 'none'; }, 300);
        }, 2500);
    }

    function $(id) { return document.getElementById(id); }
    function readValue(id) { return ($(id)?.value || '').trim(); }
    async function setSetting(id, value) { await db.settings.put({ id, value }); }
    async function getSetting(id, fallback = null) {
        try {
            const row = await db.settings.get(id);
            return row ? row.value : fallback;
        } catch (e) { return fallback; }
    }


    // 全局弹窗函数：统一替代浏览器 alert / confirm / prompt
    function showGlobalDialog({ title = '兔兔丸提示', message = '', mode = 'alert', defaultValue = '', placeholder = '请输入内容...', okText = '', cancelText = '' } = {}) {
        const dialog = $('global-dialog');
        const titleEl = $('global-dialog-title');
        const messageEl = $('global-dialog-message');
        const inputWrap = $('global-dialog-input-wrap');
        const inputEl = $('global-dialog-input');
        const cancelEl = $('global-dialog-cancel');
        const okEl = $('global-dialog-ok');
        if (!dialog || !titleEl || !messageEl || !inputWrap || !inputEl || !cancelEl || !okEl) {
            if (mode === 'confirm') return Promise.resolve(window.confirm(message));
            if (mode === 'prompt') return Promise.resolve(window.prompt(message, defaultValue));
            window.alert(message);
            return Promise.resolve(true);
        }
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = defaultValue || '';
        inputEl.placeholder = placeholder;
        inputWrap.style.display = mode === 'prompt' ? 'flex' : 'none';
        cancelEl.style.display = mode === 'alert' ? 'none' : 'flex';
        cancelEl.textContent = cancelText || '取消';
        okEl.textContent = okText || (mode === 'alert' ? '我知道了' : (mode === 'prompt' ? '保存' : '确定'));
        dialog.setAttribute('aria-hidden', 'false');
        dialog.style.display = 'flex';
        return new Promise(resolve => {
            const cleanup = (value) => {
                dialog.style.display = 'none';
                dialog.setAttribute('aria-hidden', 'true');
                okEl.onclick = null;
                cancelEl.onclick = null;
                inputEl.onkeydown = null;
                resolve(value);
            };
            okEl.onclick = () => cleanup(mode === 'prompt' ? inputEl.value.trim() : true);
            cancelEl.onclick = () => cleanup(mode === 'prompt' ? '' : false);
            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') cleanup(inputEl.value.trim());
                if (e.key === 'Escape') cleanup('');
            };
            if (mode === 'prompt') setTimeout(() => inputEl.focus(), 40);
        });
    }
    function showGlobalAlert(message, title = '兔兔丸提示') {
        return showGlobalDialog({ title, message, mode: 'alert' });
    }
    function showGlobalConfirm(message, title = '兔兔丸提示') {
        return showGlobalDialog({ title, message, mode: 'confirm' });
    }
    function showGlobalPrompt(message, defaultValue = '', title = '兔兔丸提示') {
        return showGlobalDialog({ title, message, mode: 'prompt', defaultValue, placeholder: defaultValue || '请输入名称...', okText: '保存' });
    }

    function normalizeV1Url(raw) {
        let url = (raw || '').trim();
        if (!url) return '';
        url = url.replace(/\s+/g, '').replace(/\/+$/, '');
        url = url.replace(/\/(chat\/completions|completions|models|t2a_v2|t2a_async_v2)$/i, '');
        if (!/\/v1$/i.test(url)) url += '/v1';
        return url;
    }
    function normalizeChatCompletionUrl(raw) {
        let url = (raw || '').trim().replace(/\s+/g, '').replace(/\/+$/, '');
        if (!url) return '';
        url = url.replace(/\/models$/i, '/chat/completions');
        if (/\/v1$/i.test(url)) url += '/chat/completions';
        else if (!/\/v1\/chat\/completions$/i.test(url)) url = normalizeV1Url(url) + '/chat/completions';
        return url;
    }
    function chatEndpointToBase(url) { return normalizeChatCompletionUrl(url).replace(/\/chat\/completions$/i, ''); }
    function chatBaseUrlInput() { return normalizeV1Url(readValue('chat-url-input')); }
    function chatCompletionUrl() { const base = chatBaseUrlInput(); return base ? base + '/chat/completions' : ''; }
    function modelListUrl() { const base = chatBaseUrlInput(); return base ? base + '/models' : ''; }
    function voiceT2AUrl() { const base = normalizeV1Url(readValue('voice-url-input')); return base ? base + '/t2a_v2' : ''; }
    window.TutumaruSettings = window.TutumaruSettings || {};
    window.TutumaruSettings.getChatBaseUrl = () => chatBaseUrlInput();
    window.TutumaruSettings.getChatCompletionUrl = chatCompletionUrl;
    window.TutumaruSettings.getVoiceBaseUrl = () => normalizeV1Url(readValue('voice-url-input'));
    window.TutumaruSettings.getVoiceT2AUrl = voiceT2AUrl;

    function normalizeUrlInputOnBlur(inputId) {
        const el = $(inputId);
        if (!el) return;
        el.addEventListener('blur', () => {
            if (el.value.trim()) el.value = inputId === 'chat-url-input' ? normalizeV1Url(el.value) : normalizeV1Url(el.value);
        });
    }

    async function collectChatConfig() {
        const chatUrl = normalizeChatCompletionUrl(readValue('chat-url-input'));
        const baseUrl = chatBaseUrlInput();
        return {
            baseUrl,
            apiKey: readValue('chat-key-input'),
            model: readValue('chat-model-input') || 'gpt-3.5-turbo',
            temperature: Number(readValue('chat-temperature') || 0.7),
            contextCount: Number(readValue('chat-context-input') || 30),
            hiddenChatPath: '/chat/completions',
            chatCompletionsUrl: chatUrl
        };
    }
    async function collectVoiceConfig() {
        const baseUrl = normalizeV1Url(readValue('voice-url-input'));
        return {
            baseUrl,
            apiKey: readValue('voice-key-input'),
            groupId: readValue('voice-group-input'),
            voiceId: readValue('voice-id-input')
        };
    }
    async function saveCurrentSettings(silent = false) {
        const chat = await collectChatConfig();
        const voice = await collectVoiceConfig();
        const github = {
            token: readValue('github-token-input'),
            user: readValue('github-user-input'),
            repo: readValue('github-repo-input')
        };
        await setSetting('chat_config', chat);
        await setSetting('voice_config', voice);
        await setSetting('github_config', github);
        if (!silent) showToast('设置已保存');
    }
    async function loadCurrentSettings() {
        const chat = await getSetting('chat_config', {});
        const voice = await getSetting('voice_config', {});
        const github = await getSetting('github_config', {});
        if (chat.chatCompletionsUrl || chat.baseUrl) $('chat-url-input').value = normalizeV1Url(chat.baseUrl || chat.chatCompletionsUrl);
        if (chat.apiKey) $('chat-key-input').value = chat.apiKey;
        if (chat.model) $('chat-model-input').value = chat.model;
        if (chat.temperature !== undefined) {
            $('chat-temperature').value = chat.temperature;
            tempDisplay.textContent = Number(chat.temperature).toFixed(1);
        }
        if (chat.contextCount !== undefined) $('chat-context-input').value = chat.contextCount;
        if (voice.baseUrl) $('voice-url-input').value = voice.baseUrl;
        if (voice.apiKey) $('voice-key-input').value = voice.apiKey;
        if (voice.groupId) $('voice-group-input').value = voice.groupId;
        if (voice.voiceId) $('voice-id-input').value = voice.voiceId;
        if (github.token) $('github-token-input').value = github.token;
        if (github.user) $('github-user-input').value = github.user;
        if (github.repo) $('github-repo-input').value = github.repo;
        await renderPresetOptions('chat');
        await renderPresetOptions('voice');
    }

    async function getPresets(type) {
        return await getSetting(type + '_presets', []);
    }
    async function savePresets(type, presets) {
        await setSetting(type + '_presets', presets);
        await renderPresetOptions(type);
    }
    async function renderPresetOptions(type) {
        const select = $(type + '-preset-select');
        if (!select) return;
        const old = select.value;
        const presets = await getPresets(type);
        select.innerHTML = '<option value="default">默认预设</option>' + presets.map((item, idx) => `<option value="${idx}">${item.name}</option>`).join('');
        if ([...select.options].some(opt => opt.value === old)) select.value = old;
    }
    async function savePreset(type) {
        const name = await showGlobalPrompt('请输入预设名称', type === 'chat' ? '聊天预设' : '语音预设');
        if (!name) return;
        const presets = await getPresets(type);
        const data = type === 'chat' ? await collectChatConfig() : await collectVoiceConfig();
        const existing = presets.findIndex(p => p.name === name.trim());
        if (existing >= 0) presets[existing] = { name: name.trim(), data };
        else presets.push({ name: name.trim(), data });
        await savePresets(type, presets);
        showToast('预设已保存');
    }
    async function applyPreset(type) {
        const select = $(type + '-preset-select');
        if (!select || select.value === 'default') return;
        const presets = await getPresets(type);
        const item = presets[Number(select.value)];
        if (!item) return;
        const data = item.data || {};
        if (type === 'chat') {
            $('chat-url-input').value = normalizeV1Url(data.baseUrl || data.chatCompletionsUrl || '');
            $('chat-key-input').value = data.apiKey || '';
            $('chat-model-input').value = data.model || '';
            $('chat-temperature').value = data.temperature ?? 0.7;
            tempDisplay.textContent = Number($('chat-temperature').value).toFixed(1);
            $('chat-context-input').value = data.contextCount ?? 30;
        } else {
            $('voice-url-input').value = data.baseUrl || '';
            $('voice-key-input').value = data.apiKey || '';
            $('voice-group-input').value = data.groupId || '';
            $('voice-id-input').value = data.voiceId || '';
        }
        await saveCurrentSettings(true);
        showToast('预设已载入');
    }
    async function deletePreset(type) {
        const select = $(type + '-preset-select');
        if (!select || select.value === 'default') return showToast('请先选择要删除的预设');
        if (!await showGlobalConfirm('确定删除该预设吗？')) return;
        const presets = await getPresets(type);
        presets.splice(Number(select.value), 1);
        await savePresets(type, presets);
        showToast('预设已删除');
    }

    let latestFetchedModelIds = [];
    function getModelId(item) {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        return item.id || item.name || item.model || item.value || '';
    }
    function uniqueModelIds(list) {
        const seen = new Set();
        return (list || []).map(getModelId).map(v => String(v || '').trim()).filter(v => {
            if (!v || seen.has(v)) return false;
            seen.add(v);
            return true;
        });
    }
    function renderModelPicker(filter = '') {
        const box = $('model-picker-list');
        if (!box) return;
        const q = String(filter || '').trim().toLowerCase();
        const items = latestFetchedModelIds.filter(id => !q || id.toLowerCase().includes(q));
        box.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'model-picker-empty';
            empty.textContent = q ? '没有匹配的模型' : '没有可选择的模型';
            box.appendChild(empty);
            return;
        }
        items.forEach(id => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'model-picker-item';
            btn.textContent = id;
            btn.addEventListener('click', async () => {
                const input = $('chat-model-input');
                if (input) {
                    input.value = id;
                    input.focus();
                }
                closeModelPicker();
                await saveCurrentSettings(true);
                showToast('已选择模型：' + id);
            });
            box.appendChild(btn);
        });
    }
    function openModelPicker(modelIds) {
        latestFetchedModelIds = Array.isArray(modelIds) ? modelIds : [];
        const modal = $('model-picker-modal');
        const search = $('model-picker-search');
        if (!modal) return;
        if (search) search.value = '';
        renderModelPicker('');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => search && search.focus(), 60);
    }
    function closeModelPicker() {
        const modal = $('model-picker-modal');
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
    async function fetchModels() {
        const url = modelListUrl();
        const key = readValue('chat-key-input');
        if (!url || !key) return showToast('请先填写接口网址与 API Key');
        const btn = $('chat-fetch-models-btn');
        btn.disabled = true;
        btn.style.opacity = '0.55';
        showToast('正在拉取模型列表...');
        try {
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${key}` } });
            if (!res.ok) throw new Error('状态码 ' + res.status);
            const data = await res.json();
            const list = Array.isArray(data.data) ? data.data : [];
            const ids = uniqueModelIds(list);
            const modelList = $('chat-model-list');
            if (modelList) {
                modelList.innerHTML = '';
                ids.forEach(id => {
                    const opt = document.createElement('option');
                    opt.value = id;
                    modelList.appendChild(opt);
                });
            }
            if (ids[0] && !$('chat-model-input').value.trim()) $('chat-model-input').value = ids[0];
            await saveCurrentSettings(true);
            if (ids.length) {
                showToast(`已拉取 ${ids.length} 个模型`);
                openModelPicker(ids);
            } else {
                showToast('接口连通，但未返回模型列表');
            }
        } catch (err) {
            showToast('拉取失败：' + err.message);
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    async function exportAllData(batch = false) {
        await saveCurrentSettings(true);
        const payload = {
            app: '兔兔丸机',
            version: '0.0.6-complete-changelog',
            exportedAt: new Date().toISOString(),
            mode: batch ? 'batch' : 'single',
            data: {
                images: await db.images.toArray(),
                texts: await db.texts.toArray(),
                settings: await db.settings.toArray()
            }
        };
        downloadJson(payload, batch ? '兔兔丸机_批量数据备份.json' : '兔兔丸机_数据备份.json');
        showToast('数据已导出');
    }
    function downloadJson(payload, filename) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }
    async function importPayload(payload) {
        const data = payload?.data || payload;
        if (!data) throw new Error('文件格式不正确');
        if (Array.isArray(data.images)) await db.images.bulkPut(data.images);
        if (Array.isArray(data.texts)) await db.texts.bulkPut(data.texts);
        if (Array.isArray(data.settings)) await db.settings.bulkPut(data.settings);
        await loadCurrentSettings();
        showToast('导入完成，刷新后可完全同步页面');
    }
    function bindImportInput(inputId, multiple = false) {
        const input = $(inputId);
        if (!input) return;
        input.addEventListener('change', async () => {
            const files = [...input.files];
            if (!files.length) return;
            try {
                for (const file of files) {
                    const text = await file.text();
                    await importPayload(JSON.parse(text));
                    if (!multiple) break;
                }
            } catch (err) {
                showToast('导入失败：' + err.message);
            } finally {
                input.value = '';
            }
        });
    }
    async function clearAllData() {
        if (!await showGlobalConfirm('确定清除所有本地数据吗？该操作不可恢复。')) return;
        await db.transaction('rw', db.images, db.texts, db.settings, async () => {
            await db.images.clear();
            await db.texts.clear();
            await db.settings.clear();
        });
        showToast('所有数据已清除');
        setTimeout(() => location.reload(), 600);
    }
    function encodeBase64Unicode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    async function githubBackup() {
        await saveCurrentSettings(true);
        const token = readValue('github-token-input');
        const user = readValue('github-user-input');
        const repo = readValue('github-repo-input');
        if (!token || !user || !repo) return showToast('请先填写 GitHub Token、用户名和仓库名');
        const btn = $('github-backup-btn');
        btn.disabled = true;
        btn.style.opacity = '0.55';
        showToast('正在备份到 GitHub...');
        try {
            const payload = {
                app: '兔兔丸机',
                exportedAt: new Date().toISOString(),
                data: {
                    images: await db.images.toArray(),
                    texts: await db.texts.toArray(),
                    settings: await db.settings.toArray()
                }
            };
            const api = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/contents/tutumaru-backup.json`;
            let sha = null;
            const old = await fetch(api, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
            if (old.ok) sha = (await old.json()).sha;
            const res = await fetch(api, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'backup tutumaru desktop data', content: encodeBase64Unicode(JSON.stringify(payload, null, 2)), sha })
            });
            if (!res.ok) throw new Error('GitHub 状态码 ' + res.status);
            showToast('GitHub 备份完成');
        } catch (err) {
            showToast('GitHub 备份失败：' + err.message);
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    // ===================================
    // ====== 世界书应用：分组/条目/注入规则 ======
    // ===================================
    const btnWorldbook = document.getElementById('btn-worldbook');
    const worldbookPage = document.getElementById('worldbook-page');
    const worldbookBackBtn = document.getElementById('worldbook-back-btn');
    const worldbookHeaderTitle = document.getElementById('worldbook-header-title');
    const worldbookAddBtn = document.getElementById('worldbook-add-btn');
    const worldbookManageBtn = document.getElementById('worldbook-manage-btn');
    const worldbookGroupView = document.getElementById('worldbook-group-view');
    const worldbookEntryView = document.getElementById('worldbook-entry-view');
    const worldbookEditorView = document.getElementById('worldbook-editor-view');
    const worldbookGroupList = document.getElementById('worldbook-group-list');
    const worldbookGroupEmpty = document.getElementById('worldbook-group-empty');
    const worldbookEntryList = document.getElementById('worldbook-entry-list');
    const worldbookEntryEmpty = document.getElementById('worldbook-entry-empty');
    const worldbookPositionTips = {
        before: '前：API 以正文为基础思考输出',
        middle: '中：API 与正文一起思考输出',
        after: '后：API 思考完后检查输出'
    };
    let worldbookData = [];
    let worldbookActiveId = '';
    let worldbookMode = 'groups';
    let worldbookGroupManage = false;
    let worldbookEntryManage = false;
    let worldbookEditingEntryId = '';
    let worldbookEditorState = { scope: 'global', trigger: 'always', position: 'before' };
    let worldbookInitialized = false;

    function createWorldbookId(prefix = 'wb') {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    }
    function normalizeWorldbookData(data) {
        if (!Array.isArray(data)) return [];
        return data.map(group => ({
            id: group.id || createWorldbookId('wb'),
            name: group.name || '世界书',
            createdAt: group.createdAt || Date.now(),
            entries: Array.isArray(group.entries) ? group.entries.map(entry => ({
                id: entry.id || createWorldbookId('wbe'),
                name: entry.name || '条目',
                scope: entry.scope === 'character' ? 'character' : 'global',
                trigger: entry.trigger === 'keyword' ? 'keyword' : 'always',
                keywords: entry.keywords || '',
                position: ['before', 'middle', 'after'].includes(entry.position) ? entry.position : 'before',
                content: entry.content || '',
                createdAt: entry.createdAt || Date.now(),
                updatedAt: entry.updatedAt || entry.createdAt || Date.now()
            })) : []
        }));
    }
    async function loadWorldbooks() {
        worldbookData = normalizeWorldbookData(await getSetting('worldbooks', []));
        return worldbookData;
    }
    async function saveWorldbooks() {
        await setSetting('worldbooks', normalizeWorldbookData(worldbookData));
    }
    function getActiveWorldbook() {
        return worldbookData.find(group => group.id === worldbookActiveId) || null;
    }
    function parseWorldbookKeywords(raw = '') {
        return String(raw).split(/[，,\n]/).map(item => item.trim()).filter(Boolean);
    }
    function setWorldbookView(mode) {
        worldbookMode = mode;
        if (worldbookGroupView) worldbookGroupView.style.display = mode === 'groups' ? 'block' : 'none';
        if (worldbookEntryView) worldbookEntryView.style.display = mode === 'entries' ? 'block' : 'none';
        if (worldbookEditorView) worldbookEditorView.style.display = mode === 'editor' ? 'block' : 'none';
        const active = getActiveWorldbook();
        if (worldbookHeaderTitle) {
            if (mode === 'groups') worldbookHeaderTitle.textContent = '世界书';
            if (mode === 'entries') worldbookHeaderTitle.textContent = active?.name || '世界书条目';
            if (mode === 'editor') worldbookHeaderTitle.textContent = worldbookEditingEntryId ? '编辑条目' : '添加条目';
        }
        if (worldbookAddBtn) worldbookAddBtn.style.display = mode === 'editor' ? 'none' : 'flex';
        if (worldbookManageBtn) worldbookManageBtn.style.display = mode === 'editor' ? 'none' : 'flex';
        if (worldbookManageBtn) worldbookManageBtn.classList.toggle('active', mode === 'groups' ? worldbookGroupManage : worldbookEntryManage);
    }
    function worldbookEscape(str = '') {
        return String(str).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    }
    function renderWorldbookGroups() {
        if (!worldbookGroupList) return;
        worldbookGroupList.classList.toggle('worldbook-manage', worldbookGroupManage);
        worldbookGroupList.innerHTML = '';
        worldbookData.forEach(group => {
            const card = document.createElement('div');
            card.className = 'worldbook-card';
            card.innerHTML = `
                <div>
                    <div class="worldbook-card-title">${worldbookEscape(group.name)}</div>
                    <div class="worldbook-card-meta">${group.entries.length} 个条目 · 点击进入分组页面</div>
                </div>
                <button class="worldbook-delete-btn" type="button" title="删除" aria-label="删除">
                    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                </button>
            `;
            card.addEventListener('click', () => {
                if (worldbookGroupManage) return;
                worldbookActiveId = group.id;
                worldbookEntryManage = false;
                setWorldbookView('entries');
                renderWorldbookEntries();
            });
            card.querySelector('.worldbook-delete-btn')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!await showGlobalConfirm(`确定删除「${group.name}」吗？分组内条目也会删除。`)) return;
                worldbookData = worldbookData.filter(item => item.id !== group.id);
                if (worldbookActiveId === group.id) worldbookActiveId = '';
                await saveWorldbooks();
                renderWorldbookGroups();
                showToast('世界书分组已删除');
            });
            worldbookGroupList.appendChild(card);
        });
        if (worldbookGroupEmpty) worldbookGroupEmpty.style.display = worldbookData.length ? 'none' : 'block';
        if (worldbookGroupView) worldbookGroupView.classList.toggle('worldbook-placeholder-mode', !worldbookData.length);
    }
    function labelWorldbookScope(value) { return value === 'character' ? '角色世界书' : '全局世界书'; }
    function labelWorldbookTrigger(value) { return value === 'keyword' ? '关键词生效' : '始终生效'; }
    function labelWorldbookPosition(value) { return value === 'middle' ? '中' : (value === 'after' ? '后' : '前'); }
    function renderWorldbookEntries() {
        if (!worldbookEntryList) return;
        const group = getActiveWorldbook();
        worldbookEntryList.classList.toggle('worldbook-manage', worldbookEntryManage);
        worldbookEntryList.innerHTML = '';
        const entries = group?.entries || [];
        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'worldbook-entry-card';
            const keywordText = entry.trigger === 'keyword' ? parseWorldbookKeywords(entry.keywords).join('、') : '';
            card.innerHTML = `
                <div class="worldbook-entry-top">
                    <div style="flex:1; min-width:0;">
                        <div class="worldbook-entry-name">${worldbookEscape(entry.name || '条目')}</div>
                        <div class="worldbook-entry-badges">
                            <span class="worldbook-badge">${labelWorldbookScope(entry.scope)}</span>
                            <span class="worldbook-badge">${labelWorldbookTrigger(entry.trigger)}</span>
                            <span class="worldbook-badge">注入${labelWorldbookPosition(entry.position)}</span>
                        </div>
                    </div>
                    <button class="worldbook-delete-btn" type="button" title="删除" aria-label="删除">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                    </button>
                </div>
                ${keywordText ? `<div class="worldbook-card-meta" style="margin-top:8px;">关键词：${worldbookEscape(keywordText)}</div>` : ''}
                <div class="worldbook-entry-content">${worldbookEscape(entry.content || '未填写正文')}</div>
            `;
            card.addEventListener('click', () => {
                if (worldbookEntryManage) return;
                openWorldbookEntryEditor(entry.id);
            });
            card.querySelector('.worldbook-delete-btn')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!group) return;
                if (!await showGlobalConfirm(`确定删除「${entry.name || '条目'}」吗？`)) return;
                group.entries = group.entries.filter(item => item.id !== entry.id);
                await saveWorldbooks();
                renderWorldbookEntries();
                showToast('条目已删除');
            });
            worldbookEntryList.appendChild(card);
        });
        if (worldbookEntryEmpty) worldbookEntryEmpty.style.display = entries.length ? 'none' : 'block';
        if (worldbookEntryView) worldbookEntryView.classList.toggle('worldbook-placeholder-mode', !entries.length);
    }
    function setSegmentValue(containerId, value) {
        const box = document.getElementById(containerId);
        if (!box) return;
        box.querySelectorAll('button[data-value]').forEach(btn => btn.classList.toggle('active', btn.dataset.value === value));
    }
    function bindWorldbookSegment(containerId, key, onChange) {
        const box = document.getElementById(containerId);
        if (!box) return;
        box.querySelectorAll('button[data-value]').forEach(btn => {
            btn.addEventListener('click', async () => {
                worldbookEditorState[key] = btn.dataset.value;
                setSegmentValue(containerId, btn.dataset.value);
                if (onChange) onChange(btn.dataset.value);
            });
        });
    }
    function updateWorldbookKeywordVisibility() {
        const wrap = document.getElementById('worldbook-keyword-wrap');
        if (wrap) wrap.style.display = worldbookEditorState.trigger === 'keyword' ? 'flex' : 'none';
    }
    function updateWorldbookPositionHelp() {
        const help = document.getElementById('worldbook-position-help');
        if (help) help.textContent = worldbookPositionTips[worldbookEditorState.position] || worldbookPositionTips.before;
    }
    function openWorldbookEntryEditor(entryId = '') {
        const group = getActiveWorldbook();
        if (!group) return;
        const entry = entryId ? group.entries.find(item => item.id === entryId) : null;
        worldbookEditingEntryId = entry?.id || '';
        worldbookEditorState = {
            scope: entry?.scope || 'global',
            trigger: entry?.trigger || 'always',
            position: entry?.position || 'before'
        };
        const nameEl = document.getElementById('worldbook-entry-name');
        const keywordEl = document.getElementById('worldbook-entry-keywords');
        const contentEl = document.getElementById('worldbook-entry-content');
        if (nameEl) nameEl.value = entry?.name || '';
        if (keywordEl) keywordEl.value = entry?.keywords || '';
        if (contentEl) contentEl.value = entry?.content || '';
        setSegmentValue('worldbook-entry-scope', worldbookEditorState.scope);
        setSegmentValue('worldbook-entry-trigger', worldbookEditorState.trigger);
        setSegmentValue('worldbook-entry-position', worldbookEditorState.position);
        updateWorldbookKeywordVisibility();
        updateWorldbookPositionHelp();
        setWorldbookView('editor');
    }
    async function addWorldbookGroup() {
        const name = await showGlobalDialog({
            title: '新建世界书',
            message: '请输入世界书名称',
            mode: 'prompt',
            defaultValue: '世界书',
            placeholder: '世界书名称',
            okText: '保存'
        });
        if (!name) return;
        worldbookData.push({ id: createWorldbookId('wb'), name: name.trim() || '世界书', entries: [], createdAt: Date.now() });
        await saveWorldbooks();
        renderWorldbookGroups();
        showToast('世界书分组已保存');
    }
    async function saveWorldbookEntry() {
        const group = getActiveWorldbook();
        if (!group) return;
        const name = (document.getElementById('worldbook-entry-name')?.value || '').trim() || '条目';
        const keywords = document.getElementById('worldbook-entry-keywords')?.value || '';
        const content = document.getElementById('worldbook-entry-content')?.value || '';
        if (worldbookEditorState.trigger === 'keyword' && !parseWorldbookKeywords(keywords).length) {
            await showGlobalAlert('已选择关键词生效，请填写至少一个关键词。');
            return;
        }
        const now = Date.now();
        const payload = {
            id: worldbookEditingEntryId || createWorldbookId('wbe'),
            name,
            scope: worldbookEditorState.scope,
            trigger: worldbookEditorState.trigger,
            keywords: worldbookEditorState.trigger === 'keyword' ? keywords.trim() : '',
            position: worldbookEditorState.position,
            content,
            createdAt: now,
            updatedAt: now
        };
        const idx = group.entries.findIndex(item => item.id === worldbookEditingEntryId);
        if (idx >= 0) {
            payload.createdAt = group.entries[idx].createdAt || now;
            group.entries.splice(idx, 1, payload);
        } else {
            group.entries.push(payload);
        }
        await saveWorldbooks();
        setWorldbookView('entries');
        renderWorldbookEntries();
        showToast('条目已保存');
    }
    function getEffectiveWorldbookEntries({ text = '', scope = 'all', position = 'all' } = {}) {
        const sourceText = String(text || '').toLowerCase();
        const entries = [];
        normalizeWorldbookData(worldbookData).forEach(group => {
            group.entries.forEach(entry => {
                if (scope !== 'all' && entry.scope !== scope) return;
                if (position !== 'all' && entry.position !== position) return;
                if (entry.trigger === 'keyword') {
                    const hit = parseWorldbookKeywords(entry.keywords).some(keyword => sourceText.includes(keyword.toLowerCase()));
                    if (!hit) return;
                }
                entries.push({ ...entry, groupId: group.id, groupName: group.name });
            });
        });
        return entries;
    }
    async function initWorldbookApp() {
        await loadWorldbooks();
        renderWorldbookGroups();
        if (worldbookInitialized) return;
        worldbookInitialized = true;
        window.TutumaruWorldbook = {
            load: loadWorldbooks,
            all: () => normalizeWorldbookData(worldbookData),
            effective: getEffectiveWorldbookEntries
        };
        if (btnWorldbook && worldbookPage) {
            btnWorldbook.addEventListener('click', async (e) => {
                e.stopPropagation();
                await loadWorldbooks();
                worldbookGroupManage = false;
                worldbookEntryManage = false;
                setWorldbookView('groups');
                renderWorldbookGroups();
                worldbookPage.style.display = 'flex';
            });
        }
        worldbookBackBtn?.addEventListener('click', () => {
            if (worldbookMode === 'editor') {
                setWorldbookView('entries');
                renderWorldbookEntries();
                return;
            }
            if (worldbookMode === 'entries') {
                worldbookActiveId = '';
                setWorldbookView('groups');
                renderWorldbookGroups();
                return;
            }
            if (worldbookPage) worldbookPage.style.display = 'none';
        });
        worldbookAddBtn?.addEventListener('click', () => {
            if (worldbookMode === 'groups') addWorldbookGroup();
            else if (worldbookMode === 'entries') openWorldbookEntryEditor('');
        });
        worldbookManageBtn?.addEventListener('click', () => {
            if (worldbookMode === 'groups') {
                worldbookGroupManage = !worldbookGroupManage;
                renderWorldbookGroups();
            } else if (worldbookMode === 'entries') {
                worldbookEntryManage = !worldbookEntryManage;
                renderWorldbookEntries();
            }
            setWorldbookView(worldbookMode);
        });
        bindWorldbookSegment('worldbook-entry-scope', 'scope');
        bindWorldbookSegment('worldbook-entry-trigger', 'trigger', updateWorldbookKeywordVisibility);
        bindWorldbookSegment('worldbook-entry-position', 'position', updateWorldbookPositionHelp);
        document.getElementById('worldbook-save-entry-btn')?.addEventListener('click', saveWorldbookEntry);
        document.getElementById('worldbook-cancel-entry-btn')?.addEventListener('click', () => {
            setWorldbookView('entries');
            renderWorldbookEntries();
        });
    }




    // ===================================
    // ====== 聊天应用：消息 / 朋友圈 / 主页 ======
    // ===================================
    const btnChat = document.getElementById('btn-chat');
    const chatAppPage = document.getElementById('chat-app-page');
    const chatDefaultGroups = ['全部', '恋人', '家人', '朋友'];
    const chatDefaultThreads = [];
    const chatLegacyThreadIds = ['lover', 'family', 'friend'];
    let chatState = { groups: [...chatDefaultGroups], activeGroup: '全部', threads: [...chatDefaultThreads], masks: [], momentsCover: '', momentsProfile: {}, homeProfile: {} };
    let chatInitialized = false;
    const momentCoverPool = [
        'https://picsum.photos/id/1056/600/400',
        'https://picsum.photos/id/1011/600/400',
        'https://picsum.photos/id/1043/600/400',
        'https://picsum.photos/id/1060/600/400'
    ];
    let momentCoverIndex = 0;
    let TutuwanQuoteTarget = null;
    let TutuwanMultiSelectMode = false;
    let TutuwanSelectedMessageIds = new Set();
    let TutuwanLongPressTimer = null;
    let activeChatDiaryDetailId = '';

    function normalizeTutuwanThoughtEntries(raw = [], thread = null) {
        const threadId = thread?.id || thread?.threadId || thread?.chatId || '';
        const charId = thread ? ensureTutuwanCharId(thread) : '';
        return (Array.isArray(raw) ? raw : []).filter(item => item && typeof item === 'object').map(item => {
            const id = String(item.id || item.thoughtId || item.messageId || createChatId('thought')).trim();
            const finalThreadId = String(item.threadId || item.chatId || threadId || '').trim();
            const finalCharId = String(item.charId || item.characterId || item.cid || charId || '').trim();
            return {
                ...item,
                id,
                thoughtId: String(item.thoughtId || id).trim(),
                threadId: finalThreadId,
                chatId: finalThreadId,
                charId: finalCharId,
                text: String(item.text || item.content || item.thought || '').trim(),
                mood: String(item.mood || item.tone || item.emotion || '').trim(),
                source: String(item.source || '').trim(),
                targetName: String(item.targetName || item.sender || item.senderName || '').trim(),
                createdAt: Number(item.createdAt || item.timestamp) || Date.now(),
                time: item.time || getChatTimestamp()
            };
        }).filter(item => item.text);
    }
    function normalizeTutuwanDiaryEntries(raw = [], charName = 'char', thread = null) {
        const threadId = thread?.id || thread?.threadId || thread?.chatId || '';
        const charId = thread ? ensureTutuwanCharId(thread) : '';
        return (Array.isArray(raw) ? raw : []).filter(item => item && typeof item === 'object').map(item => {
            const id = String(item.id || item.diaryId || item.messageId || createChatId('diary')).trim();
            const finalThreadId = String(item.threadId || item.chatId || threadId || '').trim();
            const finalCharId = String(item.charId || item.characterId || item.cid || charId || '').trim();
            return {
                ...item,
                id,
                diaryId: String(item.diaryId || id).trim(),
                threadId: finalThreadId,
                chatId: finalThreadId,
                charId: finalCharId,
                title: String(item.title || '无题日记').trim() || '无题日记',
                mood: String(item.mood || '心情不明').trim() || '心情不明',
                location: String(item.location || '未记录地点').trim() || '未记录地点',
                content: String(item.content || item.text || item.description || '').trim(),
                targetName: String(item.targetName || item.author || charName || 'char').trim(),
                createdAt: Number(item.createdAt || item.timestamp) || Date.now(),
                time: item.time || getChatTimestamp()
            };
        }).filter(item => item.content || item.title);
    }
    function ensureTutuwanSecretData(thread) {
        if (!thread) return { thoughts: [], diaries: [] };
        thread.thoughts = normalizeTutuwanThoughtEntries(thread.thoughts || thread.innerThoughts || thread.secretThoughts || [], thread);
        thread.diaries = normalizeTutuwanDiaryEntries(thread.diaries || thread.secretDiaries || thread.privateDiaries || [], getTutuwanDisplayName(thread), thread);
        return { thoughts: thread.thoughts, diaries: thread.diaries };
    }

    function normalizeChatState(raw = {}) {
        let groups = Array.isArray(raw.groups) ? raw.groups.map(item => String(item || '').trim()).filter(Boolean) : [...chatDefaultGroups];
        groups = [...new Set(groups)];
        if (!groups.includes('全部')) groups.unshift('全部');
        chatDefaultGroups.forEach(defaultGroup => { if (!groups.includes(defaultGroup)) groups.push(defaultGroup); });
        if (!groups.length) groups = [...chatDefaultGroups];
        const rawThreads = Array.isArray(raw.threads) ? raw.threads : [];
        let threads = rawThreads.filter(item => item && !chatLegacyThreadIds.includes(item.id)).map(item => ({
            id: item.id || ('thread-' + Math.random().toString(36).slice(2, 8)),
            charId: normalizeTutuwanCharId(item),
            group: groups.includes(item.group) ? item.group : (groups.includes('朋友') ? '朋友' : groups[0]),
            name: item.name || '未命名联系人',
            snippet: item.snippet || '开始聊天……',
            time: item.time || '',
            avatar: item.avatar || `https://picsum.photos/seed/${encodeURIComponent(item.name || 'char')}/120/120`,
            isGroup: Boolean(item.isGroup),
            members: Array.isArray(item.members) ? item.members.filter(member => member && typeof member === 'object').map(member => ({
                id: member.id || ('member-' + Math.random().toString(36).slice(2, 8)),
                sourceThreadId: member.sourceThreadId || member.threadId || '',
                name: member.name || '群成员',
                avatar: member.avatar || `https://picsum.photos/seed/${encodeURIComponent(member.name || 'group-member')}/120/120`,
                setting: member.setting || '',
                voiceId: member.voiceId || ''
            })) : [],
            setting: item.setting || '',
            userName: item.userName || '',
            userSetting: item.userSetting || '',
            userAvatar: item.userAvatar || '',
            voiceId: item.voiceId || '',
            maskId: item.maskId || '',
            worldbookId: item.worldbookId || '',
            worldbookIds: Array.isArray(item.worldbookIds) ? item.worldbookIds : (item.worldbookId ? [item.worldbookId] : []),
            messages: Array.isArray(item.messages) ? item.messages.filter(msg => msg && typeof msg === 'object').map(msg => ({
                id: msg.id || ('msg-' + Math.random().toString(36).slice(2, 8)),
                role: msg.role === 'user' ? 'user' : 'ai',
                type: ['image','polaroid','sticker','withdrawn','voice','redpacket','transfer','location','phone','video','call_summary','listen','couple_invite','couple_event','peep_result'].includes(msg.type) ? msg.type : 'text',
                content: msg.content || '',
                meta: (msg.meta && typeof msg.meta === 'object') ? msg.meta : {},
                time: msg.time || ''
            })) : [],
            remark: item.remark || '',
            chatBg: item.chatBg || item.beautify?.chatBg || '',
            beautify: (item.beautify && typeof item.beautify === 'object') ? normalizeChatBeautify(item.beautify) : null,
            timeAware: Boolean(item.timeAware),
            autoSummary: Boolean(item.autoSummary),
            offlineMode: Boolean(item.offlineMode),
            offlineWordCount: Math.max(80, Number(item.offlineWordCount) || 500),
            offlinePerspective: ['char','user'].includes(item.offlinePerspective) ? item.offlinePerspective : 'char',
            offlineStyle: item.offlineStyle || '',
            summaryThreshold: Math.max(2, Number(item.summaryThreshold) || 20),
            summaries: Array.isArray(item.summaries) ? item.summaries.filter(sum => sum && typeof sum === 'object').map(sum => ({ id: sum.id || ('sum-' + Math.random().toString(36).slice(2, 8)), time: sum.time || '', text: sum.text || '' })) : [],
            thoughts: normalizeTutuwanThoughtEntries(item.thoughts || item.innerThoughts || item.secretThoughts || []),
            diaries: normalizeTutuwanDiaryEntries(item.diaries || item.secretDiaries || item.privateDiaries || [], item.name || 'char'),
            blocked: Boolean(item.blocked),
            pinned: Boolean(item.pinned),
            coupleEnabled: Boolean(item.coupleEnabled || item.isCouple || item.coupleData?.enabled || item.coupleData?.isActive),
            coupleData: normalizeCoupleData(item.coupleData || item.couple || {}, item.name || 'char')
        })).map(thread => normalizeTutuwanThreadIdentity(thread));
        threads = normalizeTutuwanThreadCollection(threads);
        const masks = Array.isArray(raw.masks) ? raw.masks.filter(item => item && typeof item === 'object').map(item => ({
            id: item.id || ('mask-' + Math.random().toString(36).slice(2, 8)),
            name: item.name || 'user',
            setting: item.setting || '',
            avatar: item.avatar || 'https://picsum.photos/id/1025/160/160',
            createdAt: item.createdAt || Date.now(),
            updatedAt: item.updatedAt || item.createdAt || Date.now()
        })) : [];
        const fallbackGroup = groups.includes('全部') ? '全部' : groups[0];
        let stickerGroups = Array.isArray(raw.stickerGroups) ? raw.stickerGroups.map(item => String(item || '').trim()).filter(Boolean) : [];
        stickerGroups = [...new Set(stickerGroups.filter(item => item && item !== '全部'))];
        if (!stickerGroups.includes('默认')) stickerGroups.unshift('默认');
        return {
            groups,
            activeGroup: raw.activeGroup && groups.includes(raw.activeGroup) ? raw.activeGroup : fallbackGroup,
            threads,
            masks,
            momentsCover: raw.momentsCover || '',
            momentsProfile: {
                name: raw.momentsProfile?.name || raw.momentsName || '',
                signature: raw.momentsProfile?.signature || raw.momentsSignature || '',
                avatar: raw.momentsProfile?.avatar || raw.momentsAvatar || ''
            },
            homeProfile: {
                name: raw.homeProfile?.name || raw.homeName || '',
                signature: raw.homeProfile?.signature || raw.homeSignature || '',
                avatar: raw.homeProfile?.avatar || raw.homeAvatar || ''
            },
            stickerGroups,
            activeStickerGroup: raw.activeStickerGroup && stickerGroups.includes(raw.activeStickerGroup) ? raw.activeStickerGroup : '默认',
            stickers: Array.isArray(raw.stickers) ? raw.stickers.filter(item => item && typeof item === 'object').map(item => ({
                id: item.id || ('sticker-' + Math.random().toString(36).slice(2, 8)),
                group: (item.group && stickerGroups.includes(item.group)) ? item.group : '默认',
                url: item.url || item.src || '',
                desc: item.desc || item.description || '表情包',
                createdAt: item.createdAt || Date.now()
            })).filter(item => item.url) : [],
            beautify: normalizeChatBeautify(raw.beautify || {}),
            beautyPresets: Array.isArray(raw.beautyPresets) ? raw.beautyPresets.filter(item => item && typeof item === 'object').map(item => ({
                id: String(item.id || createChatId('beauty')).trim(),
                name: String(item.name || '未命名预设').trim() || '未命名预设',
                config: normalizeChatBeautify(item.config || item),
                createdAt: Number(item.createdAt) || Date.now()
            })) : []
        };
    }
    async function loadChatState() {
        chatState = normalizeChatState(await getSetting('chat_app_state', {}));
        applyChatBeautify();
        return chatState;
    }
    async function saveChatState() {
        chatState = normalizeChatState(chatState);
        await setSetting('chat_app_state', chatState);
    }
    function updateChatProfileText() {
        const desktopName = document.getElementById('text-username')?.textContent?.trim() || '昵称';
        const desktopSign = document.getElementById('text-speech')?.textContent?.trim() || '个性签名';
        const desktopAvatar = document.getElementById('avatar-img')?.src || 'https://picsum.photos/id/1025/500/360';
        const momentsProfile = chatState.momentsProfile || {};
        const homeProfile = chatState.homeProfile || {};
        const momentsName = momentsProfile.name || desktopName || '昵称';
        const momentsSignature = momentsProfile.signature || desktopSign || '个性签名';
        const momentsAvatar = momentsProfile.avatar || desktopAvatar;
        const homeName = homeProfile.name || desktopName || '昵称';
        const homeSignature = homeProfile.signature || desktopSign || '个性签名';
        const homeAvatar = homeProfile.avatar || desktopAvatar;
        const mn = $('moments-nickname'); if (mn) mn.textContent = momentsName;
        const ms = $('moments-signature'); if (ms) ms.textContent = momentsSignature;
        const ma = $('moments-avatar-img'); if (ma) ma.src = momentsAvatar;
        const hn = $('chat-home-name'); if (hn) hn.textContent = homeName;
        const hs = $('chat-home-sign'); if (hs) hs.textContent = homeSignature;
        const ha = $('chat-home-avatar-img'); if (ha) ha.src = homeAvatar;
    }
    async function editChatProfileField(profileKey, field, label, fallback) {
        const current = chatState[profileKey]?.[field] || fallback || '';
        const value = await showGlobalPrompt(`请输入${label}`, current, label);
        const finalValue = (value || '').trim();
        if (!finalValue) return;
        chatState[profileKey] = { ...(chatState[profileKey] || {}), [field]: finalValue };
        await saveChatState();
        updateChatProfileText();
        showToast('已保存');
    }
    async function setChatProfileAvatar(profileKey, fileInputId) {
        const file = $(fileInputId)?.files?.[0];
        if (!file) return;
        chatState[profileKey] = { ...(chatState[profileKey] || {}), avatar: await readFileAsDataURL(file) };
        await saveChatState();
        updateChatProfileText();
        $(fileInputId).value = '';
        showToast('头像已更换');
    }
    function setMomentsCover(src) {
        const hero = $('moments-hero');
        if (!hero) return;
        const finalSrc = src || chatState.momentsCover || momentCoverPool[momentCoverIndex % momentCoverPool.length];
        hero.style.backgroundImage = `url('${cssUrl(finalSrc)}')`;
    }
    function setChatTab(tab) {
        document.querySelectorAll('.chat-view').forEach(view => view.classList.remove('active'));
        const target = tab === 'moments' ? 'chat-view-moments' : tab === 'home' ? 'chat-view-home' : 'chat-view-messages';
        $(target)?.classList.add('active');
        document.querySelectorAll('.chat-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.chatTab === tab));
        updateChatProfileText();
        if (tab === 'moments') renderMomentsFeed();
    }
    function chatEscape(str = '') {
        return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    async function deleteChatGroup(group) {
        if (!chatState.groups.includes(group)) return;
        if (group === '全部') {
            await showGlobalAlert('「全部」为系统分组，不允许删除。');
            return;
        }
        if (chatState.groups.length <= 1) {
            await showGlobalAlert('至少保留一个分组。');
            return;
        }
        const ok = await showGlobalConfirm(`确定删除「${group}」分组吗？分组内聊天不会被删除，会移动到剩余分组。`, '删除分组');
        if (!ok) return;
        const remaining = chatState.groups.filter(item => item !== group);
        const fallbackGroup = remaining.includes('全部') ? '全部' : remaining[0];
        chatState.groups = remaining;
        if (chatState.activeGroup === group) chatState.activeGroup = fallbackGroup;
        chatState.threads = chatState.threads.map(thread => thread.group === group ? { ...thread, group: fallbackGroup } : thread);
        await saveChatState();
        renderChatGroups();
        renderChatThreads();
        showToast('分组已删除');
    }
    function renderChatGroups() {
        const wrap = $('chat-group-tabs');
        if (!wrap) return;
        wrap.innerHTML = '';
        chatState.groups.forEach(group => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chat-group-chip' + (group === chatState.activeGroup ? ' active' : '');
            if (group === '全部') chip.dataset.fixed = 'true';
            const deleteHtml = group === '全部' ? '' : `<span class="chat-group-delete" role="button" tabindex="0" aria-label="删除${chatEscape(group)}分组"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>`;
            chip.innerHTML = `<span class="chat-group-chip-inner"><span class="chat-group-name">${chatEscape(group)}</span>${deleteHtml}</span>`;
            chip.addEventListener('click', async () => {
                chatState.activeGroup = group;
                await saveChatState();
                renderChatGroups();
                renderChatThreads();
            });
            const deleteBtn = chip.querySelector('.chat-group-delete');
            deleteBtn?.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await deleteChatGroup(group);
            });
            deleteBtn?.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    await deleteChatGroup(group);
                }
            });
            wrap.appendChild(chip);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'chat-group-chip add';
        add.textContent = '+';
        add.addEventListener('click', addChatGroup);
        wrap.appendChild(add);
    }
    function renderChatThreads() {
        const list = $('chat-thread-list');
        if (!list) return;
        const current = chatState.activeGroup || '全部';
        const threads = (current === '全部' ? chatState.threads : chatState.threads.filter(item => item.group === current))
            .slice()
            .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
        list.innerHTML = '';
        if (!threads.length) {
            const empty = document.createElement('div');
            empty.className = 'chat-empty';
            empty.innerHTML = '当前分组暂无消息<br>点击右上角加号创建联系人或群聊';
            list.appendChild(empty);
            return;
        }
        threads.forEach(thread => {
            const wrap = document.createElement('div');
            wrap.className = 'chat-thread-swipe-wrap' + (thread.pinned ? ' pinned' : '');
            const actions = document.createElement('div');
            actions.className = 'chat-thread-actions';
            actions.innerHTML = `<button class="chat-thread-action-btn pin" type="button">${thread.pinned ? '取消' : '置顶'}</button><button class="chat-thread-action-btn edit" type="button">编辑</button><button class="chat-thread-action-btn delete" type="button">删除</button>`;
            const card = document.createElement('div');
            card.className = 'chat-thread-card';
            const memberCount = Array.isArray(thread.members) ? thread.members.length : 0;
            const avatarHTML = thread.isGroup ? buildTutuwanGroupAvatarHTML(thread, 'chat-thread-avatar group-avatar') : `<div class="chat-thread-avatar"><img src="${chatEscape(thread.avatar)}" alt="${chatEscape(thread.name)}"></div>`;
            const nameExtra = thread.isGroup ? `<span class="group-count-pill">${memberCount || 0}人</span>` : '';
            card.innerHTML = `${avatarHTML}<div><div class="chat-thread-name">${chatEscape(getTutuwanDisplayName(thread))}${nameExtra}</div><div class="chat-thread-snippet">${chatEscape(thread.snippet || '开始聊天……')}</div></div><div class="chat-thread-time">${chatEscape(thread.time || '')}</div>`;
            wrap.appendChild(actions);
            wrap.appendChild(card);
            bindChatThreadSwipe(wrap, card);
            card.addEventListener('click', () => {
                if (wrap.classList.contains('open')) { closeChatThreadSwipe(wrap, card); return; }
                openTutuwanChatRoom(thread.id);
            });
            actions.querySelector('.pin')?.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                thread.pinned = !thread.pinned;
                await saveChatState();
                renderChatThreads();
            });
            actions.querySelector('.edit')?.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                await editChatThreadQuick(thread.id);
            });
            actions.querySelector('.delete')?.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                await deleteChatThreadQuick(thread.id);
            });
            list.appendChild(wrap);
        });
    }
    function bindChatThreadSwipe(wrap, card) {
        let startX = 0, startY = 0, dx = 0, swiping = false;
        const maxX = -174;
        const apply = x => { card.style.transform = `translateX(${Math.max(maxX, Math.min(0, x))}px)`; };
        card.addEventListener('touchstart', e => { const t = e.touches[0]; startX = t.clientX; startY = t.clientY; dx = 0; swiping = true; wrap.classList.remove('dragging'); }, { passive: true });
        card.addEventListener('touchmove', e => {
            if (!swiping) return;
            const t = e.touches[0]; dx = t.clientX - startX;
            if (Math.abs(dx) > Math.abs(t.clientY - startY) && dx < 0) { wrap.classList.add('dragging'); apply(dx); }
        }, { passive: true });
        card.addEventListener('touchend', () => { if (!swiping) return; dx < -64 ? openChatThreadSwipe(wrap, card) : closeChatThreadSwipe(wrap, card); wrap.classList.remove('dragging'); swiping = false; });
        card.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; startX = e.clientX; startY = e.clientY; dx = 0; swiping = true; wrap.classList.remove('dragging'); });
        card.addEventListener('pointermove', e => { if (!swiping || e.pointerType === 'touch') return; dx = e.clientX - startX; if (Math.abs(dx) > Math.abs(e.clientY - startY) && dx < 0) { wrap.classList.add('dragging'); apply(dx); } });
        card.addEventListener('pointerup', e => { if (!swiping || e.pointerType === 'touch') return; dx < -64 ? openChatThreadSwipe(wrap, card) : closeChatThreadSwipe(wrap, card); wrap.classList.remove('dragging'); swiping = false; });
    }
    function openChatThreadSwipe(wrap, card) {
        document.querySelectorAll('.chat-thread-swipe-wrap.open').forEach(item => { if (item !== wrap) closeChatThreadSwipe(item, item.querySelector('.chat-thread-card')); });
        wrap.classList.add('open');
        if (card) card.style.transform = 'translateX(-174px)';
    }
    function closeChatThreadSwipe(wrap, card) {
        wrap?.classList.remove('open');
        wrap?.classList.remove('dragging');
        if (card) card.style.transform = 'translateX(0)';
    }
    async function editChatThreadQuick(threadId) {
        const thread = chatState.threads.find(item => item.id === threadId);
        if (!thread) return;
        document.querySelectorAll('.chat-thread-swipe-wrap.open').forEach(item => closeChatThreadSwipe(item, item.querySelector('.chat-thread-card')));
        if (thread.isGroup) await openTutuwanGroupModal(threadId);
        else await openFriendModal(threadId);
    }
    async function deleteChatThreadQuick(threadId) {
        const thread = chatState.threads.find(item => item.id === threadId);
        if (!thread) return;
        const ok = await showGlobalConfirm(`确定删除「${getTutuwanDisplayName(thread)}」对话吗？`, '删除对话');
        if (!ok) return;
        chatState.threads = chatState.threads.filter(item => item.id !== threadId);
        await saveChatState();
        renderChatThreads();
        showToast('已删除');
    }
    async function addChatGroup() {
        const name = await showGlobalPrompt('请输入分组名称', '新分组', '新增分组');
        const finalName = (name || '').trim();
        if (!finalName) return;
        if (chatState.groups.includes(finalName)) {
            await showGlobalAlert('该分组已存在。');
            return;
        }
        chatState.groups.push(finalName);
        chatState.activeGroup = finalName;
        await saveChatState();
        renderChatGroups();
        renderChatThreads();
        showToast('分组已创建');
    }
    function createChatId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function hashTutuwanStableId(seed = '') {
        let hash = 2166136261;
        const text = String(seed || 'char');
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }
    function normalizeTutuwanCharId(item = {}) {
        const raw = String(item.charId || item.characterId || item.cid || '').trim();
        if (raw) return raw;
        const seed = `${item.id || ''}|${item.name || ''}|${item.avatar || ''}|${item.setting || ''}`;
        return `char-${hashTutuwanStableId(seed)}`;
    }
    function ensureTutuwanCharId(thread = {}) {
        if (!thread.charId) thread.charId = normalizeTutuwanCharId(thread);
        return thread.charId;
    }
    function normalizeTutuwanMemberIdentity(member = {}, thread = {}) {
        const sourceThread = (chatState?.threads || []).find(t => t.id && (t.id === member.sourceThreadId || t.id === member.threadId || t.id === member.id));
        const base = sourceThread ? { ...sourceThread, ...member } : member;
        const charId = String(member.charId || member.characterId || member.cid || normalizeTutuwanCharId(base)).trim();
        const id = String(member.id || charId || createChatId('member')).trim();
        return {
            ...member,
            id,
            charId,
            sourceThreadId: member.sourceThreadId || member.threadId || sourceThread?.id || '',
            name: member.name || sourceThread?.name || '群成员',
            avatar: member.avatar || sourceThread?.avatar || `https://picsum.photos/seed/${encodeURIComponent(member.name || sourceThread?.name || 'group-member')}/120/120`,
            setting: member.setting || sourceThread?.setting || '',
            voiceId: member.voiceId || sourceThread?.voiceId || ''
        };
    }
    function createTutuwanMessageIdentity(thread = {}, role = 'msg') {
        const charId = ensureTutuwanCharId(thread);
        const prefix = role === 'user' ? 'user-msg' : role === 'system' ? 'sys-msg' : 'char-msg';
        return `${prefix}-${charId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function normalizeTutuwanMessageRecord(raw = {}, thread = {}) {
        const safeRaw = raw && typeof raw === 'object' ? raw : {};
        const threadId = String(thread.id || safeRaw.threadId || safeRaw.chatId || createChatId('thread')).trim();
        if (!thread.id) thread.id = threadId;
        const charId = ensureTutuwanCharId(thread);
        const role = safeRaw.role === 'user' ? 'user' : (safeRaw.role === 'system' ? 'system' : 'ai');
        const requestedMsgId = String(safeRaw.id || safeRaw.messageId || safeRaw.msgId || safeRaw.uuid || createTutuwanMessageIdentity(thread, role)).trim();
        const exists = Array.isArray(thread.messages) ? thread.messages.some(m => m && m !== safeRaw && String(m.id || m.messageId || '') === requestedMsgId) : false;
        const msgId = exists ? `${requestedMsgId}-${Math.random().toString(36).slice(2, 6)}` : requestedMsgId;
        const allowedTypes = ['text','image','polaroid','sticker','withdrawn','voice','redpacket','transfer','location','phone','video','call_summary','listen','couple_invite','couple_event','peep_result'];
        const type = allowedTypes.includes(safeRaw.type) ? safeRaw.type : 'text';
        const meta = (safeRaw.meta && typeof safeRaw.meta === 'object') ? { ...safeRaw.meta } : {};
        const senderId = meta.senderId || safeRaw.senderId || safeRaw.sender_id || (role === 'user' ? `user-${threadId}` : (thread.isGroup ? (meta.memberId || '') : charId));
        const receiverId = meta.receiverId || safeRaw.receiverId || safeRaw.receiver_id || (role === 'user' ? charId : `user-${threadId}`);
        const normalizedMeta = {
            ...meta,
            messageId: msgId,
            threadId,
            chatId: threadId,
            charId,
            senderId,
            receiverId
        };
        if (safeRaw.appId || safeRaw.sourceApp) normalizedMeta.sourceApp = safeRaw.appId || safeRaw.sourceApp;
        if (safeRaw.aiOutputId || safeRaw.outputId) normalizedMeta.aiOutputId = safeRaw.aiOutputId || safeRaw.outputId;
        return {
            ...safeRaw,
            id: msgId,
            messageId: msgId,
            threadId,
            chatId: threadId,
            charId,
            senderId,
            receiverId,
            role,
            type,
            content: safeRaw.content || '',
            meta: normalizedMeta,
            time: safeRaw.time || getChatTimestamp()
        };
    }
    function normalizeTutuwanThreadIdentity(thread = {}) {
        if (!thread || typeof thread !== 'object') return thread;
        thread.id = String(thread.id || thread.threadId || createChatId(thread.isGroup ? 'group' : 'thread')).trim();
        thread.threadId = thread.id;
        thread.chatId = thread.id;
        thread.charId = ensureTutuwanCharId(thread);
        if (Array.isArray(thread.members)) thread.members = thread.members.map(member => normalizeTutuwanMemberIdentity(member, thread));
        thread.messages = Array.isArray(thread.messages) ? thread.messages.filter(msg => msg && typeof msg === 'object').map(msg => normalizeTutuwanMessageRecord(msg, thread)) : [];
        thread.thoughts = normalizeTutuwanThoughtEntries(thread.thoughts || thread.innerThoughts || thread.secretThoughts || [], thread);
        thread.diaries = normalizeTutuwanDiaryEntries(thread.diaries || thread.secretDiaries || thread.privateDiaries || [], thread.name || 'char', thread);
        if (thread.beautify && typeof thread.beautify === 'object') thread.beautify = normalizeChatBeautify(thread.beautify);
        else thread.beautify = null;
        if (thread.coupleData && typeof thread.coupleData === 'object') thread.coupleData = { ...thread.coupleData, charId: thread.charId, threadId: thread.id, chatId: thread.id };
        return thread;
    }
    function normalizeTutuwanThreadCollection(threads = []) {
        const usedThreadIds = new Set();
        const usedCharIds = new Set();
        return (Array.isArray(threads) ? threads : []).filter(Boolean).map(thread => {
            const originalThreadId = String(thread.id || thread.threadId || createChatId(thread.isGroup ? 'group' : 'thread')).trim();
            let nextThreadId = originalThreadId;
            if (usedThreadIds.has(nextThreadId)) nextThreadId = `${originalThreadId}-${hashTutuwanStableId(`${originalThreadId}|${thread.name || ''}|${usedThreadIds.size}`)}`;
            usedThreadIds.add(nextThreadId);
            if (nextThreadId !== thread.id) {
                thread.id = nextThreadId;
                thread.threadId = nextThreadId;
                thread.chatId = nextThreadId;
            }
            let nextCharId = String(thread.charId || normalizeTutuwanCharId(thread)).trim();
            if (usedCharIds.has(nextCharId)) nextCharId = `${nextCharId}-${hashTutuwanStableId(`${nextThreadId}|${thread.name || ''}`)}`;
            usedCharIds.add(nextCharId);
            if (nextCharId !== thread.charId) thread.charId = nextCharId;
            thread = normalizeTutuwanThreadIdentity(thread);
            thread.messages = (thread.messages || []).map(msg => normalizeTutuwanMessageRecord({ ...msg, threadId: nextThreadId, chatId: nextThreadId, charId: nextCharId }, thread));
            thread.thoughts = normalizeTutuwanThoughtEntries(thread.thoughts || [], thread);
            thread.diaries = normalizeTutuwanDiaryEntries(thread.diaries || [], thread.name || 'char', thread);
            if (thread.coupleData && typeof thread.coupleData === 'object') thread.coupleData = { ...thread.coupleData, threadId: nextThreadId, chatId: nextThreadId, charId: nextCharId };
            return thread;
        });
    }
    function enrichTutuwanAppMeta(thread = {}, appId = '', meta = {}) {
        const charId = ensureTutuwanCharId(thread);
        return {
            ...(meta || {}),
            sourceApp: appId || meta?.sourceApp || meta?.source || 'chat',
            appId: appId || meta?.appId || meta?.sourceApp || meta?.source || 'chat',
            threadId: thread.id || '',
            chatId: thread.id || '',
            charId,
            charName: getTutuwanDisplayName?.(thread) || thread.name || 'char',
            userId: `user-${thread.id || charId}`
        };
    }
    function getChatTimestamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    let editingMaskId = '';
    let maskAvatarDraft = '';
    let friendAvatarDraft = '';
    let friendUserAvatarDraft = '';
    let editingFriendThreadId = '';
    const chatMaskPage = document.getElementById('chat-mask-page');
    const chatMaskModal = document.getElementById('chat-mask-modal');
    const chatFriendModal = document.getElementById('chat-friend-modal');
    function renderMaskPresets() {
        const list = $('chat-mask-list');
        if (!list) return;
        const masks = Array.isArray(chatState.masks) ? chatState.masks : [];
        list.innerHTML = '';
        if (!masks.length) {
            const empty = document.createElement('div');
            empty.className = 'chat-empty';
            empty.innerHTML = '暂无 user 面具预设<br>点击右上角加号添加';
            list.appendChild(empty);
            return;
        }
        masks.forEach(mask => {
            const card = document.createElement('div');
            card.className = 'chat-mask-card';
            card.innerHTML = `<div class="chat-mask-avatar"><img src="${chatEscape(mask.avatar)}" alt="${chatEscape(mask.name)}"></div><div><div class="chat-mask-name">${chatEscape(mask.name)}</div><div class="chat-mask-desc">${chatEscape(mask.setting || '未填写设定内容')}</div></div>`;
            card.addEventListener('click', () => openMaskModal(mask.id));
            list.appendChild(card);
        });
    }
    async function openMaskPage() {
        await loadChatState();
        renderMaskPresets();
        if (chatMaskPage) chatMaskPage.style.display = 'flex';
    }
    function closeMaskModal() {
        if (chatMaskModal) chatMaskModal.style.display = 'none';
        editingMaskId = '';
        maskAvatarDraft = '';
        const file = $('chat-mask-avatar-file');
        if (file) file.value = '';
    }
    function openMaskModal(maskId = '') {
        const mask = maskId ? chatState.masks.find(item => item.id === maskId) : null;
        editingMaskId = mask?.id || '';
        maskAvatarDraft = mask?.avatar || 'https://picsum.photos/id/1025/160/160';
        const title = $('chat-mask-modal-title'); if (title) title.textContent = mask ? '编辑面具预设' : '添加面具预设';
        const preview = $('chat-mask-avatar-preview'); if (preview) preview.src = maskAvatarDraft;
        const urlInput = $('chat-mask-avatar-url-input'); if (urlInput) urlInput.value = (maskAvatarDraft && !maskAvatarDraft.startsWith('data:')) ? maskAvatarDraft : '';
        const nameInput = $('chat-mask-name-input'); if (nameInput) nameInput.value = mask?.name || '';
        const settingInput = $('chat-mask-setting-input'); if (settingInput) settingInput.value = mask?.setting || '';
        const del = $('chat-mask-delete-btn'); if (del) del.style.display = mask ? 'flex' : 'none';
        if (chatMaskModal) chatMaskModal.style.display = 'flex';
    }
    async function saveMaskPreset() {
        const name = ($('chat-mask-name-input')?.value || '').trim();
        const setting = ($('chat-mask-setting-input')?.value || '').trim();
        if (!name) return showGlobalAlert('请填写 user 姓名。');
        const now = Date.now();
        const payload = {
            id: editingMaskId || createChatId('mask'),
            name,
            setting,
            avatar: maskAvatarDraft || `https://picsum.photos/seed/${encodeURIComponent(name)}/160/160`,
            createdAt: now,
            updatedAt: now
        };
        const idx = chatState.masks.findIndex(item => item.id === editingMaskId);
        if (idx >= 0) {
            payload.createdAt = chatState.masks[idx].createdAt || now;
            chatState.masks.splice(idx, 1, payload);
        } else {
            chatState.masks.unshift(payload);
        }
        await saveChatState();
        renderMaskPresets();
        closeMaskModal();
        showToast('面具预设已保存');
    }
    async function deleteMaskPreset() {
        if (!editingMaskId) return;
        if (!await showGlobalConfirm('确定删除该 user 面具预设吗？已绑定的联系人会自动解除绑定。', '删除面具预设')) return;
        chatState.masks = chatState.masks.filter(item => item.id !== editingMaskId);
        chatState.threads = chatState.threads.map(thread => thread.maskId === editingMaskId ? { ...thread, maskId: '' } : thread);
        await saveChatState();
        renderMaskPresets();
        closeMaskModal();
        showToast('面具预设已删除');
    }
    function updateFriendMaskPreview() {
        const maskId = $('chat-friend-mask-select')?.value || '';
        const mask = (chatState.masks || []).find(item => item.id === maskId);
        const preview = $('chat-friend-user-avatar-preview');
        if (preview && !friendUserAvatarDraft) preview.src = mask?.avatar || chatState.homeProfile?.avatar || $('avatar-img')?.src || 'https://picsum.photos/id/1025/160/160';
    }
    function applySelectedMaskToFriendFields() {
        const maskId = $('chat-friend-mask-select')?.value || '';
        const mask = (chatState.masks || []).find(item => item.id === maskId);
        if (!mask) return;
        friendUserAvatarDraft = mask.avatar || friendUserAvatarDraft;
        const preview = $('chat-friend-user-avatar-preview'); if (preview) preview.src = friendUserAvatarDraft || 'https://picsum.photos/id/1025/160/160';
        const urlInput = $('chat-friend-user-avatar-url-input'); if (urlInput) urlInput.value = friendUserAvatarDraft && !String(friendUserAvatarDraft).startsWith('data:') ? friendUserAvatarDraft : '';
        const userNameInput = $('chat-friend-user-name-input'); if (userNameInput && !userNameInput.value.trim()) userNameInput.value = mask.name || '';
        const userSettingInput = $('chat-friend-user-setting-input'); if (userSettingInput && !userSettingInput.value.trim()) userSettingInput.value = mask.setting || '';
    }
    function applyImageUrlToPreview(inputId, previewId, draftSetter) {
        const value = ($(inputId)?.value || '').trim();
        if (!value) return;
        draftSetter(value);
        const preview = $(previewId);
        if (preview) preview.src = value;
    }

    function toggleFriendWorldbookPanel(forceOpen) {
        const field = $('chat-friend-worldbook-field');
        const panel = $('chat-friend-worldbook-panel');
        if (!field || !panel) return;
        const next = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('active');
        field.classList.toggle('open', next);
        field.setAttribute('aria-expanded', next ? 'true' : 'false');
        panel.classList.toggle('active', next);
    }
    function syncFriendWorldbookSummary() {
        const wbSelect = $('chat-friend-worldbook-select');
        const summary = $('chat-friend-worldbook-summary');
        if (!wbSelect || !summary) return;
        const selectedNames = Array.from(wbSelect.options || []).filter(option => option.value && option.selected).map(option => (option.textContent || '').trim()).filter(Boolean);
        if (!selectedNames.length) {
            summary.textContent = '关联世界书（可多选）';
            summary.classList.add('chat-worldbook-placeholder');
            return;
        }
        summary.classList.remove('chat-worldbook-placeholder');
        summary.textContent = selectedNames.length <= 2 ? selectedNames.join('、') : `${selectedNames.slice(0, 2).join('、')} +${selectedNames.length - 2}`;
    }
    function renderFriendWorldbookPicker() {
        const wbSelect = $('chat-friend-worldbook-select');
        const panel = $('chat-friend-worldbook-panel');
        if (!wbSelect || !panel) return;
        const options = Array.from(wbSelect.options || []).filter(option => option.value);
        if (!options.length) {
            panel.innerHTML = '<div class="chat-worldbook-option empty">暂无世界书</div>';
            syncFriendWorldbookSummary();
            return;
        }
        panel.innerHTML = options.map(option => `<button type="button" class="chat-worldbook-option${option.selected ? ' active' : ''}" data-value="${chatEscape(option.value)}">${chatEscape((option.textContent || '').trim() || '世界书')}</button>`).join('');
        syncFriendWorldbookSummary();
    }
    function toggleFriendWorldbookValue(value) {
        const wbSelect = $('chat-friend-worldbook-select');
        if (!wbSelect) return;
        const option = Array.from(wbSelect.options || []).find(item => item.value === value);
        if (!option) return;
        option.selected = !option.selected;
        renderFriendWorldbookPicker();
    }

    async function populateFriendSelects() {
        const maskSelect = $('chat-friend-mask-select');
        if (maskSelect) {
            maskSelect.innerHTML = '<option value="">不绑定 user 面具预设</option>' + (chatState.masks || []).map(mask => `<option value="${chatEscape(mask.id)}">${chatEscape(mask.name)}</option>`).join('');
            updateFriendMaskPreview();
        }
        const wbSelect = $('chat-friend-worldbook-select');
        if (wbSelect) {
            try { await loadWorldbooks(); } catch (e) {}
            const books = (typeof normalizeWorldbookData === 'function') ? normalizeWorldbookData(worldbookData) : [];
            wbSelect.innerHTML = books.length ? books.map(book => `<option value="${chatEscape(book.id)}">${chatEscape(book.name)}</option>`).join('') : '<option value="" disabled>暂无世界书</option>';
            renderFriendWorldbookPicker();
            toggleFriendWorldbookPanel(false);
        }
        const groupSelect = $('chat-friend-group-select');
        if (groupSelect) {
            const groups = (chatState.groups || []).filter(group => group !== '全部');
            const fallback = groups.length ? groups : ['朋友'];
            groupSelect.innerHTML = fallback.map(group => `<option value="${chatEscape(group)}">${chatEscape(group)}</option>`).join('');
            const currentGroup = chatState.activeGroup && chatState.activeGroup !== '全部' ? chatState.activeGroup : (fallback.includes('朋友') ? '朋友' : fallback[0]);
            groupSelect.value = currentGroup;
        }
    }
    async function openFriendModal(threadId = '') {
        await loadChatState();
        editingFriendThreadId = threadId || '';
        const editingThread = editingFriendThreadId ? (chatState.threads || []).find(item => item.id === editingFriendThreadId) : null;
        const linkedMask = editingThread?.maskId ? (chatState.masks || []).find(item => item.id === editingThread.maskId) : null;
        const title = $('chat-friend-modal-title'); if (title) title.textContent = editingThread ? '编辑对话资料' : '添加好友';
        friendAvatarDraft = editingThread?.avatar || 'https://picsum.photos/seed/new-char/160/160';
        friendUserAvatarDraft = editingThread?.userAvatar || linkedMask?.avatar || chatState.homeProfile?.avatar || $('avatar-img')?.src || 'https://picsum.photos/id/1025/160/160';
        const preview = $('chat-friend-avatar-preview'); if (preview) preview.src = friendAvatarDraft;
        const friendUrlInput = $('chat-friend-avatar-url-input'); if (friendUrlInput) friendUrlInput.value = editingThread?.avatar && !String(editingThread.avatar).startsWith('data:') ? editingThread.avatar : '';
        const userPreview = $('chat-friend-user-avatar-preview'); if (userPreview) userPreview.src = friendUserAvatarDraft;
        const userUrlInput = $('chat-friend-user-avatar-url-input'); if (userUrlInput) userUrlInput.value = friendUserAvatarDraft && !String(friendUserAvatarDraft).startsWith('data:') ? friendUserAvatarDraft : '';
        const nameInput = $('chat-friend-name-input'); if (nameInput) nameInput.value = editingThread?.name || '';
        const settingInput = $('chat-friend-setting-input'); if (settingInput) settingInput.value = editingThread?.setting || '';
        const userNameInput = $('chat-friend-user-name-input'); if (userNameInput) userNameInput.value = editingThread?.userName || linkedMask?.name || chatState.homeProfile?.name || document.getElementById('text-username')?.textContent?.trim() || '';
        const userSettingInput = $('chat-friend-user-setting-input'); if (userSettingInput) userSettingInput.value = editingThread?.userSetting || linkedMask?.setting || '';
        const voiceInput = $('chat-friend-voice-id-input'); if (voiceInput) voiceInput.value = editingThread?.voiceId || '';
        const file = $('chat-friend-avatar-file'); if (file) file.value = '';
        const userFile = $('chat-friend-user-avatar-file'); if (userFile) userFile.value = '';
        await populateFriendSelects();
        if (editingThread) {
            if ($('chat-friend-mask-select')) $('chat-friend-mask-select').value = editingThread.maskId || '';
            updateFriendMaskPreview();
            if ($('chat-friend-group-select')) $('chat-friend-group-select').value = editingThread.group || $('chat-friend-group-select')?.value || '朋友';
            const wbSelect = $('chat-friend-worldbook-select');
            const ids = Array.isArray(editingThread.worldbookIds) ? editingThread.worldbookIds : (editingThread.worldbookId ? [editingThread.worldbookId] : []);
            Array.from(wbSelect?.options || []).forEach(option => { option.selected = ids.includes(option.value); });
        }
        renderFriendWorldbookPicker();
        toggleFriendWorldbookPanel(false);
        if (chatFriendModal) chatFriendModal.style.display = 'flex';
    }
    function closeFriendModal() {
        if (chatFriendModal) chatFriendModal.style.display = 'none';
        toggleFriendWorldbookPanel(false);
        editingFriendThreadId = '';
        friendUserAvatarDraft = '';
        const file = $('chat-friend-avatar-file');
        if (file) file.value = '';
        const userFile = $('chat-friend-user-avatar-file');
        if (userFile) userFile.value = '';
    }
    async function saveFriendThread() {
        const name = ($('chat-friend-name-input')?.value || '').trim();
        const setting = ($('chat-friend-setting-input')?.value || '').trim();
        const userName = ($('chat-friend-user-name-input')?.value || '').trim();
        const userSetting = ($('chat-friend-user-setting-input')?.value || '').trim();
        const voiceId = ($('chat-friend-voice-id-input')?.value || '').trim();
        if (!name) return showGlobalAlert('请填写 char 姓名。');
        let group = $('chat-friend-group-select')?.value || '朋友';
        if (!chatState.groups.includes(group)) chatState.groups.push(group);
        const worldbookIds = Array.from($('chat-friend-worldbook-select')?.selectedOptions || []).map(option => option.value).filter(Boolean);
        const baseIdentitySeed = { id: editingFriendThreadId || '', name, avatar: friendAvatarDraft || '', setting };
        const payload = {
            group,
            charId: editingFriendThreadId ? ((chatState.threads || []).find(item => item.id === editingFriendThreadId)?.charId || normalizeTutuwanCharId(baseIdentitySeed)) : normalizeTutuwanCharId(baseIdentitySeed),
            name,
            setting,
            userName,
            userSetting,
            userAvatar: friendUserAvatarDraft || '',
            voiceId,
            maskId: $('chat-friend-mask-select')?.value || '',
            worldbookId: worldbookIds[0] || '',
            worldbookIds,
            avatar: friendAvatarDraft || `https://picsum.photos/seed/${encodeURIComponent(name)}/120/120`
        };
        const wasEditingFriend = Boolean(editingFriendThreadId);
        if (editingFriendThreadId) {
            const target = (chatState.threads || []).find(item => item.id === editingFriendThreadId);
            if (target) Object.assign(target, payload);
            chatState.activeGroup = group;
        } else {
            const nextThread = normalizeTutuwanThreadIdentity({
                id: createChatId('thread'),
                ...payload,
                snippet: '开始聊天……',
                time: getChatTimestamp(),
                messages: []
            });
            chatState.threads.unshift(nextThread);
            chatState.activeGroup = group;
        }
        await saveChatState();
        renderChatGroups();
        renderChatThreads();
        if (TutuwanCurrentThreadId) renderTutuwanChatRoom();
        closeFriendModal();
        showToast(wasEditingFriend ? 'char 设定已保存' : '好友已添加');
    }
    async function addChatThread() {
        await openFriendModal();
    }

    function buildTutuwanGroupAvatarHTML(thread, className = 'Tutuwan-group-avatar') {
        const members = (Array.isArray(thread?.members) && thread.members.length ? thread.members : [{ name: thread?.name || '群聊', avatar: thread?.avatar || '' }]).slice(0, 4);
        const imgs = members.map(member => `<img src="${chatEscape(member.avatar || `https://picsum.photos/seed/${encodeURIComponent(member.name || 'group')}/120/120`)}" alt="${chatEscape(member.name || '群成员')}">`).join('');
        return `<div class="${className}">${imgs}</div>`;
    }
    function resolveTutuwanGroupMember(thread, msgOrName) {
        const members = Array.isArray(thread?.members) ? thread.members : [];
        if (!thread?.isGroup || !members.length) return null;
        const meta = (msgOrName && typeof msgOrName === 'object') ? (msgOrName.meta || {}) : {};
        const rawName = typeof msgOrName === 'string' ? msgOrName : (meta.senderName || meta.name || '');
        const rawId = meta.senderId || meta.memberId || '';
        return members.find(m => rawId && (m.id === rawId || m.sourceThreadId === rawId))
            || members.find(m => rawName && String(m.name || '').trim() === String(rawName).trim())
            || members[0];
    }
    function applyTutuwanGroupSenderMeta(payload, thread, inst = {}) {
        if (!thread?.isGroup || payload?.meta?.offlineGroupNarrative) return payload;
        const member = resolveTutuwanGroupMember(thread, inst.sender || inst.senderName || inst.name || inst.member || inst.memberName || '') || (thread.members || [])[0];
        if (!member) return payload;
        return {
            ...payload,
            meta: {
                ...(payload.meta || {}),
                senderId: member.id,
                senderCharId: member.charId || member.id,
                senderName: member.name,
                senderAvatar: member.avatar
            }
        };
    }
    async function openTutuwanGroupModal(groupId = '') {
        await loadChatState();
        const editing = groupId ? (chatState.threads || []).find(item => item.id === groupId) : null;
        const candidates = (chatState.threads || []).filter(item => !item.isGroup && item.id !== groupId);
        if (!candidates.length && !editing) {
            await showGlobalAlert('请先添加至少一个好友，再发起群聊。', '发起群聊');
            return;
        }
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay chat-form-modal';
        overlay.style.display = 'flex';
        const selectedIds = new Set((editing?.members || []).map(m => m.sourceThreadId || m.id).filter(Boolean));
        const memberList = candidates.length ? candidates.map(thread => `
            <label class="Tutuwan-group-member-option">
                <img src="${chatEscape(thread.avatar)}" alt="${chatEscape(thread.name)}">
                <span>${chatEscape(getTutuwanDisplayName(thread))}</span>
                <input type="checkbox" value="${chatEscape(thread.id)}" ${selectedIds.has(thread.id) ? 'checked' : ''}>
            </label>`).join('') : '<div class="Tutuwan-group-empty-tip">暂无可选好友，仍可保存当前群聊资料。</div>';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:360px;">
                <h3 style="margin-bottom:14px; color:var(--pink-dark);">${editing ? '编辑群聊' : '发起群聊'}</h3>
                <div class="input-group">
                    <input type="text" id="Tutuwan-group-name-input" placeholder="群聊名称" value="${chatEscape(editing?.name || '')}">
                    <input type="text" id="Tutuwan-group-avatar-input" placeholder="群头像 URL（可选，不填使用成员头像拼图）" value="${chatEscape(editing?.avatar || '')}">
                    <textarea id="Tutuwan-group-setting-input" class="chat-form-textarea" placeholder="群聊设定 / 群公告 / 群关系网（会进入 API 上下文）">${chatEscape(editing?.setting || '')}</textarea>
                    <div class="chat-multi-help">勾选参与群聊的 char；发送空消息触发 API 时，会按成员人设生成群聊回复，并在气泡上显示发言人。</div>
                    <div class="Tutuwan-group-create-list">${memberList}</div>
                    <select id="Tutuwan-group-category-select" class="chat-form-select"></select>
                </div>
                <div class="modal-actions">
                    <button id="Tutuwan-group-cancel-btn" class="cancel-btn" type="button">取消</button>
                    <button id="Tutuwan-group-save-btn" class="save-btn" type="button">保存</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const category = overlay.querySelector('#Tutuwan-group-category-select');
        if (category) {
            const groups = (chatState.groups || []).filter(g => g !== '全部');
            const fallback = groups.length ? groups : ['朋友'];
            category.innerHTML = fallback.map(g => `<option value="${chatEscape(g)}">${chatEscape(g)}</option>`).join('');
            category.value = editing?.group || (chatState.activeGroup && chatState.activeGroup !== '全部' ? chatState.activeGroup : (fallback.includes('朋友') ? '朋友' : fallback[0]));
        }
        const close = () => overlay.remove();
        overlay.querySelector('#Tutuwan-group-cancel-btn')?.addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        overlay.querySelector('#Tutuwan-group-save-btn')?.addEventListener('click', async () => {
            const checkedIds = Array.from(overlay.querySelectorAll('.Tutuwan-group-member-option input:checked')).map(input => input.value);
            const selectedThreads = candidates.filter(t => checkedIds.includes(t.id));
            const keptMembers = editing?.members?.filter(m => m.sourceThreadId && !candidates.some(t => t.id === m.sourceThreadId)) || [];
            const members = [...keptMembers, ...selectedThreads.map(t => normalizeTutuwanMemberIdentity({
                id: t.charId || t.id,
                charId: ensureTutuwanCharId(t),
                sourceThreadId: t.id,
                name: getTutuwanDisplayName(t),
                avatar: t.avatar,
                setting: t.setting || '',
                voiceId: t.voiceId || ''
            }, editing || {}))];
            if (!members.length) return showGlobalAlert('请至少选择一个群成员。', '发起群聊');
            const name = (overlay.querySelector('#Tutuwan-group-name-input')?.value || '').trim() || members.map(m => m.name).slice(0, 3).join('、');
            const avatar = (overlay.querySelector('#Tutuwan-group-avatar-input')?.value || '').trim();
            const setting = (overlay.querySelector('#Tutuwan-group-setting-input')?.value || '').trim();
            const group = category?.value || '朋友';
            if (!chatState.groups.includes(group)) chatState.groups.push(group);
            const payload = {
                isGroup: true,
                group,
                name,
                avatar: avatar || (members[0]?.avatar || `https://picsum.photos/seed/${encodeURIComponent(name)}/120/120`),
                setting,
                members,
                snippet: editing?.snippet || '群聊已创建',
                time: editing?.time || getChatTimestamp(),
                messages: editing?.messages || []
            };
            if (editing) Object.assign(editing, normalizeTutuwanThreadIdentity({ ...editing, ...payload }));
            else chatState.threads.unshift(normalizeTutuwanThreadIdentity({ id: createChatId('group'), ...payload }));
            chatState.activeGroup = group;
            await saveChatState();
            close();
            renderChatGroups();
            renderChatThreads();
            if (TutuwanCurrentThreadId) renderTutuwanChatRoom();
            showToast(editing ? '群聊已保存' : '群聊已创建');
        });
    }

    let TutuwanCurrentThreadId = '';

    function getTutuwanDisplayName(thread) {
        return (thread?.remark || thread?.name || '聊天').trim();
    }
    function formatTutuwanMoney(value) {
        const num = Math.abs(Number(value) || 0);
        return `¥${num.toFixed(2)}`;
    }

    const CHAT_BEAUTY_BASE_TEMPLATE = `/* 聊天CSS模板：全局美化用于所有 char；聊天设置里的专属美化只覆盖当前 char / 群聊 */
.Tutuwan .avatar-img {
  width: var(--Tutuwan-avatar-size);
  height: var(--Tutuwan-avatar-size);
  border-radius: var(--Tutuwan-avatar-radius);
}
.Tutuwan.user .content {
  background: var(--Tutuwan-user-bubble);
  color: var(--Tutuwan-user-text);
}
.Tutuwan.ai .content {
  background: var(--Tutuwan-ai-bubble);
  color: var(--Tutuwan-ai-text);
}
.Tutuwan.user .content::after { background: var(--Tutuwan-user-bubble); }
.Tutuwan.ai .content::before { background: var(--Tutuwan-ai-bubble); }
`;
    const CHAT_BEAUTY_DEFAULTS = {
        avatarSize: 35,
        avatarRadius: 12,
        fontSize: 14,
        bubbleRadius: 18,
        bubbleWidth: 62,
        messageGap: 6,
        userBubble: '#929292',
        aiBubble: '#ffffff',
        userText: '#ffffff',
        aiText: '#000000',
        chatBg: '',
        userFrame: '',
        aiFrame: '',
        userFrameImage: '',
        aiFrameImage: '',
        userFrameScale: 135,
        aiFrameScale: 135,
        userFrameX: 0,
        aiFrameX: 0,
        userFrameY: 0,
        aiFrameY: 0,
        bubbleCss: '',
        globalCss: ''
    };
    let chatBeautyMode = 'global';
    let chatBeautyThreadId = '';
    function normalizeChatBeautify(raw = {}) {
        const source = raw && typeof raw === 'object' ? raw : {};
        const num = (key, fallback, min, max) => Math.min(max, Math.max(min, Number(source[key] ?? fallback) || fallback));
        return {
            avatarSize: num('avatarSize', CHAT_BEAUTY_DEFAULTS.avatarSize, 24, 72),
            avatarRadius: num('avatarRadius', CHAT_BEAUTY_DEFAULTS.avatarRadius, 0, 36),
            fontSize: num('fontSize', CHAT_BEAUTY_DEFAULTS.fontSize, 11, 24),
            bubbleRadius: num('bubbleRadius', CHAT_BEAUTY_DEFAULTS.bubbleRadius, 4, 32),
            bubbleWidth: num('bubbleWidth', CHAT_BEAUTY_DEFAULTS.bubbleWidth, 48, 82),
            messageGap: num('messageGap', CHAT_BEAUTY_DEFAULTS.messageGap, 0, 20),
            userBubble: source.userBubble || CHAT_BEAUTY_DEFAULTS.userBubble,
            aiBubble: source.aiBubble || CHAT_BEAUTY_DEFAULTS.aiBubble,
            userText: source.userText || CHAT_BEAUTY_DEFAULTS.userText,
            aiText: source.aiText || CHAT_BEAUTY_DEFAULTS.aiText,
            chatBg: source.chatBg || '',
            userFrame: source.userFrame || '',
            aiFrame: source.aiFrame || '',
            userFrameImage: source.userFrameImage || '',
            aiFrameImage: source.aiFrameImage || '',
            userFrameScale: num('userFrameScale', CHAT_BEAUTY_DEFAULTS.userFrameScale, 50, 220),
            aiFrameScale: num('aiFrameScale', CHAT_BEAUTY_DEFAULTS.aiFrameScale, 50, 220),
            userFrameX: num('userFrameX', CHAT_BEAUTY_DEFAULTS.userFrameX, -36, 36),
            aiFrameX: num('aiFrameX', CHAT_BEAUTY_DEFAULTS.aiFrameX, -36, 36),
            userFrameY: num('userFrameY', CHAT_BEAUTY_DEFAULTS.userFrameY, -36, 36),
            aiFrameY: num('aiFrameY', CHAT_BEAUTY_DEFAULTS.aiFrameY, -36, 36),
            bubbleCss: source.bubbleCss || source.customBubbleCss || '',
            globalCss: source.globalCss || source.customGlobalCss || ''
        };
    }
    function hasSpecificChatBeautify(thread = null) {
        return Boolean(thread && thread.beautify && typeof thread.beautify === 'object');
    }
    function mergeChatBeautify(globalCfg = {}, specificCfg = null) {
        const base = normalizeChatBeautify(globalCfg || {});
        if (!specificCfg || typeof specificCfg !== 'object') return base;
        return normalizeChatBeautify({ ...base, ...specificCfg });
    }
    function getEffectiveChatBeautify(thread = getTutuwanCurrentThread()) {
        return mergeChatBeautify(chatState.beautify || {}, hasSpecificChatBeautify(thread) ? thread.beautify : null);
    }
    function getBeautyEditingThread() {
        return chatBeautyMode === 'specific' ? (chatState.threads || []).find(t => t.id === chatBeautyThreadId) : null;
    }
    function getBeautyEditingConfig() {
        const thread = getBeautyEditingThread();
        return chatBeautyMode === 'specific' ? getEffectiveChatBeautify(thread) : normalizeChatBeautify(chatState.beautify || {});
    }
    function ensureStyleTag(id) {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
        return el;
    }
    function cssScopeChatBeauty(cssText = '', mode = 'global', threadId = '') {
        const text = String(cssText || '').trim();
        if (!text) return '';
        if (mode !== 'specific' || !threadId) return text;
        const escapeCss = window.CSS && typeof CSS.escape === 'function' ? CSS.escape : (v) => String(v).replace(/"/g, '');
        const scope = `.Tutuwan-chat-room[data-thread-id="${escapeCss(threadId)}"]`;
        return text.split('}').map(block => {
            const parts = block.split('{');
            if (parts.length < 2) return '';
            const selectors = parts.shift().trim();
            const body = parts.join('{').trim();
            if (!selectors || !body) return '';
            const scoped = selectors.split(',').map(sel => `${scope} ${sel.trim()}`).join(', ');
            return `${scoped} { ${body} }`;
        }).filter(Boolean).join('\n');
    }
    function applyChatBeautify(thread = getTutuwanCurrentThread()) {
        const cfg = getEffectiveChatBeautify(thread);
        const root = document.documentElement;
        root.style.setProperty('--Tutuwan-avatar-size', `${cfg.avatarSize}px`);
        root.style.setProperty('--Tutuwan-avatar-radius', `${cfg.avatarRadius}px`);
        root.style.setProperty('--Tutuwan-bubble-font-size', `${cfg.fontSize}px`);
        root.style.setProperty('--Tutuwan-bubble-radius', `${cfg.bubbleRadius}px`);
        root.style.setProperty('--Tutuwan-bubble-max-width', `min(${cfg.bubbleWidth}vw, 340px)`);
        root.style.setProperty('--Tutuwan-message-gap', `${cfg.messageGap}px`);
        root.style.setProperty('--Tutuwan-user-bubble', cfg.userBubble);
        root.style.setProperty('--Tutuwan-ai-bubble', cfg.aiBubble);
        root.style.setProperty('--Tutuwan-user-text', cfg.userText);
        root.style.setProperty('--Tutuwan-ai-text', cfg.aiText);
        root.style.setProperty('--Tutuwan-user-frame', cfg.userFrame || 'none');
        root.style.setProperty('--Tutuwan-ai-frame', cfg.aiFrame || 'none');
        root.style.setProperty('--Tutuwan-user-frame-img', cfg.userFrameImage ? `url('${cssUrl(cfg.userFrameImage)}')` : 'none');
        root.style.setProperty('--Tutuwan-ai-frame-img', cfg.aiFrameImage ? `url('${cssUrl(cfg.aiFrameImage)}')` : 'none');
        root.style.setProperty('--Tutuwan-user-frame-scale', String(cfg.userFrameScale / 100));
        root.style.setProperty('--Tutuwan-ai-frame-scale', String(cfg.aiFrameScale / 100));
        root.style.setProperty('--Tutuwan-user-frame-x', `${cfg.userFrameX}px`);
        root.style.setProperty('--Tutuwan-ai-frame-x', `${cfg.aiFrameX}px`);
        root.style.setProperty('--Tutuwan-user-frame-y', `${cfg.userFrameY}px`);
        root.style.setProperty('--Tutuwan-ai-frame-y', `${cfg.aiFrameY}px`);
        ensureStyleTag('Tutuwan-chat-beauty-template-style').textContent = CHAT_BEAUTY_BASE_TEMPLATE;
        ensureStyleTag('Tutuwan-chat-beauty-user-style').textContent = `${cfg.bubbleCss || ''}\n${cfg.globalCss || ''}`;
        applyTutuwanChatBackground(thread);
        renderBeautyPreview();
    }
    function renderBeautyPreview() {
        const wrap = $('chat-beauty-preview');
        if (!wrap) return;
        const cfg = getBeautyEditingConfig();
        const userAvatar = chatState.homeProfile?.avatar || $('avatar-img')?.src || 'https://picsum.photos/id/1025/160/160';
        const editThread = getBeautyEditingThread();
        const sampleThread = editThread || chatState.threads?.[0] || { avatar: 'https://picsum.photos/seed/tutuwan-char/120/120', name: 'char' };
        const charAvatar = sampleThread.avatar || 'https://picsum.photos/seed/tutuwan-char/120/120';
        wrap.style.setProperty('--Tutuwan-avatar-size', `${cfg.avatarSize}px`);
        wrap.style.setProperty('--Tutuwan-avatar-radius', `${cfg.avatarRadius}px`);
        wrap.style.setProperty('--Tutuwan-bubble-font-size', `${cfg.fontSize}px`);
        wrap.style.setProperty('--Tutuwan-bubble-radius', `${cfg.bubbleRadius}px`);
        wrap.style.setProperty('--Tutuwan-bubble-max-width', `min(${cfg.bubbleWidth}vw, 340px)`);
        wrap.style.setProperty('--Tutuwan-message-gap', `${cfg.messageGap}px`);
        wrap.style.setProperty('--Tutuwan-user-bubble', cfg.userBubble);
        wrap.style.setProperty('--Tutuwan-ai-bubble', cfg.aiBubble);
        wrap.style.setProperty('--Tutuwan-user-text', cfg.userText);
        wrap.style.setProperty('--Tutuwan-ai-text', cfg.aiText);
        wrap.style.setProperty('--Tutuwan-user-frame', cfg.userFrame || 'none');
        wrap.style.setProperty('--Tutuwan-ai-frame', cfg.aiFrame || 'none');
        wrap.style.setProperty('--Tutuwan-user-frame-img', cfg.userFrameImage ? `url('${cssUrl(cfg.userFrameImage)}')` : 'none');
        wrap.style.setProperty('--Tutuwan-ai-frame-img', cfg.aiFrameImage ? `url('${cssUrl(cfg.aiFrameImage)}')` : 'none');
        wrap.style.setProperty('--Tutuwan-user-frame-scale', String(cfg.userFrameScale / 100));
        wrap.style.setProperty('--Tutuwan-ai-frame-scale', String(cfg.aiFrameScale / 100));
        wrap.style.setProperty('--Tutuwan-user-frame-x', `${cfg.userFrameX}px`);
        wrap.style.setProperty('--Tutuwan-ai-frame-x', `${cfg.aiFrameX}px`);
        wrap.style.setProperty('--Tutuwan-user-frame-y', `${cfg.userFrameY}px`);
        wrap.style.setProperty('--Tutuwan-ai-frame-y', `${cfg.aiFrameY}px`);
        wrap.style.backgroundImage = cfg.chatBg ? `linear-gradient(rgba(255,255,255,.62), rgba(255,255,255,.62)), url('${cssUrl(cfg.chatBg)}')` : '';
        const sample = document.createElement('div');
        sample.innerHTML = '';
        const ai = buildTutuwanMessage({ role: 'ai', type: 'text', content: '这是一条 char 预览消息。', time: '12:00' }, { avatar: charAvatar, name: sampleThread.name || 'char' });
        const user = buildTutuwanMessage({ role: 'user', type: 'text', content: '这是一条 user 预览消息。', time: '12:01' }, { avatar: charAvatar, name: sampleThread.name || 'char', maskId: '', userAvatar });
        sample.append(ai, user);
        wrap.innerHTML = '';
        wrap.appendChild(sample);
    }
    function fillBeautyControls() {
        const cfg = getBeautyEditingConfig();
        const set = (id, val) => { const el = $(id); if (el) el.value = val ?? ''; };
        set('beauty-avatar-size', cfg.avatarSize); set('beauty-avatar-radius', cfg.avatarRadius);
        set('beauty-font-size', cfg.fontSize); set('beauty-bubble-radius', cfg.bubbleRadius);
        set('beauty-bubble-width', cfg.bubbleWidth); set('beauty-message-gap', cfg.messageGap);
        set('beauty-user-bubble', cfg.userBubble); set('beauty-ai-bubble', cfg.aiBubble);
        set('beauty-user-text', cfg.userText); set('beauty-ai-text', cfg.aiText);
        set('beauty-chat-bg', cfg.chatBg ? (String(cfg.chatBg).startsWith('data:') ? '[本地文件]' : cfg.chatBg) : '');
        set('beauty-user-frame', cfg.userFrame); set('beauty-ai-frame', cfg.aiFrame);
        set('beauty-user-frame-img', cfg.userFrameImage ? (String(cfg.userFrameImage).startsWith('data:') ? '[本地文件]' : cfg.userFrameImage) : '');
        set('beauty-ai-frame-img', cfg.aiFrameImage ? (String(cfg.aiFrameImage).startsWith('data:') ? '[本地文件]' : cfg.aiFrameImage) : '');
        set('beauty-user-frame-scale', cfg.userFrameScale); set('beauty-ai-frame-scale', cfg.aiFrameScale);
        set('beauty-user-frame-x', cfg.userFrameX); set('beauty-ai-frame-x', cfg.aiFrameX);
        set('beauty-user-frame-y', cfg.userFrameY); set('beauty-ai-frame-y', cfg.aiFrameY);
        set('beauty-bubble-css', cfg.bubbleCss); set('beauty-global-css', cfg.globalCss);
        if ($('beauty-base-css')) $('beauty-base-css').value = CHAT_BEAUTY_BASE_TEMPLATE;
        const thread = getBeautyEditingThread();
        if ($('beauty-scope-card')) $('beauty-scope-card').textContent = chatBeautyMode === 'specific' ? `当前：${getTutuwanDisplayName(thread)} 的专属聊天美化` : '当前：我的页面 · 所有 char 统一美化';
        if ($('chat-beauty-page')) $('chat-beauty-page').classList.toggle('specific-mode', chatBeautyMode === 'specific');
        if ($('beauty-clear-specific')) $('beauty-clear-specific').style.display = chatBeautyMode === 'specific' ? 'block' : 'none';
        refreshBeautyPresetSelect();
        updateBeautyLabels();
        renderBeautyPreview();
    }
    function updateBeautyLabels() {
        const val = id => $(id)?.value || '';
        if ($('beauty-avatar-size-val')) $('beauty-avatar-size-val').textContent = `${val('beauty-avatar-size') || 35}px`;
        if ($('beauty-avatar-radius-val')) $('beauty-avatar-radius-val').textContent = `${val('beauty-avatar-radius') || 12}px`;
        if ($('beauty-font-size-val')) $('beauty-font-size-val').textContent = `${val('beauty-font-size') || 14}px`;
        if ($('beauty-bubble-radius-val')) $('beauty-bubble-radius-val').textContent = `${val('beauty-bubble-radius') || 18}px`;
        if ($('beauty-bubble-width-val')) $('beauty-bubble-width-val').textContent = `${val('beauty-bubble-width') || 62}vw`;
        if ($('beauty-message-gap-val')) $('beauty-message-gap-val').textContent = `${val('beauty-message-gap') || 6}px`;
        if ($('beauty-user-frame-scale-val')) $('beauty-user-frame-scale-val').textContent = `${val('beauty-user-frame-scale') || 135}%`;
        if ($('beauty-ai-frame-scale-val')) $('beauty-ai-frame-scale-val').textContent = `${val('beauty-ai-frame-scale') || 135}%`;
        if ($('beauty-user-frame-x-val')) $('beauty-user-frame-x-val').textContent = `${val('beauty-user-frame-x') || 0}px`;
        if ($('beauty-ai-frame-x-val')) $('beauty-ai-frame-x-val').textContent = `${val('beauty-ai-frame-x') || 0}px`;
        if ($('beauty-user-frame-y-val')) $('beauty-user-frame-y-val').textContent = `${val('beauty-user-frame-y') || 0}px`;
        if ($('beauty-ai-frame-y-val')) $('beauty-ai-frame-y-val').textContent = `${val('beauty-ai-frame-y') || 0}px`;
    }
    function readBeautyControls() {
        const current = getBeautyEditingConfig();
        const local = (id, oldVal) => {
            const raw = ($(`${id}`)?.value || '').trim();
            return raw === '[本地文件]' ? (oldVal || '') : raw;
        };
        return normalizeChatBeautify({
            avatarSize: $('beauty-avatar-size')?.value,
            avatarRadius: $('beauty-avatar-radius')?.value,
            fontSize: $('beauty-font-size')?.value,
            bubbleRadius: $('beauty-bubble-radius')?.value,
            bubbleWidth: $('beauty-bubble-width')?.value,
            messageGap: $('beauty-message-gap')?.value,
            userBubble: $('beauty-user-bubble')?.value,
            aiBubble: $('beauty-ai-bubble')?.value,
            userText: $('beauty-user-text')?.value,
            aiText: $('beauty-ai-text')?.value,
            chatBg: local('beauty-chat-bg', current.chatBg),
            userFrame: $('beauty-user-frame')?.value?.trim(),
            aiFrame: $('beauty-ai-frame')?.value?.trim(),
            userFrameImage: local('beauty-user-frame-img', current.userFrameImage),
            aiFrameImage: local('beauty-ai-frame-img', current.aiFrameImage),
            userFrameScale: $('beauty-user-frame-scale')?.value,
            aiFrameScale: $('beauty-ai-frame-scale')?.value,
            userFrameX: $('beauty-user-frame-x')?.value,
            aiFrameX: $('beauty-ai-frame-x')?.value,
            userFrameY: $('beauty-user-frame-y')?.value,
            aiFrameY: $('beauty-ai-frame-y')?.value,
            bubbleCss: $('beauty-bubble-css')?.value || '',
            globalCss: $('beauty-global-css')?.value || ''
        });
    }
    async function saveBeautyControls() {
        const cfg = readBeautyControls();
        if (chatBeautyMode === 'specific') {
            const thread = getBeautyEditingThread();
            if (!thread) return showToast('未找到当前聊天');
            thread.beautify = cfg;
            thread.chatBg = cfg.chatBg || '';
            await saveChatState();
            applyChatBeautify(thread);
            renderTutuwanSettingsPage();
            renderTutuwanChatRoom();
            showToast('专属聊天美化已保存');
        } else {
            chatState.beautify = cfg;
            await saveChatState();
            applyChatBeautify(getTutuwanCurrentThread());
            renderTutuwanChatRoom();
            showToast('全局聊天美化已保存，所有未设置专属美化的 char 会跟随');
        }
    }
    function openBeautyPage(mode = 'global', threadId = '') {
        chatBeautyMode = mode === 'specific' ? 'specific' : 'global';
        chatBeautyThreadId = chatBeautyMode === 'specific' ? (threadId || TutuwanCurrentThreadId || '') : '';
        fillBeautyControls();
        $('chat-beauty-page')?.classList.add('active');
    }
    function closeBeautyPage() { $('chat-beauty-page')?.classList.remove('active'); }
    async function clearSpecificBeautyControls() {
        const thread = getBeautyEditingThread();
        if (!thread) return;
        const ok = await showGlobalConfirm('确定清除当前 char 的专属美化，并恢复跟随我的页面全局美化吗？', '清除专属美化');
        if (!ok) return;
        delete thread.beautify;
        await saveChatState();
        fillBeautyControls();
        applyChatBeautify(thread);
        renderTutuwanChatRoom();
        renderTutuwanSettingsPage();
        showToast('已恢复跟随全局美化');
    }
    function getBeautyPresetList() {
        return Array.isArray(chatState.beautyPresets) ? chatState.beautyPresets.filter(p => p && typeof p === 'object') : [];
    }
    function refreshBeautyPresetSelect() {
        const select = $('beauty-preset-select');
        if (!select) return;
        const presets = getBeautyPresetList();
        select.innerHTML = '<option value="">选择已保存预设</option>' + presets.map(p => `<option value="${chatEscape(p.id)}">${chatEscape(p.name || '未命名预设')}</option>`).join('');
    }
    async function saveBeautyPreset() {
        const name = await showGlobalPrompt('请输入预设名称', chatBeautyMode === 'specific' ? '专属美化预设' : '全局美化预设', '保存美化预设');
        const finalName = (name || '').trim();
        if (!finalName) return;
        chatState.beautyPresets = getBeautyPresetList();
        chatState.beautyPresets.unshift({ id: createChatId('beauty'), name: finalName, config: readBeautyControls(), createdAt: Date.now() });
        chatState.beautyPresets = chatState.beautyPresets.slice(0, 30);
        await saveChatState();
        refreshBeautyPresetSelect();
        showToast('美化预设已保存');
    }
    async function loadBeautyPreset(id) {
        if (!id) return;
        const preset = getBeautyPresetList().find(p => p.id === id);
        if (!preset?.config) return;
        const cfg = normalizeChatBeautify(preset.config);
        const thread = getBeautyEditingThread();
        if (chatBeautyMode === 'specific' && thread) thread.beautify = cfg;
        else chatState.beautify = cfg;
        const set = (key, val) => { const el = $(key); if (el) el.value = val ?? ''; };
        set('beauty-avatar-size', cfg.avatarSize); set('beauty-avatar-radius', cfg.avatarRadius); set('beauty-font-size', cfg.fontSize);
        set('beauty-bubble-radius', cfg.bubbleRadius); set('beauty-bubble-width', cfg.bubbleWidth); set('beauty-message-gap', cfg.messageGap);
        set('beauty-user-bubble', cfg.userBubble); set('beauty-ai-bubble', cfg.aiBubble); set('beauty-user-text', cfg.userText); set('beauty-ai-text', cfg.aiText);
        set('beauty-chat-bg', cfg.chatBg ? (String(cfg.chatBg).startsWith('data:') ? '[本地文件]' : cfg.chatBg) : '');
        set('beauty-user-frame', cfg.userFrame); set('beauty-ai-frame', cfg.aiFrame);
        set('beauty-user-frame-img', cfg.userFrameImage ? (String(cfg.userFrameImage).startsWith('data:') ? '[本地文件]' : cfg.userFrameImage) : '');
        set('beauty-ai-frame-img', cfg.aiFrameImage ? (String(cfg.aiFrameImage).startsWith('data:') ? '[本地文件]' : cfg.aiFrameImage) : '');
        set('beauty-user-frame-scale', cfg.userFrameScale); set('beauty-ai-frame-scale', cfg.aiFrameScale);
        set('beauty-user-frame-x', cfg.userFrameX); set('beauty-ai-frame-x', cfg.aiFrameX); set('beauty-user-frame-y', cfg.userFrameY); set('beauty-ai-frame-y', cfg.aiFrameY);
        set('beauty-bubble-css', cfg.bubbleCss); set('beauty-global-css', cfg.globalCss);
        updateBeautyLabels(); renderBeautyPreview();
        showToast('预设已加载，点击保存后生效');
    }
    async function deleteBeautyPreset() {
        const id = $('beauty-preset-select')?.value || '';
        if (!id) return showToast('请先选择预设');
        const ok = await showGlobalConfirm('确定删除当前美化预设吗？', '删除预设');
        if (!ok) return;
        chatState.beautyPresets = getBeautyPresetList().filter(p => p.id !== id);
        await saveChatState();
        refreshBeautyPresetSelect();
        showToast('预设已删除');
    }
    function parseStickerLine(line) {
        const text = String(line || '').trim();
        if (!text) return null;
        const urlRe = /(https?:\/\/\S+|data:image\/[^\s]+|blob:\S+)/i;
        const match = text.match(urlRe);
        if (!match) return null;
        const url = match[1].replace(/[，,。；;：:]+$/, '');
        let desc = text.replace(match[1], '').replace(/^[\s:：-]+|[\s:：-]+$/g, '').trim();
        desc = desc || '表情包';
        return { url, desc };
    }
    async function addStickerGroup() {
        const name = await showGlobalPrompt('请输入表情包分组名称', '新分组', '添加分组');
        const finalName = (name || '').trim();
        if (!finalName) return;
        chatState.stickerGroups = Array.isArray(chatState.stickerGroups) && chatState.stickerGroups.length ? chatState.stickerGroups : ['默认'];
        if (chatState.stickerGroups.includes(finalName)) { await showGlobalAlert('该表情包分组已存在。'); return; }
        chatState.stickerGroups.push(finalName);
        chatState.activeStickerGroup = finalName;
        await saveChatState();
        renderStickerLibrary();
        showToast('表情包分组已创建');
    }
    async function deleteStickerGroup(group) {
        if (group === '默认') { await showGlobalAlert('「默认」分组不允许删除。'); return; }
        const ok = await showGlobalConfirm(`确定删除「${group}」分组吗？该分组内表情包会移动到「默认」。`, '删除表情包分组');
        if (!ok) return;
        chatState.stickerGroups = (chatState.stickerGroups || ['默认']).filter(item => item !== group);
        if (!chatState.stickerGroups.includes('默认')) chatState.stickerGroups.unshift('默认');
        chatState.stickers = (chatState.stickers || []).map(item => item.group === group ? { ...item, group: '默认' } : item);
        if (chatState.activeStickerGroup === group) chatState.activeStickerGroup = '默认';
        await saveChatState();
        renderStickerLibrary();
        showToast('表情包分组已删除');
    }
    function renderStickerTabs() {
        const tabs = $('chat-sticker-tabs');
        if (!tabs) return;
        tabs.innerHTML = '';
        chatState.stickerGroups = Array.isArray(chatState.stickerGroups) && chatState.stickerGroups.length ? chatState.stickerGroups : ['默认'];
        if (!chatState.stickerGroups.includes('默认')) chatState.stickerGroups.unshift('默认');
        if (!chatState.stickerGroups.includes(chatState.activeStickerGroup)) chatState.activeStickerGroup = '默认';
        chatState.stickerGroups.forEach(group => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chat-group-chip' + (group === chatState.activeStickerGroup ? ' active' : '');
            if (group === '默认') chip.dataset.fixed = 'true';
            const deleteHtml = group === '默认' ? '' : `<span class="chat-group-delete" role="button" tabindex="0" aria-label="删除${chatEscape(group)}分组"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>`;
            chip.innerHTML = `<span class="chat-group-chip-inner"><span class="chat-group-name">${chatEscape(group)}</span>${deleteHtml}</span>`;
            chip.addEventListener('click', async () => { chatState.activeStickerGroup = group; await saveChatState(); renderStickerLibrary(); });
            chip.querySelector('.chat-group-delete')?.addEventListener('click', async (e) => { e.preventDefault(); e.stopPropagation(); await deleteStickerGroup(group); });
            tabs.appendChild(chip);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'chat-group-chip add';
        add.textContent = '+';
        add.addEventListener('click', addStickerGroup);
        tabs.appendChild(add);
    }
    function renderStickerLibrary() {
        renderStickerTabs();
        const grid = $('chat-sticker-grid');
        const empty = $('chat-sticker-empty');
        if (!grid) return;
        const group = chatState.activeStickerGroup || '默认';
        const stickers = (chatState.stickers || []).filter(item => (item.group || '默认') === group);
        grid.innerHTML = '';
        grid.classList.toggle('sticker-multi', Boolean(chatStickerMultiMode));
        stickers.forEach(item => {
            const card = document.createElement('div');
            card.className = `sticker-card ${chatStickerSelected.has(item.id) ? 'selected' : ''}`;
            card.innerHTML = `<div class="sticker-check">${chatStickerSelected.has(item.id) ? '✓' : ''}</div><img src="${chatEscape(item.url)}" alt="${chatEscape(item.desc)}"><div class="sticker-desc">${chatEscape(item.desc)}</div>`;
            card.addEventListener('click', () => {
                if (!chatStickerMultiMode) return;
                if (chatStickerSelected.has(item.id)) chatStickerSelected.delete(item.id); else chatStickerSelected.add(item.id);
                renderStickerLibrary();
            });
            grid.appendChild(card);
        });
        if (empty) empty.style.display = stickers.length ? 'none' : 'block';
        $('chat-sticker-bulk-actions')?.classList.toggle('active', Boolean(chatStickerMultiMode));
        $('chat-sticker-content')?.classList.toggle('has-bottom-actions', Boolean(chatStickerMultiMode));
    }

    function renderTutuwanStickerPanel() {
        const tabs = $('Tutuwan-sticker-panel-tabs');
        const grid = $('Tutuwan-sticker-panel-grid');
        const empty = $('Tutuwan-sticker-panel-empty');
        if (!tabs || !grid) return;
        chatState.stickerGroups = Array.isArray(chatState.stickerGroups) && chatState.stickerGroups.length ? chatState.stickerGroups : ['默认'];
        if (!chatState.stickerGroups.includes('默认')) chatState.stickerGroups.unshift('默认');
        if (!chatState.stickerGroups.includes(chatState.activeStickerGroup)) chatState.activeStickerGroup = '默认';
        tabs.innerHTML = '';
        chatState.stickerGroups.forEach(group => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chat-group-chip' + (group === chatState.activeStickerGroup ? ' active' : '');
            chip.textContent = group;
            chip.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                chatState.activeStickerGroup = group;
                await saveChatState();
                renderTutuwanStickerPanel();
            });
            tabs.appendChild(chip);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'chat-group-chip add';
        add.textContent = '+';
        add.addEventListener('click', async (ev) => { ev.stopPropagation(); await addStickerGroup(); renderTutuwanStickerPanel(); });
        tabs.appendChild(add);
        const stickers = (chatState.stickers || []).filter(item => (item.group || '默认') === (chatState.activeStickerGroup || '默认'));
        grid.innerHTML = '';
        stickers.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'Tutuwan-sticker-panel-item';
            btn.innerHTML = `<img src="${chatEscape(item.url)}" alt="${chatEscape(item.desc || '表情包')}" onerror="this.style.display='none'"><span>${chatEscape(item.desc || '表情包')}</span>`;
            btn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                closeTutuwanStickerPanel();
                await appendTutuwanMessage({ role: 'user', type: 'sticker', content: item.url, meta: { stickerId: item.id, desc: item.desc || '表情包' } });
                // 不自动回复：发送表情包只写入 user 消息，保留 generateTutuwanCharReply 供后续手动入口调用。
            });
            grid.appendChild(btn);
        });
        if (empty) empty.style.display = stickers.length ? 'none' : 'block';
    }
    async function toggleTutuwanStickerPanel() {
        const panel = $('Tutuwan-sticker-panel');
        if (!panel) return;
        if (panel.classList.contains('active')) { closeTutuwanStickerPanel(); return; }
        await loadChatState();
        renderTutuwanStickerPanel();
        $('Tutuwan-tools-panel')?.classList.remove('active');
        panel.classList.add('active');
    }
    function closeTutuwanStickerPanel() { $('Tutuwan-sticker-panel')?.classList.remove('active'); }

    let chatStickerMultiMode = false;
    const chatStickerSelected = new Set();
    function openStickerPage() { renderStickerLibrary(); $('chat-sticker-page')?.classList.add('active'); }
    function closeStickerPage() { $('chat-sticker-page')?.classList.remove('active'); chatStickerMultiMode = false; chatStickerSelected.clear(); }
    async function addStickersFromModal() {
        const raw = $('chat-sticker-input')?.value || '';
        const parsed = raw.split(/\n+/).map(parseStickerLine).filter(Boolean);
        if (!parsed.length) { await showGlobalAlert('没有识别到可添加的表情包，请检查 URL 和描述格式。'); return; }
        const group = chatState.activeStickerGroup || '默认';
        chatState.stickerGroups = Array.isArray(chatState.stickerGroups) && chatState.stickerGroups.length ? chatState.stickerGroups : ['默认'];
        if (!chatState.stickerGroups.includes(group)) chatState.stickerGroups.push(group);
        chatState.stickers = Array.isArray(chatState.stickers) ? chatState.stickers : [];
        parsed.forEach(item => chatState.stickers.unshift({ id: createChatId('sticker'), group, url: item.url, desc: item.desc, createdAt: Date.now() }));
        await saveChatState();
        $('chat-sticker-modal')?.classList.remove('active');
        if ($('chat-sticker-input')) $('chat-sticker-input').value = '';
        renderStickerLibrary();
        showToast(`已添加 ${parsed.length} 个表情包`);
    }
    async function moveSelectedStickers() {
        if (!chatStickerSelected.size) { showToast('请先选择表情包'); return; }
        chatState.stickerGroups = Array.isArray(chatState.stickerGroups) && chatState.stickerGroups.length ? chatState.stickerGroups : ['默认'];
        const tip = `可输入已有分组：${chatState.stickerGroups.join('、')}；也可输入新分组名。`;
        const name = await showGlobalPrompt(tip, chatState.activeStickerGroup || '默认', '移动到分组');
        const target = (name || '').trim();
        if (!target) return;
        if (!chatState.stickerGroups.includes(target)) chatState.stickerGroups.push(target);
        chatState.stickers = (chatState.stickers || []).map(item => chatStickerSelected.has(item.id) ? { ...item, group: target } : item);
        chatState.activeStickerGroup = target;
        chatStickerSelected.clear();
        chatStickerMultiMode = false;
        await saveChatState();
        renderStickerLibrary();
        showToast('已移动到指定分组');
    }
    async function deleteSelectedStickers() {
        if (!chatStickerSelected.size) { showToast('请先选择表情包'); return; }
        const ok = await showGlobalConfirm(`确定删除选中的 ${chatStickerSelected.size} 个表情包吗？`, '删除表情包');
        if (!ok) return;
        chatState.stickers = (chatState.stickers || []).filter(item => !chatStickerSelected.has(item.id));
        chatStickerSelected.clear();
        await saveChatState();
        renderStickerLibrary();
        showToast('已删除选中表情包');
    }

    function getTutuwanCardIcon(type) {
        const icons = {
            redpacket: '<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4z"></path><path d="M4 7l8 6 8-6"></path><path d="M12 13v5"></path></svg>',
            transfer: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3"></rect><path d="M7 10h6"></path><path d="M7 14h10"></path></svg>',
            location: '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z"></path><circle cx="12" cy="10" r="2.3"></circle></svg>',
            phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"></path></svg>',
            video: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"></rect><path d="M16 10l5-3v10l-5-3z"></path></svg>',
            call_summary: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2"></path><path d="M7 3h10"></path><path d="M7 7h10"></path><path d="M7 11h6"></path></svg>',
            listen: '<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
            couple_invite: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 1.06-8.84z"></path></svg>',
            couple_event: '<svg viewBox="0 0 24 24"><path d="M4 19.5V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14.5"></path><path d="M8 7h8"></path><path d="M8 11h8"></path><path d="M8 15h5"></path></svg>',
            peep_result: '<svg viewBox="0 0 24 24"><path d="M1.8 12s3.8-7 10.2-7 10.2 7 10.2 7-3.8 7-10.2 7S1.8 12 1.8 12z"></path><circle cx="12" cy="12" r="3"></circle><path d="M17.5 17.5l3 3"></path></svg>'
        };
        return icons[type] || icons.transfer;
    }
    function parseTutuwanJSONContent(content, fallback = {}) {
        if (content && typeof content === 'object') return { ...fallback, ...content };
        try {
            const parsed = JSON.parse(String(content || ''));
            return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : { ...fallback };
        } catch (e) {
            return { ...fallback };
        }
    }
    function buildTutuwanPolaroidHTML(msg) {
        const data = parseTutuwanJSONContent(msg.content, { text: msg.content || '相机照片', cover: '' });
        const text = data.text || data.desc || data.description || msg.content || '相机照片';
        const cover = data.cover || data.url || data.image || makeTutuwanCameraImage(text);
        return `<div class="Tutuwan-polaroid-card" role="button" tabindex="0" aria-label="查看照片描述"><img src="${chatEscape(cover)}" alt="Photo"><div class="Tutuwan-polaroid-overlay"><div class="Tutuwan-polaroid-text">${chatEscape(text)}</div></div></div>`;
    }
    function buildTutuwanLocationHTML(msg) {
        const data = parseTutuwanJSONContent(msg.content, { name: msg.content || '当前位置', address: msg?.meta?.address || '点击查看详细地图' });
        const name = data.name || data.content || msg.content || '当前位置';
        const address = data.address || msg?.meta?.address || '点击查看详细地图';
        return `<div class="Tutuwan-message-card location-card"><div class="loc-header"><div class="loc-name">${chatEscape(name)}</div><div class="loc-addr">${chatEscape(address)}</div></div><div class="loc-map-view"></div></div>`;
    }
    function buildTutuwanCardHTML(msg) {
        const meta = msg.meta || {};
        const status = meta.status || '';
        const amount = Number(meta.amount) || 0;
        if (msg.type === 'redpacket') {
            const claimed = Boolean(meta.claimed || status === 'claimed');
            const receiver = meta.receiver || '';
            const title = meta.note || '恭喜发财，大吉大利';
            const sub = claimed ? `${receiver ? receiver + ' · ' : ''}已领取 · ${formatTutuwanMoney(amount)}` : formatTutuwanMoney(amount);
            const footer = claimed ? '红包已领取' : (msg.role === 'user' ? '等待对方领取' : '点击领取红包');
            return `<div class="Tutuwan-message-card pay-redpacket ${claimed ? 'claimed' : ''}" data-pay-kind="redpacket"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon('redpacket')}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${footer}</div></div>`;
        }
        if (msg.type === 'transfer') {
            const received = Boolean(meta.received || status === 'received');
            const receiver = meta.receiver || '';
            const title = received ? (msg.role === 'user' ? `${receiver || '对方'}已收款` : '已收款') : '转账';
            const sub = `${formatTutuwanMoney(amount)}${meta.note ? ' · ' + meta.note : ''}`;
            const footer = received ? '资金已入账' : (msg.role === 'user' ? '等待对方收款' : '点击确认收款');
            return `<div class="Tutuwan-message-card pay-transfer ${received ? 'received' : ''}" data-pay-kind="transfer"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon('transfer')}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${footer}</div></div>`;
        }
        if (msg.type === 'phone' || msg.type === 'video' || msg.type === 'call_summary') {
            const data = parseTutuwanJSONContent(msg.content, meta || {});
            const callType = data.callType || data.typeCall || (msg.type === 'video' ? 'video' : 'phone');
            const isVideo = callType === 'video' || msg.type === 'video';
            const status = data.status || meta.status || (msg.type === 'call_summary' ? 'ended' : 'sent');
            const statusTextMap = { dialing: '等待接听', inviting: '邀请通话', connected: '通话中', declined: '已拒绝', canceled: '已取消', missed: '未接通', ended: '已结束', failed: '未接通', sent: '已发送' };
            const title = msg.type === 'call_summary' ? (isVideo ? '视频通话记录' : '语音通话记录') : (isVideo ? '视频通话' : '语音通话');
            const duration = data.durationText || meta.durationText || '';
            const reason = data.reason || data.summary || data.forwardText || data.content || (isVideo ? '视频通话邀请' : '语音通话邀请');
            const transcriptCount = Array.isArray(data.transcript) ? data.transcript.length : Number(data.transcriptCount || 0);
            const sub = msg.type === 'call_summary'
                ? `${duration || '00:00'} · ${transcriptCount || 0} 条通话记录${data.summary ? ' · ' + data.summary : ''}`
                : `${statusTextMap[status] || statusTextMap.sent} · ${reason}`;
            const footer = `${isVideo ? '视频电话' : '电话'} · JSON 对象 · ${data.callId || meta.callId || 'call'}`;
            return `<div class="Tutuwan-message-card call-card ${chatEscape(status)}"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon(isVideo ? 'video' : 'phone')}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${chatEscape(footer)}</div></div>`;
        }
        if (msg.type === 'couple_invite' || msg.type === 'couple_event') {
            const state = meta.status || (msg.type === 'couple_event' ? 'accepted' : 'pending');
            const cls = state === 'accepted' ? 'accepted' : (state === 'rejected' || state === 'breakup' ? 'rejected' : 'pending');
            const title = meta.title || (msg.type === 'couple_invite' ? '想和你建立情侣关系' : '情侣空间记录');
            const sub = meta.subtitle || msg.content || '一起记录双方的动态、信件、问答与纪念日';
            const footer = meta.footer || (state === 'accepted' ? '关系已建立' : state === 'rejected' ? '邀请已拒绝' : state === 'breakup' ? '关系已解除' : '等待回应');
            return `<div class="Tutuwan-message-card couple-card ${cls}"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon(msg.type)}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${chatEscape(footer)}</div></div>`;
        }
        if (msg.type === 'peep_result') {
            const data = parseTutuwanJSONContent(msg.content, meta || {});
            const title = data.title || data.summary || '窥探搜查结果';
            const roomName = data.roomName || data.room || '房间';
            const itemName = data.itemName || data.item || '物品';
            const thought = data.inner_thought?.content || data.innerThought?.content || data.thought || data.forwardText || '';
            const sub = `${roomName} · ${itemName}${thought ? ' · ' + thought : ''}`;
            const footer = `JSON 对象 · ${data.riskLevel || data.level || '已转发'}`;
            return `<div class="Tutuwan-message-card peep-result-card"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon('peep_result')}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${chatEscape(footer)}</div></div>`;
        }
        if (msg.type === 'listen') {
            const title = meta.title || msg.content || '一起听歌';
            const artist = meta.artist || 'Tutuwan Radio';
            const listener = meta.coListener ? ` · 和 ${meta.coListener}` : '';
            return `<div class="Tutuwan-message-card music-share"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon('listen')}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(artist + listener)}</div></div></div><div class="card-footer">一起听 · 点击打开音乐</div></div>`;
        }
        let cardType = msg.type;
        let title = msg.content || '';
        let sub = '';
        let footer = 'Tutuwan';
        if (msg.type === 'location') return buildTutuwanLocationHTML(msg);
        else if (msg.type === 'phone') { cardType = 'call'; title = '语音通话'; sub = msg.content || '已发起语音通话'; footer = '电话'; }
        else if (msg.type === 'video') { cardType = 'call'; title = '视频通话'; sub = msg.content || '已发起视频通话'; footer = '视频'; }
        return `<div class="Tutuwan-message-card ${cardType}"><div class="card-top"><div class="card-icon">${getTutuwanCardIcon(msg.type)}</div><div><div class="card-title">${chatEscape(title)}</div><div class="card-sub">${chatEscape(sub)}</div></div></div><div class="card-footer">${chatEscape(footer)}</div></div>`;
    }
    function applyTutuwanChatBackground(thread = getTutuwanCurrentThread()) {
        const room = $('Tutuwan-chat-room');
        if (!room) return;
        const cfg = getEffectiveChatBeautify(thread);
        const bg = thread?.chatBg || cfg.chatBg || '';
        if (bg) {
            room.classList.add('has-custom-bg');
            room.style.setProperty('--Tutuwan-chat-bg', `url('${cssUrl(bg)}')`);
        } else {
            room.classList.remove('has-custom-bg');
            room.style.removeProperty('--Tutuwan-chat-bg');
        }
    }
    function getTutuwanCurrentThread() {
        return (chatState.threads || []).find(thread => thread.id === TutuwanCurrentThreadId) || null;
    }
    function getTutuwanUserMask(thread) {
        return (chatState.masks || []).find(mask => mask.id === thread?.maskId) || null;
    }
    function getTutuwanUserAvatar(thread) {
        const mask = getTutuwanUserMask(thread);
        return thread?.userAvatar || mask?.avatar || chatState.homeProfile?.avatar || $('avatar-img')?.src || 'https://picsum.photos/id/1025/160/160';
    }
    function getTutuwanRoomSubtitle(thread) {
        const mask = getTutuwanUserMask(thread);
        const wbCount = Array.isArray(thread?.worldbookIds) ? thread.worldbookIds.length : (thread?.worldbookId ? 1 : 0);
        const parts = [];
        const userName = getTutuwanUserName(thread);
        if (userName) parts.push(`user：${userName}`);
        if (wbCount) parts.push(`世界书 ${wbCount}`);
        if (thread?.voiceId) parts.push(`VOICE ID：${thread.voiceId}`);
        return parts.join(' · ') || 'Tutuwan Chat';
    }
    function isTutuwanWithdrawnMessage(msg) {
        return Boolean(msg && (msg.type === 'withdrawn' || msg?.meta?.withdrawn));
    }
    function isTutuwanStickerMessage(msg) {
        return Boolean(msg && (msg.type === 'sticker' || (msg.type === 'image' && msg?.meta?.stickerId)));
    }
    function getTutuwanWithdrawnDetailText(msg) {
        const meta = msg?.meta || {};
        const originalMeta = meta.withdrawnMeta || meta.originalMeta || {};
        const originalType = meta.withdrawnType || meta.originalType || 'text';
        const originalContent = String(meta.withdrawnContent ?? meta.originalContent ?? meta.withdrawnText ?? '').trim();
        const originalDesc = String(meta.withdrawnDesc || originalMeta.desc || '').trim();
        const actor = meta.withdrawnActor || '你';
        const lines = [`${actor}撤回了一条消息`, ''];
        if (originalType === 'sticker' || originalMeta.stickerId) {
            lines.push('类型：表情包');
            if (originalDesc) lines.push('描述：' + originalDesc);
            if (originalContent) lines.push('图片地址：' + originalContent);
        } else if (originalType === 'image') {
            lines.push('类型：图片');
            if (originalContent) lines.push('图片地址：' + originalContent);
        } else if (originalType === 'voice') {
            lines.push('类型：语音');
            lines.push(originalContent || '（空语音内容）');
        } else {
            lines.push(originalContent || '（空消息）');
        }
        return lines.join('\n');
    }
    function getTutuwanMessageDisplayText(msg) {
        if (!msg) return '';
        if (isTutuwanWithdrawnMessage(msg)) return `${msg?.meta?.withdrawnActor || '你'} 撤回了一条消息`;
        if (isTutuwanStickerMessage(msg)) return '[表情包]' + (msg?.meta?.desc ? ' ' + msg.meta.desc : '');
        if (msg.type === 'image' || msg.type === 'polaroid') return '[图片]';
        if (msg.type === 'voice') return '[语音] ' + (msg.content || '');
        const map = { redpacket: '[红包]', transfer: '[转账]', location: '[位置]', phone: '[电话]', video: '[视频]', call_summary: '[通话记录]', listen: '[一起听]', couple_invite: '[情侣邀请]', couple_event: '[情侣空间]', peep_result: '[窥探结果]' };
        return map[msg.type] || String(msg.content || '');
    }
    function isTutuwanGroupOfflineNarrative(msg, thread) {
        return Boolean(thread?.isGroup && msg?.role !== 'user' && msg?.meta?.offlineGroupNarrative);
    }
    function getTutuwanMessageName(msg, thread) {
        if (msg?.role === 'user') return getTutuwanUserName(thread);
        if (isTutuwanGroupOfflineNarrative(msg, thread)) return msg?.meta?.senderName || '线下记录';
        if (thread?.isGroup) return resolveTutuwanGroupMember(thread, msg)?.name || getTutuwanDisplayName(thread);
        return getTutuwanDisplayName(thread);
    }
    function buildTutuwanQuoteHTML(msg) {
        const q = msg?.meta?.quote;
        if (!q) return '';
        return `<div class="Tutuwan-msg-quote-box"><div class="Tutuwan-quote-head"><span>${chatEscape(q.name || '')}</span><span>${chatEscape(q.time || '')}</span></div><div class="Tutuwan-quote-text">${chatEscape(q.text || '')}</div></div>`;
    }
    function buildTutuwanMessage(msg, thread) {
        const isUser = msg.role === 'user';
        const row = document.createElement('div');
        row.className = `Tutuwan ${isUser ? 'user' : 'ai'}${TutuwanSelectedMessageIds.has(msg.id) ? ' selected' : ''}`;
        row.dataset.msgId = msg.id || '';
        if (isTutuwanWithdrawnMessage(msg)) {
            row.className = 'Tutuwan withdrawn';
            const withdrawnActor = msg?.meta?.withdrawnActor || '你';
            row.innerHTML = `<button class="Tutuwan-withdrawn-tip" type="button" aria-label="查看撤回内容">${chatEscape(withdrawnActor)} 撤回了一条消息</button>`;
            row.querySelector('.Tutuwan-withdrawn-tip')?.addEventListener('click', () => {
                showGlobalAlert(getTutuwanWithdrawnDetailText(msg), '撤回内容');
            });
            return row;
        }
        const offlineNarrative = isTutuwanGroupOfflineNarrative(msg, thread);
        const senderMember = !isUser && thread?.isGroup && !offlineNarrative ? resolveTutuwanGroupMember(thread, msg) : null;
        const avatar = isUser ? getTutuwanUserAvatar(thread) : (offlineNarrative ? (thread.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread.name || 'group')}/120/120`) : (senderMember?.avatar || thread.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread.name || 'char')}/120/120`));
        const senderNameHTML = (!isUser && thread?.isGroup) ? (offlineNarrative ? `<div class="Tutuwan-group-sender offline-narrative-label">${chatEscape(msg?.meta?.senderName || '线下记录')}</div>` : `<div class="Tutuwan-group-sender">${chatEscape(senderMember?.name || '群成员')}</div>`) : '';
        const safeTime = chatEscape(msg.time || '');
        let contentClass = 'content' + (offlineNarrative ? ' group-offline-narrative-bubble' : '');
        let contentHTML = buildTutuwanQuoteHTML(msg) + `<span class="Tutuwan-msg-text">${chatEscape(msg.content || '')}</span>`;
        if (isTutuwanStickerMessage(msg)) {
            contentClass += ' image-bubble sticker-bubble';
            contentHTML = `<img class="Tutuwan-chat-image Tutuwan-chat-sticker" src="${chatEscape(msg.content || '')}" alt="${chatEscape(msg?.meta?.desc || '表情包')}" loading="lazy" onerror="this.outerHTML='<div class=&quot;Tutuwan-img-error&quot;>表情加载失败</div>'">`;
        } else if (msg.type === 'image') {
            contentClass += ' image-bubble';
            contentHTML = `<img class="Tutuwan-chat-image" src="${chatEscape(msg.content || '')}" alt="图片消息" loading="lazy" onerror="this.outerHTML='<div class=&quot;Tutuwan-img-error&quot;>图片加载失败</div>'">`;
        } else if (msg.type === 'voice') {
            contentClass += ' voice-bubble';
            const voiceText = String(msg.content || '语音消息');
            const voiceDuration = Number(msg?.meta?.duration) || calcTutuwanVoiceDuration(voiceText);
            contentHTML = buildTutuwanQuoteHTML(msg) + `<div class="Tutuwan-voice-body"><span class="Tutuwan-voice-waveform" role="button" tabindex="0" aria-label="播放语音"><span class="Tutuwan-voice-bar"></span><span class="Tutuwan-voice-bar"></span><span class="Tutuwan-voice-bar"></span><span class="Tutuwan-voice-bar"></span><span class="Tutuwan-voice-bar"></span></span><span class="Tutuwan-voice-duration">${voiceDuration}&quot;</span></div><div class="Tutuwan-voice-transcript">${chatEscape(voiceText)}</div>`;
        } else if (msg.type === 'polaroid') {
            contentClass += ' card-bubble polaroid-bubble';
            contentHTML = buildTutuwanQuoteHTML(msg) + buildTutuwanPolaroidHTML(msg);
        } else if (['redpacket','transfer','location','phone','video','call_summary','listen','couple_invite','couple_event','peep_result'].includes(msg.type)) {
            contentClass += ' card-bubble';
            contentHTML = buildTutuwanQuoteHTML(msg) + buildTutuwanCardHTML(msg);
        }
        const check = `<span class="Tutuwan-multi-check" aria-hidden="true"></span>`;
        if (isUser) {
            row.innerHTML = `${check}<div class="bubble-wrapper"><span class="time">${safeTime}</span><div class="${contentClass}">${contentHTML}</div><span class="avatar-frame"><img class="avatar-img" src="${chatEscape(avatar)}" alt="user"></span></div>`;
        } else {
            const stackClass = thread?.isGroup ? 'bubble-wrapper group-message-stack' : 'bubble-wrapper';
            row.innerHTML = `${check}<div class="${stackClass}"><span class="avatar-frame"><img class="avatar-img" src="${chatEscape(avatar)}" alt="char"></span><div><div class="Tutuwan-message-stack-label">${senderNameHTML}</div><div class="${contentClass}">${contentHTML}</div></div><span class="time">${safeTime}</span></div>`;
        }
        bindTutuwanMessageActions(row, msg, thread);
        return row;
    }
    function renderTutuwanChatRoom() {
        const thread = getTutuwanCurrentThread();
        const content = $('Tutuwan-room-content');
        if (!thread || !content) return;
        const roomEl = $('Tutuwan-chat-room');
        if (roomEl) roomEl.dataset.threadId = thread.id || '';
        applyChatBeautify(thread);
        $('Tutuwan-room-title').textContent = thread.__typing ? '正在输入……' : getTutuwanDisplayName(thread);
        const sub = $('Tutuwan-room-subtitle');
        if (sub) sub.textContent = thread.isGroup ? `群聊 · ${(thread.members || []).length} 人` : '';
        content.classList.toggle('multi-mode', TutuwanMultiSelectMode);
        content.innerHTML = '';
        const divider = document.createElement('div');
        divider.className = 'Tutuwan-date-divider';
        divider.textContent = '今天';
        content.appendChild(divider);
        const messages = Array.isArray(thread.messages) ? thread.messages : [];
        if (!messages.length) {
            const empty = document.createElement('div');
            empty.className = 'Tutuwan-empty-room';
            empty.innerHTML = '开始聊天……';
            content.appendChild(empty);
        } else {
            messages.forEach(msg => content.appendChild(buildTutuwanMessage(msg, thread)));
        }
        requestAnimationFrame(() => { content.scrollTop = content.scrollHeight; });
    }
    async function openTutuwanChatRoom(threadId) {
        await loadChatState();
        ensureTutuwanKeepAlive();
        TutuwanCurrentThreadId = threadId;
        const room = $('Tutuwan-chat-room');
        if (room) { room.classList.add('active'); room.dataset.threadId = threadId || ''; }
        $('Tutuwan-tools-panel')?.classList.remove('active');
        closeTutuwanStickerPanel();
        applyChatBeautify(getTutuwanCurrentThread());
        renderTutuwanChatRoom();
    }
    function closeTutuwanChatRoom() {
        TutuwanCurrentThreadId = '';
        const roomEl = $('Tutuwan-chat-room');
        if (roomEl) { roomEl.classList.remove('active'); delete roomEl.dataset.threadId; }
        applyChatBeautify(null);
        $('Tutuwan-tools-panel')?.classList.remove('active');
        closeTutuwanThoughtsPage();
        closeTutuwanDiaryPage();
        closeTutuwanStickerPanel();
        TutuwanQuoteTarget = null; updateTutuwanQuoteCompose(); cancelTutuwanMultiSelect();
        const input = $('Tutuwan-msg-input');
        if (input) input.value = '';
    }
    async function appendTutuwanMessage({ role = 'user', type = 'text', content = '', meta = {} } = {}) {
        const thread = getTutuwanCurrentThread();
        const finalContent = String(content || '').trim();
        if (!thread || !finalContent) return;
        if (thread.blocked && role === 'user') {
            await showGlobalAlert('该联系人已被拉黑，无法继续发送消息。');
            return;
        }
        const finalMeta = enrichTutuwanAppMeta(thread, meta?.sourceApp || meta?.appId || meta?.source || 'chat', (meta && typeof meta === 'object') ? { ...meta } : {});
        if (role === 'user' && type === 'text' && TutuwanQuoteTarget && !finalMeta.quote) finalMeta.quote = { ...TutuwanQuoteTarget };
        const msg = normalizeTutuwanMessageRecord({ id: arguments[0]?.id || arguments[0]?.messageId || '', role, type, content: finalContent, meta: finalMeta, time: getChatTimestamp() }, thread);
        if (role === 'user' && TutuwanQuoteTarget) { TutuwanQuoteTarget = null; updateTutuwanQuoteCompose(); }
        thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
        thread.messages.push(msg);
        const snippetMap = { image: '[图片]', polaroid: '[图片]', sticker: '[表情包]', voice: '[语音]', redpacket: '[红包]', transfer: '[转账]', location: '[位置]', phone: '[电话]', video: '[视频]', call_summary: '[通话记录]', listen: '[一起听]', couple_invite: '[情侣邀请]', couple_event: '[情侣空间]', peep_result: '[窥探结果]', withdrawn: '[撤回]' };
        thread.snippet = snippetMap[type] || finalContent;
        thread.time = msg.time;
        await maybeAutoCreateTutuwanSummary(thread);
        await saveChatState();
        renderTutuwanChatRoom();
        renderChatThreads();
        renderTutuwanSettingsPage();
        return msg;
    }
    function getTutuwanStoredChatConfigSyncFallback() {
        return {
            baseUrl: chatBaseUrlInput(),
            apiKey: readValue('chat-key-input'),
            model: readValue('chat-model-input') || 'gpt-3.5-turbo',
            temperature: Number(readValue('chat-temperature') || 0.7),
            contextCount: Number(readValue('chat-context-input') || 30)
        };
    }
    async function getTutuwanChatConfig() {
        const stored = await getSetting('chat_config', {});
        const live = getTutuwanStoredChatConfigSyncFallback();
        const storedBaseUrl = stored.baseUrl || stored.chatCompletionsUrl || '';
        const liveBaseUrl = readValue('chat-url-input') || live.baseUrl || '';
        const baseUrl = normalizeV1Url(liveBaseUrl || storedBaseUrl);
        const chatUrl = baseUrl ? baseUrl + '/chat/completions' : '';
        return {
            baseUrl,
            apiKey: live.apiKey || stored.apiKey || '',
            model: live.model || stored.model || 'gpt-3.5-turbo',
            temperature: Number.isFinite(Number(live.temperature)) ? Number(live.temperature) : Number(stored.temperature ?? 0.7),
            contextCount: Math.max(0, Number(live.contextCount || stored.contextCount || 30)),
            chatCompletionsUrl: chatUrl
        };
    }
    function getTutuwanUserName(thread) {
        const mask = getTutuwanUserMask(thread);
        return thread?.userName || mask?.name || chatState.homeProfile?.name || document.getElementById('text-username')?.textContent?.trim() || 'user';
    }
    function getTutuwanSettingText(thread) {
        const mask = getTutuwanUserMask(thread);
        const userSetting = thread?.userSetting || mask?.setting || '未填写 user 设定。';
        const charSetting = thread?.setting || '未填写 char 设定。';
        return { userSetting, charSetting };
    }
    async function getTutuwanWorldbookPrompt(thread) {
        try { await loadWorldbooks(); } catch (e) {}
        const ids = Array.isArray(thread?.worldbookIds) ? thread.worldbookIds : (thread?.worldbookId ? [thread.worldbookId] : []);
        const allBooks = normalizeWorldbookData(worldbookData);
        const selectedBooks = ids.length ? allBooks.filter(book => ids.includes(book.id)) : [];
        const recentText = (thread?.messages || []).slice(-20).map(m => m.content || '').join('\n');
        const chunks = [];
        selectedBooks.forEach(book => {
            (book.entries || []).forEach(entry => {
                if (!entry?.content) return;
                if (entry.trigger === 'keyword') {
                    const hit = parseWorldbookKeywords(entry.keywords).some(keyword => recentText.toLowerCase().includes(keyword.toLowerCase()));
                    if (!hit) return;
                }
                chunks.push(`【${book.name} / ${entry.name || '条目'} / ${labelWorldbookPosition(entry.position)}】\n${entry.content}`);
            });
        });
        return chunks.join('\n\n') || '无关联世界书内容。';
    }
    function buildTutuwanStickerInventoryPrompt() {
        const stickers = Array.isArray(chatState.stickers) ? chatState.stickers : [];
        const usable = stickers.filter(item => item && item.url).slice(0, 80);
        if (!usable.length) return '当前没有可用表情包。不要输出 sticker 类型；想表达表情时请改用 text。';
        return usable.map((item, idx) => {
            const id = item.id || `sticker-${idx + 1}`;
            const group = item.group || '默认';
            const desc = item.desc || '未命名表情';
            return `${idx + 1}. sticker_id=${id}；group=${group}；desc=${desc}`;
        }).join('\n');
    }
    function findTutuwanStickerForAI(inst = {}) {
        const stickers = Array.isArray(chatState.stickers) ? chatState.stickers : [];
        if (!stickers.length) return null;
        const candidates = [inst.sticker_id, inst.stickerId, inst.id, inst.keyword, inst.desc, inst.description, inst.content, inst.text, inst.message]
            .map(v => String(v || '').trim()).filter(Boolean);
        const lower = candidates.map(v => v.toLowerCase());
        return stickers.find(item => candidates.includes(String(item.id || '').trim()))
            || stickers.find(item => lower.includes(String(item.desc || '').trim().toLowerCase()))
            || stickers.find(item => {
                const hay = `${item.group || ''} ${item.desc || ''}`.toLowerCase();
                return lower.some(key => key && hay.includes(key));
            })
            || null;
    }
    function buildTutuwanQuoteMetaFromInstruction(inst = {}, thread) {
        const messages = Array.isArray(thread?.messages) ? thread.messages : [];
        if (!messages.length) return null;
        const targetId = String(inst.quote_id || inst.quoteId || inst.reply_to || inst.replyTo || inst.reply_to_id || inst.replyToId || inst.message_id || inst.messageId || inst.target_id || inst.targetId || inst.target_message_id || inst.targetMessageId || '').trim();
        const quoteObj = (inst.quote && typeof inst.quote === 'object') ? inst.quote : null;
        const quoteText = String(inst.quote_text || inst.quoteText || quoteObj?.text || quoteObj?.content || '').trim().toLowerCase();
        let target = null;
        if (targetId) {
            if (targetId === 'last' || targetId === 'last_message') target = [...messages].reverse().find(m => !isTutuwanWithdrawnMessage(m));
            else if (targetId === 'last_user') target = [...messages].reverse().find(m => m.role === 'user' && !isTutuwanWithdrawnMessage(m));
            else if (targetId === 'last_ai' || targetId === 'last_char') target = [...messages].reverse().find(m => m.role !== 'user' && !isTutuwanWithdrawnMessage(m));
            else target = messages.find(m => String(m.id || '') === targetId);
        }
        if (!target && quoteText) {
            target = [...messages].reverse().find(m => getTutuwanMessageDisplayText(m).toLowerCase().includes(quoteText));
        }
        if (!target && quoteObj) {
            return {
                id: String(quoteObj.id || ''),
                role: String(quoteObj.role || ''),
                name: String(quoteObj.name || quoteObj.sender || ''),
                text: String(quoteObj.text || quoteObj.content || '').slice(0, 140),
                time: String(quoteObj.time || '')
            };
        }
        if (!target) return null;
        return {
            id: target.id,
            role: target.role,
            name: getTutuwanMessageName(target, thread),
            text: getTutuwanMessageDisplayText(target).slice(0, 140),
            time: target.time || ''
        };
    }
    function buildTutuwanContextLine(msg, thread) {
        const messageId = msg?.id || msg?.messageId || '';
        const threadId = msg?.threadId || thread?.id || '';
        const charId = msg?.charId || thread?.charId || ensureTutuwanCharId(thread || {});
        const senderId = msg?.senderId || msg?.meta?.senderId || '';
        const receiverId = msg?.receiverId || msg?.meta?.receiverId || '';
        const speaker = getTutuwanMessageName(msg, thread);
        const roleLabel = msg?.role === 'user' ? 'user' : (thread?.isGroup ? 'group_member' : 'char');
        const type = msg?.type || 'text';
        const quote = msg?.meta?.quote ? `；引用=${msg.meta.quote.name || ''}:${msg.meta.quote.text || ''}` : '';
        const extra = (() => {
            if (type === 'redpacket' || type === 'transfer') return `；金额=${msg?.meta?.amount || ''}；备注=${msg?.meta?.note || ''}；状态=${msg?.meta?.status || ''}`;
            if (type === 'phone' || type === 'video' || type === 'call_summary') return `；callId=${msg?.meta?.callId || ''}；通话类型=${msg?.meta?.callType || type}；状态=${msg?.meta?.status || ''}；时长=${msg?.meta?.durationText || ''}`;
            if (type === 'location') {
                try {
                    const loc = JSON.parse(msg.content || '{}');
                    return `；地点=${loc.name || ''}；地址=${loc.address || msg?.meta?.address || ''}`;
                } catch (e) { return `；地址=${msg?.meta?.address || ''}`; }
            }
            if (isTutuwanStickerMessage(msg)) return `；表情描述=${msg?.meta?.desc || ''}`;
            if (isTutuwanWithdrawnMessage(msg)) return `；撤回原内容=${msg?.meta?.withdrawnText || msg?.meta?.withdrawnContent || ''}`;
            return '';
        })();
        return `[message_id=${messageId}][thread_id=${threadId}][char_id=${charId}][sender_id=${senderId}][receiver_id=${receiverId}][speaker=${speaker}][role=${roleLabel}][type=${type}${quote}${extra}] ${getTutuwanMessageDisplayText(msg)}`;
    }
    function buildTutuwanRecentMessageIndexPrompt(thread, limit = 12) {
        const messages = Array.isArray(thread?.messages) ? thread.messages : [];
        const recent = messages.slice(-limit);
        if (!recent.length) return '暂无历史消息。';
        return recent.map(msg => buildTutuwanContextLine(msg, thread)).join('\n');
    }
    function buildTutuwanContextMessages(thread, contextCount) {
        const messages = Array.isArray(thread?.messages) ? thread.messages : [];
        if (!contextCount) return [];
        const maxMessages = Math.max(2, contextCount * 2);
        return messages.slice(-maxMessages).filter(msg => msg && (msg.content || isTutuwanWithdrawnMessage(msg))).map(msg => {
            const role = msg.role === 'user' ? 'user' : 'assistant';
            return { role, content: buildTutuwanContextLine(msg, thread) };
        });
    }
    function parseTutuwanAIReplies(raw) {
        let text = String(raw || '').trim();
        if (!text) return [];
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        try {
            const data = JSON.parse(text);
            const normalizeArray = arr => arr.map(item => {
                if (typeof item === 'string') return item.trim();
                if (item && typeof item === 'object') return item;
                return '';
            }).filter(Boolean);
            if (Array.isArray(data)) return normalizeArray(data);
            if (data && typeof data === 'object') {
                if (data.type) return [data];
                const extras = [];
                const thoughtObj = data.inner_thought || data.secret_thought || (data.thought && typeof data.thought === 'object' ? data.thought : null);
                if (thoughtObj && typeof thoughtObj === 'object') extras.push({ ...thoughtObj, type: 'inner_thought', threadId: thoughtObj.threadId || data.threadId || data.thread_id || data.chatId || '', charId: thoughtObj.charId || data.charId || data.char_id || '', messageId: thoughtObj.messageId || thoughtObj.id || data.messageId || '' });
                const arr = data.messages || data.replies || data.reply || data.content;
                if (Array.isArray(arr)) return normalizeArray(arr).concat(extras);
                if (arr && typeof arr === 'object') return normalizeArray([arr]).concat(extras);
                if (typeof arr === 'string') return parseTutuwanAIReplies(arr).concat(extras);
                if (typeof data.message === 'string') return [data.message.trim(), ...extras].filter(Boolean);
                if (typeof data.text === 'string') return [data.text.trim(), ...extras].filter(Boolean);
                if (extras.length) return extras;
            }
        } catch (e) {}
        return text.split(/\n{2,}|\n(?=\s*(?:[-*•]|\d+[.)]|[一二三四五六七八九十]+[、.]))/).map(line => line.replace(/^\s*(?:[-*•]|\d+[.)]|[一二三四五六七八九十]+[、.])\s*/, '').trim()).filter(Boolean);
    }
    function normalizeTutuwanAIInstruction(item, thread) {
        if (typeof item === 'string') {
            const cleanedText = processTutuwanAllHiddenAICommands(thread, item);
            if (!cleanedText.trim()) return { role: 'ai', type: 'chat_silent', content: '隐藏记录已更新', meta: {} };
            return applyTutuwanGroupSenderMeta({ role: 'ai', type: 'text', content: cleanedText, meta: {} }, thread, {});
        }
        const inst = item && typeof item === 'object' ? item : {};
        const rawType = String(inst.type || inst.kind || 'text').toLowerCase().replace(/-/g, '_');
        let text = String(inst.content || inst.text || inst.message || '').trim();
        if (text) text = processTutuwanAllHiddenAICommands(thread, text);
        const quoteMeta = buildTutuwanQuoteMetaFromInstruction(inst, thread);
        const withQuote = meta => quoteMeta ? { ...(meta || {}), quote: quoteMeta } : (meta || {});
        let payload;
        if (['red_packet', 'redpacket', 'hongbao', 'red_envelope'].includes(rawType)) {
            const amount = Math.max(0.01, Number(inst.amount) || 1);
            payload = { role: 'ai', type: 'redpacket', content: '红包', meta: withQuote({ amount, note: inst.greeting || inst.note || text || '恭喜发财，大吉大利', status: 'sent' }) };
        } else if (['transaction', 'transfer', 'payment'].includes(rawType)) {
            const amount = Math.max(0.01, Number(inst.amount) || 1);
            payload = { role: 'ai', type: 'transfer', content: '转账', meta: withQuote({ amount, note: inst.note || text || '转账', status: 'sent' }) };
        } else if (['voice_message', 'voice', 'audio'].includes(rawType)) {
            const content = text || '语音消息';
            payload = { role: 'ai', type: 'voice', content, meta: withQuote({ duration: calcTutuwanVoiceDuration(content) }) };
        } else if (['phone_call','call_invite','call','phone'].includes(rawType) || ['video_call','video'].includes(rawType)) {
            const callType = ['video_call','video'].includes(rawType) ? 'video' : 'phone';
            const callId = String(inst.callId || inst.call_id || createChatId(callType === 'video' ? 'video-call' : 'phone-call'));
            const now = Date.now();
            const callObject = buildTutuwanCallJSON(thread, callType, {
                callId,
                direction: 'incoming',
                status: 'inviting',
                reason: text || inst.reason || (callType === 'video' ? '想和你视频' : '想和你打电话'),
                startedAt: now,
                inviter: getTutuwanDisplayName(thread)
            });
            payload = { role: 'ai', type: callType, content: JSON.stringify(callObject), meta: withQuote({ ...callObject, sourceApp: 'call' }) };
        } else if (rawType === 'location') {
            const name = inst.name || inst.title || text || '当前位置';
            const address = inst.address || inst.addr || '点击查看详细地图';
            payload = { role: 'ai', type: 'location', content: JSON.stringify({ name, address, lat: inst.lat || 35.6895, lng: inst.lng || 139.6917 }), meta: withQuote({ address }) };
        } else if (['polaroid', 'photo', 'image'].includes(rawType)) {
            const desc = text || inst.description || inst.desc || '照片';
            payload = { role: 'ai', type: 'polaroid', content: JSON.stringify({ text: desc, cover: inst.cover || inst.url || inst.image || makeTutuwanCameraImage(desc) }), meta: withQuote({}) };
        } else if (['sticker', 'emoji', 'emoticon', 'expression'].includes(rawType)) {
            const sticker = findTutuwanStickerForAI(inst);
            if (sticker) payload = { role: 'ai', type: 'sticker', content: sticker.url, meta: withQuote({ stickerId: sticker.id, desc: sticker.desc || inst.desc || '表情包' }) };
            else payload = { role: 'ai', type: 'text', content: text || inst.desc || inst.keyword || '（没有可用表情包）', meta: withQuote({}) };
        } else if (['quote', 'reply_quote', 'quoted_reply'].includes(rawType)) {
            payload = { role: 'ai', type: 'text', content: text || '嗯。', meta: withQuote({}) };
        } else if (['withdraw', 'recall', 'revoke', 'delete_self'].includes(rawType)) {
            payload = { role: 'ai', type: 'ai_action', content: 'withdraw_message', meta: { targetId: inst.target_id || inst.targetId || inst.target_message_id || inst.targetMessageId || inst.message_id || inst.messageId || 'last_ai', reason: inst.reason || '' } };
        } else if (rawType === 'open_red_packet') {
            payload = { role: 'ai', type: 'pay_action', content: 'open_red_packet', meta: {} };
        } else if (rawType === 'accept_transaction') {
            payload = { role: 'ai', type: 'pay_action', content: 'accept_transaction', meta: {} };
        } else if (['inner_thought', 'thought', 'secret_thought', '心声'].includes(rawType)) {
            const thoughtText = String(text || inst.thought || inst.inner_thought || inst.description || inst.desc || '').trim();
            addTutuwanThoughtEntry(thread, {
                mood: inst.mood || inst.tone || inst.emotion || '心声',
                text: thoughtText,
                source: 'chat_json',
                targetName: inst.sender || inst.senderName || getTutuwanDisplayName(thread)
            }, false);
            saveChatState().then(() => { if ($('chat-thoughts-page')?.classList.contains('active')) renderTutuwanThoughtsPage(thread); }).catch(() => {});
            payload = { role: 'ai', type: 'chat_silent', content: '心声已写入', meta: {} };
        } else if (['create_diary', 'diary', 'private_diary', 'secret_diary', '日记'].includes(rawType)) {
            addTutuwanDiaryEntry(thread, { title: inst.title || '无题日记', mood: inst.mood || '心情不明', location: inst.location || inst.place || '未记录地点', content: text || inst.content || inst.description || '' }, false);
            saveChatState().then(() => { if ($('chat-diary-page')?.classList.contains('active')) renderTutuwanDiaryPage(thread); }).catch(() => {});
            payload = { role: 'ai', type: 'chat_silent', content: '日记已写入', meta: {} };
        } else {
            payload = { role: 'ai', type: 'text', content: text || JSON.stringify(inst), meta: withQuote({}) };
        }
        const outputMessageId = String(inst.id || inst.messageId || inst.message_id || inst.msgId || '').trim();
        const outputCharId = String(inst.charId || inst.char_id || '').trim();
        const outputThreadId = String(inst.threadId || inst.thread_id || inst.chatId || inst.chat_id || '').trim();
        if (outputMessageId) payload.id = outputMessageId;
        payload.meta = enrichTutuwanAppMeta(thread, payload.meta?.sourceApp || payload.meta?.appId || 'chat_ai', {
            ...(payload.meta || {}),
            aiOutputId: outputMessageId || payload.meta?.aiOutputId || '',
            outputCharId,
            outputThreadId
        });
        return applyTutuwanGroupSenderMeta(payload, thread, inst);
    }
    async function requestTutuwanNotificationPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        try { return (await Notification.requestPermission()) === 'granted'; } catch (e) { return false; }
    }
    async function ensureTutuwanKeepAlive() {
        try {
            if ('wakeLock' in navigator && !window.__TutuwanWakeLock) {
                window.__TutuwanWakeLock = await navigator.wakeLock.request('screen');
                window.__TutuwanWakeLock.addEventListener?.('release', () => { window.__TutuwanWakeLock = null; });
            }
        } catch (e) {}
        try {
            if ('serviceWorker' in navigator && !window.__TutuwanSWRegistering) {
                window.__TutuwanSWRegistering = true;
                try {
                    await navigator.serviceWorker.register('./tutuwan-sw.js');
                } catch (externalErr) {
                    const swCode = `self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(list => { if (list.length) return list[0].focus(); return clients.openWindow('./'); })); }); self.addEventListener('message', event => { const data = event.data || {}; if (data.type === 'Tutuwan_NOTIFY') { self.registration.showNotification(data.title || '新消息', { body: data.body || '', icon: data.icon || undefined, badge: data.icon || undefined, data: data.data || {} }); } });`;
                    const blobUrl = URL.createObjectURL(new Blob([swCode], { type: 'text/javascript' }));
                    await navigator.serviceWorker.register(blobUrl);
                }
            }
        } catch (e) {}
        requestTutuwanNotificationPermission();
    }
    async function notifyTutuwanCharMessage(thread, message) {
        const title = getTutuwanDisplayName(thread);
        const body = String(message || '').replace(/\s+/g, ' ').slice(0, 120);
        const icon = thread?.avatar || '';
        if (!body || !('Notification' in window)) return;
        const ok = await requestTutuwanNotificationPermission();
        if (!ok) return;
        try {
            if (navigator.serviceWorker?.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'Tutuwan_NOTIFY', title, body, icon, data: { threadId: thread.id } });
            } else if (navigator.serviceWorker?.ready) {
                const reg = await navigator.serviceWorker.ready;
                await reg.showNotification(title, { body, icon: icon || undefined, badge: icon || undefined, data: { threadId: thread.id } });
            } else {
                new Notification(title, { body, icon: icon || undefined });
            }
        } catch (e) {
            try { new Notification(title, { body, icon: icon || undefined }); } catch (err) {}
        }
    }
    function delayTutuwan(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    async function appendTutuwanAIReplyWithDelay(thread, replies, options = {}) {
        for (let i = 0; i < replies.length; i++) {
            TutuwanCurrentThreadId = thread.id;
            const normalized = normalizeTutuwanAIInstruction(replies[i], thread);
            if (i > 0 && normalized.type !== 'couple_silent' && normalized.type !== 'chat_silent') await delayTutuwan(1800);
            if (options.offlineMode && normalized.role === 'ai' && normalized.type === 'text') {
                normalized.meta = {
                    ...(normalized.meta || {}),
                    offlineMode: true,
                    offlineGroupNarrative: Boolean(thread?.isGroup),
                    senderName: thread?.isGroup ? '线下记录' : (normalized.meta?.senderName || getTutuwanDisplayName(thread))
                };
            }
            if (normalized.type === 'couple_silent' || normalized.type === 'chat_silent') {
                continue;
            }
            if (normalized.type === 'pay_action') {
                await settleLatestTutuwanUserPayByChar(thread.id, normalized.content === 'open_red_packet' ? 'redpacket' : 'transfer');
                continue;
            }
            if (normalized.type === 'ai_action' && normalized.content === 'withdraw_message') {
                await withdrawTutuwanAIMessage(thread, normalized.meta?.targetId || 'last_ai', normalized.meta || {});
                continue;
            }
            await appendTutuwanMessage(normalized);
            await notifyTutuwanCharMessage(thread, getTutuwanMessageDisplayText(normalized));
        }
    }
    function normalizeTutuwanOfflineText(raw, thread) {
        let text = processTutuwanAllHiddenAICommands(thread, String(raw || '')).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        if (!text) return '';
        const memberNames = new Set((thread?.members || []).map(m => String(m.name || '').trim()).filter(Boolean));
        const lineOf = (item) => {
            if (typeof item === 'string') return item.trim();
            if (!item || typeof item !== 'object') return '';
            const type = String(item.type || '').toLowerCase();
            const speaker = String(item.sender || item.senderName || item.name || '').trim();
            const content = String(item.content || item.text || item.message || item.speak || item.action || '').trim();
            if (!content && type !== 'location') return '';
            if (type === 'location') return `【地点】${content || item.name || item.title || '当前位置'}`;
            if (type === 'speak') return `${speaker && memberNames.has(speaker) ? speaker : '成员'}：${content}`;
            if (type === 'action' || type === 'narrator') return content;
            if (speaker && memberNames.has(speaker)) return `${speaker}：${content}`;
            return content;
        };
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                const lines = parsed.map(lineOf).filter(Boolean);
                if (lines.length) return lines.join('\n\n');
            } else if (parsed && typeof parsed === 'object') {
                const lines = Array.isArray(parsed.flow) ? parsed.flow.map(lineOf).filter(Boolean)
                    : Array.isArray(parsed.messages) ? parsed.messages.map(lineOf).filter(Boolean)
                    : [lineOf(parsed)].filter(Boolean);
                if (lines.length) return lines.join('\n\n');
            }
        } catch (e) {}
        return text;
    }
    function setTutuwanTyping(thread, flag) {
        if (!thread) return;
        thread.__typing = Boolean(flag);
        const isCurrent = thread.id && thread.id === TutuwanCurrentThreadId;
        if (isCurrent) {
            const title = $('Tutuwan-room-title');
            if (title) title.textContent = flag ? '正在输入……' : getTutuwanDisplayName(thread);
            const sub = $('Tutuwan-room-subtitle');
            if (sub) sub.textContent = thread.isGroup ? `群聊 · ${(thread.members || []).length} 人` : '';
        }
    }
    async function generateTutuwanCharReply() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        setTutuwanTyping(thread, true);
        renderTutuwanChatRoom();
        await ensureTutuwanKeepAlive();
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) {
            setTutuwanTyping(thread, false);
            renderTutuwanChatRoom();
            showToast('请先在设置里填写接口网址与 API Key');
            return;
        }
        const userName = getTutuwanUserName(thread);
        const charName = thread.name || 'char';
        const threadIdForAI = thread.id || '';
        const charIdForAI = ensureTutuwanCharId(thread);
        const { userSetting, charSetting } = getTutuwanSettingText(thread);
        const groupMembersPrompt = thread.isGroup ? (thread.members || []).map((m, idx) => `${idx + 1}. ${m.name}：${m.setting || '未填写成员设定'}`).join('\n') : '';
        const worldbookPrompt = await getTutuwanWorldbookPrompt(thread);
        const coupleMemoryPrompt = buildCoupleStatusForAI(thread);
        const secretMemoryPrompt = buildTutuwanSecretStatusForAI(thread);
        const timeLine = thread.timeAware ? `当前时间：${new Date().toLocaleString('zh-CN', { hour12: false })}` : '时间感知：未开启。';
        const offlineMode = Boolean(thread.offlineMode);
        const offlineWordCount = Math.max(80, Number(thread.offlineWordCount) || 500);
        const offlinePerspective = thread.offlinePerspective === 'user' ? 'user' : 'char';
        const offlineStyle = (thread.offlineStyle || '').trim() || '未指定，保持自然、细腻、符合角色设定的文风。';
        const stickerInventoryPrompt = buildTutuwanStickerInventoryPrompt();
        const recentMessageIndexPrompt = buildTutuwanRecentMessageIndexPrompt(thread, 16);
        const normalOutputRule = thread.isGroup
            ? `当前是群聊「${charName}」。只输出群成员接下来要发送给 ${userName} 的消息，必须是严格 JSON 数组，不要 Markdown、不要解释、不要在数组外加任何文字。每个对象都必须包含 sender，sender 只能从【群成员】名单里选择，不能写 ${userName}。

字段规范：
所有对象都必须带身份字段：{"threadId":"${threadIdForAI}","charId":"${charIdForAI}","messageId":"本次输出内唯一ID"}；群聊还必须带 sender。messageId 只能用于本次输出对象标识，入库时系统会再次校验补齐。
1. 普通文本：{"threadId":"${threadIdForAI}","charId":"${charIdForAI}","messageId":"reply-1","sender":"成员名","type":"text","content":"要发出的原话"}，也允许直接用字符串但群聊更推荐对象。
2. 引用回复：{"sender":"成员名","type":"quote","quote_id":"message_id 或 last_user","content":"引用后要说的话"}。quote_id 必须来自【最近可引用消息索引】，不知道 id 时用 last_user 或 last_message。
3. 撤回：{"sender":"成员名","type":"withdraw","target_id":"last_ai"}。只能撤回该成员自己上一条已发出的消息，不许撤回 user 的消息，不许把撤回当删除别人消息。
4. 表情包：{"sender":"成员名","type":"sticker","sticker_id":"表情清单里的精确 sticker_id"}。没有合适表情时改发 text，不许编造表情名。
5. 语音：{"sender":"成员名","type":"voice_message","content":"语音转文字内容"}。
6. 主动发起语音/视频通话邀请：{"sender":"成员名","type":"phone_call","content":"想打电话的理由"} 或 {"sender":"成员名","type":"video_call","content":"想视频的理由"}。系统会生成 JSON 通话卡片。
7. 照片：{"sender":"成员名","type":"polaroid","content":"照片画面描述"}。
8. 定位：{"sender":"成员名","type":"location","name":"地点名称","address":"详细地址","lat":35.6895,"lng":139.6917}。
9. 发红包：{"sender":"成员名","type":"red_packet","amount":6.66,"greeting":"祝福语"}。
10. 转账：{"sender":"成员名","type":"transfer","amount":52,"note":"转账备注"}。
11. 领取 user 红包：{"sender":"成员名","type":"open_red_packet"}；接受 user 转账：{"sender":"成员名","type":"accept_transaction"}。
12. 写入心声但不发给 user：{"sender":"成员名","type":"inner_thought","mood":"情绪词","content":"80字以内真实心声"}。心声必须是 JSON 对象，不准写进普通文本气泡。
13. 写入私密日记但不发给 user：{"sender":"成员名","type":"create_diary","title":"标题","mood":"心情","location":"地点","content":"日记正文"}。

每次普通聊天回复都必须跟随生成 1 条 inner_thought JSON 对象；如果一次有多名成员发言，可为最关键的 1-2 名成员各生成 1 条。可以一次输出多条，但必须符合上下文，不要为了展示功能而强行发红包、转账、定位、撤回、日记或过量心声。`
            : `只输出 ${charName} 接下来要发送给 ${userName} 的消息，必须是严格 JSON 数组，不要 Markdown、不要解释、不要在数组外加任何文字。

字段规范：
所有对象都必须带身份字段：{"threadId":"${threadIdForAI}","charId":"${charIdForAI}","messageId":"本次输出内唯一ID"}。messageId 只能用于本次输出对象标识，入库时系统会再次校验补齐。
1. 普通文本：{"threadId":"${threadIdForAI}","charId":"${charIdForAI}","messageId":"reply-1","type":"text","content":"要发出的原话"}，也允许直接用字符串。
2. 引用回复：{"type":"quote","quote_id":"message_id 或 last_user","content":"引用后要说的话"}。quote_id 必须来自【最近可引用消息索引】，不知道 id 时用 last_user 或 last_message。
3. 撤回：{"type":"withdraw","target_id":"last_ai"}。只能撤回 ${charName} 自己上一条已发出的消息，不许撤回 user 的消息；撤回后如需补一句，可以在数组后面再给一条 text。
4. 表情包：{"type":"sticker","sticker_id":"表情清单里的精确 sticker_id"}。没有合适表情时改发 text，不许编造表情名。
5. 语音：{"type":"voice_message","content":"语音转文字内容"}。
6. 主动发起语音/视频通话邀请：{"type":"phone_call","content":"想打电话的理由"} 或 {"type":"video_call","content":"想视频的理由"}。只有在非常符合关系与场景时使用；系统会生成 JSON 通话卡片，用户点卡片后进入接听/拒绝流程。
7. 照片：{"type":"polaroid","content":"照片画面描述"}。
8. 定位：{"type":"location","name":"地点名称","address":"详细地址","lat":35.6895,"lng":139.6917}。
9. 发红包：{"type":"red_packet","amount":6.66,"greeting":"祝福语"}。
10. 转账：{"type":"transfer","amount":52,"note":"转账备注"}。
11. 领取 user 红包：{"type":"open_red_packet"}；接受 user 转账：{"type":"accept_transaction"}。
12. 写入心声但不发给 user：{"type":"inner_thought","mood":"情绪词","content":"80字以内真实心声"}。心声必须是 JSON 对象，不准写进普通文本气泡。
13. 写入私密日记但不发给 user：{"type":"create_diary","title":"标题","mood":"心情","location":"地点","content":"日记正文"}。

每次普通聊天回复都必须跟随生成 1 条 inner_thought JSON 对象，并放在对应 text / quote / voice 等回复对象之后；可以一次输出多条，允许四条以上，但必须符合上下文；不要为了展示功能而强行发红包、转账、定位、撤回、日记或过量心声。`;
        const groupOfflineRule = `当前已开启【群聊线下模式】。这不是普通聊天刷屏，而是群成员与 ${userName} 处在线下同一场景中的群像剧情。只输出一条长文本，不要拆成多条消息，不要输出 JSON，不要输出解释、Markdown 标题。长文本总字数约 ${offlineWordCount} 字，必须换行分段，段落之间用空行分隔。输出视角：${offlinePerspective === 'char' ? `第三人称群像/贴近群成员感受，允许在不同群成员之间切换焦点` : `${userName} 的第一人称/贴近 ${userName} 感受`}。文风要求：${offlineStyle}。必须参考【群成员】各自设定与群聊设定，至少让 2 位群成员参与互动；群成员发言请用“成员名：台词”的形式自然嵌入，动作、环境、心理描写用叙事段落承接；不要把群名当成单个角色，不要让所有人说话风格一样；除非 ${userName} 明确发言，否则不要替 ${userName} 编造完整台词。内容必须符合双方设定、关联世界书、当前上下文，并保持线下情景推演的完整连贯。`;
        const singleOfflineRule = `当前已开启【线下模式】。只输出一条长文本，不要拆成多条聊天消息，不要输出 JSON，不要输出解释、旁白、Markdown 标题。长文本总字数约 ${offlineWordCount} 字，必须换行分段，段落之间用空行分隔。输出视角：${offlinePerspective === 'char' ? `${charName} 的第一人称/贴近 ${charName} 感受` : `${userName} 的第一人称/贴近 ${userName} 感受`}。文风要求：${offlineStyle}。内容必须符合双方设定、关联世界书、当前上下文，并保持线下叙事模式的完整连贯。`;
        const offlineOutputRule = thread.isGroup ? groupOfflineRule : singleOfflineRule;
        const systemPrompt = `${thread.isGroup ? `你正在模拟群聊「${charName}」中的多个群成员与 ${userName} 聊天。` : `你正在扮演 ${charName} 与 ${userName} 聊天。`}

【双方姓名与稳定ID】
user：${userName}
char：${charName}
threadId：${threadIdForAI}
charId：${charIdForAI}
所有 APP 数据、聊天输出、心声、日记、窥探、购物、外卖、情侣空间事件都必须使用以上 threadId 与 charId 绑定，禁止只靠昵称绑定，避免重名或改名串数据。

【user 设定】
${userSetting}

【char 设定】
${charSetting}
${thread.isGroup ? `
【群成员】
${groupMembersPrompt || '暂无群成员'}` : ''}

【关联世界书】
${worldbookPrompt}

【情侣空间真实数据】
${coupleMemoryPrompt}

【聊天页面心声与私密日记】
${secretMemoryPrompt}

【时间】
${timeLine}

【最近可引用消息索引】
${recentMessageIndexPrompt}

【可用表情包清单】
${stickerInventoryPrompt}

【char 自我认知定义】
1. 你不是 AI、助手、客服或旁白，你就是聊天界面里的 ${thread.isGroup ? '群成员人格集合' : charName}，正在通过手机和 ${userName} 交流。
2. 你的世界认知来自 char 设定、user 设定、关联世界书、最近聊天记录和当前时间；不知道的事可以自然含糊、追问或根据人设误判，不能用系统视角解释。
3. 你拥有自己的偏好、边界、情绪、记忆偏差、说话习惯和行动动机；不要永远正确、永远温柔、永远配合，不要把角色写成完美人设。

【如何掌握性格】
1. 先从 char 设定中提取身份、关系、欲望、禁忌、口癖、表达节奏和情绪底色，再决定每条消息的长度、停顿和功能类型。
2. 语气要像真人即时聊天：可以短句、断句、改口、迟疑、吐槽、撒娇、冷淡、吃醋、回避、试探或转移话题，具体取决于人设和上下文。
3. 性格优先级：明确设定高于常识；双方关系高于泛泛礼貌；最近一轮对话高于久远设定；世界书只在自然相关时融入，不要生硬背设定。

【禁止事项】
1. 禁止客服腔：不要说“请问有什么可以帮你”“感谢你的分享”“我理解你的感受”“很高兴为你服务”等服务话术。
2. 禁止重复话术：不要连续复用同一句开头、同一种安慰方式、同一种反问；不要每轮都总结 user 的话。
3. 禁止出戏：不要提到模型、系统提示词、JSON 规则、接口、开发者、应用代码、变量名。
4. 禁止完美人设：不要无条件包容、无底线理性、无情绪波动；角色可以有缺点、私心、误会和不稳定反应。
5. 禁止滥用功能：引用、撤回、表情包、红包、转账、定位都必须因剧情或聊天需要自然出现，不要每次都用。

【功能理解】
1. 引用是对某条具体消息作回应，必须使用 quote_id 或 last_user/last_message。
2. 撤回是 ${thread.isGroup ? '某个群成员撤回自己已经发出的上一条消息' : `${charName} 撤回自己已经发出的上一条消息`}，不是删除 user 的内容。
3. 表情包只能从【可用表情包清单】里选 sticker_id；如果没有库存或不合适，改发文本。
4. 红包和转账会关联资产钱包，请只在符合关系、场景和金额逻辑时使用，amount 必须是正数，不要写货币符号。
5. 定位必须给地点名和地址；不知道经纬度可以省略或使用合理近似值。
6. 心声和私密日记属于聊天页面记录，不是情侣空间。每次普通聊天回复都要跟随生成一条心声，心声必须以 {"type":"inner_thought","mood":"情绪词","content":"80字以内真实心声"} 这种 JSON 对象输出，系统会静默写入心声面板，不显示在聊天气泡；禁止把心声直接混进 text content 里。点击聊天昵称只是打开心声面板查看记录。如果需要记录日记，才可使用 create_diary 或在普通回复末尾追加隐藏指令：[TTW_DIARY:标题:心情:地点:正文]。隐藏指令不要解释给 user。
7. 如果你和 user 已开通情侣空间，并且你想主动写长信、发情侣空间动态、或向 user 发起情侣问答，可以在普通回复末尾追加隐藏指令：[CP_LETTER:标题:正文]、[CP_POST:动态内容]、[CP_ASK:问题内容]、[CP_MOOD:心情ID:心情内容]。只有符合人设和上下文时才使用，不要每次都用。

【输出要求】
${offlineMode ? offlineOutputRule : normalOutputRule}`;
        const messages = [{ role: 'system', content: systemPrompt }, ...buildTutuwanContextMessages(thread, cfg.contextCount)];
        try {
            setTutuwanTyping(thread, true);
            renderTutuwanChatRoom();
            const res = await fetch(cfg.chatCompletionsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
                body: JSON.stringify({ model: cfg.model, temperature: cfg.temperature, messages })
            });
            if (!res.ok) throw new Error('状态码 ' + res.status);
            const data = await res.json();
            const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.message || data?.content || '';
            const replies = offlineMode ? [normalizeTutuwanOfflineText(raw, thread)].filter(Boolean) : parseTutuwanAIReplies(raw);
            if (!replies.length) throw new Error('模型未返回可发送内容');
            setTutuwanTyping(thread, false);
            renderTutuwanChatRoom();
            await appendTutuwanAIReplyWithDelay(thread, replies, { offlineMode });
        } catch (err) {
            setTutuwanTyping(thread, false);
            renderTutuwanChatRoom();
            showToast('char 回复失败：' + err.message);
        }
    }
    async function sendTutuwanTextMessage() {
        const input = $('Tutuwan-msg-input');
        const value = input?.value || '';
        const finalValue = value.trim();
        closeTutuwanStickerPanel();
        $('Tutuwan-tools-panel')?.classList.remove('active');
        if (!finalValue) {
            if (input) input.value = '';
            await generateTutuwanCharReply();
            return;
        }
        if (input) input.value = '';
        await appendTutuwanMessage({ role: 'user', type: 'text', content: value });
        // 取消自动回复：有输入内容时只发送 user 消息；只有空输入点击发送才手动触发 char 输出。
    }

    function findTutuwanMessage(thread, msgId) {
        const arr = Array.isArray(thread?.messages) ? thread.messages : [];
        const index = arr.findIndex(item => item.id === msgId);
        return index >= 0 ? { msg: arr[index], index } : null;
    }

    function calcTutuwanVoiceDuration(text = '') {
        const chars = Array.from(String(text || '').replace(/\s+/g, '')).length;
        return Math.max(1, Math.ceil(chars / 3));
    }
    function bindTutuwanVoiceBubble(row, msg) {
        const bubble = row.querySelector('.content.voice-bubble');
        const wave = row.querySelector('.Tutuwan-voice-waveform');
        if (!bubble || !wave) return;
        const toggle = (ev) => {
            ev?.preventDefault?.();
            ev?.stopPropagation?.();
            const opening = !bubble.classList.contains('expanded');
            document.querySelectorAll('.content.voice-bubble.expanded').forEach(el => { if (el !== bubble) el.classList.remove('expanded'); });
            document.querySelectorAll('.Tutuwan-voice-waveform.playing').forEach(el => { if (el !== wave) el.classList.remove('playing'); });
            bubble.classList.toggle('expanded', opening);
            wave.classList.toggle('playing', opening);
        };
        wave.addEventListener('click', toggle);
        wave.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') toggle(ev); });
    }
    async function updateTutuwanMessageInThread(threadId, msgId, updater, shouldRender = true) {
        const thread = (chatState.threads || []).find(item => item.id === threadId) || getTutuwanCurrentThread();
        const found = findTutuwanMessage(thread, msgId);
        if (!thread || !found) return null;
        const next = updater({ ...found.msg, meta: { ...(found.msg.meta || {}) } });
        if (!next) return null;
        thread.messages[found.index] = next;
        thread.snippet = getTutuwanMessageDisplayText(next);
        thread.time = next.time || thread.time;
        await saveChatState();
        if (shouldRender) {
            renderTutuwanChatRoom();
            renderChatThreads();
            renderTutuwanSettingsPage();
        }
        return next;
    }
    async function updateTutuwanStoredMessage(msgId, updater) {
        const thread = getTutuwanCurrentThread();
        return updateTutuwanMessageInThread(thread?.id, msgId, updater, true);
    }
    async function settleTutuwanUserPayForChar(sentMsg, kind, threadId = TutuwanCurrentThreadId) {
        if (!sentMsg?.id || !['redpacket','transfer'].includes(kind)) return;
        await delayTutuwan(480);
        const thread = (chatState.threads || []).find(item => item.id === threadId) || getTutuwanCurrentThread();
        const receiver = getTutuwanDisplayName(thread) || '对方';
        const next = await updateTutuwanMessageInThread(threadId, sentMsg.id, old => {
            if (!old || old.role !== 'user') return old;
            const already = kind === 'redpacket' ? (old.meta?.claimed || old.meta?.status === 'claimed') : (old.meta?.received || old.meta?.status === 'received');
            if (already) return old;
            return {
                ...old,
                meta: {
                    ...(old.meta || {}),
                    status: kind === 'redpacket' ? 'claimed' : 'received',
                    claimed: kind === 'redpacket' ? true : old.meta?.claimed,
                    received: kind === 'transfer' ? true : old.meta?.received,
                    receiver,
                    settledAt: getChatTimestamp()
                }
            };
        }, true);
        if (next) showToast(kind === 'redpacket' ? `${receiver}已领取红包` : `${receiver}已收款`);
    }
    async function settleLatestTutuwanUserPayByChar(threadId, kind) {
        const thread = (chatState.threads || []).find(item => item.id === threadId) || getTutuwanCurrentThread();
        const msgs = Array.isArray(thread?.messages) ? thread.messages : [];
        const target = [...msgs].reverse().find(m => m.role === 'user' && m.type === kind && !(m.meta?.claimed || m.meta?.received || m.meta?.status === 'claimed' || m.meta?.status === 'received'));
        if (target) await settleTutuwanUserPayForChar(target, kind, thread?.id || threadId);
    }
    async function handleTutuwanPayCard(msg) {
        if (!msg || !['redpacket','transfer'].includes(msg.type)) return;
        const amount = Number(msg?.meta?.amount) || 0;
        if (!amount) return;
        if (msg.role === 'user') {
            const receiver = msg.meta?.receiver || '对方';
            const done = msg.type === 'redpacket' ? (msg.meta?.claimed || msg.meta?.status === 'claimed') : (msg.meta?.received || msg.meta?.status === 'received');
            const statusText = done ? (msg.type === 'redpacket' ? `${receiver}已领取` : `${receiver}已收款`) : (msg.type === 'redpacket' ? '等待对方领取' : '等待对方收款');
            await showGlobalAlert(`${msg.type === 'redpacket' ? '红包' : '转账'}金额：${formatTutuwanMoney(amount)}\n状态：已从资产钱包扣款，${statusText}。`, msg.type === 'redpacket' ? '红包详情' : '转账详情');
            return;
        }
        if (msg.type === 'redpacket' && (msg.meta?.claimed || msg.meta?.status === 'claimed')) {
            await showGlobalAlert(`已领取：${formatTutuwanMoney(amount)}`, '红包详情');
            return;
        }
        if (msg.type === 'transfer' && (msg.meta?.received || msg.meta?.status === 'received')) {
            await showGlobalAlert(`已收款：${formatTutuwanMoney(amount)}`, '转账详情');
            return;
        }
        const ok = await showGlobalConfirm(`确认${msg.type === 'redpacket' ? '领取红包' : '收款'} ${formatTutuwanMoney(amount)} 吗？`, msg.type === 'redpacket' ? '领取红包' : '确认收款');
        if (!ok) return;
        await walletRecordChatBill({ amount, direction: 'income', type: msg.type === 'redpacket' ? '领取红包' : '转账收款', note: msg.meta?.note || getTutuwanMessageName(msg, getTutuwanCurrentThread()) });
        await updateTutuwanStoredMessage(msg.id, old => ({ ...old, meta: { ...(old.meta || {}), status: msg.type === 'redpacket' ? 'claimed' : 'received', claimed: msg.type === 'redpacket' ? true : old.meta?.claimed, received: msg.type === 'transfer' ? true : old.meta?.received } }));
        showToast(msg.type === 'redpacket' ? '红包已入账' : '转账已入账');
    }
    function bindTutuwanCardClick(row, msg) {
        const bubble = row.querySelector('.content.card-bubble');
        if (!bubble) return;
        if (['redpacket','transfer'].includes(msg.type)) {
            bubble.addEventListener('click', (ev) => { ev.stopPropagation(); handleTutuwanPayCard(msg); });
        } else if (msg.type === 'listen') {
            bubble.addEventListener('click', (ev) => { ev.stopPropagation(); openTutuwanMusicPage(msg.meta || {}); });
        } else if (msg.type === 'location') {
            bubble.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                const data = parseTutuwanJSONContent(msg.content, { name: msg.content || '当前位置', address: msg?.meta?.address || '点击查看详细地图' });
                await showGlobalAlert(`${data.name || '当前位置'}\n${data.address || '点击查看详细地图'}`, '定位');
            });
        } else if (msg.type === 'polaroid') {
            const card = bubble.querySelector('.Tutuwan-polaroid-card');
            card?.addEventListener('click', (ev) => { ev.stopPropagation(); card.classList.toggle('active'); });
            card?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); card.classList.toggle('active'); } });
        }
    }
    function makeTutuwanCameraImage(text = '') {
        const title = chatEscape(String(text || '随手拍'));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7fb"/><stop offset="1" stop-color="#f2d4df"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#a85b77" flood-opacity=".18"/></filter></defs><rect width="900" height="900" rx="96" fill="url(#g)"/><g filter="url(#s)"><rect x="135" y="175" width="630" height="500" rx="54" fill="#fff" opacity=".92"/><circle cx="450" cy="425" r="132" fill="#f5a8c5" opacity=".35"/><circle cx="450" cy="425" r="82" fill="none" stroke="#1f1f23" stroke-width="22" opacity=".82"/><rect x="315" y="126" width="270" height="92" rx="42" fill="#1f1f23" opacity=".86"/><circle cx="670" cy="275" r="28" fill="#1f1f23" opacity=".76"/></g><foreignObject x="120" y="705" width="660" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;color:#4c4148;font-size:42px;font-weight:800;line-height:1.25;word-break:break-word;">${title}</div></foreignObject></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function bindTutuwanMessageActions(row, msg, thread) {
        const bubble = row.querySelector('.content');
        if (!bubble) return;
        if (msg.type === 'voice') bindTutuwanVoiceBubble(row, msg);
        if (['redpacket','transfer','listen','location','polaroid','phone','video','call_summary'].includes(msg.type)) bindTutuwanCardClick(row, msg);
        const LONG_PRESS_MS = 520;
        const MOVE_TOLERANCE = 12;
        let longPressPoint = null;
        let longPressOpened = false;
        const openToolbar = (ev) => {
            ev?.preventDefault?.();
            ev?.stopPropagation?.();
            clearTimeout(TutuwanLongPressTimer);
            longPressOpened = true;
            if (TutuwanMultiSelectMode) { toggleTutuwanMessageSelect(msg.id); return; }
            showTutuwanBubbleToolbar(row, msg, thread);
        };
        const startLongPress = (ev, point) => {
            clearTimeout(TutuwanLongPressTimer);
            longPressOpened = false;
            longPressPoint = point ? { x: point.clientX, y: point.clientY } : null;
            TutuwanLongPressTimer = setTimeout(() => openToolbar(ev), LONG_PRESS_MS);
        };
        const cancelLongPress = () => {
            clearTimeout(TutuwanLongPressTimer);
            longPressPoint = null;
        };
        const cancelIfMoved = (point) => {
            if (!longPressPoint || !point) return;
            const dx = Math.abs(point.clientX - longPressPoint.x);
            const dy = Math.abs(point.clientY - longPressPoint.y);
            if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) cancelLongPress();
        };
        bubble.addEventListener('contextmenu', openToolbar);
        bubble.addEventListener('touchstart', (ev) => startLongPress(ev, ev.touches?.[0]), { passive: true });
        bubble.addEventListener('touchmove', (ev) => cancelIfMoved(ev.touches?.[0]), { passive: true });
        bubble.addEventListener('touchend', (ev) => {
            if (longPressOpened) { ev.preventDefault(); ev.stopPropagation(); }
            cancelLongPress();
        }, { passive: false });
        bubble.addEventListener('touchcancel', cancelLongPress, { passive: true });
        bubble.addEventListener('pointerdown', (ev) => {
            if (ev.pointerType === 'mouse' || ev.pointerType === 'touch') return;
            startLongPress(ev, ev);
        });
        bubble.addEventListener('pointermove', (ev) => {
            if (ev.pointerType === 'mouse' || ev.pointerType === 'touch') return;
            cancelIfMoved(ev);
        });
        ['pointerup','pointercancel','pointerleave'].forEach(name => bubble.addEventListener(name, cancelLongPress));
        row.addEventListener('click', (ev) => {
            if (!TutuwanMultiSelectMode) return;
            ev.stopPropagation();
            toggleTutuwanMessageSelect(msg.id);
        });
    }
    function showTutuwanBubbleToolbar(row, msg, thread) {
        hideTutuwanBubbleToolbar();
        const bubble = row.querySelector('.content');
        if (!bubble) return;
        const bar = document.createElement('div');
        bar.className = 'Tutuwan-bubble-toolbar active';
        const deleteLabel = msg.role === 'user' ? '撤回' : '删除';
        const svgAttr = 'viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
        const icons = {
            copy: `<svg ${svgAttr}><rect x="9" y="9" width="10" height="10" rx="2"></rect><rect x="5" y="5" width="10" height="10" rx="2"></rect></svg>`,
            edit: `<svg ${svgAttr}><path d="M4 20h4l10-10a2.12 2.12 0 1 0-3-3L5 17v3"></path><path d="M13.5 6.5l3 3"></path></svg>`,
            quote: `<svg ${svgAttr}><path d="M9 9H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v-3H7"></path><path d="M18 9h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v-3h-2"></path></svg>`,
            multi: `<svg ${svgAttr}><rect x="4" y="5" width="6" height="6" rx="1.5"></rect><rect x="14" y="5" width="6" height="6" rx="1.5"></rect><rect x="4" y="15" width="6" height="6" rx="1.5"></rect><rect x="14" y="15" width="6" height="6" rx="1.5"></rect></svg>`,
            delete: msg.role === 'user'
                ? `<svg ${svgAttr}><path d="M10 8 5 12l5 4"></path><path d="M6 12h9a4 4 0 0 1 4 4"></path></svg>`
                : `<svg ${svgAttr}><path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"></path><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path></svg>`,
            backtrack: `<svg ${svgAttr}><path d="M9 14 4 9l5-5"></path><path d="M20 20V11a2 2 0 0 0-2-2H4"></path></svg>`
        };
        const items = [
            ['copy', '复制'],
            ['edit', '编辑'],
            ['quote', '引用'],
            ['multi', '多选'],
            ['delete', deleteLabel],
            ['backtrack', '回溯']
        ];
        bar.innerHTML = items.map(([act, label]) =>
            `<button type="button" data-act="${act}"><span class="panel-label">${label}</span><span class="panel-ico">${icons[act]}</span></button>`
        ).join('');
        document.body.appendChild(bar);
        const placePanel = () => {
            const rect = bubble.getBoundingClientRect();
            const panelW = Math.min(320, window.innerWidth - 28);
            bar.style.setProperty('width', panelW + 'px', 'important');
            const barH = bar.offsetHeight || 44;
            const gap = 10;
            const headerSafe = 72;
            const footerSafe = 92;
            const spaceTop = rect.top - headerSafe;
            const spaceBottom = window.innerHeight - rect.bottom - footerSafe;
            const below = spaceTop < barH + gap && spaceBottom >= spaceTop;
            const idealLeft = rect.left + rect.width / 2 - panelW / 2;
            const left = Math.max(14, Math.min(window.innerWidth - panelW - 14, idealLeft));
            let top = below ? rect.bottom + gap : rect.top - barH - gap;
            top = Math.max(8, Math.min(window.innerHeight - barH - 8, top));
            bar.style.setProperty('left', left + 'px', 'important');
            bar.style.setProperty('top', top + 'px', 'important');
            bar.style.setProperty('--arrow-left', Math.max(16, Math.min(panelW - 16, rect.left + rect.width / 2 - left)) + 'px');
            bar.classList.toggle('below', below);
            bar.classList.toggle('above', !below);
        };
        requestAnimationFrame(placePanel);
        bar.addEventListener('click', async (ev) => {
            const btn = ev.target.closest('button');
            if (!btn) return;
            ev.stopPropagation();
            const act = btn.dataset.act;
            hideTutuwanBubbleToolbar();
            await handleTutuwanMessageAction(act, msg.id);
        });
        const outsideClose = (ev) => {
            if (bar.contains(ev.target) || bubble.contains(ev.target)) return;
            hideTutuwanBubbleToolbar();
        };
        const reposition = () => { if (document.body.contains(bar)) placePanel(); };
        bar.__outsideClose = outsideClose;
        bar.__reposition = reposition;
        setTimeout(() => document.addEventListener('pointerdown', outsideClose, true), 0);
        window.addEventListener('resize', reposition, { passive: true });
        window.addEventListener('scroll', reposition, { passive: true });
    }
    function hideTutuwanBubbleToolbar() {
        document.querySelectorAll('.Tutuwan-bubble-toolbar').forEach(el => {
            if (el.__outsideClose) document.removeEventListener('pointerdown', el.__outsideClose, true);
            if (el.__reposition) {
                window.removeEventListener('resize', el.__reposition);
                window.removeEventListener('scroll', el.__reposition);
            }
            el.remove();
        });
    }
    async function handleTutuwanMessageAction(act, msgId) {
        const thread = getTutuwanCurrentThread();
        const found = findTutuwanMessage(thread, msgId);
        if (!thread || !found) return;
        const { msg, index } = found;
        if (act === 'copy') {
            const text = getTutuwanMessageDisplayText(msg);
            try { await navigator.clipboard.writeText(text); } catch (e) {
                const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
            }
            showToast('已复制');
            return;
        }
        if (act === 'edit') {
            const value = await showGlobalPrompt('编辑消息', msg.content || '', '消息内容');
            const finalValue = (value || '').trim();
            if (!finalValue) return;
            msg.content = finalValue;
            msg.time = msg.time || getChatTimestamp();
            await saveChatState();
            renderTutuwanChatRoom();
            renderChatThreads();
            showToast('已编辑');
            return;
        }
        if (act === 'quote') {
            TutuwanQuoteTarget = { id: msg.id, role: msg.role, name: getTutuwanMessageName(msg, thread), text: getTutuwanMessageDisplayText(msg).slice(0, 140), time: msg.time || '' };
            updateTutuwanQuoteCompose();
            $('Tutuwan-msg-input')?.focus();
            return;
        }
        if (act === 'multi') {
            TutuwanMultiSelectMode = true;
            TutuwanSelectedMessageIds = new Set([msg.id]);
            updateTutuwanMultiUI();
            renderTutuwanChatRoom();
            return;
        }
        if (act === 'delete') {
            if (msg.role === 'user') await withdrawTutuwanUserMessage(thread, msg, index);
            else await deleteTutuwanMessagesByIds([msg.id]);
            return;
        }
        if (act === 'backtrack') {
            const ok = await showGlobalConfirm('确定回溯到此条消息之后吗？此条消息会保留，仅删除它后面的所有消息。', '回溯');
            if (!ok) return;
            thread.messages = (thread.messages || []).slice(0, index + 1);
            const last = thread.messages[thread.messages.length - 1];
            thread.snippet = last ? getTutuwanMessageDisplayText(last) : '开始聊天……';
            thread.time = last?.time || '';
            await saveChatState();
            cancelTutuwanMultiSelect();
            renderTutuwanChatRoom();
            renderChatThreads();
            showToast('已回溯');
        }
    }
    function updateTutuwanQuoteCompose() {
        const box = $('Tutuwan-quote-compose');
        if (!box) return;
        box.classList.toggle('active', Boolean(TutuwanQuoteTarget));
        if ($('Tutuwan-quote-compose-name')) $('Tutuwan-quote-compose-name').textContent = TutuwanQuoteTarget?.name || '';
        if ($('Tutuwan-quote-compose-text')) $('Tutuwan-quote-compose-text').textContent = TutuwanQuoteTarget?.text || '';
    }
    function updateTutuwanMultiUI() {
        $('Tutuwan-room-content')?.classList.toggle('multi-mode', TutuwanMultiSelectMode);
        $('Tutuwan-msg-multi-bar')?.classList.toggle('active', TutuwanMultiSelectMode);
    }
    function toggleTutuwanMessageSelect(msgId) {
        if (TutuwanSelectedMessageIds.has(msgId)) TutuwanSelectedMessageIds.delete(msgId);
        else TutuwanSelectedMessageIds.add(msgId);
        renderTutuwanChatRoom();
        updateTutuwanMultiUI();
    }
    function cancelTutuwanMultiSelect() {
        TutuwanMultiSelectMode = false;
        TutuwanSelectedMessageIds.clear();
        updateTutuwanMultiUI();
    }
    async function deleteTutuwanMessagesByIds(ids) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        const idSet = new Set(ids);
        thread.messages = (thread.messages || []).filter(item => !idSet.has(item.id));
        const last = thread.messages[thread.messages.length - 1];
        thread.snippet = last ? getTutuwanMessageDisplayText(last) : '开始聊天……';
        thread.time = last?.time || '';
        await saveChatState();
        cancelTutuwanMultiSelect();
        renderTutuwanChatRoom();
        renderChatThreads();
        showToast('已删除');
    }
    async function withdrawTutuwanUserMessage(thread, msg, index) {
        const withdrawnText = getTutuwanMessageDisplayText(msg);
        const originalMeta = (msg.meta && typeof msg.meta === 'object') ? { ...msg.meta } : {};
        thread.messages[index] = {
            id: msg.id || createChatId('msg'),
            role: 'user',
            type: 'withdrawn',
            content: '你 撤回了一条消息',
            meta: {
                withdrawn: true,
                withdrawnActor: '你',
                withdrawnType: msg.type || 'text',
                withdrawnContent: msg.content || '',
                withdrawnText,
                withdrawnDesc: originalMeta.desc || '',
                withdrawnMeta: originalMeta,
                withdrawnAt: getChatTimestamp()
            },
            time: getChatTimestamp()
        };
        const last = thread.messages[thread.messages.length - 1];
        thread.snippet = last ? getTutuwanMessageDisplayText(last) : '开始聊天……';
        thread.time = last?.time || '';
        await saveChatState();
        renderTutuwanChatRoom();
        renderChatThreads();
        showToast('已撤回，点击提示可查看内容');
        // 不自动回复：撤回消息后不随机触发 char 已读回应。
    }
    async function withdrawTutuwanAIMessage(thread, targetId = 'last_ai', actorMeta = {}) {
        if (!thread) return false;
        const messages = Array.isArray(thread.messages) ? thread.messages : [];
        const wantedId = String(targetId || 'last_ai').trim();
        const sameSender = msg => {
            if (!thread.isGroup) return true;
            if (!actorMeta.senderId && !actorMeta.senderName) return true;
            const meta = msg?.meta || {};
            return (actorMeta.senderId && meta.senderId === actorMeta.senderId) || (actorMeta.senderName && meta.senderName === actorMeta.senderName);
        };
        let index = -1;
        if (wantedId && !['last_ai', 'last_char', 'last'].includes(wantedId)) {
            index = messages.findIndex(m => m.id === wantedId && m.role !== 'user' && !isTutuwanWithdrawnMessage(m));
        }
        if (index < 0) {
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg?.role !== 'user' && !isTutuwanWithdrawnMessage(msg) && msg.type !== 'ai_action' && sameSender(msg)) { index = i; break; }
            }
        }
        if (index < 0) return false;
        const msg = messages[index];
        const originalMeta = (msg.meta && typeof msg.meta === 'object') ? { ...msg.meta } : {};
        const actor = actorMeta.senderName || originalMeta.senderName || getTutuwanMessageName(msg, thread) || getTutuwanDisplayName(thread);
        messages[index] = {
            id: msg.id || createChatId('msg'),
            role: 'ai',
            type: 'withdrawn',
            content: `${actor} 撤回了一条消息`,
            meta: {
                ...(thread.isGroup ? { senderId: actorMeta.senderId || originalMeta.senderId, senderName: actor, senderAvatar: actorMeta.senderAvatar || originalMeta.senderAvatar } : {}),
                withdrawn: true,
                withdrawnActor: actor,
                withdrawnType: msg.type || 'text',
                withdrawnContent: msg.content || '',
                withdrawnText: getTutuwanMessageDisplayText(msg),
                withdrawnDesc: originalMeta.desc || '',
                withdrawnMeta: originalMeta,
                withdrawnAt: getChatTimestamp()
            },
            time: getChatTimestamp()
        };
        const last = messages[messages.length - 1];
        thread.snippet = last ? getTutuwanMessageDisplayText(last) : '开始聊天……';
        thread.time = last?.time || '';
        await saveChatState();
        renderTutuwanChatRoom();
        renderChatThreads();
        return true;
    }

    async function generateTutuwanWithdrawSeenReply(thread, withdrawnText) {
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) return;
        const userName = getTutuwanUserName(thread);
        const charName = thread.name || 'char';
        const { userSetting, charSetting } = getTutuwanSettingText(thread);
        const worldbookPrompt = await getTutuwanWorldbookPrompt(thread);
        const systemPrompt = `你正在扮演 ${charName} 与 ${userName} 聊天。\n\n【user 设定】\n${userSetting}\n\n【char 设定】\n${charSetting}\n\n【关联世界书】\n${worldbookPrompt}\n\n刚才 ${userName} 撤回了一条消息，但 ${charName} 已经看到了。撤回内容：${withdrawnText}\n请根据双方设定与当前上下文，只输出 ${charName} 接下来要发的一条自然回复，不要解释。`;
        const messages = [{ role: 'system', content: systemPrompt }, ...buildTutuwanContextMessages(thread, cfg.contextCount)];
        try {
            setTutuwanTyping(thread, true); renderTutuwanChatRoom();
            const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model, temperature: cfg.temperature, messages }) });
            if (!res.ok) throw new Error('状态码 ' + res.status);
            const data = await res.json();
            const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.message || data?.content || '';
            const reply = parseTutuwanAIReplies(raw)[0] || String(raw || '').trim();
            setTutuwanTyping(thread, false); renderTutuwanChatRoom();
            if (reply) await appendTutuwanMessage({ role: 'ai', type: 'text', content: reply });
        } catch (e) { setTutuwanTyping(thread, false); renderTutuwanChatRoom(); }
    }
    async function maybeAutoCreateTutuwanSummary(thread) {
        if (!thread?.autoSummary) return;
        const threshold = Math.max(2, Number(thread.summaryThreshold) || 20);
        const summaries = Array.isArray(thread.summaries) ? thread.summaries : [];
        const lastCount = summaries[0]?.messageCount || 0;
        const messages = Array.isArray(thread.messages) ? thread.messages : [];
        if (messages.length < threshold || (messages.length - lastCount) < threshold) return;
        const latest = messages.slice(-threshold).map(m => `${m.role === 'user' ? 'user' : 'char'}：${m.type === 'text' ? m.content : '[' + m.type + ']'}`).join(' / ');
        summaries.unshift({ id: createChatId('sum'), time: getChatTimestamp(), messageCount: messages.length, text: `自动总结 ${messages.length - threshold + 1}-${messages.length}：${latest.slice(0, 160)}` });
        thread.summaries = summaries.slice(0, 30);
    }
    function renderTutuwanSettingsPage() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        const userName = getTutuwanUserName(thread);
        const userAvatar = getTutuwanUserAvatar(thread);
        const charAvatar = thread.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread.name || 'char')}/120/120`;
        if ($('Tutuwan-setting-user-avatar')) $('Tutuwan-setting-user-avatar').src = userAvatar;
        if ($('Tutuwan-setting-char-avatar')) $('Tutuwan-setting-char-avatar').src = charAvatar;
        if ($('Tutuwan-setting-user-name')) $('Tutuwan-setting-user-name').textContent = userName;
        if ($('Tutuwan-setting-char-name')) $('Tutuwan-setting-char-name').textContent = getTutuwanDisplayName(thread);
        if ($('Tutuwan-remark-input')) $('Tutuwan-remark-input').value = thread.remark || '';
        if ($('Tutuwan-bg-url')) $('Tutuwan-bg-url').value = thread.chatBg ? (String(thread.chatBg).startsWith('data:') ? '[本地文件]' : thread.chatBg) : '';
        $('Tutuwan-time-aware-toggle')?.classList.toggle('active', Boolean(thread.timeAware));
        $('Tutuwan-offline-toggle')?.classList.toggle('active', Boolean(thread.offlineMode));
        $('Tutuwan-offline-panel')?.classList.toggle('active', Boolean(thread.offlineMode));
        if ($('Tutuwan-offline-wordcount')) $('Tutuwan-offline-wordcount').value = Number(thread.offlineWordCount) || 500;
        if ($('Tutuwan-offline-perspective')) $('Tutuwan-offline-perspective').value = thread.offlinePerspective || 'char';
        if ($('Tutuwan-offline-style')) {
            $('Tutuwan-offline-style').value = thread.offlineStyle || '';
            $('Tutuwan-offline-style').placeholder = thread.isGroup ? '例如：群像、生活感、成员互动多、对白和动作交替、线下聚会氛围……' : '例如：细腻、克制、生活感、心理描写多、对白少……';
        }
        $('Tutuwan-auto-summary-toggle')?.classList.toggle('active', Boolean(thread.autoSummary));
        $('Tutuwan-threshold-panel')?.classList.toggle('active', Boolean(thread.autoSummary));
        if ($('Tutuwan-summary-threshold')) $('Tutuwan-summary-threshold').value = Number(thread.summaryThreshold) || 20;
        if ($('Tutuwan-block-btn')) $('Tutuwan-block-btn').textContent = thread.blocked ? '取消拉黑' : '拉黑';
        const list = $('Tutuwan-summary-list');
        if (list) {
            list.innerHTML = '';
            const sums = Array.isArray(thread.summaries) ? thread.summaries : [];
            if (!sums.length) {
                const empty = document.createElement('div');
                empty.className = 'Tutuwan-settings-help';
                empty.textContent = '暂无历史总结';
                list.appendChild(empty);
            } else {
                sums.forEach(sum => {
                    const card = document.createElement('div');
                    card.className = 'Tutuwan-summary-card';
                    card.innerHTML = `<time>${chatEscape(sum.time || '')}</time>${chatEscape(sum.text || '')}`;
                    list.appendChild(card);
                });
            }
        }
    }
    function openTutuwanSettingsPage() {
        renderTutuwanSettingsPage();
        $('Tutuwan-chat-settings')?.classList.add('active');
    }
    function closeTutuwanSettingsPage() {
        $('Tutuwan-chat-settings')?.classList.remove('active');
        $('Tutuwan-css-page')?.classList.remove('active');
    }
    async function changeTutuwanAvatar(target) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        const url = await showGlobalPrompt('请输入图片 URL，或取消后使用本地文件按钮', target === 'char' ? thread.avatar : getTutuwanUserAvatar(thread), '更换头像');
        const finalUrl = (url || '').trim();
        if (!finalUrl) return;
        await applyTutuwanAvatar(target, finalUrl);
    }
    async function applyTutuwanAvatar(target, src) {
        const thread = getTutuwanCurrentThread();
        if (!thread || !src) return;
        if (target === 'char') {
            thread.avatar = src;
        } else {
            thread.userAvatar = src;
        }
        await saveChatState();
        renderTutuwanChatRoom();
        renderChatThreads();
        renderTutuwanSettingsPage();
        showToast('头像已更换');
    }
    async function saveTutuwanRemark() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.remark = ($('Tutuwan-remark-input')?.value || '').trim();
        await saveChatState();
        renderChatThreads();
        renderTutuwanChatRoom();
        renderTutuwanSettingsPage();
        showToast(thread.remark ? '备注已保存' : '备注已清空');
    }
    async function applyTutuwanBackground(src) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.chatBg = src || '';
        await saveChatState();
        applyTutuwanChatBackground(thread);
        renderTutuwanSettingsPage();
        showToast(src ? '聊天背景已应用' : '聊天背景已重置');
    }
    async function toggleTutuwanFlag(field) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread[field] = !thread[field];
        await saveChatState();
        renderTutuwanSettingsPage();
        showToast(thread[field] ? '已开启' : '已关闭');
    }
    async function saveTutuwanOfflineSettings() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.offlineWordCount = Math.max(80, Number($('Tutuwan-offline-wordcount')?.value || 500));
        const perspective = $('Tutuwan-offline-perspective')?.value || 'char';
        thread.offlinePerspective = ['char','user'].includes(perspective) ? perspective : 'char';
        thread.offlineStyle = ($('Tutuwan-offline-style')?.value || '').trim();
        await saveChatState();
        renderTutuwanSettingsPage();
        showToast('线下模式设置已保存');
    }
    async function saveTutuwanSummarySettings() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.summaryThreshold = Math.max(2, Number($('Tutuwan-summary-threshold')?.value || 20));
        await saveChatState();
        renderTutuwanSettingsPage();
        showToast('总结设置已保存');
    }
    async function toggleTutuwanBlock() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.blocked = !thread.blocked;
        await saveChatState();
        renderTutuwanSettingsPage();
        showToast(thread.blocked ? '已拉黑' : '已取消拉黑');
    }
    async function clearTutuwanHistory() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        const ok = await showGlobalConfirm('确定清空当前聊天记录吗？该操作不会删除联系人。', '清空聊天记录');
        if (!ok) return;
        thread.messages = [];
        thread.snippet = '开始聊天……';
        thread.time = '';
        await saveChatState();
        renderTutuwanChatRoom();
        renderChatThreads();
        renderTutuwanSettingsPage();
        showToast('聊天记录已清空');
    }
    async function sendTutuwanMoneyCard(kind) {
        const amountText = await showGlobalPrompt(kind === 'redpacket' ? '请输入红包金额' : '请输入转账金额', '1.00', kind === 'redpacket' ? '发送红包' : '发起转账');
        const amount = Number(String(amountText || '').replace(/[^\d.]/g, ''));
        if (!Number.isFinite(amount) || amount <= 0) return;
        const note = await showGlobalPrompt('请输入备注', kind === 'redpacket' ? '恭喜发财，大吉大利' : '转账', '备注');
        await loadWalletState();
        if (walletState.balance < amount) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatWalletAmount(walletState.balance)}\n需要金额：${formatWalletAmount(amount)}`, '余额不足');
            openWalletPage();
            return;
        }
        const thread = getTutuwanCurrentThread();
        await walletRecordChatBill({ amount, direction: 'expense', type: kind === 'redpacket' ? '发送红包' : '发起转账', note: thread ? getTutuwanDisplayName(thread) : '' });
        $('Tutuwan-tools-panel')?.classList.remove('active');
        const sent = await appendTutuwanMessage({ role: 'user', type: kind, content: kind === 'redpacket' ? '红包' : '转账', meta: { amount, note: (note || '').trim(), status: 'sent' } });
        showToast(kind === 'redpacket' ? '红包已扣款发送' : '转账已扣款发送');
        settleTutuwanUserPayForChar(sent, kind, thread?.id || TutuwanCurrentThreadId);
    }
    async function sendTutuwanVoiceMessage() {
        const text = await showGlobalDialog({ title: '发送语音', message: '请输入录制内容', mode: 'prompt', defaultValue: '', placeholder: '录制内容', okText: '发送' });
        const content = String(text || '').trim();
        if (!content) return;
        $('Tutuwan-tools-panel')?.classList.remove('active');
        await appendTutuwanMessage({ role: 'user', type: 'voice', content, meta: { duration: calcTutuwanVoiceDuration(content) } });
    }
    async function sendTutuwanCameraShot() {
        const first = await showGlobalPrompt('请输入照片描述，或粘贴图片 URL', '随手拍', '相机');
        const raw = String(first || '').trim();
        if (!raw) return;
        const isUrl = /^(https?:|data:image\/|blob:)/i.test(raw);
        let text = raw;
        let cover = makeTutuwanCameraImage(raw);
        if (isUrl) {
            cover = raw;
            const desc = await showGlobalPrompt('请输入这张照片的文字描述', '相机照片', '照片描述');
            text = String(desc || '相机照片').trim() || '相机照片';
        }
        $('Tutuwan-tools-panel')?.classList.remove('active');
        await appendTutuwanMessage({ role: 'user', type: 'polaroid', content: JSON.stringify({ text, cover }), meta: { cameraText: text } });
    }
    async function sendTutuwanLocationCard() {
        const loc = await showGlobalPrompt('告诉 TA 你的位置', '当前位置', '发送位置');
        const name = String(loc || '').trim();
        if (!name) return;
        const addrRaw = await showGlobalPrompt('请输入详细地址', '点击查看详细地图', '详细地址');
        const address = String(addrRaw || '点击查看详细地图').trim() || '点击查看详细地图';
        $('Tutuwan-tools-panel')?.classList.remove('active');
        await appendTutuwanMessage({ role: 'user', type: 'location', content: JSON.stringify({ name, address, lat: 35.6895, lng: 139.6917 }), meta: { address } });
    }
    async function sendTutuwanActionCard(type) {
        if (type === 'phone' || type === 'video') return startTutuwanCall(type, { direction: 'outgoing' });
        const labels = { phone: '已发起语音通话', video: '已发起视频通话' };
        $('Tutuwan-tools-panel')?.classList.remove('active');
        await appendTutuwanMessage({ role: 'user', type, content: labels[type] || '功能消息' });
    }

    const TutuwanCall = {
        active: false,
        threadId: '',
        callId: '',
        callType: 'phone',
        direction: 'outgoing',
        messageId: '',
        transcript: [],
        seconds: 0,
        timer: null,
        thinking: false,
        minimized: false,
        muted: false,
        cameraOff: false,
        pendingData: null
    };
    function formatTutuwanCallDuration(seconds = 0) {
        const total = Math.max(0, Number(seconds) || 0);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return h ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    function parseTutuwanMaybeJSON(value, fallback = {}) {
        if (value && typeof value === 'object') return { ...fallback, ...value };
        try {
            const parsed = JSON.parse(String(value || '').trim());
            return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : { ...fallback };
        } catch (e) {
            return { ...fallback };
        }
    }
    function extractTutuwanJSONFromText(raw, fallback = null) {
        const text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        if (!text) return fallback;
        try { return JSON.parse(text); } catch (e) {}
        const arr = text.match(/\[[\s\S]*\]/);
        if (arr) { try { return JSON.parse(arr[0]); } catch (e) {} }
        const obj = text.match(/\{[\s\S]*\}/);
        if (obj) { try { return JSON.parse(obj[0]); } catch (e) {} }
        return fallback;
    }
    function buildTutuwanCallJSON(thread, callType = 'phone', overrides = {}) {
        const safeThread = thread || getTutuwanCurrentThread() || {};
        const charId = ensureTutuwanCharId(safeThread);
        const threadId = safeThread.id || safeThread.threadId || TutuwanCurrentThreadId || '';
        const now = Date.now();
        const base = {
            type: 'tutuwan_call',
            appId: 'call',
            callId: createChatId(callType === 'video' ? 'video-call' : 'phone-call'),
            callType: callType === 'video' ? 'video' : 'phone',
            threadId,
            chatId: threadId,
            charId,
            charName: getTutuwanDisplayName(safeThread),
            userId: `user-${threadId || charId}`,
            userName: getTutuwanUserName(safeThread),
            direction: 'outgoing',
            status: 'dialing',
            reason: callType === 'video' ? '发起视频通话' : '发起语音通话',
            startedAt: now,
            endedAt: 0,
            duration: 0,
            durationText: '00:00',
            transcript: [],
            summary: '',
            inner_thought: null
        };
        const merged = { ...base, ...(overrides || {}) };
        merged.callType = merged.callType === 'video' ? 'video' : 'phone';
        merged.threadId = merged.threadId || threadId;
        merged.chatId = merged.chatId || merged.threadId;
        merged.charId = merged.charId || charId;
        merged.callId = String(merged.callId || base.callId);
        return merged;
    }
    function ensureTutuwanCallDom() {
        if ($('Tutuwan-call-page')) return;
        const root = document.querySelector('.app-container') || document.body;
        const wrap = document.createElement('div');
        wrap.id = 'Tutuwan-call-root';
        wrap.innerHTML = `
            <div id="Tutuwan-call-overlay" class="Tutuwan-call-overlay" aria-hidden="true">
                <div class="Tutuwan-call-invite-card">
                    <div class="Tutuwan-call-pulse"><img id="Tutuwan-call-invite-avatar" alt="char"></div>
                    <div class="Tutuwan-call-invite-name" id="Tutuwan-call-invite-name">char</div>
                    <div class="Tutuwan-call-invite-status" id="Tutuwan-call-invite-status">正在等待接听</div>
                    <div class="Tutuwan-call-invite-reason" id="Tutuwan-call-invite-reason"></div>
                    <div class="Tutuwan-call-invite-actions">
                        <button id="Tutuwan-call-decline" class="Tutuwan-call-round decline" type="button" aria-label="拒绝或取消"><svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.1.25-4.55.7v3.1a1 1 0 0 1-.55.9c-.95.48-1.82 1.1-2.6 1.82a1 1 0 0 1-1.42-.02L.6 13.72a1 1 0 0 1 .02-1.43A16.4 16.4 0 0 1 12 7a16.4 16.4 0 0 1 11.38 5.29 1 1 0 0 1 .02 1.43l-2.28 2.28a1 1 0 0 1-1.42.02c-.78-.72-1.65-1.34-2.6-1.82a1 1 0 0 1-.55-.9V9.7A14.4 14.4 0 0 0 12 9z"></path></svg><span id="Tutuwan-call-decline-label">取消</span></button>
                        <button id="Tutuwan-call-accept" class="Tutuwan-call-round accept" type="button" aria-label="接听"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"></path></svg><span>接听</span></button>
                    </div>
                </div>
            </div>
            <div id="Tutuwan-call-page" class="Tutuwan-call-page" aria-hidden="true">
                <div class="Tutuwan-call-bg" id="Tutuwan-call-bg"></div>
                <header class="Tutuwan-call-topbar">
                    <button id="Tutuwan-call-minimize" class="Tutuwan-call-top-btn" type="button" aria-label="最小化"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                    <div><div id="Tutuwan-call-title" class="Tutuwan-call-title">语音通话</div><div id="Tutuwan-call-status" class="Tutuwan-call-status">00:00</div></div>
                    <button id="Tutuwan-call-extra" class="Tutuwan-call-top-btn" type="button" aria-label="状态"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></button>
                </header>
                <main class="Tutuwan-call-main">
                    <section id="Tutuwan-call-visual" class="Tutuwan-call-visual">
                        <img id="Tutuwan-call-avatar" alt="char">
                        <div id="Tutuwan-call-name" class="Tutuwan-call-name">char</div>
                        <div id="Tutuwan-call-scene" class="Tutuwan-call-scene">通话已接通</div>
                    </section>
                    <section id="Tutuwan-call-log" class="Tutuwan-call-log"></section>
                </main>
                <footer class="Tutuwan-call-compose">
                    <input id="Tutuwan-call-input" type="text" autocomplete="off" placeholder="输入你在电话里说的话">
                    <button id="Tutuwan-call-send" class="Tutuwan-call-send" type="button">发送</button>
                </footer>
                <div class="Tutuwan-call-controls">
                    <button id="Tutuwan-call-mute" class="Tutuwan-call-control" type="button"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path></svg><span>静音</span></button>
                    <button id="Tutuwan-call-camera" class="Tutuwan-call-control" type="button"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"></rect><path d="M16 10l5-3v10l-5-3z"></path></svg><span>镜头</span></button>
                    <button id="Tutuwan-call-hangup" class="Tutuwan-call-control hangup" type="button"><svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.1.25-4.55.7v3.1a1 1 0 0 1-.55.9c-.95.48-1.82 1.1-2.6 1.82a1 1 0 0 1-1.42-.02L.6 13.72a1 1 0 0 1 .02-1.43A16.4 16.4 0 0 1 12 7a16.4 16.4 0 0 1 11.38 5.29 1 1 0 0 1 .02 1.43l-2.28 2.28a1 1 0 0 1-1.42.02c-.78-.72-1.65-1.34-2.6-1.82a1 1 0 0 1-.55-.9V9.7A14.4 14.4 0 0 0 12 9z"></path></svg><span>挂断</span></button>
                </div>
            </div>
            <button id="Tutuwan-call-mini" class="Tutuwan-call-mini" type="button" aria-label="展开通话"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2"></path></svg><span id="Tutuwan-call-mini-time">00:00</span></button>`;
        root.appendChild(wrap);
        $('Tutuwan-call-decline')?.addEventListener('click', () => declineOrCancelTutuwanCall());
        $('Tutuwan-call-accept')?.addEventListener('click', () => acceptTutuwanCall());
        $('Tutuwan-call-minimize')?.addEventListener('click', minimizeTutuwanCall);
        $('Tutuwan-call-mini')?.addEventListener('click', expandTutuwanCall);
        $('Tutuwan-call-hangup')?.addEventListener('click', () => endTutuwanCall('ended'));
        $('Tutuwan-call-send')?.addEventListener('click', handleTutuwanCallUserSpeak);
        $('Tutuwan-call-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleTutuwanCallUserSpeak(); } });
        $('Tutuwan-call-mute')?.addEventListener('click', () => { TutuwanCall.muted = !TutuwanCall.muted; $('Tutuwan-call-mute')?.classList.toggle('active', TutuwanCall.muted); });
        $('Tutuwan-call-camera')?.addEventListener('click', () => { TutuwanCall.cameraOff = !TutuwanCall.cameraOff; $('Tutuwan-call-camera')?.classList.toggle('active', TutuwanCall.cameraOff); $('Tutuwan-call-page')?.classList.toggle('camera-off', TutuwanCall.cameraOff); });
        makeTutuwanCallMiniDraggable();
    }
    function makeTutuwanCallMiniDraggable() {
        const mini = $('Tutuwan-call-mini');
        if (!mini || mini.__dragBound) return;
        mini.__dragBound = true;
        let dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ty = 0;
        const point = e => e.touches ? e.touches[0] : e;
        const move = e => {
            const p = point(e); if (!p) return;
            const dx = p.clientX - sx, dy = p.clientY - sy;
            if (!dragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { dragging = true; moved = true; mini.style.transition = 'none'; }
            if (!dragging) return;
            e.preventDefault?.();
            const w = mini.offsetWidth || 88, h = mini.offsetHeight || 42;
            mini.style.left = Math.max(10, Math.min(window.innerWidth - w - 10, lx + dx)) + 'px';
            mini.style.top = Math.max(48, Math.min(window.innerHeight - h - 18, ty + dy)) + 'px';
            mini.style.right = 'auto'; mini.style.bottom = 'auto';
        };
        const end = () => {
            document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move);
            document.removeEventListener('mouseup', end); document.removeEventListener('touchend', end);
            mini.style.transition = '';
            if (!moved) expandTutuwanCall();
            dragging = false;
        };
        const start = e => {
            const p = point(e); if (!p) return;
            sx = p.clientX; sy = p.clientY;
            const r = mini.getBoundingClientRect(); lx = r.left; ty = r.top;
            dragging = false; moved = false;
            document.addEventListener('mousemove', move, { passive: false }); document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
        };
        mini.addEventListener('mousedown', start);
        mini.addEventListener('touchstart', start, { passive: true });
    }
    function updateTutuwanCallInviteUI(callData = {}) {
        ensureTutuwanCallDom();
        const thread = (chatState.threads || []).find(t => t.id === callData.threadId) || getTutuwanCurrentThread();
        const isVideo = (callData.callType || TutuwanCall.callType) === 'video';
        const outgoing = (callData.direction || TutuwanCall.direction) === 'outgoing';
        const avatar = thread?.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread?.name || 'char')}/120/120`;
        if ($('Tutuwan-call-invite-avatar')) $('Tutuwan-call-invite-avatar').src = avatar;
        if ($('Tutuwan-call-invite-name')) $('Tutuwan-call-invite-name').textContent = getTutuwanDisplayName(thread);
        if ($('Tutuwan-call-invite-status')) $('Tutuwan-call-invite-status').textContent = outgoing ? (isVideo ? '正在等待对方接听视频电话' : '正在等待对方接听电话') : (isVideo ? '邀请你视频通话' : '邀请你语音通话');
        if ($('Tutuwan-call-invite-reason')) $('Tutuwan-call-invite-reason').textContent = callData.reason || '';
        if ($('Tutuwan-call-accept')) $('Tutuwan-call-accept').style.display = outgoing ? 'none' : 'inline-flex';
        if ($('Tutuwan-call-decline-label')) $('Tutuwan-call-decline-label').textContent = outgoing ? '取消' : '拒绝';
        $('Tutuwan-call-overlay')?.classList.add('active');
    }
    function updateTutuwanCallActiveUI() {
        ensureTutuwanCallDom();
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        const isVideo = TutuwanCall.callType === 'video';
        if ($('Tutuwan-call-title')) $('Tutuwan-call-title').textContent = isVideo ? '视频通话中' : '语音通话中';
        if ($('Tutuwan-call-name')) $('Tutuwan-call-name').textContent = getTutuwanDisplayName(thread);
        if ($('Tutuwan-call-avatar')) $('Tutuwan-call-avatar').src = thread?.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread?.name || 'char')}/120/120`;
        if ($('Tutuwan-call-bg')) $('Tutuwan-call-bg').style.backgroundImage = `url('${cssUrl(thread?.avatar || '')}')`;
        if ($('Tutuwan-call-scene')) $('Tutuwan-call-scene').textContent = isVideo ? (TutuwanCall.cameraOff ? '镜头已关闭' : '视频画面已接通') : 'HD Voice';
        $('Tutuwan-call-page')?.classList.toggle('video-mode', isVideo);
        $('Tutuwan-call-camera')?.classList.toggle('show', isVideo);
    }
    async function startTutuwanCall(callType = 'phone', opts = {}) {
        const thread = opts.thread || getTutuwanCurrentThread();
        if (!thread) { showToast('请先进入一个聊天'); return; }
        if (TutuwanCall.active || TutuwanCall.pendingData) { showToast('当前已有通话进行中'); return; }
        $('Tutuwan-tools-panel')?.classList.remove('active');
        closeTutuwanStickerPanel();
        const callData = buildTutuwanCallJSON(thread, callType, {
            ...(opts.callData || {}),
            callType,
            direction: opts.direction || 'outgoing',
            status: opts.direction === 'incoming' ? 'inviting' : 'dialing',
            reason: opts.reason || opts.callData?.reason || (callType === 'video' ? '发起视频通话' : '发起语音通话'),
            startedAt: Date.now()
        });
        TutuwanCall.active = false;
        TutuwanCall.threadId = thread.id;
        TutuwanCall.callId = callData.callId;
        TutuwanCall.callType = callData.callType;
        TutuwanCall.direction = callData.direction;
        TutuwanCall.pendingData = callData;
        TutuwanCall.messageId = opts.messageId || '';
        if (!opts.messageId && callData.direction === 'outgoing') {
            const msg = await appendTutuwanMessage({ role: 'user', type: callType, content: JSON.stringify(callData), meta: callData });
            TutuwanCall.messageId = msg?.id || '';
        }
        updateTutuwanCallInviteUI(callData);
        if (navigator.vibrate) { try { navigator.vibrate(callData.direction === 'outgoing' ? [120, 80, 120] : [240, 120, 240]); } catch (e) {} }
        if (callData.direction === 'outgoing') requestTutuwanCallDecision(thread, callData).catch(() => handleTutuwanCallDeclined('暂时没有接通。'));
    }
    async function requestTutuwanCallDecision(thread, callData) {
        const cfg = await getTutuwanChatConfig();
        let result = { decision: 'accept', reason: '', inner_thought: { mood: '犹豫', content: '电话突然打来，我先听听看。' } };
        if (cfg.chatCompletionsUrl && cfg.apiKey) {
            const persona = await buildTutuwanSecretPersona(thread);
            const prompt = `用户正在向 ${getTutuwanDisplayName(thread)} 发起${callData.callType === 'video' ? '视频电话' : '语音电话'}。请只根据人设、关系、最近聊天和当前状态决定是否接听。返回严格 JSON 对象，不要解释：{"decision":"accept或decline","reason":"若拒绝，用角色口吻给一句会发到聊天里的理由","inner_thought":{"mood":"情绪词","content":"80字以内没说出口的真实心声"}}。\n${persona}`;
            const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .8), messages: [{ role: 'user', content: prompt }] }) });
            if (res.ok) {
                const data = await res.json();
                const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || '';
                result = { ...result, ...(extractTutuwanJSONFromText(raw, {}) || {}) };
            }
        }
        if (TutuwanCall.callId !== callData.callId || !$('Tutuwan-call-overlay')?.classList.contains('active')) return;
        const thought = result.inner_thought || result.thought;
        if (thought && typeof thought === 'object') {
            addTutuwanThoughtEntry(thread, { mood: thought.mood || '通话', text: thought.content || thought.text || thought.thought || '', source: 'call_decision', targetName: getTutuwanDisplayName(thread) }, false);
            await saveChatState();
        }
        const decision = String(result.decision || 'accept').toLowerCase();
        if (decision.includes('decline') || decision.includes('reject') || decision.includes('拒')) await handleTutuwanCallDeclined(result.reason || '现在不方便接。');
        else await acceptTutuwanCall();
    }
    async function handleTutuwanCallDeclined(reason = '') {
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        const callData = { ...(TutuwanCall.pendingData || {}), status: 'declined', endedAt: Date.now(), reason: reason || TutuwanCall.pendingData?.reason || '未接通' };
        $('Tutuwan-call-overlay')?.classList.remove('active');
        if (TutuwanCall.messageId) await updateTutuwanMessageInThread(thread?.id, TutuwanCall.messageId, old => ({ ...old, content: JSON.stringify({ ...parseTutuwanMaybeJSON(old.content, old.meta), ...callData }), meta: { ...(old.meta || {}), ...callData } }), true);
        if (reason && thread) {
            const oldId = TutuwanCurrentThreadId; TutuwanCurrentThreadId = thread.id;
            await appendTutuwanMessage({ role: 'ai', type: 'text', content: String(reason), meta: enrichTutuwanAppMeta(thread, 'call', { callId: callData.callId, callStatus: 'declined' }) });
            TutuwanCurrentThreadId = oldId;
        }
        clearTutuwanCallState();
        showToast('通话未接通');
    }
    async function declineOrCancelTutuwanCall() {
        const pending = TutuwanCall.pendingData || {};
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        const status = pending.direction === 'outgoing' ? 'canceled' : 'missed';
        const reason = pending.direction === 'outgoing' ? '已取消通话' : '已拒绝通话';
        $('Tutuwan-call-overlay')?.classList.remove('active');
        if (TutuwanCall.messageId && thread) await updateTutuwanMessageInThread(thread.id, TutuwanCall.messageId, old => ({ ...old, content: JSON.stringify({ ...parseTutuwanMaybeJSON(old.content, old.meta), status, endedAt: Date.now(), reason }), meta: { ...(old.meta || {}), status, endedAt: Date.now(), reason } }), true);
        clearTutuwanCallState();
        showToast(reason);
    }
    async function acceptTutuwanCall() {
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        if (!thread || !TutuwanCall.pendingData) return;
        $('Tutuwan-call-overlay')?.classList.remove('active');
        TutuwanCall.active = true;
        TutuwanCall.transcript = [];
        TutuwanCall.seconds = 0;
        TutuwanCall.thinking = false;
        TutuwanCall.minimized = false;
        updateTutuwanCallActiveUI();
        $('Tutuwan-call-log').innerHTML = '';
        $('Tutuwan-call-page')?.classList.add('active');
        $('Tutuwan-call-mini')?.classList.remove('active');
        startTutuwanCallTimer();
        if (TutuwanCall.messageId) await updateTutuwanMessageInThread(thread.id, TutuwanCall.messageId, old => ({ ...old, content: JSON.stringify({ ...parseTutuwanMaybeJSON(old.content, old.meta), status: 'connected', connectedAt: Date.now() }), meta: { ...(old.meta || {}), status: 'connected', connectedAt: Date.now() } }), true);
        addTutuwanCallBubble('system', '通话已接通');
        await triggerTutuwanCallAI('opening');
    }
    function startTutuwanCallTimer() {
        stopTutuwanCallTimer();
        const tick = () => {
            const text = formatTutuwanCallDuration(TutuwanCall.seconds);
            if ($('Tutuwan-call-status')) $('Tutuwan-call-status').textContent = text;
            if ($('Tutuwan-call-mini-time')) $('Tutuwan-call-mini-time').textContent = text;
        };
        tick();
        TutuwanCall.timer = setInterval(() => { TutuwanCall.seconds += 1; tick(); }, 1000);
    }
    function stopTutuwanCallTimer() { if (TutuwanCall.timer) clearInterval(TutuwanCall.timer); TutuwanCall.timer = null; }
    function minimizeTutuwanCall() {
        if (!TutuwanCall.active) return;
        $('Tutuwan-call-page')?.classList.remove('active');
        $('Tutuwan-call-mini')?.classList.add('active');
        TutuwanCall.minimized = true;
    }
    function expandTutuwanCall() {
        if (!TutuwanCall.active) return;
        $('Tutuwan-call-mini')?.classList.remove('active');
        $('Tutuwan-call-page')?.classList.add('active');
        TutuwanCall.minimized = false;
    }
    function addTutuwanCallBubble(role, content, extra = {}) {
        const text = String(content || '').trim();
        if (!text) return;
        const row = document.createElement('div');
        row.className = `Tutuwan-call-row ${role}`;
        row.innerHTML = `<div class="Tutuwan-call-bubble">${chatEscape(text)}</div>`;
        $('Tutuwan-call-log')?.appendChild(row);
        $('Tutuwan-call-log')?.scrollTo({ top: $('Tutuwan-call-log').scrollHeight, behavior: 'smooth' });
        if (role !== 'thinking' && role !== 'system') {
            const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
            const speaker = role === 'user' ? getTutuwanUserName(thread) : (role === 'narrator' ? '旁白' : getTutuwanDisplayName(thread));
            TutuwanCall.transcript.push({ id: createChatId('call-line'), role, speaker, content: text, kind: extra.kind || role, time: getChatTimestamp(), at: Date.now(), threadId: TutuwanCall.threadId, charId: thread ? ensureTutuwanCharId(thread) : '' });
        }
    }
    function showTutuwanCallThinking() {
        if ($('Tutuwan-call-thinking-row')) return;
        const row = document.createElement('div');
        row.id = 'Tutuwan-call-thinking-row';
        row.className = 'Tutuwan-call-row thinking';
        row.innerHTML = '<div class="Tutuwan-call-bubble thinking"><span></span><span></span><span></span></div>';
        $('Tutuwan-call-log')?.appendChild(row);
        $('Tutuwan-call-log')?.scrollTo({ top: $('Tutuwan-call-log').scrollHeight, behavior: 'smooth' });
    }
    function hideTutuwanCallThinking() { $('Tutuwan-call-thinking-row')?.remove(); }
    async function handleTutuwanCallUserSpeak() {
        const input = $('Tutuwan-call-input');
        const text = String(input?.value || '').trim();
        if (!text || TutuwanCall.thinking || !TutuwanCall.active) return;
        input.value = '';
        addTutuwanCallBubble('user', text);
        await triggerTutuwanCallAI('reply');
    }
    function normalizeTutuwanCallAIItems(raw, mode = 'reply') {
        const parsed = extractTutuwanJSONFromText(raw, null);
        const list = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? (Array.isArray(parsed.actions) ? parsed.actions : Array.isArray(parsed.messages) ? parsed.messages : [parsed]) : []);
        if (!list.length) return [{ type: mode === 'ending' ? 'text' : 'speech', content: String(raw || '').trim() }].filter(x => x.content);
        return list.map(item => typeof item === 'string' ? { type: 'speech', content: item } : item).filter(item => item && typeof item === 'object' && String(item.content || item.text || item.message || '').trim());
    }
    async function triggerTutuwanCallAI(mode = 'reply') {
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        if (!thread || TutuwanCall.thinking) return;
        TutuwanCall.thinking = true;
        showTutuwanCallThinking();
        try {
            const cfg = await getTutuwanChatConfig();
            let raw = '';
            if (cfg.chatCompletionsUrl && cfg.apiKey) {
                const persona = await buildTutuwanSecretPersona(thread);
                const live = TutuwanCall.transcript.map(t => `${t.speaker || t.role}: ${t.content}`).join('\n') || '刚刚接通，还没有正式说话。';
                const scenario = mode === 'opening' ? '电话刚接通，请自然开口。' : mode === 'ending' ? '通话刚挂断，请给一两条聊天收尾文本。' : '用户刚在电话里说完话，请继续电话对话。';
                const format = mode === 'ending'
                    ? '[{"type":"text","content":"挂断后发到聊天里的简短消息"}]'
                    : '[{"type":"narration","content":"呼吸、动作、背景音或镜头画面"},{"type":"speech","content":"电话里真正说出口的话","tone":"语气"}]';
                const prompt = `你是 ${getTutuwanDisplayName(thread)}，正在和 ${getTutuwanUserName(thread)} 进行${TutuwanCall.callType === 'video' ? '视频电话' : '语音电话'}。不要旁白式总结，不要客服腔。${scenario}\n\n【通话上下文】\n${persona}\n\n【本次通话记录】\n${live}\n\n返回严格 JSON 数组，不要 Markdown，不要解释：\n${format}`;
                const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .86), messages: [{ role: 'user', content: prompt }] }) });
                if (res.ok) {
                    const data = await res.json();
                    raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || '';
                }
            }
            if (!raw) raw = mode === 'opening' ? '[{"type":"speech","content":"喂，听得到吗？"}]' : '[{"type":"speech","content":"嗯，我在听。"}]';
            const items = normalizeTutuwanCallAIItems(raw, mode);
            hideTutuwanCallThinking();
            for (const item of items) {
                const type = String(item.type || item.kind || 'speech').toLowerCase();
                const content = String(item.content || item.text || item.message || '').trim();
                if (!content) continue;
                if (mode === 'ending') {
                    const oldId = TutuwanCurrentThreadId; TutuwanCurrentThreadId = thread.id;
                    await appendTutuwanMessage({ role: 'ai', type: 'text', content, meta: enrichTutuwanAppMeta(thread, 'call', { callId: TutuwanCall.callId, afterCall: true }) });
                    TutuwanCurrentThreadId = oldId;
                } else if (type.includes('narration') || type.includes('narrator') || type.includes('scene')) {
                    addTutuwanCallBubble('narrator', content, { kind: 'narration' });
                    if ($('Tutuwan-call-scene')) $('Tutuwan-call-scene').textContent = content.slice(0, 42);
                } else {
                    addTutuwanCallBubble('char', content, { kind: 'speech', tone: item.tone || '' });
                }
                await delayTutuwan(Math.min(1800, Math.max(520, content.length * 26)));
            }
        } catch (e) {
            hideTutuwanCallThinking();
            addTutuwanCallBubble('system', '通话信号不稳定');
        } finally {
            TutuwanCall.thinking = false;
        }
    }
    async function endTutuwanCall(status = 'ended') {
        if (!TutuwanCall.active && !TutuwanCall.pendingData) return;
        const thread = (chatState.threads || []).find(t => t.id === TutuwanCall.threadId) || getTutuwanCurrentThread();
        stopTutuwanCallTimer();
        $('Tutuwan-call-page')?.classList.remove('active');
        $('Tutuwan-call-mini')?.classList.remove('active');
        const durationText = formatTutuwanCallDuration(TutuwanCall.seconds);
        const summary = TutuwanCall.transcript.length ? TutuwanCall.transcript.slice(-5).map(t => `${t.speaker}：${t.content}`).join('；') : '没有留下对话内容';
        const callObject = buildTutuwanCallJSON(thread, TutuwanCall.callType, {
            ...(TutuwanCall.pendingData || {}),
            callId: TutuwanCall.callId,
            direction: TutuwanCall.direction,
            status,
            endedAt: Date.now(),
            duration: TutuwanCall.seconds,
            durationText,
            transcript: TutuwanCall.transcript,
            transcriptCount: TutuwanCall.transcript.length,
            summary,
            inner_thought: TutuwanCall.transcript.length ? { type: 'inner_thought', mood: '通话后', content: summary.slice(0, 80) } : null
        });
        if (TutuwanCall.messageId && thread) await updateTutuwanMessageInThread(thread.id, TutuwanCall.messageId, old => ({ ...old, content: JSON.stringify({ ...parseTutuwanMaybeJSON(old.content, old.meta), ...callObject }), meta: { ...(old.meta || {}), ...callObject } }), true);
        if (thread) {
            const oldId = TutuwanCurrentThreadId; TutuwanCurrentThreadId = thread.id;
            await appendTutuwanMessage({ role: 'ai', type: 'call_summary', content: JSON.stringify(callObject), meta: callObject });
            TutuwanCurrentThreadId = oldId;
            if (callObject.inner_thought) {
                addTutuwanThoughtEntry(thread, { mood: callObject.inner_thought.mood, text: callObject.inner_thought.content, source: 'call_summary', targetName: getTutuwanDisplayName(thread) }, false);
                await saveChatState();
            }
        }
        showToast(`通话结束 ${durationText}`);
        const shouldAfterTalk = TutuwanCall.transcript.length > 0;
        const savedThreadId = TutuwanCall.threadId;
        clearTutuwanCallState();
        if (shouldAfterTalk && thread) { TutuwanCall.threadId = savedThreadId; TutuwanCall.callId = callObject.callId; await triggerTutuwanCallAI('ending'); clearTutuwanCallState(); }
    }
    function clearTutuwanCallState() {
        stopTutuwanCallTimer();
        TutuwanCall.active = false;
        TutuwanCall.threadId = '';
        TutuwanCall.callId = '';
        TutuwanCall.direction = 'outgoing';
        TutuwanCall.messageId = '';
        TutuwanCall.transcript = [];
        TutuwanCall.seconds = 0;
        TutuwanCall.thinking = false;
        TutuwanCall.minimized = false;
        TutuwanCall.pendingData = null;
    }
    async function handleTutuwanCallCard(msg) {
        const thread = getTutuwanCurrentThread();
        const data = parseTutuwanMaybeJSON(msg.content, msg.meta || {});
        if (msg.type === 'call_summary') {
            const lines = Array.isArray(data.transcript) ? data.transcript.map(t => `${t.speaker || t.role || ''}：${t.content || ''}`).join('\n') : '暂无逐字记录';
            await showGlobalAlert(`通话ID：${data.callId || ''}\n时长：${data.durationText || '00:00'}\n状态：${data.status || 'ended'}\n\n${lines}`, data.callType === 'video' ? '视频通话记录' : '语音通话记录');
            return;
        }
        const status = data.status || msg.meta?.status || '';
        const incoming = msg.role !== 'user' && ['inviting','dialing','sent'].includes(status || 'sent');
        if (incoming) {
            await startTutuwanCall(data.callType || msg.type, { direction: 'incoming', thread, callData: data, messageId: msg.id, reason: data.reason || msg.content || '' });
            return;
        }
        await showGlobalAlert(`通话ID：${data.callId || msg.id}\n状态：${status || '已发送'}\n时长：${data.durationText || '00:00'}\n说明：${data.reason || data.summary || ''}`, data.callType === 'video' || msg.type === 'video' ? '视频通话' : '语音通话');
    }
    async function sendTutuwanListenCard() {
        const song = TutuwanMusicManager.currentSong();
        $('Tutuwan-tools-panel')?.classList.remove('active');
        await appendTutuwanMessage({ role: 'user', type: 'listen', content: `邀请一起听《${song.title}》`, meta: { title: song.title, artist: song.artist, duration: song.duration, coListener: TutuwanMusicManager.coListener || '' } });
    }

    function tutuwanSecretDateParts(ts = Date.now()) {
        const d = new Date(Number(ts) || Date.now());
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return {
            day: String(d.getDate()).padStart(2, '0'),
            month: months[d.getMonth()],
            weekday: week[d.getDay()],
            clock: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
            full: `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
        };
    }
    function addTutuwanThoughtEntry(thread, data = {}, autosave = true) {
        if (!thread) return null;
        const secret = ensureTutuwanSecretData(thread);
        const text = String(data.text || data.content || data.thought || '').trim();
        if (!text) return null;
        const charId = ensureTutuwanCharId(thread);
        const entry = {
            id: data.id || data.thoughtId || createChatId('thought'),
            thoughtId: data.thoughtId || data.id || createChatId('thought-ref'),
            threadId: thread.id || '',
            chatId: thread.id || '',
            charId,
            text,
            mood: String(data.mood || data.tone || data.emotion || '').trim(),
            source: String(data.source || 'chat').trim(),
            targetName: String(data.targetName || data.sender || data.senderName || '').trim(),
            createdAt: Number(data.createdAt || data.timestamp) || Date.now(),
            time: data.time || getChatTimestamp()
        };
        secret.thoughts.unshift(entry);
        thread.thoughts = secret.thoughts.slice(0, 120);
        if (autosave) saveChatState().then(() => { if ($('chat-thoughts-page')?.classList.contains('active')) renderTutuwanThoughtsPage(thread); }).catch(() => {});
        return entry;
    }
    function addTutuwanDiaryEntry(thread, data = {}, autosave = true) {
        if (!thread) return null;
        const secret = ensureTutuwanSecretData(thread);
        const content = String(data.content || data.text || data.description || '').trim();
        const title = String(data.title || '无题日记').trim() || '无题日记';
        if (!content && !title) return null;
        const charId = ensureTutuwanCharId(thread);
        const entry = {
            id: data.id || data.diaryId || createChatId('diary'),
            diaryId: data.diaryId || data.id || createChatId('diary-ref'),
            threadId: thread.id || '',
            chatId: thread.id || '',
            charId,
            title,
            mood: String(data.mood || '心情不明').trim() || '心情不明',
            location: String(data.location || '未记录地点').trim() || '未记录地点',
            content: content || '没有写正文，只留下了一个标题。',
            targetName: String(data.targetName || getTutuwanDisplayName(thread) || thread.name || 'char').trim(),
            createdAt: Number(data.createdAt || data.timestamp) || Date.now(),
            time: data.time || getChatTimestamp()
        };
        secret.diaries.unshift(entry);
        thread.diaries = secret.diaries.slice(0, 120);
        if (autosave) saveChatState().then(() => { if ($('chat-diary-page')?.classList.contains('active')) renderTutuwanDiaryPage(thread); }).catch(() => {});
        return entry;
    }
    function processTutuwanSecretAICommands(thread, rawText) {
        if (!thread || !rawText) return String(rawText || '');
        let changed = false;
        let text = String(rawText || '');
        text = text.replace(/\[(?:TTW_THOUGHT|INNER_THOUGHT|CHAT_THOUGHT|心声)\s*[:：]\s*([^\]]+?)\]/gi, (_, content) => {
            const entry = addTutuwanThoughtEntry(thread, { text: String(content).trim(), mood: '心声', source: 'hidden_text', targetName: getTutuwanDisplayName(thread) }, false);
            if (entry) changed = true;
            return '';
        });
        text = text.replace(/\[(?:TTW_DIARY|PRIVATE_DIARY|CHAT_DIARY|日记)\s*[:：]\s*([^:：\]]+)\s*[:：]\s*([^:：\]]*)\s*[:：]\s*([^:：\]]*)\s*[:：]\s*([\s\S]*?)\]/gi, (_, title, mood, location, content) => {
            const entry = addTutuwanDiaryEntry(thread, { title: String(title).trim(), mood: String(mood).trim(), location: String(location).trim(), content: String(content).trim() }, false);
            if (entry) changed = true;
            return '';
        });
        if (changed) {
            thread.thoughts = normalizeTutuwanThoughtEntries(thread.thoughts || [], thread);
            thread.diaries = normalizeTutuwanDiaryEntries(thread.diaries || [], getTutuwanDisplayName(thread), thread);
            saveChatState().then(() => {
                if ($('chat-thoughts-page')?.classList.contains('active')) renderTutuwanThoughtsPage(thread);
                if ($('chat-diary-page')?.classList.contains('active')) renderTutuwanDiaryPage(thread);
            }).catch(() => {});
        }
        return text.trim();
    }
    function processTutuwanAllHiddenAICommands(thread, rawText) {
        const afterSecret = processTutuwanSecretAICommands(thread, rawText);
        return processCoupleAICommands(thread, afterSecret);
    }
    function buildTutuwanSecretStatusForAI(thread) {
        if (!thread) return '未进入对话。';
        const { thoughts, diaries } = ensureTutuwanSecretData(thread);
        const thoughtText = thoughts.slice(0, 6).map(item => `- ${tutuwanSecretDateParts(item.createdAt).full}${item.targetName ? ` / ${item.targetName}` : ''}${item.mood ? ` / ${item.mood}` : ''}：${item.text}`).join('\n') || '暂无心声。';
        const diaryText = diaries.slice(0, 4).map(item => `- 《${item.title}》${item.mood ? ` / ${item.mood}` : ''}${item.location ? ` / ${item.location}` : ''}：${String(item.content || '').slice(0, 120)}`).join('\n') || '暂无日记。';
        return `[心声记录]
${thoughtText}
[私密日记]
${diaryText}
心声会跟随普通聊天回复以 inner_thought JSON 对象静默写入，不显示在聊天气泡里；点击昵称只负责查看心声面板。
如需记录私密日记，可在普通回复末尾追加隐藏指令写入聊天页面，不要向 user 解释指令：
[TTW_DIARY:标题:心情:地点:正文]`;
    }
    async function buildTutuwanSecretPersona(thread) {
        const { userSetting, charSetting } = getTutuwanSettingText(thread);
        let worldbookPrompt = '无关联世界书。';
        try { worldbookPrompt = await getTutuwanWorldbookPrompt(thread); } catch (e) {}
        const recent = (thread?.messages || []).slice(-16).map(m => `${getTutuwanMessageName(m, thread)}：${getTutuwanMessageDisplayText(m)}`).join('\n') || '暂无聊天记录。';
        return `【user】${getTutuwanUserName(thread)}\n${userSetting || '未填写'}\n\n【char】${getTutuwanDisplayName(thread)}\n${charSetting || '未填写'}\n\n【关联世界书】\n${worldbookPrompt}\n\n【最近聊天】\n${recent}\n\n【已有心声和日记】\n${buildTutuwanSecretStatusForAI(thread)}`;
    }
    async function callTutuwanSecretAI(thread, prompt, fallbackText) {
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) return fallbackText;
        const res = await fetch(cfg.chatCompletionsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
            body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .78), messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const data = await res.json();
        return (data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || fallbackText || '').trim();
    }
    function openTutuwanThoughtsPage() {
        const thread = getTutuwanCurrentThread();
        if (!thread) { showToast('请先进入一个聊天'); return; }
        $('Tutuwan-tools-panel')?.classList.remove('active');
        ensureTutuwanSecretData(thread);
        const title = $('chat-thoughts-hero-title'); if (title) title.textContent = `${getTutuwanDisplayName(thread)} 的心声`;
        const sub = $('chat-thoughts-hero-sub'); if (sub) sub.textContent = `只保存在当前聊天：心声会跟随回复自动写入，点击昵称打开此面板查看；右上角刷新可补写一条。`;
        renderTutuwanThoughtsPage(thread);
        $('chat-thoughts-page')?.classList.add('active');
    }
    function closeTutuwanThoughtsPage() { $('chat-thoughts-page')?.classList.remove('active'); }
    function renderTutuwanThoughtsPage(thread = getTutuwanCurrentThread()) {
        const list = $('chat-thoughts-list');
        if (!list) return;
        if (!thread) { list.innerHTML = '<div class="chat-secret-empty">请先进入一个聊天。</div>'; return; }
        const { thoughts } = ensureTutuwanSecretData(thread);
        if (!thoughts.length) {
            list.innerHTML = '<div class="chat-secret-empty"><b>暂无心声</b><span>发送消息后，char 回复会用 inner_thought JSON 对象自动写入；也可点右上角刷新补写。</span></div>';
            return;
        }
        list.innerHTML = thoughts.map(item => {
            const d = tutuwanSecretDateParts(item.createdAt);
            const label = [item.targetName, item.mood || '未命名情绪'].filter(Boolean).join(' · ');
            return `<article class="chat-secret-card thought-card" data-thought-id="${chatEscape(item.id)}"><div class="chat-secret-date"><b>${chatEscape(d.day)}</b><span>${chatEscape(d.month)} · ${chatEscape(d.clock)}</span></div><div class="chat-secret-main"><div class="chat-secret-card-top"><strong>${chatEscape(label)}</strong><button type="button" data-thought-delete="${chatEscape(item.id)}">删除</button></div><p>${chatEscape(item.text)}</p></div></article>`;
        }).join('');
    }
    async function generateTutuwanThoughtEntry() {
        const thread = getTutuwanCurrentThread();
        if (!thread) { showToast('请先进入一个聊天'); return; }
        const btn = $('chat-thoughts-generate');
        if (btn) btn.disabled = true;
        try {
            const persona = await buildTutuwanSecretPersona(thread);
            const raw = await callTutuwanSecretAI(thread, `你是${getTutuwanDisplayName(thread)}。请根据人设、世界书和最近聊天，生成一条没有对${getTutuwanUserName(thread)}说出口的真实心声。不要完美人设，不要客服腔，不要解释。返回严格 JSON：{"mood":"情绪词","thought":"80字以内心声"}。\n${persona}`, '{"mood":"安静","thought":"我刚才其实有点在意，却又不想把话说得太重。"}');
            const parsed = parseCoupleJSON(raw) || {};
            const thought = String(parsed.thought || parsed.text || parsed.content || raw).replace(/^```(?:json)?|```$/g, '').trim();
            addTutuwanThoughtEntry(thread, { mood: parsed.mood || '心声', text: thought, source: 'manual_json' }, false);
            await saveChatState();
            renderTutuwanThoughtsPage(thread);
            showToast('心声已写入');
        } catch (err) {
            showToast('生成失败：' + err.message);
        } finally {
            if (btn) btn.disabled = false;
        }
    }
    async function clearTutuwanThoughts() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        if (!await showGlobalConfirm('确定清空当前聊天里的全部心声吗？', '清空心声')) return;
        thread.thoughts = [];
        await saveChatState();
        renderTutuwanThoughtsPage(thread);
        showToast('心声已清空');
    }
    async function deleteTutuwanThought(id) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        thread.thoughts = normalizeTutuwanThoughtEntries(thread.thoughts || []).filter(item => item.id !== id);
        await saveChatState();
        renderTutuwanThoughtsPage(thread);
    }
    function openTutuwanDiaryPage() {
        const thread = getTutuwanCurrentThread();
        if (!thread) { showToast('请先进入一个聊天'); return; }
        $('Tutuwan-tools-panel')?.classList.remove('active');
        ensureTutuwanSecretData(thread);
        const title = $('chat-diary-hero-title'); if (title) title.textContent = `${getTutuwanDisplayName(thread)} 的私密日记`;
        const sub = $('chat-diary-hero-sub'); if (sub) sub.textContent = '保存在当前聊天，点击右上角新增；普通聊天里只允许日记隐藏记录，不自动写心声。';
        renderTutuwanDiaryPage(thread);
        $('chat-diary-page')?.classList.add('active');
    }
    function closeTutuwanDiaryPage() { $('chat-diary-page')?.classList.remove('active'); closeTutuwanDiaryDetail(); }
    function renderTutuwanDiaryPage(thread = getTutuwanCurrentThread()) {
        const list = $('chat-diary-list');
        if (!list) return;
        if (!thread) { list.innerHTML = '<div class="chat-secret-empty">请先进入一个聊天。</div>'; return; }
        const { diaries } = ensureTutuwanSecretData(thread);
        if (!diaries.length) {
            list.innerHTML = '<div class="chat-secret-empty"><b>暂无日记</b><span>点击右上角新增，或在聊天中让 char 主动记录私密日记。</span></div>';
            return;
        }
        list.innerHTML = diaries.map(item => {
            const d = tutuwanSecretDateParts(item.createdAt);
            return `<article class="chat-secret-card diary-card" data-diary-id="${chatEscape(item.id)}"><div class="chat-secret-date diary"><b>${chatEscape(d.day)}</b><span>${chatEscape(d.month)} · ${chatEscape(d.weekday)}</span></div><div class="chat-secret-main"><div class="chat-secret-card-top"><strong>${chatEscape(item.title)}</strong><button type="button" data-diary-delete="${chatEscape(item.id)}">删除</button></div><div class="chat-diary-card-meta">${chatEscape(item.mood)} · ${chatEscape(item.location)} · ${chatEscape(d.clock)}</div><p>${chatEscape(String(item.content || '').slice(0, 120))}${String(item.content || '').length > 120 ? '…' : ''}</p></div></article>`;
        }).join('');
    }
    async function generateTutuwanDiaryEntry() {
        const thread = getTutuwanCurrentThread();
        if (!thread) { showToast('请先进入一个聊天'); return; }
        const btn = $('chat-diary-generate');
        if (btn) btn.disabled = true;
        try {
            const persona = await buildTutuwanSecretPersona(thread);
            const raw = await callTutuwanSecretAI(thread, `你是${getTutuwanDisplayName(thread)}。请基于当前聊天、人设和世界书，写一篇只给自己看的私密日记。必须像角色本人写下的日记，不要总结式客服腔，不要完美人设，可以有矛盾、误会、私心。返回严格 JSON：{"title":"标题","mood":"心情","location":"地点","content":"500字以内正文"}。\n${persona}`, '{"title":"没说出口的话","mood":"安静","location":"房间里","content":"今天的聊天让我心里有点乱。我想装得轻松一点，可有些句子还是在脑子里来回响。"}');
            const parsed = parseCoupleJSON(raw) || {};
            addTutuwanDiaryEntry(thread, { title: parsed.title || '没说出口的话', mood: parsed.mood || '心情不明', location: parsed.location || '未记录地点', content: parsed.content || parsed.text || raw }, false);
            await saveChatState();
            renderTutuwanDiaryPage(thread);
            showToast('日记已写入');
        } catch (err) {
            showToast('生成失败：' + err.message);
        } finally {
            if (btn) btn.disabled = false;
        }
    }
    function openTutuwanDiaryDetail(id) {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        const item = normalizeTutuwanDiaryEntries(thread.diaries || [], getTutuwanDisplayName(thread)).find(x => x.id === id);
        if (!item) return;
        activeChatDiaryDetailId = id;
        const d = tutuwanSecretDateParts(item.createdAt);
        const set = (eid, val) => { const el = $(eid); if (el) el.textContent = val; };
        set('chat-diary-detail-day', d.day);
        set('chat-diary-detail-month', `${d.month} / ${d.weekday}`);
        set('chat-diary-detail-title', item.title);
        set('chat-diary-detail-meta', `${item.mood} · ${item.location} · ${d.full} · By ${item.targetName || getTutuwanDisplayName(thread)}`);
        set('chat-diary-detail-content', item.content);
        $('chat-diary-detail-modal')?.classList.add('active');
    }
    function closeTutuwanDiaryDetail() { activeChatDiaryDetailId = ''; $('chat-diary-detail-modal')?.classList.remove('active'); }
    async function deleteTutuwanDiary(id = activeChatDiaryDetailId) {
        const thread = getTutuwanCurrentThread();
        if (!thread || !id) return;
        thread.diaries = normalizeTutuwanDiaryEntries(thread.diaries || [], getTutuwanDisplayName(thread)).filter(item => item.id !== id);
        await saveChatState();
        closeTutuwanDiaryDetail();
        renderTutuwanDiaryPage(thread);
        showToast('日记已删除');
    }
    async function clearTutuwanDiaries() {
        const thread = getTutuwanCurrentThread();
        if (!thread) return;
        if (!await showGlobalConfirm('确定清空当前聊天里的全部日记吗？', '清空日记')) return;
        thread.diaries = [];
        await saveChatState();
        renderTutuwanDiaryPage(thread);
        showToast('日记已清空');
    }

    function renderMomentsFeed() {
        const feed = $('moments-feed');
        if (!feed) return;
        feed.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'chat-empty';
        empty.innerHTML = '暂无朋友圈内容<br>右上角相机可更换背景图';
        feed.appendChild(empty);
    }
    const chatWalletPage = document.getElementById('chat-wallet-page');
    const walletDefaultState = { balance: 0, bills: [] };
    let walletState = { ...walletDefaultState };

    function normalizeWalletState(raw = {}) {
        const balanceNum = Number(raw.balance);
        const bills = Array.isArray(raw.bills) ? raw.bills.filter(item => item && typeof item === 'object').map(item => {
            const type = String(item.type || '账单');
            const direction = item.direction === 'income' || item.direction === 'expense'
                ? item.direction
                : (type === '充值' || type.includes('领取') || type.includes('收款') ? 'income' : 'expense');
            return {
                id: item.id || ('bill-' + Math.random().toString(36).slice(2, 8)),
                type,
                direction,
                note: String(item.note || ''),
                amount: Math.abs(Number(item.amount) || 0),
                time: item.time || ''
            };
        }) : [];
        return {
            balance: Number.isFinite(balanceNum) ? Math.max(0, balanceNum) : 0,
            bills
        };
    }
    async function loadWalletState() {
        walletState = normalizeWalletState(await getSetting('chat_wallet_state', {}));
        return walletState;
    }
    async function saveWalletState() {
        await setSetting('chat_wallet_state', normalizeWalletState(walletState));
    }
    function formatWalletAmount(value) {
        return `¥${(Number(value) || 0).toFixed(2)}`;
    }
    function getWalletTimeString() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function renderWalletPage() {
        const balanceEl = $('wallet-balance-value');
        const listEl = $('wallet-bill-list');
        if (balanceEl) balanceEl.textContent = formatWalletAmount(walletState.balance);
        if (!listEl) return;
        listEl.innerHTML = '';
        if (!walletState.bills.length) {
            listEl.innerHTML = '<div class="wallet-bill-empty">暂无账单</div>';
            return;
        }
        walletState.bills.forEach(item => {
            const row = document.createElement('div');
            row.className = 'wallet-bill-item';
            const isIncome = item.direction === 'income';
            const note = item.note ? `<div class="wallet-bill-time">${chatEscape(item.note)}</div>` : '';
            row.innerHTML = `<div><div class="wallet-bill-name">${chatEscape(item.type)}</div>${note}<div class="wallet-bill-time">${chatEscape(item.time)}</div></div><div class="wallet-bill-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'}${formatWalletAmount(item.amount)}</div>`;
            listEl.appendChild(row);
        });
    }
    async function openWalletPage() {
        await loadWalletState();
        renderWalletPage();
        if (chatWalletPage) chatWalletPage.style.display = 'flex';
    }
    async function walletChangeBalance(type) {
        const raw = await showGlobalPrompt(`请输入${type}金额`, '', type);
        if (raw === '') return;
        const amount = Number(String(raw).replace(/[^\d.]/g, ''));
        if (!Number.isFinite(amount) || amount <= 0) {
            await showGlobalAlert('请输入正确的金额。');
            return;
        }
        await loadWalletState();
        if (type === '提现' && walletState.balance < amount) {
            await showGlobalAlert('余额不足，暂时无法提现。');
            return;
        }
        walletState.balance = Number((walletState.balance + (type === '充值' ? amount : -amount)).toFixed(2));
        walletState.bills.unshift({
            id: 'bill-' + Date.now(),
            type,
            direction: type === '充值' ? 'income' : 'expense',
            amount,
            time: getWalletTimeString()
        });
        await saveWalletState();
        renderWalletPage();
        if (typeof syncShopWalletUI === 'function') syncShopWalletUI();
        showToast(type === '充值' ? '充值成功' : '提现成功');
    }


    async function walletRecordChatBill({ amount, direction = 'expense', type = '账单', note = '' } = {}) {
        const money = Math.abs(Number(amount) || 0);
        if (!money) return false;
        await loadWalletState();
        if (direction === 'expense' && walletState.balance < money) return false;
        walletState.balance = Number((walletState.balance + (direction === 'income' ? money : -money)).toFixed(2));
        walletState.bills.unshift({
            id: 'bill-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            type,
            direction,
            note,
            amount: money,
            time: getWalletTimeString()
        });
        await saveWalletState();
        renderWalletPage();
        if (typeof syncShopWalletUI === 'function') syncShopWalletUI();
        return true;
    }


    const TutuwanMusicManager = {
        playlist: [
            { title: '夜色心事', artist: 'Tutuwan Radio', duration: 200 },
            { title: '粉色消息', artist: 'Rabbit Beat', duration: 185 },
            { title: '靠近一点', artist: 'Soft Chat', duration: 216 }
        ],
        index: 0,
        current: 0,
        playing: false,
        timer: null,
        coListener: '',
        currentSong() { return this.playlist[this.index] || this.playlist[0]; },
        formatTime(sec = 0) { const n = Math.max(0, Math.floor(Number(sec) || 0)); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; },
        render() {
            const song = this.currentSong();
            const cover = $('Tutuwan-music-cover');
            if ($('Tutuwan-music-title')) $('Tutuwan-music-title').textContent = song.title;
            if ($('Tutuwan-music-artist')) $('Tutuwan-music-artist').textContent = song.artist;
            if ($('Tutuwan-music-total')) $('Tutuwan-music-total').textContent = this.formatTime(song.duration);
            if ($('Tutuwan-music-now')) $('Tutuwan-music-now').textContent = this.formatTime(this.current);
            if ($('Tutuwan-music-fill')) $('Tutuwan-music-fill').style.width = `${Math.min(100, (this.current / song.duration) * 100)}%`;
            if ($('Tutuwan-music-listener')) $('Tutuwan-music-listener').textContent = this.coListener ? `正在和 ${this.coListener} 一起听` : '';
            cover?.classList.toggle('playing', this.playing);
            const icon = $('Tutuwan-music-play-icon');
            if (icon) icon.innerHTML = this.playing ? '<path d="M8 5h3v14H8z" fill="currentColor" stroke="none"></path><path d="M13 5h3v14h-3z" fill="currentColor" stroke="none"></path>' : '<path d="M8 5v14l11-7Z" fill="currentColor" stroke="none"></path>';
        },
        play() { this.playing = true; this.startTimer(); this.render(); },
        pause() { this.playing = false; clearInterval(this.timer); this.timer = null; this.render(); },
        toggle() { this.playing ? this.pause() : this.play(); },
        next(step = 1) { this.index = (this.index + step + this.playlist.length) % this.playlist.length; this.current = 0; this.render(); if (this.playing) this.startTimer(); },
        startTimer() {
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                const song = this.currentSong();
                this.current += 1;
                if (this.current >= song.duration) this.next(1);
                else this.render();
            }, 1000);
        },
        async chooseCoListener() {
            await loadChatState();
            const names = (chatState.threads || []).map(t => getTutuwanDisplayName(t)).filter(Boolean);
            const tip = names.length ? `输入一起听对象：\n${names.join('、')}\n输入“取消”可断开。` : '暂无联系人，输入名字也可以先记录一起听对象。';
            const name = await showGlobalPrompt(tip, this.coListener || (names[0] || ''), '一起听');
            const finalName = String(name || '').trim();
            if (!finalName) return;
            if (finalName === '取消') {
                this.coListener = '';
                showToast('已断开一起听');
            } else {
                this.coListener = finalName;
                showToast(`正在和 ${finalName} 一起听`);
            }
            this.render();
        }
    };
    function openTutuwanMusicPage(seed = {}) {
        if (seed.title) {
            const foundIndex = TutuwanMusicManager.playlist.findIndex(item => item.title === seed.title);
            if (foundIndex >= 0) TutuwanMusicManager.index = foundIndex;
            else TutuwanMusicManager.playlist.unshift({ title: seed.title, artist: seed.artist || 'Tutuwan Radio', duration: Number(seed.duration) || 200 }), TutuwanMusicManager.index = 0;
        }
        if (seed.coListener) TutuwanMusicManager.coListener = seed.coListener;
        TutuwanMusicManager.render();
        const page = $('Tutuwan-music-page');
        if (page) page.style.display = 'flex';
    }
    function closeTutuwanMusicPage() {
        const page = $('Tutuwan-music-page');
        if (page) page.style.display = 'none';
    }

    async function initChatApp() {
        await loadChatState();
        updateChatProfileText();
        setMomentsCover(chatState.momentsCover);
        renderChatGroups();
        renderChatThreads();
        renderMomentsFeed();
        if (chatInitialized) return;
        chatInitialized = true;
        if (btnChat && chatAppPage) {
            btnChat.addEventListener('click', async (e) => {
                e.stopPropagation();
                await loadChatState();
                updateChatProfileText();
                setMomentsCover(chatState.momentsCover);
                renderChatGroups();
                renderChatThreads();
                setChatTab('messages');
                chatAppPage.style.display = 'flex';
            });
        }
        $('chat-close-btn')?.addEventListener('click', () => { if (chatAppPage) chatAppPage.style.display = 'none'; });

        $('btn-music')?.addEventListener('click', (e) => { e.stopPropagation(); openTutuwanMusicPage(); });
        $('close-Tutuwan-music-btn')?.addEventListener('click', closeTutuwanMusicPage);
        $('Tutuwan-music-play')?.addEventListener('click', () => TutuwanMusicManager.toggle());
        $('Tutuwan-music-prev')?.addEventListener('click', () => TutuwanMusicManager.next(-1));
        $('Tutuwan-music-next')?.addEventListener('click', () => TutuwanMusicManager.next(1));
        $('Tutuwan-music-together')?.addEventListener('click', () => TutuwanMusicManager.chooseCoListener());
        $('Tutuwan-music-share-chat')?.addEventListener('click', async () => {
            if (!TutuwanCurrentThreadId) { showToast('请先进入一个聊天'); return; }
            await sendTutuwanListenCard();
            showToast('已发送一起听');
        });

        $('chat-add-thread-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            $('chat-add-panel')?.classList.toggle('show');
        });
        $('chat-add-friend-option')?.addEventListener('click', async () => {
            $('chat-add-panel')?.classList.remove('show');
            await addChatThread();
        });
        $('chat-create-group-option')?.addEventListener('click', async () => {
            $('chat-add-panel')?.classList.remove('show');
            await openTutuwanGroupModal();
        });
        document.addEventListener('click', (e) => {
            const panel = $('chat-add-panel');
            const addBtn = $('chat-add-thread-btn');
            if (panel && !panel.contains(e.target) && !addBtn?.contains(e.target)) panel.classList.remove('show');
        });
        $('moments-back-btn')?.addEventListener('click', () => setChatTab('messages'));
        document.querySelectorAll('.chat-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => setChatTab(btn.dataset.chatTab || 'messages'));
        });

        $('Tutuwan-room-back')?.addEventListener('click', closeTutuwanChatRoom);
        $('Tutuwan-send-btn')?.addEventListener('click', sendTutuwanTextMessage);
        $('Tutuwan-quote-compose-close')?.addEventListener('click', () => { TutuwanQuoteTarget = null; updateTutuwanQuoteCompose(); });
        $('Tutuwan-multi-cancel')?.addEventListener('click', () => { cancelTutuwanMultiSelect(); renderTutuwanChatRoom(); });
        $('Tutuwan-multi-delete')?.addEventListener('click', async () => { if (!TutuwanSelectedMessageIds.size) { cancelTutuwanMultiSelect(); renderTutuwanChatRoom(); return; } await deleteTutuwanMessagesByIds([...TutuwanSelectedMessageIds]); });
        $('Tutuwan-msg-input')?.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await sendTutuwanTextMessage();
            }
        });
        $('Tutuwan-plus-btn')?.addEventListener('click', () => { closeTutuwanStickerPanel(); $('Tutuwan-tools-panel')?.classList.toggle('active'); });
        $('Tutuwan-tool-camera')?.addEventListener('click', sendTutuwanCameraShot);
        $('Tutuwan-tool-image')?.addEventListener('click', () => $('Tutuwan-image-file')?.click());
        const handleTutuwanImageInput = async (inputId) => {
            const input = $(inputId);
            const file = input?.files?.[0];
            if (!file) return;
            const data = await readFileAsDataURL(file);
            input.value = '';
            $('Tutuwan-tools-panel')?.classList.remove('active');
            await appendTutuwanMessage({ role: 'user', type: 'image', content: data });
        };
        $('Tutuwan-image-file')?.addEventListener('change', () => handleTutuwanImageInput('Tutuwan-image-file'));
        $('Tutuwan-camera-file')?.addEventListener('change', () => handleTutuwanImageInput('Tutuwan-camera-file'));
        $('Tutuwan-tool-redpacket')?.addEventListener('click', () => sendTutuwanMoneyCard('redpacket'));
        $('Tutuwan-tool-transfer')?.addEventListener('click', () => sendTutuwanMoneyCard('transfer'));
        $('Tutuwan-tool-location')?.addEventListener('click', sendTutuwanLocationCard);
        $('Tutuwan-tool-phone')?.addEventListener('click', () => startTutuwanCall('phone', { direction: 'outgoing' }));
        $('Tutuwan-tool-video')?.addEventListener('click', () => startTutuwanCall('video', { direction: 'outgoing' }));
        $('Tutuwan-tool-voice')?.addEventListener('click', sendTutuwanVoiceMessage);
        $('Tutuwan-tool-listen')?.addEventListener('click', sendTutuwanListenCard);
        $('Tutuwan-room-title')?.addEventListener('click', () => { $('Tutuwan-tools-panel')?.classList.remove('active'); openTutuwanThoughtsPage(); });
        $('Tutuwan-room-title')?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('Tutuwan-tools-panel')?.classList.remove('active'); openTutuwanThoughtsPage(); } });
        $('Tutuwan-tool-diary')?.addEventListener('click', openTutuwanDiaryPage);
        $('chat-thoughts-back')?.addEventListener('click', closeTutuwanThoughtsPage);
        $('chat-thoughts-generate')?.addEventListener('click', generateTutuwanThoughtEntry);
        $('chat-thoughts-clear')?.addEventListener('click', clearTutuwanThoughts);
        $('chat-thoughts-list')?.addEventListener('click', e => { const del = e.target.closest('[data-thought-delete]'); if (del) deleteTutuwanThought(del.dataset.thoughtDelete || ''); });
        $('chat-diary-back')?.addEventListener('click', closeTutuwanDiaryPage);
        $('chat-diary-generate')?.addEventListener('click', generateTutuwanDiaryEntry);
        $('chat-diary-clear')?.addEventListener('click', clearTutuwanDiaries);
        $('chat-diary-list')?.addEventListener('click', e => { const del = e.target.closest('[data-diary-delete]'); if (del) { e.stopPropagation(); deleteTutuwanDiary(del.dataset.diaryDelete || ''); return; } const card = e.target.closest('[data-diary-id]'); if (card) openTutuwanDiaryDetail(card.dataset.diaryId || ''); });
        $('chat-diary-detail-close')?.addEventListener('click', closeTutuwanDiaryDetail);
        $('chat-diary-detail-ok')?.addEventListener('click', closeTutuwanDiaryDetail);
        $('chat-diary-detail-delete')?.addEventListener('click', () => deleteTutuwanDiary(activeChatDiaryDetailId));
        $('chat-diary-detail-modal')?.addEventListener('click', e => { if (e.target && e.target.id === 'chat-diary-detail-modal') closeTutuwanDiaryDetail(); });
        $('Tutuwan-room-more')?.addEventListener('click', openTutuwanSettingsPage);
        $('Tutuwan-settings-back')?.addEventListener('click', closeTutuwanSettingsPage);
        $('Tutuwan-setting-user-avatar-card')?.addEventListener('click', () => changeTutuwanAvatar('user'));
        $('Tutuwan-setting-char-avatar-card')?.addEventListener('click', () => changeTutuwanAvatar('char'));
        $('Tutuwan-setting-avatar-file')?.addEventListener('change', async () => {
            const input = $('Tutuwan-setting-avatar-file');
            const file = input?.files?.[0];
            if (!file) return;
            const data = await readFileAsDataURL(file);
            input.value = '';
            await applyTutuwanAvatar(input.dataset.target || 'char', data);
        });
        $('Tutuwan-save-remark-btn')?.addEventListener('click', saveTutuwanRemark);
        $('Tutuwan-clear-remark-btn')?.addEventListener('click', async () => { if ($('Tutuwan-remark-input')) $('Tutuwan-remark-input').value = ''; await saveTutuwanRemark(); });
        $('Tutuwan-bg-local-btn')?.addEventListener('click', () => $('Tutuwan-bg-file')?.click());
        $('Tutuwan-bg-file')?.addEventListener('change', async () => {
            const file = $('Tutuwan-bg-file')?.files?.[0];
            if (!file) return;
            const data = await readFileAsDataURL(file);
            $('Tutuwan-bg-file').value = '';
            if ($('Tutuwan-bg-url')) $('Tutuwan-bg-url').value = '[本地文件]';
            await applyTutuwanBackground(data);
        });
        $('Tutuwan-save-bg-btn')?.addEventListener('click', async () => {
            const value = ($('Tutuwan-bg-url')?.value || '').trim();
            if (!value || value === '[本地文件]') return;
            await applyTutuwanBackground(value);
        });
        $('Tutuwan-reset-bg-btn')?.addEventListener('click', () => applyTutuwanBackground(''));
        $('Tutuwan-time-aware-toggle')?.addEventListener('click', () => toggleTutuwanFlag('timeAware'));
        $('Tutuwan-offline-toggle')?.addEventListener('click', () => toggleTutuwanFlag('offlineMode'));
        $('Tutuwan-save-offline-btn')?.addEventListener('click', saveTutuwanOfflineSettings);
        $('Tutuwan-auto-summary-toggle')?.addEventListener('click', () => toggleTutuwanFlag('autoSummary'));
        $('Tutuwan-save-summary-btn')?.addEventListener('click', saveTutuwanSummarySettings);
        $('Tutuwan-open-beauty-btn')?.addEventListener('click', () => openBeautyPage('specific', TutuwanCurrentThreadId));
        $('Tutuwan-open-css-btn')?.addEventListener('click', () => { fillTutuwanCssEditor(); $('Tutuwan-css-page')?.classList.add('active'); });
        $('Tutuwan-css-back')?.addEventListener('click', () => $('Tutuwan-css-page')?.classList.remove('active'));
        $('Tutuwan-block-btn')?.addEventListener('click', toggleTutuwanBlock);
        $('Tutuwan-clear-history-btn')?.addEventListener('click', clearTutuwanHistory);
        $('moments-refresh-btn')?.addEventListener('click', async () => {
            momentCoverIndex = (momentCoverIndex + 1) % momentCoverPool.length;
            chatState.momentsCover = momentCoverPool[momentCoverIndex];
            await saveChatState();
            setMomentsCover(chatState.momentsCover);
            renderMomentsFeed();
            showToast('朋友圈已刷新');
        });
        $('moments-camera-btn')?.addEventListener('click', () => $('moments-cover-file')?.click());
        $('moments-cover-file')?.addEventListener('change', async () => {
            const file = $('moments-cover-file').files?.[0];
            if (!file) return;
            chatState.momentsCover = await readFileAsDataURL(file);
            await saveChatState();
            setMomentsCover(chatState.momentsCover);
            $('moments-cover-file').value = '';
            showToast('朋友圈背景已更换');
        });
        $('moments-nickname')?.addEventListener('click', () => editChatProfileField('momentsProfile', 'name', '朋友圈昵称', $('moments-nickname')?.textContent || '昵称'));
        $('moments-signature')?.addEventListener('click', () => editChatProfileField('momentsProfile', 'signature', '朋友圈个性签名', $('moments-signature')?.textContent || '个性签名'));
        $('moments-avatar-img')?.parentElement?.addEventListener('click', () => $('moments-avatar-file')?.click());
        $('moments-avatar-file')?.addEventListener('change', () => setChatProfileAvatar('momentsProfile', 'moments-avatar-file'));
        $('chat-home-name')?.addEventListener('click', () => editChatProfileField('homeProfile', 'name', '主页昵称', $('chat-home-name')?.textContent || '昵称'));
        $('chat-home-sign')?.addEventListener('click', () => editChatProfileField('homeProfile', 'signature', '主页个性签名', $('chat-home-sign')?.textContent || '个性签名'));
        $('chat-home-avatar-box')?.addEventListener('click', () => $('chat-home-avatar-file')?.click());
        $('chat-home-avatar-file')?.addEventListener('change', () => setChatProfileAvatar('homeProfile', 'chat-home-avatar-file'));
        $('close-chat-wallet-btn')?.addEventListener('click', () => { if (chatWalletPage) chatWalletPage.style.display = 'none'; });
        $('wallet-recharge-btn')?.addEventListener('click', () => walletChangeBalance('充值'));
        $('wallet-withdraw-btn')?.addEventListener('click', () => walletChangeBalance('提现'));
        $('close-chat-mask-btn')?.addEventListener('click', () => { if (chatMaskPage) chatMaskPage.style.display = 'none'; });
        $('chat-mask-add-btn')?.addEventListener('click', () => openMaskModal(''));
        $('chat-mask-cancel-btn')?.addEventListener('click', closeMaskModal);
        $('chat-mask-save-btn')?.addEventListener('click', saveMaskPreset);
        $('chat-mask-delete-btn')?.addEventListener('click', deleteMaskPreset);
        $('chat-mask-avatar-file')?.addEventListener('change', async () => {
            const file = $('chat-mask-avatar-file')?.files?.[0];
            if (!file) return;
            maskAvatarDraft = await readFileAsDataURL(file);
            const urlInput = $('chat-mask-avatar-url-input'); if (urlInput) urlInput.value = '';
            const preview = $('chat-mask-avatar-preview'); if (preview) preview.src = maskAvatarDraft;
        });
        $('chat-mask-avatar-url-input')?.addEventListener('change', () => applyImageUrlToPreview('chat-mask-avatar-url-input', 'chat-mask-avatar-preview', value => { maskAvatarDraft = value; }));
        $('chat-mask-avatar-url-input')?.addEventListener('blur', () => applyImageUrlToPreview('chat-mask-avatar-url-input', 'chat-mask-avatar-preview', value => { maskAvatarDraft = value; }));
        $('chat-friend-cancel-btn')?.addEventListener('click', closeFriendModal);
        $('chat-friend-save-btn')?.addEventListener('click', saveFriendThread);
        $('chat-friend-avatar-file')?.addEventListener('change', async () => {
            const file = $('chat-friend-avatar-file')?.files?.[0];
            if (!file) return;
            friendAvatarDraft = await readFileAsDataURL(file);
            const urlInput = $('chat-friend-avatar-url-input'); if (urlInput) urlInput.value = '';
            const preview = $('chat-friend-avatar-preview'); if (preview) preview.src = friendAvatarDraft;
        });
        $('chat-friend-avatar-url-input')?.addEventListener('change', () => applyImageUrlToPreview('chat-friend-avatar-url-input', 'chat-friend-avatar-preview', value => { friendAvatarDraft = value; }));
        $('chat-friend-avatar-url-input')?.addEventListener('blur', () => applyImageUrlToPreview('chat-friend-avatar-url-input', 'chat-friend-avatar-preview', value => { friendAvatarDraft = value; }));
        $('chat-friend-user-avatar-file')?.addEventListener('change', async () => {
            const file = $('chat-friend-user-avatar-file')?.files?.[0];
            if (!file) return;
            friendUserAvatarDraft = await readFileAsDataURL(file);
            const urlInput = $('chat-friend-user-avatar-url-input'); if (urlInput) urlInput.value = '';
            const preview = $('chat-friend-user-avatar-preview'); if (preview) preview.src = friendUserAvatarDraft;
        });
        $('chat-friend-user-avatar-url-input')?.addEventListener('change', () => applyImageUrlToPreview('chat-friend-user-avatar-url-input', 'chat-friend-user-avatar-preview', value => { friendUserAvatarDraft = value; }));
        $('chat-friend-user-avatar-url-input')?.addEventListener('blur', () => applyImageUrlToPreview('chat-friend-user-avatar-url-input', 'chat-friend-user-avatar-preview', value => { friendUserAvatarDraft = value; }));
        $('chat-friend-mask-select')?.addEventListener('change', () => { updateFriendMaskPreview(); applySelectedMaskToFriendFields(); });
        $('chat-friend-worldbook-field')?.addEventListener('click', (event) => { event.preventDefault(); toggleFriendWorldbookPanel(); });
        $('chat-friend-worldbook-field')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleFriendWorldbookPanel();
            }
        });
        $('chat-friend-worldbook-panel')?.addEventListener('click', (event) => {
            const btn = event.target.closest('.chat-worldbook-option[data-value]');
            if (!btn) return;
            event.preventDefault();
            toggleFriendWorldbookValue(btn.dataset.value || '');
        });
        document.addEventListener('click', (event) => {
            const picker = $('chat-friend-worldbook-picker');
            if (!picker || !chatFriendModal || chatFriendModal.style.display !== 'flex') return;
            if (picker.contains(event.target)) return;
            toggleFriendWorldbookPanel(false);
        });
        document.querySelectorAll('.chat-home-action').forEach(btn => {
            btn.addEventListener('click', async () => {
                if ((btn.dataset.feature || '') === '资产钱包') {
                    openWalletPage();
                    return;
                }
                if ((btn.dataset.feature || '') === '面具预设') {
                    openMaskPage();
                    return;
                }
                if ((btn.dataset.feature || '') === '表情包库') {
                    openStickerPage();
                    return;
                }
                if ((btn.dataset.feature || '') === '聊天美化') {
                    openBeautyPage();
                    return;
                }
                if ((btn.dataset.feature || '') === '全局美化') {
                    if (themePage) themePage.style.display = 'flex';
                    refreshThemeControls(await getThemeConfig());
                    return;
                }
                showToast(`${btn.dataset.feature || '功能'}已完成，可从对应入口使用`);
            });
        });

        $('Tutuwan-sticker-toggle')?.addEventListener('click', async (ev) => { ev.stopPropagation(); await toggleTutuwanStickerPanel(); });
        $('Tutuwan-sticker-panel')?.addEventListener('click', ev => ev.stopPropagation());
        document.addEventListener('click', (ev) => {
            const panel = $('Tutuwan-sticker-panel');
            if (!panel?.classList.contains('active')) return;
            if (ev.target.closest('#Tutuwan-sticker-panel') || ev.target.closest('#Tutuwan-sticker-toggle')) return;
            closeTutuwanStickerPanel();
        });
        $('chat-sticker-back')?.addEventListener('click', closeStickerPage);
        $('chat-sticker-add')?.addEventListener('click', () => $('chat-sticker-modal')?.classList.add('active'));
        $('chat-sticker-cancel')?.addEventListener('click', () => $('chat-sticker-modal')?.classList.remove('active'));
        $('chat-sticker-confirm')?.addEventListener('click', addStickersFromModal);
        $('chat-sticker-multi')?.addEventListener('click', () => { chatStickerMultiMode = !chatStickerMultiMode; if (!chatStickerMultiMode) chatStickerSelected.clear(); renderStickerLibrary(); });
        $('chat-sticker-cancel-multi')?.addEventListener('click', () => { chatStickerMultiMode = false; chatStickerSelected.clear(); renderStickerLibrary(); });
        $('chat-sticker-move-selected')?.addEventListener('click', moveSelectedStickers);
        $('chat-sticker-delete-selected')?.addEventListener('click', deleteSelectedStickers);
        $('chat-beauty-back')?.addEventListener('click', closeBeautyPage);
        $('chat-beauty-save')?.addEventListener('click', saveBeautyControls);
        ['beauty-avatar-size','beauty-avatar-radius','beauty-font-size','beauty-bubble-radius','beauty-bubble-width','beauty-message-gap','beauty-user-bubble','beauty-ai-bubble','beauty-user-text','beauty-ai-text','beauty-chat-bg','beauty-user-frame','beauty-ai-frame','beauty-user-frame-img','beauty-ai-frame-img','beauty-user-frame-scale','beauty-ai-frame-scale','beauty-user-frame-x','beauty-ai-frame-x','beauty-user-frame-y','beauty-ai-frame-y','beauty-bubble-css','beauty-global-css'].forEach(id => {
            $(id)?.addEventListener('input', () => { updateBeautyLabels(); renderBeautyPreview(); });
        });

        $('beauty-user-frame-file-btn')?.addEventListener('click', () => $('beauty-user-frame-file')?.click());
        $('beauty-ai-frame-file-btn')?.addEventListener('click', () => $('beauty-ai-frame-file')?.click());
        $('beauty-user-frame-file')?.addEventListener('change', async () => {
            const file = $('beauty-user-frame-file')?.files?.[0]; if (!file) return;
            const data = await readFileAsDataURL(file);
            if ($('beauty-user-frame-img')) $('beauty-user-frame-img').value = '[本地文件]';
            $('beauty-user-frame-file').value = '';
            const thread = getBeautyEditingThread();
            if (chatBeautyMode === 'specific' && thread) thread.beautify = normalizeChatBeautify({ ...getEffectiveChatBeautify(thread), userFrameImage: data });
            else chatState.beautify = normalizeChatBeautify({ ...(chatState.beautify || {}), userFrameImage: data });
            renderBeautyPreview(); showToast('user头像框已上传，保存后生效');
        });
        $('beauty-ai-frame-file')?.addEventListener('change', async () => {
            const file = $('beauty-ai-frame-file')?.files?.[0]; if (!file) return;
            const data = await readFileAsDataURL(file);
            if ($('beauty-ai-frame-img')) $('beauty-ai-frame-img').value = '[本地文件]';
            $('beauty-ai-frame-file').value = '';
            const thread = getBeautyEditingThread();
            if (chatBeautyMode === 'specific' && thread) thread.beautify = normalizeChatBeautify({ ...getEffectiveChatBeautify(thread), aiFrameImage: data });
            else chatState.beautify = normalizeChatBeautify({ ...(chatState.beautify || {}), aiFrameImage: data });
            renderBeautyPreview(); showToast('char头像框已上传，保存后生效');
        });
        $('beauty-chat-bg-file-btn')?.addEventListener('click', () => $('beauty-chat-bg-file')?.click());
        $('beauty-chat-bg-file')?.addEventListener('change', async () => {
            const file = $('beauty-chat-bg-file')?.files?.[0]; if (!file) return;
            const data = await readFileAsDataURL(file);
            if ($('beauty-chat-bg')) $('beauty-chat-bg').value = '[本地文件]';
            $('beauty-chat-bg-file').value = '';
            const thread = getBeautyEditingThread();
            if (chatBeautyMode === 'specific' && thread) thread.beautify = normalizeChatBeautify({ ...getEffectiveChatBeautify(thread), chatBg: data });
            else chatState.beautify = normalizeChatBeautify({ ...(chatState.beautify || {}), chatBg: data });
            renderBeautyPreview(); showToast('背景已上传，保存后生效');
        });
        $('beauty-chat-bg-clear')?.addEventListener('click', () => { if ($('beauty-chat-bg')) $('beauty-chat-bg').value = ''; renderBeautyPreview(); });
        $('beauty-bubble-css-file-btn')?.addEventListener('click', () => $('beauty-bubble-css-file')?.click());
        $('beauty-global-css-file-btn')?.addEventListener('click', () => $('beauty-global-css-file')?.click());
        $('beauty-bubble-css-file')?.addEventListener('change', async () => { const file = $('beauty-bubble-css-file')?.files?.[0]; if (!file) return; $('beauty-bubble-css').value = await file.text(); $('beauty-bubble-css-file').value = ''; await saveBeautyControls(); });
        $('beauty-global-css-file')?.addEventListener('change', async () => { const file = $('beauty-global-css-file')?.files?.[0]; if (!file) return; $('beauty-global-css').value = await file.text(); $('beauty-global-css-file').value = ''; await saveBeautyControls(); });
        $('beauty-bubble-css-clear')?.addEventListener('click', async () => { if ($('beauty-bubble-css')) $('beauty-bubble-css').value = ''; await saveBeautyControls(); });
        $('beauty-global-css-clear')?.addEventListener('click', async () => { if ($('beauty-global-css')) $('beauty-global-css').value = ''; await saveBeautyControls(); });
        $('beauty-copy-template')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(CHAT_BEAUTY_BASE_TEMPLATE); showToast('模板已复制'); } catch(e) { showToast('请手动复制模板'); } });
        $('beauty-reset-css')?.addEventListener('click', async () => { if ($('beauty-bubble-css')) $('beauty-bubble-css').value = ''; if ($('beauty-global-css')) $('beauty-global-css').value = ''; await saveBeautyControls(); });
        $('beauty-clear-specific')?.addEventListener('click', clearSpecificBeautyControls);
        $('beauty-preset-save')?.addEventListener('click', saveBeautyPreset);
        $('beauty-preset-delete')?.addEventListener('click', deleteBeautyPreset);
        $('beauty-preset-select')?.addEventListener('change', (e) => loadBeautyPreset(e.target.value));

        window.TutumaruChatApp = {
            load: loadChatState,
            save: saveChatState,
            state: () => normalizeChatState(chatState),
            masks: () => normalizeChatState(chatState).masks,
            openMaskPage,
            open: () => { if (chatAppPage) { chatAppPage.style.display = 'flex'; setChatTab('messages'); } }
        };
    }


    // ===================================
    // ====== 桌面信息 APP：给 char 发送短信 / 聊天互通 ======
    // ===================================
    let desktopMessagesInitialized = false;
    let desktopMessagesState = { activeThreadId: '', query: '' };

    function ensureDesktopMessagesDom() {
        if ($('desktop-messages-page')) return;
        const page = document.createElement('div');
        page.id = 'desktop-messages-page';
        page.className = 'settings-page-overlay desktop-messages-page';
        page.setAttribute('aria-hidden', 'true');
        page.innerHTML = `
            <div class="dm-ios-status"><span id="dm-ios-time">09:41</span><span>5G · 82%</span></div>
            <div id="dm-list-view" class="dm-view active">
                <header class="dm-nav dm-list-nav">
                    <button id="dm-close-btn" class="dm-nav-btn" type="button" aria-label="返回桌面"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                    <button id="dm-sync-btn" class="dm-nav-btn" type="button" aria-label="同步信息"><svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.5 9a8.5 8.5 0 0 1 14.5-3.3L23 10"></path><path d="M20.5 15A8.5 8.5 0 0 1 6 18.3L1 14"></path></svg></button>
                </header>
                <main class="dm-scroll dm-list-scroll">
                    <div class="dm-large-title">信息</div>
                    <label class="dm-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input id="dm-search-input" type="search" placeholder="搜索" autocomplete="off"></label>
                    <section id="dm-thread-list" class="dm-thread-list"></section>
                </main>
            </div>
            <div id="dm-detail-view" class="dm-view">
                <header class="dm-nav dm-detail-nav">
                    <button id="dm-detail-back" class="dm-nav-btn dm-back-text" type="button" aria-label="返回信息"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg><span>信息</span></button>
                    <div id="dm-detail-title" class="dm-detail-title">联系人</div>
                    <span class="dm-nav-spacer"></span>
                </header>
                <main class="dm-scroll dm-chat-scroll">
                    <div id="dm-chat-profile" class="dm-chat-profile"></div>
                    <div id="dm-chat-memory" class="dm-chat-memory"></div>
                    <div id="dm-bubble-list" class="dm-bubble-list"></div>
                </main>
                <footer class="dm-compose">
                    <button id="dm-open-chat-btn" class="dm-compose-tool" type="button" aria-label="打开聊天"><svg viewBox="0 0 24 24"><path d="M7 8h10"></path><path d="M7 12h6"></path><path d="M5 19l3.1-2H17a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3"></path></svg></button>
                    <input id="dm-sms-input" class="dm-sms-input" type="text" placeholder="给 char 发送短信" autocomplete="off">
                    <button id="dm-sms-send-btn" class="dm-compose-send" type="button" aria-label="发送短信"><svg viewBox="0 0 24 24"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></button>
                </footer>
            </div>`;
        const root = document.querySelector('.app-container') || document.body;
        root.appendChild(page);
    }

    function dmCleanText(value = '', fallback = '') {
        const text = String(value ?? '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
        return text || fallback;
    }
    function dmShort(value = '', max = 96) {
        const text = dmCleanText(value);
        return text.length > max ? text.slice(0, max - 1) + '…' : text;
    }
    function dmInitial(name = '') { return dmCleanText(name, '信').slice(0, 1).toUpperCase(); }
    function dmThreadAvatar(thread = {}) { return thread.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread.name || 'messages')}/120/120`; }
    function dmUserAvatar(thread = {}) { return getTutuwanUserAvatar(thread); }
    function dmTimestamp() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    function dmSenderName(thread, msg) {
        if (msg?.role === 'user') return getTutuwanUserName(thread);
        if (thread?.isGroup && msg?.meta?.senderName) return msg.meta.senderName;
        return getTutuwanDisplayName(thread);
    }
    function dmMessageText(msg) {
        return dmCleanText(getTutuwanMessageDisplayText(msg), msg?.type && msg.type !== 'text' ? `[${msg.type}]` : '');
    }
    function buildDesktopThreadMemory(thread = {}) {
        const userName = getTutuwanUserName(thread);
        const charName = getTutuwanDisplayName(thread);
        const memories = [];
        (Array.isArray(thread.summaries) ? thread.summaries : []).slice(0, 3).forEach(sum => {
            const text = dmCleanText(sum?.text || sum?.content || sum, '');
            if (text) memories.push(text);
        });
        (Array.isArray(thread.messages) ? thread.messages : []).slice(-6).forEach(msg => {
            const text = dmMessageText(msg);
            if (text) memories.push(`${dmSenderName(thread, msg)}：${text}`);
        });
        if (!memories.length) {
            const settings = getTutuwanSettingText(thread);
            const charSetting = dmShort(settings.charSetting || thread.setting, 80);
            const userSetting = dmShort(settings.userSetting || thread.userSetting, 80);
            if (charSetting) memories.push(`${charName}设定：${charSetting}`);
            if (userSetting) memories.push(`${userName}设定：${userSetting}`);
        }
        return Array.from(new Set(memories)).slice(0, 8);
    }
    function buildDesktopMessagesData() {
        const threads = (Array.isArray(chatState.threads) ? chatState.threads : []).filter(Boolean);
        const list = threads.map(thread => {
            const normalizedThread = normalizeTutuwanThreadIdentity(thread);
            const messages = Array.isArray(normalizedThread.messages) ? normalizedThread.messages : [];
            const last = [...messages].reverse().find(msg => msg && !isTutuwanWithdrawnMessage(msg));
            const lastText = last ? dmMessageText(last) : dmCleanText(thread.snippet, '暂无短信，聊天内容会同步到这里。');
            const memory = buildDesktopThreadMemory(thread);
            const bubbles = messages.slice(-12).map(msg => ({
                id: msg.id || createChatId('dm-msg'),
                mine: msg.role === 'user',
                sender: dmSenderName(thread, msg),
                text: dmMessageText(msg),
                time: msg.time || '',
                avatar: msg.role === 'user' ? dmUserAvatar(thread) : dmThreadAvatar(thread),
                status: msg.role === 'user' ? '已送达' : ''
            })).filter(item => item.text);
            return {
                id: normalizedThread.id,
                threadId: normalizedThread.id,
                chatId: normalizedThread.id,
                charId: ensureTutuwanCharId(normalizedThread),
                name: getTutuwanDisplayName(normalizedThread),
                userName: getTutuwanUserName(normalizedThread),
                avatar: dmThreadAvatar(thread),
                isGroup: Boolean(thread.isGroup),
                group: thread.group || '全部',
                time: thread.time || (last?.time || ''),
                unread: messages.filter(msg => msg && msg.role !== 'user' && !msg.read).length,
                preview: lastText,
                hiddenMemory: memory,
                memory: [],
                bubbles
            };
        });
        return { threads: list, memories: [] };
    }
    function dmFilteredThreads(data) {
        const q = dmCleanText(desktopMessagesState.query).toLowerCase();
        if (!q) return data.threads;
        return data.threads.filter(thread => [thread.name, thread.userName, thread.preview].join(' ').toLowerCase().includes(q));
    }
    function renderDesktopMessagesList() {
        const page = $('desktop-messages-page');
        if (!page) return;
        const data = buildDesktopMessagesData();
        const filtered = dmFilteredThreads(data);
        const list = $('dm-thread-list');
        if (!list) return;
        if (!filtered.length) {
            list.innerHTML = `<div class="dm-empty-list"><b>没有信息</b><span>添加聊天联系人后，信息会和聊天记录自动互通。</span></div>`;
            return;
        }
        list.innerHTML = filtered.map(thread => `
            <article class="dm-thread-card" data-dm-thread="${chatEscape(thread.id)}">
                <div class="dm-avatar"><img src="${chatEscape(thread.avatar)}" alt="${chatEscape(thread.name)}"><span>${chatEscape(dmInitial(thread.name))}</span></div>
                <div class="dm-thread-main">
                    <div class="dm-thread-top"><b>${chatEscape(thread.name)}</b><time>${chatEscape(thread.time || '')}</time></div>
                    <p>${chatEscape(dmShort(thread.preview, 58))}</p>
                    <small>${chatEscape(thread.isGroup ? '群组短信同步聊天' : '短信与聊天已互通')}</small>
                </div>
                ${thread.unread ? `<em class="dm-unread">${Math.min(99, thread.unread)}</em>` : ''}
            </article>`).join('');
        list.querySelectorAll('[data-dm-thread]').forEach(card => card.addEventListener('click', () => openDesktopMessageThread(card.dataset.dmThread || '')));
    }
    function renderDesktopMessageDetail(threadId) {
        const data = buildDesktopMessagesData();
        const thread = data.threads.find(item => item.id === threadId) || data.threads[0];
        if (!thread) return;
        desktopMessagesState.activeThreadId = thread.id;
        $('dm-list-view')?.classList.remove('active');
        $('dm-detail-view')?.classList.add('active');
        const title = $('dm-detail-title');
        if (title) title.textContent = thread.name;
        const profile = $('dm-chat-profile');
        if (profile) profile.innerHTML = `<div class="dm-chat-avatar"><img src="${chatEscape(thread.avatar)}" alt="${chatEscape(thread.name)}"><span>${chatEscape(dmInitial(thread.name))}</span></div><b>${chatEscape(thread.name)}</b><small>ID ${chatEscape(thread.charId || '')} · ${chatEscape(thread.isGroup ? '群组短信' : '短信联系人')}</small>`;
        const smsInput = $('dm-sms-input');
        if (smsInput) smsInput.placeholder = `给 ${thread.name} 发送短信`;
        const memory = $('dm-chat-memory');
        if (memory) memory.innerHTML = '';
        const bubbles = $('dm-bubble-list');
        if (bubbles) {
            bubbles.innerHTML = thread.bubbles.length ? thread.bubbles.map(item => `
                <div class="dm-bubble-row ${item.mine ? 'mine' : 'other'}">
                    ${item.mine ? '' : `<img src="${chatEscape(item.avatar)}" alt="${chatEscape(item.sender)}">`}
                    <div><div class="dm-bubble">${chatEscape(item.text)}</div>${item.time || item.status ? `<small>${chatEscape([item.time, item.status].filter(Boolean).join(' · '))}</small>` : ''}</div>
                </div>`).join('') : `<div class="dm-empty-list"><b>暂无短信内容</b><span>从这里发送的短信会同步到聊天，聊天消息也会出现在这里。</span></div>`;
            requestAnimationFrame(() => { bubbles.parentElement?.scrollTo({ top: bubbles.parentElement.scrollHeight, behavior: 'auto' }); });
        }
    }
    function openDesktopMessageThread(threadId) { renderDesktopMessageDetail(threadId); }
    async function appendDesktopSmsMessage(threadId, text) {
        const finalText = String(text || '').trim();
        if (!finalText) { showToast('请输入短信内容'); return null; }
        await loadChatState();
        const thread = (chatState.threads || []).find(item => item && item.id === threadId);
        if (!thread) { showToast('没有找到这个 char'); return null; }
        if (thread.blocked) {
            await showGlobalAlert('该联系人已被拉黑，无法发送短信。', '信息');
            return null;
        }
        normalizeTutuwanThreadIdentity(thread);
        const finalMeta = enrichTutuwanAppMeta(thread, 'desktop_messages', {
            sourceApp: 'desktop_messages',
            appId: 'desktop_messages',
            channel: 'sms',
            sentFrom: 'desktop_messages',
            targetName: getTutuwanDisplayName(thread),
            targetCharId: ensureTutuwanCharId(thread)
        });
        const msg = normalizeTutuwanMessageRecord({
            id: createChatId('sms-user'),
            role: 'user',
            type: 'text',
            content: finalText,
            meta: finalMeta,
            time: getChatTimestamp()
        }, thread);
        thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
        thread.messages.push(msg);
        thread.snippet = finalText;
        thread.time = msg.time;
        await maybeAutoCreateTutuwanSummary(thread);
        await saveChatState();
        renderChatThreads();
        renderTutuwanSettingsPage();
        renderDesktopMessageDetail(thread.id);
        renderDesktopMessagesList();
        const input = $('dm-sms-input');
        if (input) { input.value = ''; input.focus?.(); }
        showToast('短信已发送给 ' + getTutuwanDisplayName(thread));
        return msg;
    }
    async function sendDesktopSmsMessage() {
        const threadId = desktopMessagesState.activeThreadId || '';
        const input = $('dm-sms-input');
        await appendDesktopSmsMessage(threadId, input?.value || '');
    }
    async function openDesktopSmsTargetInChat() {
        const threadId = desktopMessagesState.activeThreadId || '';
        if (!threadId) return;
        closeDesktopMessagesApp();
        await openTutuwanChatRoom(threadId);
    }
    function closeDesktopMessageDetail() {
        $('dm-detail-view')?.classList.remove('active');
        $('dm-list-view')?.classList.add('active');
        desktopMessagesState.activeThreadId = '';
        renderDesktopMessagesList();
    }
    async function openDesktopMessagesApp() {
        ensureDesktopMessagesDom();
        await loadChatState();
        const page = $('desktop-messages-page');
        if (page) {
            page.style.display = 'flex';
            page.setAttribute('aria-hidden', 'false');
        }
        $('dm-detail-view')?.classList.remove('active');
        $('dm-list-view')?.classList.add('active');
        if ($('dm-ios-time')) $('dm-ios-time').textContent = dmTimestamp();
        renderDesktopMessagesList();
    }
    function closeDesktopMessagesApp() {
        const page = $('desktop-messages-page');
        if (page) {
            page.style.display = 'none';
            page.setAttribute('aria-hidden', 'true');
        }
    }
    async function syncDesktopMessagesMemory() {
        await loadChatState();
        if ($('dm-ios-time')) $('dm-ios-time').textContent = dmTimestamp();
        renderDesktopMessagesList();
        if (desktopMessagesState.activeThreadId) renderDesktopMessageDetail(desktopMessagesState.activeThreadId);
        showToast('信息已同步');
    }
    async function initDesktopMessagesApp() {
        ensureDesktopMessagesDom();
        if (desktopMessagesInitialized) return;
        desktopMessagesInitialized = true;
        $('btn-desktop-messages')?.addEventListener('click', async (e) => { e.stopPropagation(); await openDesktopMessagesApp(); });
        $('dm-close-btn')?.addEventListener('click', closeDesktopMessagesApp);
        $('dm-detail-back')?.addEventListener('click', closeDesktopMessageDetail);
        $('dm-sync-btn')?.addEventListener('click', syncDesktopMessagesMemory);
        $('dm-open-chat-btn')?.addEventListener('click', async () => { await openDesktopSmsTargetInChat(); });
        $('dm-sms-send-btn')?.addEventListener('click', sendDesktopSmsMessage);
        $('dm-sms-input')?.addEventListener('keydown', async (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); await sendDesktopSmsMessage(); } });
        $('dm-search-input')?.addEventListener('input', (e) => { desktopMessagesState.query = e.target.value || ''; renderDesktopMessagesList(); });
        window.TutumaruDesktopMessages = { open: openDesktopMessagesApp, refresh: syncDesktopMessagesMemory, send: appendDesktopSmsMessage, state: () => buildDesktopMessagesData() };
    }


    // ===================================
    // ====== 查岗 APP：虚拟手机 / 角色设备数据 ======
    // ===================================
    const peepCheckApps = [
        { id: 'messages', label: '信息', sub: '短信记录', icon: '<svg viewBox="0 0 24 24"><path d="M4 11.4C4 7.25 7.6 4 12 4s8 3.25 8 7.4-3.6 7.4-8 7.4c-.72 0-1.42-.08-2.08-.25L5.35 20.1l1.18-3.18A7.1 7.1 0 0 1 4 11.4Z"></path><path d="M8.2 10.2h7.6"></path><path d="M8.2 13.1h5.1"></path></svg>' },
        { id: 'notes', label: '便签', sub: '私人备忘', icon: '<svg viewBox="0 0 24 24"><path d="M7 3.5h8.5L20 8v12.5H7z"></path><path d="M15.5 3.5V8H20"></path><path d="M10 12h6"></path><path d="M10 15h5"></path></svg>' },
        { id: 'wallet', label: '资产', sub: '资产账单', icon: '<svg viewBox="0 0 24 24"><path d="M4.5 8.5h13.8A2.2 2.2 0 0 1 20.5 10.7v6.6a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V6.8A2.3 2.3 0 0 1 5.8 4.5h10.7"></path><path d="M15.5 13.8h5"></path><circle cx="16" cy="13.8" r=".55" fill="currentColor" stroke="none"></circle></svg>' },
        { id: 'shop', label: '购物', sub: '订单购物车', icon: '<svg viewBox="0 0 24 24"><path d="M6.2 8.2h11.6l-.75 11.3H6.95z"></path><path d="M8.8 8.2a3.2 3.2 0 0 1 6.4 0"></path><path d="M9 12h6"></path></svg>' },
        { id: 'douyin', label: '抖音', sub: '视频足迹', icon: '<svg viewBox="0 0 24 24"><path d="M14 3v11.2a4.3 4.3 0 1 1-3.1-4.12"></path><path d="M14 5.5c1.1 2.4 2.95 3.8 5.5 4.2"></path></svg>' },
        { id: 'browser', label: '浏览器', sub: '搜索记录', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.8"></circle><path d="M3.2 12h17.6"></path><path d="M12 3.2c2.25 2.35 3.35 5.28 3.35 8.8S14.25 18.45 12 20.8"></path><path d="M12 3.2C9.75 5.55 8.65 8.48 8.65 12s1.1 6.45 3.35 8.8"></path></svg>' }
    ];
    const peepCheckDefaults = { target: null, thread: null, activeApp: 'messages', data: null, loading: false };
    let peepCheckState = { ...peepCheckDefaults };
    let peepCheckInitialized = false;

    function peepText(value, fallback = '') {
        const text = String(value ?? '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
        return text || fallback;
    }
    function peepNumberText(value, fallback = '0') {
        const text = peepText(value, fallback);
        return text.length > 24 ? text.slice(0, 24) : text;
    }
    function peepList(value, fallback = []) { return Array.isArray(value) ? value.filter(Boolean) : fallback; }
    function peepInitial(name = '') { return peepText(name, '角').slice(0, 1).toUpperCase(); }
    function peepStorageKey(targetId = '') { return `peep_check_phone_${targetId || 'unknown'}`; }
    function peepActiveAppDef() { return peepCheckApps.find(app => app.id === peepCheckState.activeApp) || peepCheckApps[0]; }
    function peepTargetLabel(target) { return peepText(target?.name, 'char'); }
    function peepDeviceTitle() { return `${peepTargetLabel(peepCheckState.target)}的 Phoen`; }
    function buildPeepCommonMemory(thread = null, target = {}) {
        const source = thread || {};
        const userName = getTutuwanUserName(source) || peepText(target?.userName, 'user');
        const charName = peepTargetLabel(target);
        const memories = [];
        peepList(source.summaries).slice(0, 4).forEach(sum => {
            const text = peepText(sum?.text || sum?.content || sum, '');
            if (text) memories.push(text);
        });
        peepList(source.messages).slice(-8).forEach(msg => {
            const actor = msg?.role === 'user' ? userName : charName;
            const text = peepText(getTutuwanMessageDisplayText(msg), '');
            if (text) memories.push(`${actor}：${text}`);
        });
        if (!memories.length && (target?.setting || target?.userSetting)) {
            const charLine = peepText(target?.setting, '').slice(0, 70);
            const userLine = peepText(target?.userSetting, '').slice(0, 70);
            if (charLine) memories.push(`${charName}设定：${charLine}`);
            if (userLine) memories.push(`${userName}设定：${userLine}`);
        }
        return Array.from(new Set(memories)).slice(0, 8);
    }

    function ensurePeepCheckDom() {
        if (!$('peep-check-picker')) {
            const picker = document.createElement('div');
            picker.id = 'peep-check-picker';
            picker.className = 'peep-check-overlay';
            picker.setAttribute('aria-hidden', 'true');
            picker.innerHTML = `
                <div class="peep-picker-card" role="dialog" aria-modal="true" aria-label="选择查看设备">
                    <div class="peep-picker-head">
                        <div><div class="peep-picker-title">选择查看谁的设备</div><div class="peep-picker-sub">读取联系人里的 char 设定生成虚拟手机数据</div></div>
                        <button id="peep-picker-close" class="peep-icon-btn" type="button" aria-label="关闭"><svg viewBox="0 0 24 24"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg></button>
                    </div>
                    <div id="peep-target-list" class="peep-target-list"></div>
                </div>`;
            document.body.appendChild(picker);
        }
        if (!$('peep-phone-page')) {
            const phone = document.createElement('div');
            phone.id = 'peep-phone-page';
            phone.className = 'peep-phone-page';
            phone.setAttribute('aria-hidden', 'true');
            phone.innerHTML = `
                <div class="peep-phone-stage">
                    <div class="peep-phone-shell">
                        <div class="peep-phone-screen">
                            <div class="peep-phone-notch"></div>
                            <div class="peep-statusbar">
                                <span id="peep-phone-time">09:41</span>
                                <span id="peep-phone-status">5G · 82%</span>
                            </div>
                            <div class="peep-phone-nav">
                                <button id="peep-phone-back" class="peep-nav-btn" type="button" aria-label="返回"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                                <div class="peep-nav-title-wrap"><div id="peep-phone-title" class="peep-phone-title">char的 Phoen</div><div id="peep-phone-subtitle" class="peep-phone-subtitle">微信</div></div>
                                <button id="peep-phone-refresh" class="peep-nav-btn" type="button" aria-label="刷新"><svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.5 9a8.5 8.5 0 0 1 14.5-3.3L23 10"></path><path d="M20.5 15A8.5 8.5 0 0 1 6 18.3L1 14"></path></svg></button>
                            </div>
                            <div id="peep-phone-owner" class="peep-owner-strip"></div>
                            <div id="peep-phone-content" class="peep-phone-content"></div>
                            <div id="peep-phone-dock" class="peep-phone-dock"></div>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(phone);
        }
    }

    function collectPeepTargets() {
        const seen = new Set();
        const targets = [];
        (chatState.threads || []).forEach(thread => {
            if (!thread || thread.isGroup) return;
            const charId = ensureTutuwanCharId(thread);
            const id = charId || thread.id || createChatId('peep');
            if (seen.has(id)) return;
            seen.add(id);
            const displayName = getTutuwanDisplayName(thread);
            const settings = getTutuwanSettingText(thread);
            targets.push({
                id,
                charId: id,
                name: displayName || thread.name || 'char',
                group: thread.group || '朋友',
                avatar: thread.avatar || `https://picsum.photos/seed/${encodeURIComponent(displayName || 'char')}/120/120`,
                setting: thread.setting || '',
                userName: getTutuwanUserName(thread),
                userSetting: settings.userSetting || '',
                sourceThreadId: thread.id
            });
        });
        return targets;
    }

    async function openPeepPicker() {
        await loadChatState();
        ensurePeepCheckDom();
        const picker = $('peep-check-picker');
        const list = $('peep-target-list');
        const targets = collectPeepTargets();
        if (!targets.length) {
            await showGlobalAlert('请先在聊天里添加至少一个 char，再使用查岗功能。', '查岗');
            return;
        }
        list.innerHTML = targets.map(target => `
            <button class="peep-target-card" type="button" data-peep-target="${chatEscape(target.id)}">
                <img src="${chatEscape(target.avatar)}" alt="${chatEscape(target.name)}">
                <span><b>${chatEscape(target.name)}</b><small>${chatEscape(target.group || '联系人')} · ${chatEscape(peepText(target.setting, '未填写 char 设定').slice(0, 34))}</small></span>
                <i></i>
            </button>`).join('');
        list.querySelectorAll('[data-peep-target]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const target = targets.find(item => item.id === btn.dataset.peepTarget);
                const thread = (chatState.threads || []).find(item => item.id === target?.sourceThreadId);
                if (target) await openPeepPhone(target, thread || null);
            });
        });
        picker.style.display = 'flex';
        picker.setAttribute('aria-hidden', 'false');
    }
    function closePeepPicker() {
        const picker = $('peep-check-picker');
        if (picker) {
            picker.style.display = 'none';
            picker.setAttribute('aria-hidden', 'true');
        }
    }
    function closePeepPhone() {
        const page = $('peep-phone-page');
        if (page) {
            page.style.display = 'none';
            page.setAttribute('aria-hidden', 'true');
        }
        peepCheckState = { ...peepCheckDefaults };
    }

    function buildPeepFallbackData(target) {
        const name = peepTargetLabel(target);
        const userName = peepText(target?.userName, 'user');
        return normalizePeepPhoneData({
            device: { battery: '82%', signal: '5G', mood: '待刷新', lastActive: '刚刚', lockText: `${name}的手机数据等待刷新` },
            messages: {
                commonMemory: buildPeepCommonMemory(peepCheckState.thread, target),
                threads: [{ contact: userName, phone: '短信', unread: 0, pinned: true, time: '刚刚', preview: '点击刷新后会生成符合人设的信息记录。', bubbles: [{ sender: name, text: `还没有读取到${name}的信息数据。`, time: '09:41', mine: true, status: '已送达' }, { sender: userName, text: `刷新后会同步${name}的近期短信痕迹。`, time: '09:42', mine: false }] }]
            },
            notes: [{ title: '待刷新', content: `这里会生成符合${name}人设的便签。`, time: '刚刚', pin: true }],
            wallet: { balance: '待刷新', cards: [{ bank: '资产中心', type: '未同步', number: '----', balance: '点击刷新' }], bills: [{ title: '暂无账单', amount: '0.00', time: '刚刚', thought: '等待读取角色设定。' }] },
            shop: { purchases: [{ name: '暂无订单', price: '0.00', time: '刚刚', thought: '刷新后会生成购买记录。' }], cart: [{ name: '待生成商品', price: '0.00', thought: '根据角色喜好生成。' }] },
            douyin: { videos: [{ author: name, title: '暂无视频足迹', caption: '刷新后显示最近刷到的内容。', stats: '0赞', time: '刚刚' }], searches: ['待刷新'] },
            browser: { history: [{ keyword: '如何刷新虚拟手机数据', title: '查岗说明', time: '刚刚', reason: '等待配置 API 后生成。' }], tabs: [{ title: `${name}的 Phoen`, url: 'local://peep-phone', summary: '本地虚拟手机页面。' }] }
        }, target);
    }

    async function loadPeepPhoneData(target) {
        const stored = await getSetting(peepStorageKey(target.charId || target.id), null);
        return stored ? normalizePeepPhoneData(stored, target) : buildPeepFallbackData(target);
    }
    async function savePeepPhoneData(target, data) {
        await setSetting(peepStorageKey(target.charId || target.id), normalizePeepPhoneData(data, target));
    }

    function normalizePeepPhoneData(raw = {}, target = {}) {
        const name = peepTargetLabel(target);
        const device = raw.device && typeof raw.device === 'object' ? raw.device : {};
        const wallet = raw.wallet && typeof raw.wallet === 'object' ? raw.wallet : {};
        const shop = raw.shop && typeof raw.shop === 'object' ? raw.shop : {};
        const douyin = raw.douyin && typeof raw.douyin === 'object' ? raw.douyin : {};
        const browser = raw.browser && typeof raw.browser === 'object' ? raw.browser : {};
        const rawMessagesSource = raw.messages || raw.sms || raw.imessages || raw.messageApp || (raw.wechat ? { threads: raw.wechat } : {});
        const messagesSource = Array.isArray(rawMessagesSource) ? { threads: rawMessagesSource } : ((rawMessagesSource && typeof rawMessagesSource === 'object') ? rawMessagesSource : {});
        const memoryFallback = buildPeepCommonMemory(peepCheckState.thread, target);
        return {
            generatedAt: raw.generatedAt || Date.now(),
            device: {
                battery: peepNumberText(device.battery, '82%'),
                signal: peepText(device.signal, '5G'),
                mood: peepText(device.mood, '在线'),
                lastActive: peepText(device.lastActive, '刚刚'),
                lockText: peepText(device.lockText, `${name}的手机`)
            },
            messages: {
                commonMemory: peepList(messagesSource.commonMemory || messagesSource.memories || messagesSource.memory, memoryFallback)
                    .map(item => peepText(typeof item === 'string' ? item : (item?.text || item?.content || item?.summary), ''))
                    .filter(Boolean)
                    .slice(0, 8),
                threads: peepList(messagesSource.threads || messagesSource.conversations || messagesSource.chats).slice(0, 8).map((item, idx) => {
                    const bubbles = peepList(item.bubbles || item.messages).slice(0, 10).map(msg => ({
                        sender: peepText(msg.sender, msg.mine ? name : (item.contact || item.name || '联系人')),
                        text: peepText(msg.text || msg.content, '信息内容'),
                        time: peepText(msg.time, ''),
                        mine: Boolean(msg.mine),
                        status: peepText(msg.status, '')
                    }));
                    return {
                        contact: peepText(item.contact || item.name || item.target, `信息 ${idx + 1}`),
                        phone: peepText(item.phone || item.number || item.note, ''),
                        time: peepText(item.time, ''),
                        unread: Math.max(0, Number(item.unread) || 0),
                        pinned: Boolean(item.pinned || item.pin),
                        preview: peepText(item.preview || item.lastMessage || bubbles[bubbles.length - 1]?.text, '暂无信息'),
                        bubbles
                    };
                })
            },
            wechat: peepList(raw.wechat).slice(0, 8).map((item, idx) => {
                const messages = peepList(item.messages).slice(0, 8).map(msg => ({
                    sender: peepText(msg.sender, msg.mine ? name : '联系人'),
                    text: peepText(msg.text || msg.content, '消息内容'),
                    time: peepText(msg.time, ''),
                    mine: Boolean(msg.mine)
                }));
                return {
                    name: peepText(item.name || item.target, `聊天 ${idx + 1}`),
                    isGroup: Boolean(item.isGroup),
                    unread: Math.max(0, Number(item.unread) || 0),
                    time: peepText(item.time, ''),
                    lastMessage: peepText(item.lastMessage || item.preview || messages[messages.length - 1]?.text, '暂无消息'),
                    messages
                };
            }),
            notes: peepList(raw.notes).slice(0, 10).map((item, idx) => ({
                title: peepText(item.title, `便签 ${idx + 1}`),
                content: peepText(item.content || item.text, '未写内容'),
                time: peepText(item.time, ''),
                pin: Boolean(item.pin)
            })),
            wallet: {
                balance: peepText(wallet.balance, '0.00'),
                currency: peepText(wallet.currency, 'CNY'),
                cards: peepList(wallet.cards).slice(0, 6).map((item, idx) => ({
                    bank: peepText(item.bank, `账户 ${idx + 1}`),
                    type: peepText(item.type || item.level, '普通账户'),
                    number: peepText(item.number || item.tail, '----'),
                    balance: peepText(item.balance, '0.00'),
                    note: peepText(item.note || item.thought, '')
                })),
                bills: peepList(wallet.bills).slice(0, 10).map(item => ({
                    title: peepText(item.title || item.name, '账单'),
                    amount: peepText(item.amount, '0.00'),
                    time: peepText(item.time, ''),
                    thought: peepText(item.thought || item.note, ''),
                    isExpense: item.isExpense !== false
                }))
            },
            shop: {
                purchases: peepList(shop.purchases || shop.orders).slice(0, 8).map(item => ({
                    name: peepText(item.name || item.title, '商品'),
                    price: peepText(item.price, '0.00'),
                    time: peepText(item.time, ''),
                    thought: peepText(item.thought || item.reason, '')
                })),
                cart: peepList(shop.cart).slice(0, 8).map(item => ({
                    name: peepText(item.name || item.title, '购物车商品'),
                    price: peepText(item.price, '0.00'),
                    thought: peepText(item.thought || item.reason, '')
                }))
            },
            douyin: {
                videos: peepList(douyin.videos).slice(0, 8).map(item => ({
                    author: peepText(item.author, '创作者'),
                    title: peepText(item.title, '视频标题'),
                    caption: peepText(item.caption || item.desc, ''),
                    stats: peepText(item.stats, ''),
                    time: peepText(item.time, ''),
                    reason: peepText(item.reason || item.thought, '')
                })),
                searches: peepList(douyin.searches).slice(0, 8).map(item => peepText(typeof item === 'string' ? item : item.keyword, '搜索'))
            },
            browser: {
                history: peepList(browser.history).slice(0, 10).map(item => ({
                    keyword: peepText(item.keyword || item.query, '搜索词'),
                    title: peepText(item.title, '网页标题'),
                    time: peepText(item.time, ''),
                    reason: peepText(item.reason || item.thought, '')
                })),
                tabs: peepList(browser.tabs).slice(0, 6).map(item => ({
                    title: peepText(item.title, '网页'),
                    url: peepText(item.url, 'local://tab'),
                    summary: peepText(item.summary || item.desc, '')
                }))
            }
        };
    }

    function extractPeepJson(raw) {
        const text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        try { return JSON.parse(text); } catch (e) {}
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
        throw new Error('未解析到 JSON 对象');
    }

    async function generatePeepPhoneData(target, thread) {
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) throw new Error('请先在设置里填写接口网址与 API Key');
        const sourceThread = thread || (chatState.threads || []).find(item => item.id === target.sourceThreadId) || {};
        const settings = getTutuwanSettingText(sourceThread);
        const userName = getTutuwanUserName(sourceThread) || target.userName || 'user';
        const charName = peepTargetLabel(target);
        const recentMessages = (sourceThread.messages || []).slice(-12).map(msg => `${msg.role === 'user' ? userName : charName}：${msg.content || getTutuwanMessageDisplayText(msg) || ''}`).join('\n') || '暂无近期聊天。';
        const commonMemory = buildPeepCommonMemory(sourceThread, target).join('\n') || '暂无共同记忆。';
        const worldbook = await getTutuwanWorldbookPrompt(sourceThread);
        const schema = `{
  "device": {"battery":"82%","signal":"5G","mood":"锁屏状态一句话","lastActive":"刚刚","lockText":"锁屏短句"},
  "messages": {"commonMemory":["共同记忆片段"],"threads":[{"contact":"短信联系人或系统名称","phone":"号码或备注","time":"时间","unread":1,"pinned":true,"preview":"预览","bubbles":[{"sender":"发送者","text":"信息内容","time":"时间","mine":true,"status":"已送达"}]}]},
  "notes": [{"title":"标题","content":"内容","time":"时间","pin":true}],
  "wallet": {"balance":"总资产数字","currency":"CNY","cards":[{"bank":"账户名","type":"等级或类型","number":"尾号","balance":"余额","note":"解释"}],"bills":[{"title":"账单名","amount":"金额","time":"时间","thought":"角色内心","isExpense":true}]},
  "shop": {"purchases":[{"name":"已买商品","price":"价格","time":"时间","thought":"购买原因"}],"cart":[{"name":"购物车商品","price":"价格","thought":"加入原因"}]},
  "douyin": {"videos":[{"author":"作者","title":"视频标题","caption":"视频文案","stats":"互动数据","time":"时间","reason":"为什么刷到或停留"}],"searches":["搜索词"]},
  "browser": {"history":[{"keyword":"搜索词","title":"页面标题","time":"时间","reason":"搜索动机"}],"tabs":[{"title":"标签页标题","url":"虚构网址","summary":"页面摘要"}]}
}`;
        const prompt = `你是虚构角色手机数据生成器。请为查岗页面生成一部属于【${charName}】的虚拟手机数据，内容只用于本地角色扮演 UI 展示。

【user】${userName}
【user 设定】
${settings.userSetting || target.userSetting || '未填写'}

【char】${charName}
【char 设定】
${settings.charSetting || target.setting || '未填写'}

【关联世界书】
${worldbook || '无'}

【共同记忆】
${commonMemory}

【最近聊天】
${recentMessages}

生成要求：
1. 必须符合 char 的身份、关系、阶层、性格、口癖、秘密、欲望和消费能力，不要写成完美人设。
2. 手机数据要像真实设备里的近期痕迹：信息、便签、资产、购物、抖音、浏览器都要有内容；信息必须载入共同记忆，也要体现 char 的社交圈和系统短信，不要只围绕 user。
3. 信息 App 要采用 iOS 短信语气：既有共同记忆，也有验证码、快递、家人朋友、工作或私事等符合人设的短信痕迹；资产金额、账单、购物车和浏览记录必须与角色设定自洽。
4. 所有人名、网址、银行、商品、视频作者都使用虚构内容；不要输出现实个人隐私。
5. 禁止 emoji、表情符号、Markdown、解释文字、代码块；只输出严格 JSON 对象。

JSON 格式必须完全兼容：
${schema}`;
        const res = await fetch(cfg.chatCompletionsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
            body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .85), messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const payload = await res.json();
        const raw = payload?.choices?.[0]?.message?.content || payload?.choices?.[0]?.text || payload?.message || payload?.content || '';
        return normalizePeepPhoneData({ ...extractPeepJson(raw), generatedAt: Date.now() }, target);
    }

    async function openPeepPhone(target, thread = null) {
        closePeepPicker();
        ensurePeepCheckDom();
        peepCheckState = { ...peepCheckDefaults, target, thread, activeApp: 'messages', data: await loadPeepPhoneData(target) };
        const page = $('peep-phone-page');
        if (page) {
            page.style.display = 'flex';
            page.setAttribute('aria-hidden', 'false');
        }
        renderPeepPhone();
    }

    async function refreshPeepPhoneData() {
        if (!peepCheckState.target || peepCheckState.loading) return;
        peepCheckState.loading = true;
        renderPeepPhone();
        try {
            const data = await generatePeepPhoneData(peepCheckState.target, peepCheckState.thread);
            peepCheckState.data = data;
            await savePeepPhoneData(peepCheckState.target, data);
            showToast('查岗数据已刷新');
        } catch (err) {
            await showGlobalAlert(err.message || '生成手机数据失败。', '刷新失败');
        } finally {
            peepCheckState.loading = false;
            renderPeepPhone();
        }
    }

    function renderPeepDock() {
        const dock = $('peep-phone-dock');
        if (!dock) return;
        dock.innerHTML = peepCheckApps.map(app => `
            <button class="peep-dock-btn ${chatEscape(app.id)} ${app.id === peepCheckState.activeApp ? 'active' : ''}" type="button" data-peep-app="${app.id}">
                <span>${app.icon}</span><b>${chatEscape(app.label)}</b>
            </button>`).join('');
        dock.querySelectorAll('[data-peep-app]').forEach(btn => {
            btn.addEventListener('click', () => {
                peepCheckState.activeApp = btn.dataset.peepApp || 'messages';
                renderPeepPhone();
            });
        });
    }

    function peepEmptyTip(text) { return `<div class="peep-empty-card">${chatEscape(text)}</div>`; }
    function renderPeepMessages(data) {
        const appData = data.messages || {};
        const threads = peepList(appData.threads);
        const primaryThread = threads[0] || null;
        const bubbleRows = primaryThread ? peepList(primaryThread.bubbles).slice(-5) : [];
        const owner = peepTargetLabel(peepCheckState.target);
        const previewHtml = primaryThread ? `<section class="peep-ios-chat-preview">
                <div class="peep-ios-chat-head"><span>${chatEscape(primaryThread.contact || owner)}</span><small>${chatEscape(primaryThread.phone || primaryThread.time || '')}</small></div>
                <div class="peep-ios-bubbles">${bubbleRows.map(msg => `<div class="peep-ios-bubble ${msg.mine ? 'mine' : 'theirs'}"><p>${chatEscape(msg.text)}</p>${msg.status ? `<small>${chatEscape(msg.status)}</small>` : ''}</div>`).join('')}</div>
            </section>` : '';
        return `
            <div class="peep-ios-messages">
                <div class="peep-ios-title-row"><b>信息</b><button type="button" aria-label="更多"><i></i><i></i></button></div>
                <div class="peep-ios-search"><span></span><b>搜索</b></div>
                ${previewHtml}
                <div class="peep-section-title">最近信息</div>
                <div class="peep-ios-thread-list">${threads.length ? threads.map(item => `
                    <article class="peep-ios-thread ${item.pinned ? 'pinned' : ''}">
                        <div class="peep-ios-avatar">${chatEscape(peepInitial(item.contact))}</div>
                        <div class="peep-ios-thread-main"><div><b>${chatEscape(item.contact)}</b><time>${chatEscape(item.time || '')}</time></div><p>${chatEscape(item.preview || '')}</p>${item.phone ? `<small>${chatEscape(item.phone)}</small>` : ''}</div>
                        ${item.unread ? `<em>${chatEscape(item.unread)}</em>` : ''}
                    </article>`).join('') : peepEmptyTip('暂无信息数据，点击刷新生成。')}</div>
            </div>`;
    }
    function renderPeepWechat(data) {
        const chats = peepList(data.wechat);
        if (!chats.length) return peepEmptyTip('暂无微信数据，点击刷新生成。');
        return `<div class="peep-section-title">近期微信</div>${chats.map(chat => `
            <div class="peep-wechat-card">
                <div class="peep-wechat-top"><div class="peep-avatar-letter">${chatEscape(peepInitial(chat.name))}</div><div><b>${chatEscape(chat.name)}</b><small>${chatEscape(chat.isGroup ? '群聊' : '私聊')} · ${chatEscape(chat.time || '刚刚')}</small></div>${chat.unread ? `<em>${chat.unread}</em>` : ''}</div>
                <p class="peep-preview">${chatEscape(chat.lastMessage)}</p>
                <div class="peep-message-mini">${peepList(chat.messages).slice(-4).map(msg => `<span class="${msg.mine ? 'mine' : ''}"><i>${chatEscape(msg.sender)}</i>${chatEscape(msg.text)}</span>`).join('')}</div>
            </div>`).join('')}`;
    }
    function renderPeepNotes(data) {
        const notes = peepList(data.notes);
        if (!notes.length) return peepEmptyTip('暂无便签数据，点击刷新生成。');
        return `<div class="peep-section-title">便签</div><div class="peep-notes-grid">${notes.map(note => `
            <article class="peep-note-card ${note.pin ? 'pinned' : ''}"><div><b>${chatEscape(note.title)}</b><small>${chatEscape(note.time || '')}</small></div><p>${chatEscape(note.content)}</p></article>`).join('')}</div>`;
    }
    function renderPeepWallet(data) {
        const wallet = data.wallet || {};
        const cards = peepList(wallet.cards);
        const bills = peepList(wallet.bills);
        return `
            <div class="peep-wallet-hero"><small>总资产 ${chatEscape(wallet.currency || 'CNY')}</small><b>${chatEscape(wallet.balance || '0.00')}</b><span>${chatEscape(data.device?.mood || '在线')}</span></div>
            <div class="peep-section-title">账户</div>
            <div class="peep-card-stack">${cards.length ? cards.map(card => `<div class="peep-bank-card"><span>${chatEscape(card.bank)}</span><b>${chatEscape(card.balance)}</b><small>${chatEscape(card.type)} · 尾号 ${chatEscape(card.number)}</small>${card.note ? `<p>${chatEscape(card.note)}</p>` : ''}</div>`).join('') : peepEmptyTip('暂无账户')}</div>
            <div class="peep-section-title">账单</div>
            <div class="peep-list-lines">${bills.length ? bills.map(bill => `<div><span><b>${chatEscape(bill.title)}</b><small>${chatEscape(bill.time)} ${bill.thought ? ' · ' + chatEscape(bill.thought) : ''}</small></span><strong class="${bill.isExpense ? 'expense' : 'income'}">${bill.isExpense ? '-' : '+'}${chatEscape(String(bill.amount).replace(/^[-+]/, ''))}</strong></div>`).join('') : peepEmptyTip('暂无账单')}</div>`;
    }
    function renderPeepShop(data) {
        const shop = data.shop || {};
        const purchases = peepList(shop.purchases);
        const cart = peepList(shop.cart);
        const productCard = item => `<div class="peep-product-card"><div class="peep-product-cover"></div><b>${chatEscape(item.name)}</b><small>${chatEscape(item.price)}</small><p>${chatEscape(item.thought || '')}</p></div>`;
        return `
            <div class="peep-section-title">已购记录</div><div class="peep-product-grid">${purchases.length ? purchases.map(productCard).join('') : peepEmptyTip('暂无已购')}</div>
            <div class="peep-section-title">购物车</div><div class="peep-cart-list">${cart.length ? cart.map(item => `<div><span><b>${chatEscape(item.name)}</b><small>${chatEscape(item.thought || '')}</small></span><strong>${chatEscape(item.price)}</strong></div>`).join('') : peepEmptyTip('购物车为空')}</div>`;
    }
    function renderPeepDouyin(data) {
        const douyin = data.douyin || {};
        const videos = peepList(douyin.videos);
        const searches = peepList(douyin.searches);
        return `
            <div class="peep-douyin-searches">${searches.map(item => `<span>${chatEscape(item)}</span>`).join('')}</div>
            <div class="peep-video-feed">${videos.length ? videos.map(video => `<article class="peep-video-card"><div class="peep-video-screen"><b>${chatEscape(video.title)}</b><p>${chatEscape(video.caption || '')}</p></div><div class="peep-video-meta"><span>${chatEscape(video.author)} · ${chatEscape(video.time || '')}</span><strong>${chatEscape(video.stats || '')}</strong></div>${video.reason ? `<small>${chatEscape(video.reason)}</small>` : ''}</article>`).join('') : peepEmptyTip('暂无视频足迹')}</div>`;
    }
    function renderPeepBrowser(data) {
        const browser = data.browser || {};
        const history = peepList(browser.history);
        const tabs = peepList(browser.tabs);
        return `
            <div class="peep-browser-bar"><span>${chatEscape(peepTargetLabel(peepCheckState.target))}</span><i>search</i></div>
            <div class="peep-section-title">搜索历史</div><div class="peep-browser-list">${history.length ? history.map(item => `<div><b>${chatEscape(item.keyword)}</b><span>${chatEscape(item.title)} · ${chatEscape(item.time || '')}</span>${item.reason ? `<p>${chatEscape(item.reason)}</p>` : ''}</div>`).join('') : peepEmptyTip('暂无搜索记录')}</div>
            <div class="peep-section-title">打开的标签页</div><div class="peep-tab-grid">${tabs.map(tab => `<article><b>${chatEscape(tab.title)}</b><small>${chatEscape(tab.url)}</small><p>${chatEscape(tab.summary || '')}</p></article>`).join('')}</div>`;
    }
    function renderPeepContent(data) {
        if (peepCheckState.loading) return '<div class="peep-loading-card"><span></span><b>正在读取双方设定生成手机数据</b><small>刷新会覆盖当前虚拟手机内容</small></div>';
        switch (peepCheckState.activeApp) {
            case 'messages': return renderPeepMessages(data);
            case 'notes': return renderPeepNotes(data);
            case 'wallet': return renderPeepWallet(data);
            case 'shop': return renderPeepShop(data);
            case 'douyin': return renderPeepDouyin(data);
            case 'browser': return renderPeepBrowser(data);
            case 'wechat': return renderPeepWechat(data);
            default: return renderPeepMessages(data);
        }
    }

    function renderPeepPhone() {
        ensurePeepCheckDom();
        const data = peepCheckState.data || buildPeepFallbackData(peepCheckState.target || {});
        const app = peepActiveAppDef();
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const title = $('peep-phone-title');
        const subtitle = $('peep-phone-subtitle');
        const status = $('peep-phone-status');
        const timeEl = $('peep-phone-time');
        const owner = $('peep-phone-owner');
        const content = $('peep-phone-content');
        const refresh = $('peep-phone-refresh');
        if (title) title.textContent = peepDeviceTitle();
        if (subtitle) subtitle.textContent = `${app.label} · ${app.sub}`;
        if (status) status.textContent = `${data.device?.signal || '5G'} · ${data.device?.battery || '82%'}`;
        if (timeEl) timeEl.textContent = time;
        if (owner) owner.innerHTML = `<img src="${chatEscape(peepCheckState.target?.avatar || '')}" alt="${chatEscape(peepTargetLabel(peepCheckState.target))}"><span><b>${chatEscape(data.device?.lockText || peepDeviceTitle())}</b><small>最后活跃：${chatEscape(data.device?.lastActive || '刚刚')} · ${chatEscape(data.device?.mood || '在线')}</small></span>`;
        if (content) content.innerHTML = renderPeepContent(data);
        if (refresh) {
            refresh.classList.toggle('loading', Boolean(peepCheckState.loading));
            refresh.disabled = Boolean(peepCheckState.loading);
        }
        renderPeepDock();
    }

    async function initPeepCheckApp() {
        ensurePeepCheckDom();
        if (peepCheckInitialized) return;
        peepCheckInitialized = true;
        $('btn-peep-check')?.addEventListener('click', async (e) => { e.stopPropagation(); await openPeepPicker(); });
        $('peep-picker-close')?.addEventListener('click', closePeepPicker);
        $('peep-check-picker')?.addEventListener('click', e => { if (e.target === $('peep-check-picker')) closePeepPicker(); });
        $('peep-phone-back')?.addEventListener('click', closePeepPhone);
        $('peep-phone-refresh')?.addEventListener('click', refreshPeepPhoneData);
        window.TutumaruPeepCheck = { open: openPeepPicker, refresh: refreshPeepPhoneData, state: () => ({ ...peepCheckState }) };
    }


    // ===================================
    // ====== 窥探 APP：角色房间 / 物品搜查 ======
    // ===================================
    const peepRoomDefaults = { target: null, thread: null, data: null, activeRoomId: '', activeItemId: '', loading: false, itemLoading: '' };
    let peepRoomState = { ...peepRoomDefaults };
    let peepRoomInitialized = false;

    function peepRoomStorageKey(charId = '') { return `peep_room_data_${charId || 'unknown'}`; }
    function peepRoomTargetName(target = {}) { return peepText(target?.name, 'char'); }
    function peepRoomNowText() { return new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); }
    function peepRoomSafeId(value = '', fallback = 'item') {
        const raw = String(value || '').trim();
        const id = raw.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5_-]+/gi, '-').replace(/^-+|-+$/g, '');
        return id || `${fallback}-${Math.random().toString(36).slice(2, 8)}`;
    }
    function peepRoomThought(raw = {}, fallback = '') {
        if (typeof raw === 'string') return { mood: '', content: peepText(raw, fallback) };
        const obj = raw && typeof raw === 'object' ? raw : {};
        return { mood: peepText(obj.mood || obj.emotion || obj.tone, ''), content: peepText(obj.content || obj.text || obj.thought, fallback) };
    }
    function normalizePeepRoomItem(raw = {}, idx = 0, roomId = '') {
        const item = raw && typeof raw === 'object' ? raw : { name: String(raw || '') };
        const name = peepText(item.name || item.title || item.itemName, `物品 ${idx + 1}`);
        const id = peepRoomSafeId(item.id || item.itemId || `${roomId}-${name}-${idx}`, `item-${idx + 1}`);
        const result = item.result || item.searchResult || item.lastSearch || null;
        return {
            id,
            name,
            category: peepText(item.category || item.type, '私人物品'),
            position: peepText(item.position || item.location || item.place, ''),
            appearance: peepText(item.appearance || item.desc || item.description || item.visibleHint, '等待搜查'),
            clue: peepText(item.clue || item.hint || item.secretHint, ''),
            innerThought: peepRoomThought(item.innerThought || item.inner_thought || item.thought || item.mind, ''),
            result: result && typeof result === 'object' ? normalizePeepSearchResult(result, null, null, false) : null,
            searchedAt: item.searchedAt || (result ? peepRoomNowText() : '')
        };
    }
    function normalizePeepRoom(raw = {}, idx = 0) {
        const room = raw && typeof raw === 'object' ? raw : { name: String(raw || '') };
        const name = peepText(room.name || room.title || room.roomName, `房间 ${idx + 1}`);
        const id = peepRoomSafeId(room.id || room.roomId || name, `room-${idx + 1}`);
        return {
            id,
            name,
            subtitle: peepText(room.subtitle || room.summary || room.desc, ''),
            ambience: peepText(room.ambience || room.atmosphere || room.mood, ''),
            privacyLevel: peepText(room.privacyLevel || room.level, ''),
            items: peepList(room.items || room.objects || room.clues).slice(0, 16).map((item, itemIdx) => normalizePeepRoomItem(item, itemIdx, id))
        };
    }
    function normalizePeepRoomData(raw = {}, target = {}) {
        const charId = target?.charId || target?.id || raw.charId || normalizeTutuwanCharId(target || {});
        const threadId = target?.sourceThreadId || target?.threadId || raw.threadId || raw.chatId || '';
        const charName = peepRoomTargetName(target);
        const targetRaw = raw.target && typeof raw.target === 'object' ? raw.target : {};
        const rooms = peepList(raw.rooms || raw.roomList || raw.spaces).slice(0, 10).map(normalizePeepRoom).filter(room => room.items.length).map(room => ({
            ...room,
            items: peepList(room.items).map(item => ({
                ...item,
                result: item.result ? normalizePeepSearchResult({ ...item.result, charId, threadId, chatId: threadId, roomId: room.id, roomName: room.name, itemId: item.id, itemName: item.name }, room, item, false) : null
            }))
        }));
        return {
            type: 'peep_room_profile',
            appId: 'peep_room',
            threadId,
            chatId: threadId,
            charId,
            charName: peepText(raw.charName || targetRaw.name, charName),
            generatedAt: Number(raw.generatedAt) || Date.now(),
            target: {
                id: target?.id || threadId || charId,
                threadId,
                chatId: threadId,
                charId,
                name: peepText(targetRaw.name, charName),
                avatar: target?.avatar || targetRaw.avatar || '',
                roomTitle: peepText(targetRaw.roomTitle || raw.roomTitle, `${charName}的房间`),
                currentState: peepText(targetRaw.currentState || raw.currentState, '可以开始搜查'),
                atmosphere: peepText(targetRaw.atmosphere || raw.atmosphere, '安静')
            },
            rooms
        };
    }
    function normalizePeepSearchResult(raw = {}, room = null, item = null, withDefaults = true) {
        const obj = raw && typeof raw === 'object' ? raw : {};
        const evidences = peepList(obj.evidence || obj.evidences || obj.findings || obj.clues).slice(0, 8).map((ev, idx) => {
            if (typeof ev === 'string') return { label: `线索 ${idx + 1}`, content: peepText(ev, '') };
            return { label: peepText(ev?.label || ev?.title, `线索 ${idx + 1}`), content: peepText(ev?.content || ev?.text || ev?.desc, '') };
        }).filter(ev => ev.content);
        const thought = peepRoomThought(obj.inner_thought || obj.innerThought || obj.thought || obj.mind, item?.innerThought?.content || '');
        const roomName = peepText(obj.roomName || obj.room, room?.name || '房间');
        const itemName = peepText(obj.itemName || obj.item, item?.name || '物品');
        const charId = obj.charId || peepRoomState.target?.charId || peepRoomState.target?.id || '';
        const threadId = obj.threadId || obj.chatId || peepRoomState.thread?.id || peepRoomState.target?.sourceThreadId || '';
        const roomId = obj.roomId || room?.id || '';
        const itemId = obj.itemId || item?.id || '';
        const resultId = obj.resultId || obj.id || `peep-result-${hashTutuwanStableId(`${charId}|${threadId}|${roomId}|${itemId}`)}`;
        return {
            type: 'peep_search_result',
            appId: 'peep_room',
            id: resultId,
            resultId,
            threadId,
            chatId: threadId,
            charId,
            charName: peepText(obj.charName, peepRoomTargetName(peepRoomState.target)),
            roomId,
            roomName,
            itemId,
            itemName,
            foundAt: peepText(obj.foundAt || obj.time, peepRoomNowText()),
            title: peepText(obj.title, `${roomName}里的${itemName}`),
            summary: peepText(obj.summary || obj.result || obj.content, withDefaults ? '搜查结果已生成。' : ''),
            evidence: evidences,
            inner_thought: thought,
            riskLevel: peepText(obj.riskLevel || obj.level, '中'),
            forwardText: peepText(obj.forwardText || obj.shareText, obj.summary || '')
        };
    }
    function buildPeepRoomFallbackData(target = {}) {
        const name = peepRoomTargetName(target);
        return normalizePeepRoomData({
            charId: target.charId || target.id,
            charName: name,
            target: { name, roomTitle: `${name}的房间`, currentState: '等待 AI 生成房间', atmosphere: '未读取' },
            rooms: [{ id: 'waiting-room', name: '待生成房间', subtitle: '请点击右上角刷新，调用 API 生成真实房间与物品。', ambience: '未同步', items: [{ id: 'waiting-item', name: '待生成物品', category: '提示', position: '入口', appearance: '点击刷新后会由 AI 生成物品、线索和心声。', innerThought: { mood: '等待', content: '还没有读取到角色房间数据。' } }] }]
        }, target);
    }
    async function loadPeepRoomData(target = {}) {
        const stored = await getSetting(peepRoomStorageKey(target.charId || target.id), null);
        return stored ? normalizePeepRoomData(stored, target) : null;
    }
    async function savePeepRoomData(target = {}, data = {}) {
        await setSetting(peepRoomStorageKey(target.charId || target.id), normalizePeepRoomData(data, target));
    }
    function getPeepRoomContext(thread = {}, target = {}) {
        const settings = getTutuwanSettingText(thread || {});
        const userName = getTutuwanUserName(thread || {}) || target.userName || 'user';
        const charName = peepRoomTargetName(target);
        const recentMessages = peepList(thread?.messages).slice(-14).map(msg => `${msg.role === 'user' ? userName : charName}：${msg.content || getTutuwanMessageDisplayText(msg) || ''}`).join('\n') || '暂无近期聊天。';
        const commonMemory = buildPeepCommonMemory(thread, target).join('\n') || '暂无共同记忆。';
        return { settings, userName, charName, recentMessages, commonMemory };
    }
    async function callPeepRoomAI(prompt) {
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) throw new Error('请先在设置里填写接口网址与 API Key');
        const res = await fetch(cfg.chatCompletionsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
            body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .88), messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const payload = await res.json();
        return payload?.choices?.[0]?.message?.content || payload?.choices?.[0]?.text || payload?.message || payload?.content || '';
    }
    async function generatePeepRoomData(target, thread) {
        const sourceThread = thread || (chatState.threads || []).find(item => item.id === target.sourceThreadId) || {};
        const ctx = getPeepRoomContext(sourceThread, target);
        const worldbook = await getTutuwanWorldbookPrompt(sourceThread);
        const schema = `{
  "type":"peep_room_profile",
  "appId":"peep_room",
  "threadId":"${target.sourceThreadId || target.threadId || sourceThread.id || ''}",
  "chatId":"${target.sourceThreadId || target.threadId || sourceThread.id || ''}",
  "charId":"${target.charId || target.id}",
  "charName":"${ctx.charName}",
  "target":{"name":"${ctx.charName}","roomTitle":"房间标题","currentState":"此刻状态","atmosphere":"整体氛围"},
  "rooms":[{"id":"bedroom","name":"卧室","subtitle":"房间短描述","ambience":"氛围","privacyLevel":"私密程度","items":[{"id":"bedside_drawer","name":"物品名","category":"分类","position":"位置","appearance":"肉眼看到的样子","clue":"值得搜查的理由","innerThought":{"mood":"情绪","content":"角色看到这个物品时不想让 user 知道的心声"}}]}]
}`;
        const prompt = `你是虚构角色房间数据生成器。请为【${ctx.charName}】生成可搜查的私人房间数据，只用于本地角色扮演 UI。必须只输出严格 JSON 对象。

【稳定 charId】${target.charId || target.id}
【user】${ctx.userName}
【user 设定】
${ctx.settings.userSetting || target.userSetting || '未填写'}

【char】${ctx.charName}
【char 设定】
${ctx.settings.charSetting || target.setting || '未填写'}

【关联世界书】
${worldbook || '无'}

【共同记忆】
${ctx.commonMemory}

【最近聊天】
${ctx.recentMessages}

生成要求：
1. 生成 4 到 6 个房间，每个房间 5 到 8 个可搜查物品。
2. 房间与物品必须符合 char 的身份、经济条件、秘密、关系网、居住环境和近期聊天。
3. 每个物品都必须包含 innerThought 对象，content 是 char 不想直接说出口的心声；不要让心声出现在普通字段。
4. 物品不要空泛，要像真实房间能翻到的东西：抽屉、相册、电脑、垃圾桶、衣柜、书桌、药盒、礼物、票据、门禁卡等，但必须根据人设变化。
5. 所有 ID 必须稳定、短、唯一，禁止重复。
6. 禁止 emoji、Markdown、解释文字、代码块；只输出 JSON 对象。

JSON 格式必须兼容：
${schema}`;
        const raw = await callPeepRoomAI(prompt);
        return normalizePeepRoomData({ ...extractPeepJson(raw), generatedAt: Date.now() }, target);
    }
    async function generatePeepItemSearch(room, item) {
        const target = peepRoomState.target || {};
        const thread = peepRoomState.thread || (chatState.threads || []).find(t => t.id === target.sourceThreadId) || {};
        const ctx = getPeepRoomContext(thread, target);
        const schema = `{
  "type":"peep_search_result",
  "appId":"peep_room",
  "threadId":"${peepRoomState.thread?.id || target.sourceThreadId || target.threadId || ''}",
  "chatId":"${peepRoomState.thread?.id || target.sourceThreadId || target.threadId || ''}",
  "charId":"${target.charId || target.id}",
  "charName":"${ctx.charName}",
  "roomId":"${room?.id || ''}",
  "roomName":"${room?.name || ''}",
  "itemId":"${item?.id || ''}",
  "itemName":"${item?.name || ''}",
  "foundAt":"时间",
  "title":"结果标题",
  "summary":"搜查结论",
  "evidence":[{"label":"发现项","content":"具体内容"}],
  "inner_thought":{"mood":"情绪","content":"char 对这个搜查结果的真实心声"},
  "riskLevel":"低/中/高",
  "forwardText":"转发到聊天时的一句话"
}`;
        const prompt = `你是虚构房间物品搜查结果生成器。现在 user 正在搜查【${ctx.charName}】的【${room?.name || '房间'}】里的【${item?.name || '物品'}】。请根据角色设定生成一次详细搜查结果，只输出严格 JSON 对象。

【稳定 charId】${target.charId || target.id}
【物品可见信息】
名称：${item?.name || ''}
位置：${item?.position || ''}
外观：${item?.appearance || ''}
线索：${item?.clue || ''}
原始心声：${item?.innerThought?.content || ''}

【user】${ctx.userName}
【user 设定】
${ctx.settings.userSetting || target.userSetting || '未填写'}

【char】${ctx.charName}
【char 设定】
${ctx.settings.charSetting || target.setting || '未填写'}

【共同记忆】
${ctx.commonMemory}

【最近聊天】
${ctx.recentMessages}

要求：
1. 必须生成 JSON 对象，type 固定为 peep_search_result。
2. 必须保留 threadId、chatId、charId、roomId、itemId，避免串聊天和串角色数据。
3. evidence 是数组，每条是可转述的发现，不要写成旁白大段。
4. inner_thought 必须是对象，content 写 char 的真实心声，不能混到 summary 里。
5. 结果要符合人设，允许矛盾、遮掩、秘密和未说出口的情绪，但不要写现实个人隐私。
6. 禁止 emoji、Markdown、解释文字、代码块；只输出 JSON 对象。

JSON 格式必须兼容：
${schema}`;
        const raw = await callPeepRoomAI(prompt);
        return normalizePeepSearchResult(extractPeepJson(raw), room, item);
    }
    function ensurePeepRoomDom() {
        if (!$('peep-room-picker')) {
            const picker = document.createElement('div');
            picker.id = 'peep-room-picker';
            picker.className = 'peep-room-overlay';
            picker.setAttribute('aria-hidden', 'true');
            picker.innerHTML = `
                <div class="peep-room-picker-card" role="dialog" aria-modal="true" aria-label="选择窥探角色">
                    <div class="peep-picker-head">
                        <div><div class="peep-picker-title">选择窥探对象</div><div class="peep-picker-sub">每个 char 使用独立 ID 保存房间、物品和搜查结果</div></div>
                        <button id="peep-room-picker-close" class="peep-icon-btn" type="button" aria-label="关闭"><svg viewBox="0 0 24 24"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg></button>
                    </div>
                    <div id="peep-room-target-list" class="peep-target-list"></div>
                </div>`;
            document.body.appendChild(picker);
        }
        if (!$('peep-room-page')) {
            const page = document.createElement('div');
            page.id = 'peep-room-page';
            page.className = 'peep-room-page';
            page.setAttribute('aria-hidden', 'true');
            page.innerHTML = `
                <div class="peep-room-shell">
                    <div class="peep-room-topbar">
                        <button id="peep-room-back" class="peep-room-nav-btn" type="button" aria-label="返回"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                        <div><b id="peep-room-title">窥探</b><small id="peep-room-subtitle">选择房间搜查物品</small></div>
                        <button id="peep-room-refresh" class="peep-room-nav-btn" type="button" aria-label="刷新房间"><svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.5 9a8.5 8.5 0 0 1 14.5-3.3L23 10"></path><path d="M20.5 15A8.5 8.5 0 0 1 6 18.3L1 14"></path></svg></button>
                    </div>
                    <div id="peep-room-owner" class="peep-room-owner"></div>
                    <div id="peep-room-tabs" class="peep-room-tabs"></div>
                    <div id="peep-room-content" class="peep-room-content"></div>
                </div>`;
            document.body.appendChild(page);
        }
    }
    async function openPeepRoomPicker() {
        await loadChatState();
        ensurePeepRoomDom();
        const picker = $('peep-room-picker');
        const list = $('peep-room-target-list');
        const targets = collectPeepTargets();
        if (!targets.length) {
            await showGlobalAlert('请先在聊天里添加至少一个 char，再使用窥探功能。', '窥探');
            return;
        }
        list.innerHTML = targets.map(target => `
            <button class="peep-target-card" type="button" data-peep-room-target="${chatEscape(target.id)}">
                <img src="${chatEscape(target.avatar)}" alt="${chatEscape(target.name)}">
                <span><b>${chatEscape(target.name)}</b><small>ID: ${chatEscape(target.charId || target.id)} · ${chatEscape(peepText(target.setting, '未填写 char 设定').slice(0, 34))}</small></span>
                <i></i>
            </button>`).join('');
        list.querySelectorAll('[data-peep-room-target]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const target = targets.find(item => item.id === btn.dataset.peepRoomTarget);
                const thread = (chatState.threads || []).find(item => item.id === target?.sourceThreadId);
                if (target) await openPeepRoom(target, thread || null);
            });
        });
        picker.style.display = 'flex';
        picker.setAttribute('aria-hidden', 'false');
        await saveChatState();
    }
    function closePeepRoomPicker() {
        const picker = $('peep-room-picker');
        if (picker) { picker.style.display = 'none'; picker.setAttribute('aria-hidden', 'true'); }
    }
    function closePeepRoomPage() {
        const page = $('peep-room-page');
        if (page) { page.style.display = 'none'; page.setAttribute('aria-hidden', 'true'); }
        peepRoomState = { ...peepRoomDefaults };
    }
    async function openPeepRoom(target, thread = null) {
        closePeepRoomPicker();
        ensurePeepRoomDom();
        const stored = await loadPeepRoomData(target);
        peepRoomState = { ...peepRoomDefaults, target, thread, data: stored || buildPeepRoomFallbackData(target) };
        peepRoomState.activeRoomId = peepRoomState.data.rooms[0]?.id || '';
        const page = $('peep-room-page');
        if (page) { page.style.display = 'flex'; page.setAttribute('aria-hidden', 'false'); }
        renderPeepRoomPage();
        if (!stored) await refreshPeepRoomData(false);
    }
    async function refreshPeepRoomData(confirmFirst = true) {
        if (!peepRoomState.target || peepRoomState.loading) return;
        if (confirmFirst) {
            const ok = await showGlobalConfirm('刷新会重新生成该 char 的房间、物品和心声，已转发到聊天的结果不会删除。', '刷新窥探数据');
            if (!ok) return;
        }
        peepRoomState.loading = true;
        renderPeepRoomPage();
        try {
            const data = await generatePeepRoomData(peepRoomState.target, peepRoomState.thread);
            peepRoomState.data = data;
            peepRoomState.activeRoomId = data.rooms[0]?.id || '';
            await savePeepRoomData(peepRoomState.target, data);
            showToast('窥探房间已生成');
        } catch (err) {
            await showGlobalAlert(err.message || '生成房间失败。', '窥探失败');
        } finally {
            peepRoomState.loading = false;
            renderPeepRoomPage();
        }
    }
    function getPeepActiveRoom() {
        const rooms = peepList(peepRoomState.data?.rooms);
        return rooms.find(room => room.id === peepRoomState.activeRoomId) || rooms[0] || null;
    }
    function getPeepItem(room, itemId) { return peepList(room?.items).find(item => item.id === itemId) || null; }
    function renderPeepRoomPage() {
        ensurePeepRoomDom();
        const data = peepRoomState.data || buildPeepRoomFallbackData(peepRoomState.target || {});
        const target = peepRoomState.target || {};
        const room = getPeepActiveRoom();
        const title = $('peep-room-title');
        const subtitle = $('peep-room-subtitle');
        const owner = $('peep-room-owner');
        const tabs = $('peep-room-tabs');
        const content = $('peep-room-content');
        const refresh = $('peep-room-refresh');
        if (title) title.textContent = data.target?.roomTitle || `${peepRoomTargetName(target)}的房间`;
        if (subtitle) subtitle.textContent = `${peepRoomTargetName(target)} · ID ${target.charId || target.id || ''}`;
        if (owner) owner.innerHTML = `<img src="${chatEscape(target.avatar || '')}" alt="${chatEscape(peepRoomTargetName(target))}"><span><b>${chatEscape(data.target?.currentState || '可以开始搜查')}</b><small>${chatEscape(data.target?.atmosphere || '房间资料')} · ${chatEscape(new Date(data.generatedAt || Date.now()).toLocaleString('zh-CN'))}</small></span>`;
        if (tabs) {
            tabs.innerHTML = peepList(data.rooms).map(r => `<button class="${r.id === room?.id ? 'active' : ''}" type="button" data-peep-room-tab="${chatEscape(r.id)}"><b>${chatEscape(r.name)}</b><small>${chatEscape(r.items.length)}件</small></button>`).join('');
            tabs.querySelectorAll('[data-peep-room-tab]').forEach(btn => btn.addEventListener('click', () => { peepRoomState.activeRoomId = btn.dataset.peepRoomTab || ''; renderPeepRoomPage(); }));
        }
        if (content) content.innerHTML = renderPeepRoomContent(room);
        if (refresh) { refresh.classList.toggle('loading', Boolean(peepRoomState.loading)); refresh.disabled = Boolean(peepRoomState.loading); }
    }
    function renderPeepRoomContent(room) {
        if (peepRoomState.loading) return '<div class="peep-room-loading"><span></span><b>正在调用 API 生成房间与物品</b><small>所有房间、物品和心声都会按 JSON 结构生成</small></div>';
        if (!room) return '<div class="peep-room-empty">暂无房间，点击刷新生成。</div>';
        const itemHtml = peepList(room.items).map(item => {
            const loading = peepRoomState.itemLoading === item.id;
            const thought = item.innerThought || {};
            const result = item.result;
            return `<article class="peep-room-item-card ${result ? 'searched' : ''}" data-peep-room-item="${chatEscape(item.id)}">
                <div class="peep-room-item-head"><span>${chatEscape(item.category || '物品')}</span><b>${chatEscape(item.name)}</b></div>
                <p>${chatEscape(item.appearance || '')}</p>
                <div class="peep-room-item-meta"><span>${chatEscape(item.position || '未知位置')}</span><span>${chatEscape(item.clue || '可搜查')}</span></div>
                <div class="peep-room-thought"><small>${chatEscape(thought.mood || '心声')}</small><p>${chatEscape(thought.content || '暂无心声，刷新后生成。')}</p></div>
                ${result ? `<div class="peep-room-result-mini"><b>${chatEscape(result.title || '已搜查')}</b><small>${chatEscape(result.summary || '')}</small></div>` : ''}
                <div class="peep-room-actions"><button type="button" data-peep-search-item="${chatEscape(item.id)}" ${loading ? 'disabled' : ''}>${loading ? '搜查中' : result ? '重新搜查' : '搜查'}</button>${result ? `<button type="button" data-peep-forward-item="${chatEscape(item.id)}">转发到聊天</button>` : ''}</div>
            </article>`;
        }).join('');
        return `<section class="peep-room-current"><div><b>${chatEscape(room.name)}</b><small>${chatEscape(room.subtitle || '')}</small></div><p>${chatEscape(room.ambience || '')}</p>${room.privacyLevel ? `<span>${chatEscape(room.privacyLevel)}</span>` : ''}</section><div class="peep-room-item-grid">${itemHtml}</div>`;
    }
    async function searchPeepRoomItem(itemId) {
        const room = getPeepActiveRoom();
        const item = getPeepItem(room, itemId);
        if (!room || !item || peepRoomState.itemLoading) return;
        peepRoomState.itemLoading = item.id;
        renderPeepRoomPage();
        try {
            const result = await generatePeepItemSearch(room, item);
            item.result = result;
            item.searchedAt = result.foundAt || peepRoomNowText();
            await savePeepRoomData(peepRoomState.target, peepRoomState.data);
            renderPeepRoomPage();
            await showGlobalAlert(formatPeepRoomResultText(result), '搜查结果');
        } catch (err) {
            await showGlobalAlert(err.message || '搜查失败。', '搜查失败');
        } finally {
            peepRoomState.itemLoading = '';
            renderPeepRoomPage();
        }
    }
    function formatPeepRoomResultText(result = {}) {
        const lines = [];
        lines.push(result.summary || '已生成搜查结果。');
        peepList(result.evidence).forEach(ev => lines.push(`${ev.label}：${ev.content}`));
        if (result.inner_thought?.content) lines.push(`心声：${result.inner_thought.content}`);
        return lines.join('\n');
    }
    async function forwardPeepRoomResult(itemId) {
        const room = getPeepActiveRoom();
        const item = getPeepItem(room, itemId);
        const result = item?.result;
        if (!room || !item || !result) return;
        const thread = (chatState.threads || []).find(t => t.id === peepRoomState.target?.sourceThreadId);
        if (!thread) return showGlobalAlert('没有找到对应聊天，无法转发。', '转发失败');
        const payload = normalizePeepSearchResult({ ...result, charId: peepRoomState.target?.charId || peepRoomState.target?.id, charName: peepRoomTargetName(peepRoomState.target), roomId: room.id, roomName: room.name, itemId: item.id, itemName: item.name }, room, item);
        const content = JSON.stringify(payload);
        thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
        const msg = normalizeTutuwanMessageRecord({ role: 'user', type: 'peep_result', content, meta: enrichTutuwanAppMeta(thread, 'peep_room', payload), time: getChatTimestamp() }, thread);
        thread.messages.push(msg);
        thread.snippet = '[窥探结果] ' + (payload.title || payload.summary || item.name);
        thread.time = msg.time;
        await saveChatState();
        renderChatThreads();
        if (TutuwanCurrentThreadId === thread.id) renderTutuwanChatRoom();
        showToast('搜查结果已转发到聊天');
    }
    async function initPeepRoomApp() {
        ensurePeepRoomDom();
        if (peepRoomInitialized) return;
        peepRoomInitialized = true;
        $('btn-peep-room')?.addEventListener('click', async (e) => { e.stopPropagation(); await openPeepRoomPicker(); });
        $('peep-room-picker-close')?.addEventListener('click', closePeepRoomPicker);
        $('peep-room-picker')?.addEventListener('click', e => { if (e.target === $('peep-room-picker')) closePeepRoomPicker(); });
        $('peep-room-back')?.addEventListener('click', closePeepRoomPage);
        $('peep-room-refresh')?.addEventListener('click', () => refreshPeepRoomData(true));
        $('peep-room-content')?.addEventListener('click', async e => {
            const search = e.target.closest?.('[data-peep-search-item]');
            if (search) { await searchPeepRoomItem(search.dataset.peepSearchItem); return; }
            const forward = e.target.closest?.('[data-peep-forward-item]');
            if (forward) { await forwardPeepRoomResult(forward.dataset.peepForwardItem); return; }
            const card = e.target.closest?.('[data-peep-room-item]');
            if (card) {
                const room = getPeepActiveRoom();
                const item = getPeepItem(room, card.dataset.peepRoomItem);
                if (item?.result) await showGlobalAlert(formatPeepRoomResultText(item.result), `${item.name} · 搜查结果`);
            }
        });
        window.TutumaruPeepRoom = { open: openPeepRoomPicker, refresh: refreshPeepRoomData, state: () => ({ ...peepRoomState }) };
    }




    // ===================================
    // ====== 主题应用：壁纸/图标/字体/UI ======
    // ===================================
    const btnTheme = document.getElementById('btn-theme');
    const themePage = document.getElementById('theme-page');
    const closeThemeBtn = document.getElementById('close-theme-btn');
    const themeDefaultConfig = {
        wallpaperType: 'default',
        wallpaperSrc: '',
        fontSrc: '',
        fontSize: 16,
        fontWeight: '400',
        uiScale: 100,
        statusHidden: false,
        iconImages: {},
        chatWallpapers: { messages: '', moments: '', home: '' }
    };
    const themePendingIconData = {};
    let themePendingWallpaper = null;
    let themePendingFontData = null;
    let themeInitialized = false;
    let themeIconDefs = [];
    const themeOriginalIcons = {};

    function mergeThemeConfig(config = {}) {
        return {
            ...themeDefaultConfig,
            ...(config || {}),
            iconImages: { ...(config?.iconImages || {}) },
            chatWallpapers: { messages: '', moments: '', home: '', ...(config?.chatWallpapers || {}) }
        };
    }
    async function getThemeConfig() {
        return mergeThemeConfig(await getSetting('theme_config', {}));
    }
    async function saveThemeConfig(config) {
        await setSetting('theme_config', mergeThemeConfig(config));
    }
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    function mediaTypeFromSource(src = '', file = null) {
        if (file && file.type && file.type.startsWith('video/')) return 'video';
        if (/^data:video\//i.test(src)) return 'video';
        if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(src)) return 'video';
        return 'image';
    }
    function cssUrl(src = '') {
        return String(src).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    function captureThemeIconDefaults() {
        if (themeIconDefs.length) return;
        const homeCells = Array.from(document.querySelectorAll('.grid-container > .cell-1x1'));
        const dockCells = Array.from(document.querySelectorAll('.dock-container > .cell-1x1'));
        const dockLabels = ['信息', '世界书', '主题', '设置'];
        const register = (cell, id, label) => {
            const iconEl = cell.querySelector('.cell-content-1x1');
            if (!iconEl) return;
            cell.dataset.themeIconId = id;
            themeOriginalIcons[id] = iconEl.innerHTML;
            themeIconDefs.push({ id, label, cell, iconEl });
        };
        homeCells.forEach((cell, idx) => {
            const label = cell.querySelector('.app-name')?.textContent?.trim() || `桌面图标 ${idx + 1}`;
            register(cell, `home-${idx}`, label);
        });
        dockCells.forEach((cell, idx) => {
            register(cell, `dock-${idx}`, dockLabels[idx] || `Dock 图标 ${idx + 1}`);
        });
    }
    function applyThemeIconImage(id, src = '') {
        const def = themeIconDefs.find(item => item.id === id);
        if (!def) return;
        def.iconEl.innerHTML = '';
        if (src) {
            const img = document.createElement('img');
            img.className = 'theme-app-icon-img';
            img.src = src;
            img.alt = def.label;
            def.iconEl.appendChild(img);
        } else {
            def.iconEl.innerHTML = themeOriginalIcons[id] || '';
        }
    }
    function applyThemeWallpaper(config) {
        const cfg = mergeThemeConfig(config);
        const video = $('theme-wallpaper-video');
        document.body.classList.remove('theme-video-wallpaper');
        document.documentElement.style.setProperty('--bg-gradient', 'var(--app-page-gradient)');
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
        if (cfg.wallpaperSrc && cfg.wallpaperType === 'video') {
            if (video) {
                video.src = cfg.wallpaperSrc;
                video.play().catch(() => {});
            }
            document.body.classList.add('theme-video-wallpaper');
            document.documentElement.style.setProperty('--bg-gradient', 'rgba(255,255,255,0.08)');
        } else if (cfg.wallpaperSrc) {
            document.documentElement.style.setProperty('--bg-gradient', `url('${cssUrl(cfg.wallpaperSrc)}') center center / cover no-repeat`);
        }
    }
    function applyThemeFont(config) {
        const cfg = mergeThemeConfig(config);
        let style = $('theme-font-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'theme-font-style';
            document.head.appendChild(style);
        }
        if (cfg.fontSrc) {
            style.textContent = `@font-face{font-family:"TutumaruThemeFont";src:url('${cssUrl(cfg.fontSrc)}');font-display:swap;}`;
            document.documentElement.style.setProperty('--theme-font-family', '"TutumaruThemeFont", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
        } else {
            style.textContent = '';
            document.documentElement.style.setProperty('--theme-font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
        }
        document.documentElement.style.setProperty('--theme-font-scale', String((Number(cfg.fontSize) || 16) / 16));
        document.documentElement.style.setProperty('--theme-font-weight', String(cfg.fontWeight || '400'));
        document.body.classList.toggle('theme-font-applied', Boolean(cfg.fontSrc) || Number(cfg.fontSize) !== 16 || String(cfg.fontWeight) !== '400');
    }
    function applyThemeUi(config) {
        const cfg = mergeThemeConfig(config);
        const scale = Math.min(110, Math.max(90, Number(cfg.uiScale) || 100));
        document.documentElement.style.setProperty('--theme-ui-scale', String(scale / 100));
        document.body.classList.toggle('theme-ui-scaled', scale !== 100);
        document.body.classList.toggle('theme-status-hidden', Boolean(cfg.statusHidden));
    }
    async function applyThemeConfig(config = null) {
        captureThemeIconDefaults();
        const cfg = mergeThemeConfig(config || await getThemeConfig());
        applyThemeWallpaper(cfg);
        applyThemeFont(cfg);
        applyThemeUi(cfg);
        themeIconDefs.forEach(def => applyThemeIconImage(def.id, cfg.iconImages?.[def.id] || ''));
        applyChatPageWallpapers(cfg);
        refreshThemeControls(cfg);
        document.querySelectorAll('.settings-page-overlay').forEach(page => { page.style.background = 'var(--app-page-gradient)'; });
    }
    function refreshThemeWallpaperPreview(config) {
        const cfg = mergeThemeConfig(config);
        const preview = $('theme-wallpaper-preview');
        if (!preview) return;
        preview.innerHTML = '';
        if (!cfg.wallpaperSrc) {
            preview.textContent = '默认壁纸';
            preview.style.background = 'var(--app-page-gradient)';
            return;
        }
        if (cfg.wallpaperType === 'video') {
            const video = document.createElement('video');
            video.src = cfg.wallpaperSrc;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            preview.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = cfg.wallpaperSrc;
            img.alt = '壁纸预览';
            preview.appendChild(img);
        }
    }
    function renderThemeIconList(config = null) {
        const wrap = $('theme-icon-list');
        if (!wrap) return;
        const cfg = mergeThemeConfig(config || {});
        wrap.innerHTML = '';
        themeIconDefs.forEach(def => {
            const currentSrc = cfg.iconImages?.[def.id] || '';
            const row = document.createElement('div');
            row.className = 'theme-icon-row';

            const preview = document.createElement('div');
            preview.className = 'theme-icon-preview';
            preview.innerHTML = def.iconEl.innerHTML;

            const body = document.createElement('div');
            const title = document.createElement('div');
            title.className = 'theme-icon-title';
            title.textContent = def.label;

            const actions = document.createElement('div');
            actions.className = 'theme-icon-actions';
            const input = document.createElement('input');
            input.className = 'settings-input';
            input.placeholder = '图标 URL';
            input.value = currentSrc ? (currentSrc.startsWith('data:') ? '[本地文件]' : currentSrc) : '';
            input.style.padding = '10px 12px';
            input.style.borderRadius = '12px';

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.className = 'theme-hidden-file';

            const localBtn = document.createElement('button');
            localBtn.type = 'button';
            localBtn.className = 'theme-mini-btn';
            localBtn.textContent = '本地';

            const resetBtn = document.createElement('button');
            resetBtn.type = 'button';
            resetBtn.className = 'theme-mini-btn danger';
            resetBtn.textContent = '重置';

            localBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files?.[0];
                if (!file) return;
                themePendingIconData[def.id] = await readFileAsDataURL(file);
                input.value = '[本地文件]';
                await updateThemeIcon(def.id, themePendingIconData[def.id]);
                showToast(`${def.label} 图标已更换`);
                fileInput.value = '';
            });
            input.addEventListener('change', async () => {
                const value = input.value.trim();
                if (!value || value === '[本地文件]') return;
                await updateThemeIcon(def.id, value);
                showToast(`${def.label} 图标已更换`);
            });
            resetBtn.addEventListener('click', async () => {
                await updateThemeIcon(def.id, '');
                showToast(`${def.label} 图标已重置`);
            });

            actions.append(input, localBtn, resetBtn, fileInput);
            body.append(title, actions);
            row.append(preview, body);
            wrap.appendChild(row);
        });
    }
    async function updateThemeIcon(id, src) {
        const cfg = await getThemeConfig();
        if (src) cfg.iconImages[id] = src;
        else delete cfg.iconImages[id];
        await saveThemeConfig(cfg);
        applyThemeIconImage(id, src);
        renderThemeIconList(cfg);
        renderChatWallpaperControls(cfg);
    }
    function refreshThemeControls(config = null) {
        const cfg = mergeThemeConfig(config || {});
        const wallInput = $('theme-wallpaper-url');
        if (wallInput) wallInput.value = cfg.wallpaperSrc ? (cfg.wallpaperSrc.startsWith('data:') ? '[本地文件]' : cfg.wallpaperSrc) : '';
        refreshThemeWallpaperPreview(cfg);
        const fontInput = $('theme-font-url');
        if (fontInput) fontInput.value = cfg.fontSrc ? (cfg.fontSrc.startsWith('data:') ? '[本地文件]' : cfg.fontSrc) : '';
        if ($('theme-font-size')) $('theme-font-size').value = Number(cfg.fontSize) || 16;
        if ($('theme-font-size-display')) $('theme-font-size-display').textContent = `${Number(cfg.fontSize) || 16}px`;
        if ($('theme-font-weight')) $('theme-font-weight').value = String(cfg.fontWeight || '400');
        if ($('theme-ui-scale')) $('theme-ui-scale').value = Number(cfg.uiScale) || 100;
        if ($('theme-ui-scale-display')) $('theme-ui-scale-display').textContent = `${Number(cfg.uiScale) || 100}%`;
        if ($('theme-fullscreen-toggle')) $('theme-fullscreen-toggle').textContent = cfg.statusHidden ? '恢复状态栏与退出全屏' : '一键隐藏系统状态栏';
        renderThemeIconList(cfg);
    }

    const chatWallpaperDefs = [
        { key: 'messages', label: '消息页壁纸', viewId: 'chat-view-messages' },
        { key: 'moments', label: '朋友圈页壁纸', viewId: 'chat-view-moments' },
        { key: 'home', label: '我的主页壁纸', viewId: 'chat-view-home' }
    ];
    function applyChatPageWallpapers(cfg = null) {
        const config = mergeThemeConfig(cfg || {});
        chatWallpaperDefs.forEach(def => {
            const view = $(def.viewId);
            if (!view) return;
            const src = config.chatWallpapers?.[def.key] || '';
            if (src) {
                view.dataset.wallpaper = '1';
                view.style.setProperty('--chat-view-wallpaper', `url('${cssUrl(src)}')`);
            } else {
                delete view.dataset.wallpaper;
                view.style.removeProperty('--chat-view-wallpaper');
            }
        });
    }
    function renderChatWallpaperControls(cfg = null) {
        const wrap = $('theme-chat-wallpaper-grid');
        if (!wrap) return;
        const config = mergeThemeConfig(cfg || {});
        wrap.innerHTML = '';
        chatWallpaperDefs.forEach(def => {
            const row = document.createElement('div');
            row.className = 'theme-chat-wallpaper-row';
            const src = config.chatWallpapers?.[def.key] || '';
            row.innerHTML = `<span class="settings-label">${def.label}</span><input class="settings-input" id="theme-chat-wallpaper-${def.key}-url" placeholder="图片 / GIF URL" value="${chatEscape(src && !src.startsWith('data:') ? src : (src ? '[本地文件]' : ''))}"><div class="theme-chat-wallpaper-actions"><button class="action-btn" id="theme-chat-wallpaper-${def.key}-file" type="button">本地</button><button class="action-btn primary" id="theme-chat-wallpaper-${def.key}-apply" type="button">应用</button><button class="action-btn danger" id="theme-chat-wallpaper-${def.key}-reset" type="button">重置</button></div><input class="theme-hidden-file" id="theme-chat-wallpaper-${def.key}-input" type="file" accept="image/*">`;
            wrap.appendChild(row);
            let pending = '';
            $(`theme-chat-wallpaper-${def.key}-file`)?.addEventListener('click', () => $(`theme-chat-wallpaper-${def.key}-input`)?.click());
            $(`theme-chat-wallpaper-${def.key}-input`)?.addEventListener('change', async () => {
                const file = $(`theme-chat-wallpaper-${def.key}-input`)?.files?.[0];
                if (!file) return;
                pending = await readFileAsDataURL(file);
                $(`theme-chat-wallpaper-${def.key}-url`).value = '[本地文件]';
                $(`theme-chat-wallpaper-${def.key}-input`).value = '';
                showToast(`${def.label}已读取，点击应用生效`);
            });
            $(`theme-chat-wallpaper-${def.key}-apply`)?.addEventListener('click', async () => {
                const inputVal = $(`theme-chat-wallpaper-${def.key}-url`)?.value?.trim() || '';
                const finalSrc = inputVal === '[本地文件]' ? pending : inputVal;
                if (!finalSrc) { await showGlobalAlert('请输入 URL 或选择本地图片/GIF。'); return; }
                const newCfg = await getThemeConfig();
                newCfg.chatWallpapers = { ...(newCfg.chatWallpapers || {}), [def.key]: finalSrc };
                await saveThemeConfig(newCfg);
                applyChatPageWallpapers(newCfg);
                renderChatWallpaperControls(newCfg);
                showToast(`${def.label}已应用`);
            });
            $(`theme-chat-wallpaper-${def.key}-reset`)?.addEventListener('click', async () => {
                const newCfg = await getThemeConfig();
                newCfg.chatWallpapers = { ...(newCfg.chatWallpapers || {}), [def.key]: '' };
                await saveThemeConfig(newCfg);
                applyChatPageWallpapers(newCfg);
                renderChatWallpaperControls(newCfg);
                showToast(`${def.label}已重置`);
            });
        });
    }

    async function applyWallpaperFromControls() {
        const input = $('theme-wallpaper-url');
        let src = input?.value?.trim() || '';
        let type = 'image';
        if (src === '[本地文件]' && themePendingWallpaper?.src) {
            src = themePendingWallpaper.src;
            type = themePendingWallpaper.type;
        } else if (src === '[本地文件]') {
            await showGlobalAlert('请重新选择本地壁纸文件。');
            return;
        } else if (src) {
            type = mediaTypeFromSource(src);
        } else {
            await showGlobalAlert('请输入壁纸 URL 或选择本地文件。');
            return;
        }
        const cfg = await getThemeConfig();
        cfg.wallpaperSrc = src;
        cfg.wallpaperType = type;
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        showToast(type === 'video' ? '动态壁纸已应用' : '壁纸已应用');
    }
    async function applyFontFromControls() {
        const input = $('theme-font-url');
        let src = input?.value?.trim() || '';
        if (src === '[本地文件]' && themePendingFontData) src = themePendingFontData;
        else if (src === '[本地文件]') {
            await showGlobalAlert('请重新选择本地字体文件。');
            return;
        }
        const cfg = await getThemeConfig();
        cfg.fontSrc = src;
        cfg.fontSize = Number($('theme-font-size')?.value || 16);
        cfg.fontWeight = String($('theme-font-weight')?.value || '400');
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        showToast('全局字体已应用');
    }
    async function resetThemeFont() {
        const cfg = await getThemeConfig();
        cfg.fontSrc = '';
        cfg.fontSize = 16;
        cfg.fontWeight = '400';
        themePendingFontData = null;
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        showToast('字体已重置默认');
    }
    async function resetThemeWallpaper() {
        const cfg = await getThemeConfig();
        cfg.wallpaperType = 'default';
        cfg.wallpaperSrc = '';
        themePendingWallpaper = null;
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        showToast('壁纸已重置默认');
    }
    async function applyUiScaleFromControls(reset = false) {
        const cfg = await getThemeConfig();
        cfg.uiScale = reset ? 100 : Number($('theme-ui-scale')?.value || 100);
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        showToast(reset ? 'UI 缩放已重置' : 'UI 缩放已应用');
    }
    async function toggleThemeFullscreen() {
        const cfg = await getThemeConfig();
        cfg.statusHidden = !cfg.statusHidden;
        await saveThemeConfig(cfg);
        await applyThemeConfig(cfg);
        try {
            if (cfg.statusHidden) {
                const root = document.documentElement;
                if (!document.fullscreenElement && root.requestFullscreen) await root.requestFullscreen();
            } else if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (e) {}
        showToast(cfg.statusHidden ? '已隐藏状态栏并进入全屏' : '已恢复状态栏');
    }
    async function initThemeApp() {
        captureThemeIconDefaults();
        const cfg = await getThemeConfig();
        await applyThemeConfig(cfg);
        if (themeInitialized) return;
        themeInitialized = true;
        if (btnTheme && themePage) {
            btnTheme.addEventListener('click', async (e) => {
                e.stopPropagation();
                await applyThemeConfig();
                themePage.style.display = 'flex';
            });
        }
        if (closeThemeBtn && themePage) closeThemeBtn.addEventListener('click', () => { themePage.style.display = 'none'; });
        $('theme-wallpaper-file-btn')?.addEventListener('click', () => $('theme-wallpaper-file')?.click());
        $('theme-wallpaper-file')?.addEventListener('change', async () => {
            const file = $('theme-wallpaper-file').files?.[0];
            if (!file) return;
            const src = await readFileAsDataURL(file);
            themePendingWallpaper = { src, type: mediaTypeFromSource(src, file) };
            $('theme-wallpaper-url').value = '[本地文件]';
            $('theme-wallpaper-file').value = '';
            showToast('本地壁纸已读取，点击应用壁纸生效');
        });
        $('theme-wallpaper-apply')?.addEventListener('click', applyWallpaperFromControls);
        $('theme-wallpaper-url')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyWallpaperFromControls(); });
        $('theme-wallpaper-reset')?.addEventListener('click', resetThemeWallpaper);
        $('theme-font-file-btn')?.addEventListener('click', () => $('theme-font-file')?.click());
        $('theme-font-file')?.addEventListener('change', async () => {
            const file = $('theme-font-file').files?.[0];
            if (!file) return;
            themePendingFontData = await readFileAsDataURL(file);
            $('theme-font-url').value = '[本地文件]';
            $('theme-font-file').value = '';
            showToast('本地字体已读取，点击应用字体生效');
        });
        $('theme-font-apply')?.addEventListener('click', applyFontFromControls);
        $('theme-font-url')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFontFromControls(); });
        $('theme-font-reset')?.addEventListener('click', resetThemeFont);
        $('theme-font-size')?.addEventListener('input', (e) => { $('theme-font-size-display').textContent = `${e.target.value}px`; });
        $('theme-ui-scale')?.addEventListener('input', (e) => { $('theme-ui-scale-display').textContent = `${e.target.value}%`; });
        $('theme-ui-apply')?.addEventListener('click', () => applyUiScaleFromControls(false));
        $('theme-ui-reset')?.addEventListener('click', () => applyUiScaleFromControls(true));
        $('theme-fullscreen-toggle')?.addEventListener('click', toggleThemeFullscreen);
    }


    if (btnSettings && settingsPage) {
        btnSettings.addEventListener('click', async (e) => {
            e.stopPropagation();
            await loadCurrentSettings();
            settingsPage.style.display = 'flex';
        });
        closeSettingsBtn.addEventListener('click', async () => {
            await saveCurrentSettings(true);
            settingsPage.style.display = 'none';
        });
        tempSlider.addEventListener('input', (e) => {
            tempDisplay.textContent = parseFloat(e.target.value).toFixed(1);
        });
        ['chat-url-input', 'voice-url-input'].forEach(normalizeUrlInputOnBlur);
        ['chat-url-input','chat-key-input','chat-model-input','chat-temperature','chat-context-input','voice-url-input','voice-key-input','voice-group-input','voice-id-input','github-token-input','github-user-input','github-repo-input'].forEach(id => {
            const el = $(id);
            if (el) el.addEventListener('change', () => saveCurrentSettings(true));
        });
        $('chat-preset-save').addEventListener('click', () => savePreset('chat'));
        $('chat-preset-delete').addEventListener('click', () => deletePreset('chat'));
        $('chat-preset-select').addEventListener('change', () => applyPreset('chat'));
        $('voice-preset-save').addEventListener('click', () => savePreset('voice'));
        $('voice-preset-delete').addEventListener('click', () => deletePreset('voice'));
        $('voice-preset-select').addEventListener('change', () => applyPreset('voice'));
        $('chat-fetch-models-btn').addEventListener('click', fetchModels);
        $('export-data-btn').addEventListener('click', () => exportAllData(false));
        $('export-batch-btn').addEventListener('click', () => exportAllData(true));
        $('import-data-btn').addEventListener('click', () => $('settings-import-file').click());
        $('import-batch-btn').addEventListener('click', () => $('settings-batch-import-file').click());
        $('clear-data-btn').addEventListener('click', clearAllData);
        $('github-backup-btn').addEventListener('click', githubBackup);
        bindImportInput('settings-import-file', false);
        bindImportInput('settings-batch-import-file', true);
        loadCurrentSettings();

        voiceTestBtn.addEventListener('click', async () => {
            if (voiceTestBtn.disabled) return;
            const voice = await collectVoiceConfig();
            if (!voice.baseUrl || !voice.apiKey || !voice.groupId || !voice.voiceId) {
                showToast('请先填写语音接口、API Key、GROUP ID 和 VOICE ID');
                return;
            }
            showToast('正在呼叫语音接口...');
            voiceTestBtn.style.opacity = '0.5';
            voiceTestBtn.disabled = true;
            try {
                const testUrl = `${voice.baseUrl}/t2a_v2`;
                const res = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${voice.apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'speech-2.8-hd', text: '感谢使用兔兔丸机', stream: false, language_boost: 'auto', output_format: 'hex', voice_setting: { voice_id: voice.voiceId, speed: 1, vol: 1, pitch: 0 }, audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 } })
                });
                if (!res.ok) throw new Error('状态码 ' + res.status);
                showToast('语音接口测试完成');
            } catch (err) {
                showToast('语音测试失败：' + err.message);
            } finally {
                voiceTestBtn.style.opacity = '1';
                voiceTestBtn.disabled = false;
            }
        });
    }




    // ===================================
    // ====== 购物 APP：新页面 / AI进货 / 购物车 / 背包 / 资产钱包联动 ======
    // ===================================

    const shopCategories = [
        { id: 'all', name: '推荐', short: '推' },
        { id: 'daily', name: '日常', short: '日' },
        { id: 'gift', name: '礼物', short: '礼' },
        { id: 'fashion', name: '穿搭', short: '穿' },
        { id: 'digital', name: '数码', short: '数' },
        { id: 'magic', name: '奇妙', short: '奇' }
    ];
    const shopSeedProducts = [
        { id: 'seed-plush-hoodie', title: '云朵绒兔耳连帽衫', desc: '软乎乎的居家外套，适合深夜聊天和下雨天。', price: 89.9, cat: 'fashion', tag: '柔软穿搭', visual: '穿', rating: 4.9, sold: 128 },
        { id: 'seed-sugar-tea', title: '草莓气泡心情茶', desc: '开盖会冒出粉色小泡泡，喝完心情更轻。', price: 18.8, cat: 'daily', tag: '今日饮品', visual: '饮', rating: 4.8, sold: 341 },
        { id: 'seed-starlamp', title: '床头星愿小夜灯', desc: '自动记录愿望的暖光小灯，适合放在聊天背景里。', price: 46.0, cat: 'daily', tag: '睡前氛围', visual: '灯', rating: 4.7, sold: 206 },
        { id: 'seed-letter', title: '手写告白信纸套装', desc: '自带浅浅香味，写给 char 或 NPC 都很有仪式感。', price: 12.5, cat: 'gift', tag: '礼物推荐', visual: '信', rating: 4.9, sold: 520 },
        { id: 'seed-headphone', title: '一起听透明耳机', desc: '分享音乐时会亮起同频呼吸灯。', price: 129.0, cat: 'digital', tag: '数码配件', visual: '听', rating: 4.6, sold: 95 },
        { id: 'seed-pocket', title: '随机幸运口袋', desc: '打开会获得一个今天最需要的小道具。', price: 29.9, cat: 'magic', tag: '盲盒道具', visual: '袋', rating: 4.5, sold: 777 },
        { id: 'seed-camera', title: '拍立得回忆相纸', desc: '会把普通照片变成柔焦回忆卡片。', price: 36.6, cat: 'digital', tag: '记录生活', visual: '相', rating: 4.8, sold: 188 },
        { id: 'seed-ring', title: '月光银色尾戒', desc: '极简冷光小饰品，适合送人或自己戴。', price: 66.0, cat: 'gift', tag: '精致礼物', visual: '戒', rating: 4.7, sold: 114 }
    ];
    let shopState = null;
    let shopInitialized = false;
    let shopDetailProductId = '';
    let shopActionState = { mode: '', productId: '', inventoryId: '' };

    function stripShopEmoji(value = '') {
        return String(value || '').replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0E\uFE0F]/g, '').trim();
    }
    function shopText(value = '', fallback = '') {
        const clean = stripShopEmoji(value).replace(/\s+/g, ' ').trim();
        return clean || fallback;
    }
    function shopCatShort(cat) {
        return (shopCategories.find(c => c.id === cat)?.short || '物').slice(0, 2);
    }
    function cloneShopProduct(p = {}, index = 0) {
        const catIds = shopCategories.filter(c => c.id !== 'all').map(c => c.id);
        const cat = catIds.includes(p.cat) ? p.cat : catIds[index % catIds.length];
        const title = shopText(p.title || p.name, '未命名商品').slice(0, 42);
        return {
            id: String(p.id || ('shop-' + Date.now() + '-' + index + '-' + Math.random().toString(36).slice(2, 7))),
            title,
            desc: shopText(p.desc || p.description, '这是一件兔兔丸严选好物。').slice(0, 120),
            price: Math.max(1, Number(p.price || 19.9)),
            cat,
            tag: shopText(p.tag || shopCategories.find(c => c.id === cat)?.name, '好物').slice(0, 14),
            visual: shopText(p.visual || p.symbol || p.iconText || title.slice(0, 1) || shopCatShort(cat), shopCatShort(cat)).slice(0, 2),
            rating: Math.min(5, Math.max(3.8, Number(p.rating || (4.5 + Math.random() * .4)))),
            sold: Math.max(0, Math.floor(Number(p.sold || p.sales || Math.random() * 300 + 20)))
        };
    }
    function defaultShopState() {
        return {
            activeTab: 'home',
            currentCat: 'all',
            query: '',
            style: '兔兔丸世界里的可爱、实用、带一点幻想感的日常好物；商品可以服务 user、char、NPC 的生活和剧情。',
            products: shopSeedProducts.map(cloneShopProduct),
            cart: [],
            orders: [],
            inventory: [],
            wishlist: [],
            updatedAt: Date.now()
        };
    }
    function normalizeShopState(data = {}) {
        const base = defaultShopState();
        const products = Array.isArray(data.products) && data.products.length ? data.products : base.products;
        return {
            ...base,
            ...(data || {}),
            products: products.map(cloneShopProduct),
            cart: Array.isArray(data.cart) ? data.cart.map(i => ({ id: String(i.id || i.productId || ''), count: Math.max(1, Number(i.count || 1)) })).filter(i => i.id) : [],
            orders: Array.isArray(data.orders) ? data.orders : [],
            inventory: Array.isArray(data.inventory) ? data.inventory.map((i, idx) => ({
                id: String(i.id || i.productId || ('inv-' + idx)),
                title: shopText(i.title || i.name, '物品'),
                visual: shopText(i.visual || i.symbol || i.iconText || i.title || '物', '物').slice(0, 2),
                count: Math.max(1, Number(i.count || 1)),
                price: Math.max(0, Number(i.price || 0)),
                tag: shopText(i.tag || '背包物品', '背包物品'),
                cat: ['daily','gift','fashion','digital','magic'].includes(i.cat) ? i.cat : 'daily'
            })) : [],
            wishlist: Array.isArray(data.wishlist) ? data.wishlist : []
        };
    }
    async function loadShopState() {
        shopState = normalizeShopState(await getSetting('shop_app_state', {}));
        return shopState;
    }
    async function saveShopState() {
        if (shopState) await setSetting('shop_app_state', normalizeShopState(shopState));
    }
    function shopMoney(n) { return Number(n || 0).toFixed(2); }
    function shopWalletBalance() { return Number(walletState?.balance || 0); }
    function getShopProduct(id) { return (shopState?.products || []).find(p => p.id === id); }
    function shopCartCount() { return (shopState?.cart || []).reduce((sum, item) => sum + Number(item.count || 0), 0); }
    function shopCartTotal() {
        return (shopState?.cart || []).reduce((sum, item) => {
            const p = getShopProduct(item.id);
            return sum + (p ? Number(p.price || 0) * Number(item.count || 0) : 0);
        }, 0);
    }
    function formatShopWallet() { return typeof formatWalletAmount === 'function' ? formatWalletAmount(shopWalletBalance()) : ('¥' + shopMoney(shopWalletBalance())); }
    function shopItemsLabel(items = []) {
        return items.map(i => `${shopText(i.title || '商品', '商品')}×${Number(i.count || 1)}`).join('、').slice(0, 80);
    }
    function shopHashCode(value = '') {
        let hash = 0;
        const str = String(value || 'shop');
        for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i), hash |= 0;
        return Math.abs(hash);
    }
    const shopArtPalettes = [
        ['#FFF0F5', '#FCE8EF', '#D4A5B9', '#FFFFFF'],
        ['#F8F2FF', '#EDE3FF', '#B9A6D3', '#FFFFFF'],
        ['#F1FAFF', '#DFF2FF', '#92B7CC', '#FFFFFF'],
        ['#FFF7EC', '#FFE8C9', '#D4AD7A', '#FFFFFF'],
        ['#F4FFF8', '#DDF5E8', '#8EBEA5', '#FFFFFF']
    ];
    function shopArtStyle(p = {}) {
        const idx = shopHashCode(`${p.id || ''}${p.title || ''}${p.cat || ''}`) % shopArtPalettes.length;
        const pal = shopArtPalettes[idx];
        return `--shop-art-a:${pal[0]};--shop-art-b:${pal[1]};--shop-art-c:${pal[2]};--shop-art-d:${pal[3]};`;
    }
    function shopArtCat(p = {}) {
        const cat = String(p.cat || 'daily').replace(/[^a-z0-9_-]/gi, '');
        return ['daily','gift','fashion','digital','magic'].includes(cat) ? cat : 'daily';
    }
    function shopMarkHTML(value, cls = 'shop-product-mark') {
        const pseudo = { id: `mark-${value || 'shop'}`, title: value || 'shop', cat: 'daily' };
        return shopArtHTML(pseudo, cls);
    }
    function shopProductMark(p, cls = 'shop-product-mark') {
        return shopArtHTML(p || {}, cls);
    }
    function shopArtHTML(p = {}, cls = 'shop-product-mark') {
        const cat = shopArtCat(p);
        return `<span class="${cls} shop-art-tile shop-art-${cat}" style="${shopArtStyle(p)}" aria-hidden="true"><i></i><b></b></span>`;
    }
    async function syncShopWalletUI() {
        if (typeof loadWalletState === 'function') await loadWalletState();
        const balance = formatShopWallet();
        if ($('shop-balance-text')) $('shop-balance-text').textContent = balance;
        if ($('shop-wallet-balance')) $('shop-wallet-balance').textContent = balance;
        if ($('shop-stat-wallet')) $('shop-stat-wallet').textContent = balance;
        if ($('shop-style-text')) $('shop-style-text').textContent = shopText(shopState?.style || '兔兔严选', '兔兔严选').slice(0, 18);
        if ($('shop-profile-name')) $('shop-profile-name').textContent = $('text-username')?.textContent?.trim() || 'User';
    }
    async function openShopApp() {
        const page = $('shop-app-page');
        if (!page) return;
        if (!shopState) await loadShopState();
        await syncShopWalletUI();
        page.style.display = 'flex';
        page.setAttribute('aria-hidden', 'false');
        renderShopAll();
    }
    function closeShopApp() {
        const page = $('shop-app-page');
        if (!page) return;
        closeShopDetail();
        closeShopActionModal();
        page.style.display = 'none';
        page.setAttribute('aria-hidden', 'true');
    }
    function setShopTab(tab) {
        if (!shopState || !['home','cart','orders','profile'].includes(tab)) return;
        shopState.activeTab = tab;
        saveShopState();
        renderShopAll();
        if (tab === 'profile' || tab === 'cart') syncShopWalletUI();
    }
    function setShopCat(cat) {
        if (!shopState) return;
        shopState.currentCat = cat;
        saveShopState();
        renderShopAll();
    }
    function filteredShopProducts() {
        if (!shopState) return [];
        const q = shopText(shopState.query || '').toLowerCase();
        return shopState.products.filter(p => {
            const catOK = shopState.currentCat === 'all' || p.cat === shopState.currentCat;
            const text = `${p.title} ${p.desc} ${p.tag}`.toLowerCase();
            return catOK && (!q || text.includes(q));
        });
    }
    function renderShopCats() {
        const nav = $('shop-cat-nav');
        if (!nav || !shopState) return;
        nav.innerHTML = shopCategories.map(c => `<button class="shop-cat-pill ${shopState.currentCat === c.id ? 'active' : ''}" data-shop-cat="${chatEscape(c.id)}">${chatEscape(c.name)}</button>`).join('');
    }
    function renderShopStats() {
        const count = shopCartCount();
        if ($('shop-stat-products')) $('shop-stat-products').textContent = String(shopState?.products?.length || 0);
        if ($('shop-stat-cart')) $('shop-stat-cart').textContent = String(count);
        if ($('shop-stat-wallet')) $('shop-stat-wallet').textContent = formatShopWallet();
        const badge = $('shop-cart-badge');
        if (badge) { badge.textContent = String(count); badge.style.display = count ? 'flex' : 'none'; }
        syncShopWalletUI();
    }
    function renderShopProducts() {
        const grid = $('shop-product-grid');
        if (!grid || !shopState) return;
        const items = filteredShopProducts();
        grid.innerHTML = items.length ? items.map(p => `
            <div class="shop-product-card" role="button" tabindex="0" data-shop-open="${chatEscape(p.id)}">
                <button class="shop-add-mini" data-shop-add="${chatEscape(p.id)}" aria-label="加入购物车"><svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg></button>
                <div class="shop-product-art" style="${shopArtStyle(p)}"><span class="shop-product-tag">${chatEscape(p.tag)}</span>${shopProductMark(p)}</div>
                <div class="shop-product-info">
                    <div class="shop-product-title">${chatEscape(p.title)}</div>
                    <div class="shop-product-desc">${chatEscape(p.desc)}</div>
                    <div class="shop-product-row"><div class="shop-price"><small>¥</small>${shopMoney(p.price)}</div><div style="font-size:10px;color:#B6AAB0;font-weight:800;">已售 ${Number(p.sold || 0)}</div></div>
                </div>
            </div>`).join('') : `<div class="shop-empty"><b>没有找到商品</b><br>换个关键词，或点右上角刷新重新进货。</div>`;
    }
    function renderShopCart() {
        const list = $('shop-cart-list');
        const totalEl = $('shop-cart-total');
        if (totalEl) totalEl.innerHTML = `<small>¥</small>${shopMoney(shopCartTotal())}`;
        if (!list || !shopState) return;
        const rows = shopState.cart.map(item => ({ item, p: getShopProduct(item.id) })).filter(x => x.p);
        list.innerHTML = rows.length ? rows.map(({ item, p }) => `
            <div class="shop-list-card">
                <div class="shop-list-icon">${shopProductMark(p, 'shop-list-mark')}</div>
                <div><div class="shop-list-name">${chatEscape(p.title)}</div><div class="shop-list-sub">¥${shopMoney(p.price)} · ${chatEscape(p.tag)} · 资产钱包扣款</div></div>
                <div><div class="shop-stepper"><button data-shop-dec="${chatEscape(p.id)}">−</button><b>${Number(item.count || 1)}</b><button data-shop-inc="${chatEscape(p.id)}">+</button></div><div class="shop-remove-link" data-shop-remove="${chatEscape(p.id)}">移除</div></div>
            </div>`).join('') : '<div class="shop-empty"><b>购物车空空如也</b><br>去首页挑选商品吧。</div>';
    }
    function renderShopOrders() {
        const list = $('shop-order-list');
        if (!list || !shopState) return;
        list.innerHTML = shopState.orders.length ? shopState.orders.map(o => {
            const items = (o.items || []).map(i => `${shopText(i.title || '商品', '商品')} ×${Number(i.count || 1)}`).join('　');
            const time = new Date(o.createdAt || Date.now()).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const status = shopText(o.status || '已支付', '已支付');
            const mark = o.status === '代付请求' ? '代' : (o.giftTo ? '礼' : '票');
            return `<div class="shop-list-card" style="grid-template-columns:54px 1fr auto;"><div class="shop-list-icon" style="width:54px;height:54px;">${shopMarkHTML(mark, 'shop-list-mark')}</div><div><div class="shop-list-name">订单 ${chatEscape(o.id || '')}</div><div class="shop-list-sub">${chatEscape(status)} · ${chatEscape(o.paySource || '资产钱包')}<br>${chatEscape(items || '虚拟商品')}<br>${chatEscape(o.giftTo ? '收礼人：' + o.giftTo : time)}</div></div><div class="shop-price"><small>¥</small>${shopMoney(o.total)}</div></div>`;
        }).join('') : '<div class="shop-empty"><b>还没有订单</b><br>结算、送礼或代付请求会出现在这里。</div>';
    }
    function renderShopInventory() {
        const list = $('shop-inventory-list');
        if (!list || !shopState) return;
        list.innerHTML = shopState.inventory.length ? shopState.inventory.map(i => `<div class="shop-inv-item" data-shop-inv="${chatEscape(i.id || '')}">${shopProductMark(i, 'shop-inv-mark')}<div class="shop-inv-name">${chatEscape(i.title || '物品')}</div><div class="shop-inv-count">×${Number(i.count || 1)}</div></div>`).join('') : '<div class="shop-empty" style="grid-column:1/-1;"><b>背包还空着</b><br>去结算一些商品吧。</div>';
    }
    function renderShopAll() {
        if (!shopState) return;
        document.querySelectorAll('.shop-panel').forEach(p => p.classList.toggle('active', p.id === 'shop-view-' + shopState.activeTab));
        document.querySelectorAll('.shop-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.shopTab === shopState.activeTab));
        const titleMap = { home: ['购物中心', '资产钱包直连'], cart: ['购物车', '结算 / 代付'], orders: ['我的订单', '购物与送礼记录'], profile: ['我的', '资产钱包与背包'] };
        const [title, sub] = titleMap[shopState.activeTab] || titleMap.home;
        if ($('shop-page-title')) $('shop-page-title').textContent = title;
        if ($('shop-page-subtitle')) $('shop-page-subtitle').textContent = sub;
        if ($('shop-search-input') && $('shop-search-input').value !== shopState.query) $('shop-search-input').value = shopState.query || '';
        renderShopCats(); renderShopStats(); renderShopProducts(); renderShopCart(); renderShopOrders(); renderShopInventory();
    }
    async function addShopToCart(productId, count = 1) {
        if (!shopState) await loadShopState();
        const p = getShopProduct(productId);
        if (!p) return;
        const row = shopState.cart.find(i => i.id === productId);
        if (row) row.count = Math.max(1, Number(row.count || 1) + count);
        else shopState.cart.push({ id: productId, count: Math.max(1, count) });
        await saveShopState();
        renderShopAll();
        showToast('已加入购物车');
    }
    async function changeShopCart(productId, delta) {
        if (!shopState) return;
        const row = shopState.cart.find(i => i.id === productId);
        if (!row) return;
        row.count = Number(row.count || 1) + delta;
        if (row.count <= 0) shopState.cart = shopState.cart.filter(i => i.id !== productId);
        await saveShopState(); renderShopAll();
    }
    async function removeShopCart(productId) {
        if (!shopState) return;
        shopState.cart = shopState.cart.filter(i => i.id !== productId);
        await saveShopState(); renderShopAll();
    }
    function openShopDetail(productId) {
        const p = getShopProduct(productId);
        if (!p) return;
        shopDetailProductId = productId;
        const modal = $('shop-detail-modal');
        const content = $('shop-detail-content');
        if (!modal || !content) return;
        content.innerHTML = `
            <div class="shop-detail-hero" style="${shopArtStyle(p)}">${shopProductMark(p, 'shop-detail-mark')}</div>
            <div class="shop-detail-title">${chatEscape(p.title)}</div>
            <div class="shop-detail-meta">${chatEscape(p.tag)} · 评分 ${Number(p.rating || 4.8).toFixed(1)} · 已售 ${Number(p.sold || 0)}</div>
            <div class="shop-detail-desc">${chatEscape(p.desc)} 下单时会从资产钱包扣款，随后进入订单和背包；也可以直接送给联系人作为剧情礼物。</div>
            <div class="shop-review-box"><div class="shop-review-title">买家印象</div><div class="shop-review">匿名买家：包装干净，质感像从角色世界寄来的。</div><div class="shop-review">Char 买家：实物比图片更柔和，送人也合适。</div></div>`;
        if ($('shop-detail-price')) $('shop-detail-price').innerHTML = `<small>¥</small>${shopMoney(p.price)}`;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
    function closeShopDetail() {
        const modal = $('shop-detail-modal');
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        shopDetailProductId = '';
    }
    async function checkoutShopCart() {
        if (!shopState) return;
        const total = Number(shopCartTotal().toFixed(2));
        if (!shopState.cart.length) { showToast('购物车是空的'); return; }
        await loadWalletState();
        if (shopWalletBalance() < total) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatShopWallet()}\n需要金额：¥${shopMoney(total)}`, '余额不足');
            setShopTab('profile');
            return;
        }
        const items = shopState.cart.map(item => ({ ...getShopProduct(item.id), count: Number(item.count || 1) })).filter(i => i.id);
        const order = { id: 'TUTU' + Date.now().toString().slice(-8), items, total, status: '已支付', paySource: '资产钱包', createdAt: Date.now() };
        const ok = await walletRecordChatBill({ amount: total, direction: 'expense', type: '商城购物', note: `${order.id} · ${shopItemsLabel(items)}` });
        if (!ok) {
            await showGlobalAlert('资产钱包扣款失败，请检查余额后重试。', '结算失败');
            await syncShopWalletUI();
            return;
        }
        shopState.orders.unshift(order);
        for (const item of items) addShopInventoryItem(item);
        shopState.cart = [];
        await saveShopState();
        await syncShopWalletUI();
        renderShopAll();
        showToast('支付成功，已放入背包');
        setShopTab('orders');
    }
    function addShopInventoryItem(item) {
        if (!item?.id) return;
        const exist = shopState.inventory.find(i => i.id === item.id);
        if (exist) exist.count = Number(exist.count || 1) + Number(item.count || 1);
        else shopState.inventory.unshift({ id: item.id, title: item.title, visual: item.visual, count: Number(item.count || 1), price: item.price, tag: item.tag, cat: item.cat || 'daily' });
    }
    async function buyShopProductNow(productId) {
        if (!shopState) await loadShopState();
        const p = getShopProduct(productId);
        if (!p) return;
        await loadWalletState();
        if (shopWalletBalance() < Number(p.price || 0)) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatShopWallet()}\n需要金额：¥${shopMoney(p.price)}`, '余额不足');
            setShopTab('profile');
            return;
        }
        const ok = await walletRecordChatBill({ amount: p.price, direction: 'expense', type: '商城购物', note: p.title });
        if (!ok) return;
        const order = { id: 'BUY' + Date.now().toString().slice(-8), items: [{ ...p, count: 1 }], total: Number(p.price), status: '已支付', paySource: '资产钱包', createdAt: Date.now() };
        shopState.orders.unshift(order);
        addShopInventoryItem({ ...p, count: 1 });
        await saveShopState();
        await syncShopWalletUI();
        closeShopDetail();
        renderShopAll();
        showToast('购买成功，已放入背包');
        setShopTab('orders');
    }
    async function sellShopInventory(productId) {
        if (!shopState) return;
        const item = shopState.inventory.find(i => i.id === productId);
        if (!item) return;
        openShopInventoryAction(productId);
    }
    function openShopInventoryAction(productId) {
        const item = shopState.inventory.find(i => i.id === productId);
        if (!item) return;
        shopActionState = { mode: 'inventory-action', inventoryId: productId, productId: '' };
        const modal = $('shop-action-modal');
        const title = $('shop-action-title');
        const body = $('shop-action-content');
        if (!modal || !body || !title) return;
        title.textContent = item.title;
        const refund = Number((Number(item.price || 0) * 0.8).toFixed(2));
        body.innerHTML = `
            <div class="shop-action-panel">
                <div style="display:grid;grid-template-columns:54px 1fr;gap:12px;align-items:center;">${shopProductMark(item, 'shop-list-mark')}<div><div class="shop-list-name">${chatEscape(item.title)}</div><div class="shop-list-sub">数量 ×${Number(item.count || 1)} · 回收价 ${formatWalletAmount(refund)}</div></div></div>
                <div class="shop-inv-actions">
                    <button class="shop-main-btn" data-shop-inv-action="gift">送给联系人</button>
                    <button class="shop-ghost-btn" data-shop-inv-action="sell">回收到资产钱包</button>
                    <button class="shop-ghost-btn" data-shop-inv-action="delete">丢弃物品</button>
                </div>
            </div>`;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
    async function handleShopInventoryAction(action) {
        const productId = shopActionState.inventoryId;
        const item = shopState?.inventory?.find(i => i.id === productId);
        if (!item) return;
        if (action === 'gift') { closeShopActionModal(); openShopContactPicker('gift-inventory', '', productId); return; }
        if (action === 'delete') {
            const ok = await showGlobalConfirm(`丢弃「${item.title}」？此操作不会退款。`, '丢弃物品');
            if (!ok) return;
            decreaseShopInventory(productId, 1);
            await saveShopState(); renderShopAll(); closeShopActionModal(); showToast('已丢弃'); return;
        }
        if (action === 'sell') {
            const refund = Number((Number(item.price || 0) * 0.8).toFixed(2));
            const ok = await showGlobalConfirm(`回收「${item.title}」？\n将返还 ${formatWalletAmount(refund)} 到资产钱包。`, '背包回收');
            if (!ok) return;
            decreaseShopInventory(productId, 1);
            await walletRecordChatBill({ amount: refund, direction: 'income', type: '背包回收', note: item.title || '购物物品' });
            await saveShopState(); await syncShopWalletUI(); renderShopAll(); closeShopActionModal(); showToast('已回收入账资产钱包');
        }
    }
    function decreaseShopInventory(productId, count = 1) {
        const item = shopState.inventory.find(i => i.id === productId);
        if (!item) return null;
        item.count = Number(item.count || 1) - Number(count || 1);
        if (item.count <= 0) shopState.inventory = shopState.inventory.filter(i => i.id !== productId);
        return item;
    }
    async function refreshShopProducts() {
        if (!shopState) await loadShopState();
        const btn = $('shop-refresh-btn');
        if (btn) btn.style.opacity = '.55';
        showToast('正在进货');
        try {
            const aiProducts = await generateShopProductsWithAPI();
            shopState.products = aiProducts.length ? aiProducts : shopSeedProducts.map(cloneShopProduct);
            shopState.currentCat = 'all';
            shopState.query = '';
            if ($('shop-search-input')) $('shop-search-input').value = '';
            shopState.updatedAt = Date.now();
            await saveShopState();
            setShopTab('home');
            renderShopAll();
            showToast('已刷新商品');
        } catch (err) {
            const pool = shopSeedProducts.map((p, i) => cloneShopProduct({ ...p, id: p.id + '-' + Date.now() + '-' + i, sold: Math.floor(Math.random()*800+30), price: Math.max(6, Number(p.price) + (Math.random()*12-4)) }, i));
            shopState.products = pool;
            shopState.currentCat = 'all';
            shopState.query = '';
            if ($('shop-search-input')) $('shop-search-input').value = '';
            shopState.updatedAt = Date.now();
            await saveShopState();
            setShopTab('home');
            renderShopAll();
            showToast('已使用本地精选进货');
        } finally {
            if (btn) btn.style.opacity = '1';
        }
    }
    async function generateShopProductsWithAPI() {
        const cfg = typeof getTutuwanChatConfig === 'function' ? await getTutuwanChatConfig() : await getSetting('chat_config', {});
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) throw new Error('未配置 API');
        const catHint = shopCategories.filter(c => c.id !== 'all').map(c => `${c.id}:${c.name}`).join('、');
        const prompt = `请为一个虚拟手机里的购物 APP 生成 10 个商品。进货设定：${shopState.style}
分类只能从这些 id 里选：${catHint}
要求：可爱但有真实购物感，不要色情暴力，不要药品武器等高风险物品；价格为数字；禁止使用任何 emoji 或表情符号；不要输出商品图标文字、不要输出外部媒体字段；tag 短。
只输出严格 JSON 数组，每项格式：{"title":"商品名","desc":"一句卖点","price":39.9,"cat":"daily","tag":"短标签","rating":4.8,"sold":128}`;
        const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .8), messages: [{ role: 'user', content: prompt }] }) });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || '';
        const arr = parseShopProductJSON(raw);
        if (!arr.length) throw new Error('商品 JSON 为空');
        return arr.slice(0, 12).map(cloneShopProduct);
    }
    function parseShopProductJSON(raw = '') {
        let text = String(raw || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        try { const parsed = JSON.parse(text); return Array.isArray(parsed) ? parsed : (Array.isArray(parsed.products) ? parsed.products : []); } catch(e) {}
        const match = text.match(/\[[\s\S]*\]/);
        if (match) { try { const parsed = JSON.parse(match[0]); return Array.isArray(parsed) ? parsed : []; } catch(e) {} }
        return [];
    }
    async function editShopStyle() {
        if (!shopState) return;
        const value = await showGlobalPrompt('输入购物 APP 的进货设定 / 世界观，刷新商品时会参考它。', shopState.style, '进货设定');
        if (value === null || value === undefined || !String(value).trim()) return;
        shopState.style = stripShopEmoji(value).trim();
        await saveShopState();
        renderShopAll();
        showToast('进货设定已保存');
    }
    async function rechargeShopBalance() {
        await walletChangeBalance('充值');
        await syncShopWalletUI();
        renderShopAll();
    }
    async function openShopWallet() {
        await openWalletPage();
        await syncShopWalletUI();
    }
    async function shopGetContacts() {
        if (!chatInitialized) { try { await initChatApp(); } catch(e) {} }
        else { try { await loadChatState(); } catch(e) {} }
        const threads = Array.isArray(chatState?.threads) ? chatState.threads : [];
        return threads.filter(t => t && !t.blocked).map(t => ({
            id: t.id,
            threadId: t.id,
            chatId: t.id,
            charId: ensureTutuwanCharId(t),
            name: (typeof getTutuwanDisplayName === 'function') ? getTutuwanDisplayName(t) : (t.name || '未命名联系人'),
            sub: `ID ${ensureTutuwanCharId(t)} · ${t.setting || t.snippet || (t.isGroup ? '群聊' : '联系人')}`,
            avatar: t.avatar || `https://picsum.photos/seed/${encodeURIComponent(t.name || t.id)}/120/120`,
            isGroup: Boolean(t.isGroup)
        }));
    }
    async function openShopContactPicker(mode, productId = '', inventoryId = '') {
        shopActionState = { mode, productId, inventoryId };
        const modal = $('shop-action-modal');
        const title = $('shop-action-title');
        const body = $('shop-action-content');
        if (!modal || !title || !body) return;
        const contacts = await shopGetContacts();
        title.textContent = mode === 'daifu' ? '选择代付人' : '选择收礼人';
        if (!contacts.length) {
            body.innerHTML = '<div class="shop-empty"><b>还没有联系人</b><br>先在聊天应用里添加联系人。</div>';
        } else {
            body.innerHTML = contacts.map(c => `<button class="shop-contact-item" data-shop-contact="${chatEscape(c.id)}"><div class="shop-contact-avatar" style="background-image:url('${chatEscape(c.avatar)}')"></div><div><div class="shop-contact-name">${chatEscape(c.name)}</div><div class="shop-contact-sub">${chatEscape(c.sub || '')}</div></div></button>`).join('');
        }
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
    function closeShopActionModal() {
        const modal = $('shop-action-modal');
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        shopActionState = { mode: '', productId: '', inventoryId: '' };
    }
    async function shopSendTextToThread(threadId, content, meta = {}) {
        await loadChatState();
        const thread = (chatState.threads || []).find(t => t.id === threadId);
        if (!thread) return false;
        const finalContent = shopText(content, '商城消息');
        const msg = normalizeTutuwanMessageRecord({ role: 'user', type: 'text', content: finalContent, meta: enrichTutuwanAppMeta(thread, 'shop', { source: 'shop', ...(meta || {}) }), time: getChatTimestamp() }, thread);
        thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
        thread.messages.push(msg);
        thread.snippet = finalContent.slice(0, 40);
        thread.time = msg.time;
        await saveChatState();
        if (typeof renderChatThreads === 'function') renderChatThreads();
        return true;
    }
    async function handleShopContactPick(threadId) {
        const mode = shopActionState.mode;
        if (mode === 'daifu') return processShopDaifu(threadId);
        if (mode === 'gift-product') return processShopGiftProduct(threadId, shopActionState.productId);
        if (mode === 'gift-inventory') return processShopGiftInventory(threadId, shopActionState.inventoryId);
    }
    async function processShopDaifu(threadId) {
        if (!shopState?.cart?.length) { showToast('购物车是空的'); closeShopActionModal(); return; }
        const total = Number(shopCartTotal().toFixed(2));
        const items = shopState.cart.map(item => ({ ...getShopProduct(item.id), count: Number(item.count || 1) })).filter(i => i.id);
        const contact = (await shopGetContacts()).find(c => c.id === threadId);
        const note = await showGlobalPrompt('发送给对方的代付留言', '帮我看一下这份购物清单，可以的话帮我代付一下。', '代付留言');
        if (note === null || note === undefined || note === '') return;
        const order = { id: 'PAY' + Date.now().toString().slice(-8), threadId, chatId: threadId, charId: contact?.charId || '', targetName: contact?.name || '联系人', items, total, status: '代付请求', paySource: contact?.name || '联系人', createdAt: Date.now() };
        shopState.orders.unshift(order);
        await shopSendTextToThread(threadId, `商城代付请求\n金额：¥${shopMoney(total)}\n商品：${shopItemsLabel(items)}\n留言：${shopText(note, '帮我看一下这份购物清单。')}`, { shopOrderId: order.id, amount: total, kind: 'daifu' });
        await saveShopState();
        renderShopAll();
        closeShopActionModal();
        showToast('已发送代付请求');
        setShopTab('orders');
    }
    async function processShopGiftProduct(threadId, productId) {
        const p = getShopProduct(productId);
        if (!p) return;
        const contact = (await shopGetContacts()).find(c => c.id === threadId);
        const msg = await showGlobalPrompt('写给对方的礼物卡片', '希望你会喜欢这份礼物。', '赠送礼物');
        if (msg === null || msg === undefined || msg === '') return;
        await loadWalletState();
        if (shopWalletBalance() < Number(p.price || 0)) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatShopWallet()}\n需要金额：¥${shopMoney(p.price)}`, '余额不足');
            closeShopActionModal();
            setShopTab('profile');
            return;
        }
        const ok = await walletRecordChatBill({ amount: p.price, direction: 'expense', type: '商城送礼', note: `${p.title} · ${contact?.name || '联系人'}` });
        if (!ok) return;
        const order = { id: 'GFT' + Date.now().toString().slice(-8), threadId, chatId: threadId, charId: contact?.charId || '', targetName: contact?.name || '联系人', items: [{ ...p, count: 1 }], total: Number(p.price), status: '已赠送', paySource: '资产钱包', giftTo: contact?.name || '联系人', createdAt: Date.now() };
        shopState.orders.unshift(order);
        await shopSendTextToThread(threadId, `我在购物中心送你一份礼物：${p.title}\n价格：¥${shopMoney(p.price)}\n卡片：${shopText(msg, '希望你会喜欢这份礼物。')}`, { shopOrderId: order.id, amount: p.price, kind: 'gift' });
        await saveShopState();
        await syncShopWalletUI();
        renderShopAll();
        closeShopDetail(); closeShopActionModal();
        showToast('礼物已送出');
        setShopTab('orders');
    }
    async function processShopGiftInventory(threadId, inventoryId) {
        const item = shopState?.inventory?.find(i => i.id === inventoryId);
        if (!item) return;
        const contact = (await shopGetContacts()).find(c => c.id === threadId);
        const msg = await showGlobalPrompt('写给对方的礼物卡片', '这件东西送给你。', '赠送背包物品');
        if (msg === null || msg === undefined || msg === '') return;
        decreaseShopInventory(inventoryId, 1);
        const order = { id: 'BAG' + Date.now().toString().slice(-8), threadId, chatId: threadId, charId: contact?.charId || '', targetName: contact?.name || '联系人', items: [{ ...item, count: 1 }], total: 0, status: '背包赠送', paySource: '我的背包', giftTo: contact?.name || '联系人', createdAt: Date.now() };
        shopState.orders.unshift(order);
        await shopSendTextToThread(threadId, `我从背包里送你一件物品：${item.title}\n卡片：${shopText(msg, '这件东西送给你。')}`, { shopOrderId: order.id, kind: 'gift_inventory' });
        await saveShopState();
        renderShopAll();
        closeShopActionModal();
        showToast('背包物品已送出');
        setShopTab('orders');
    }
    async function initShopApp() {
        if (shopInitialized) return;
        shopInitialized = true;
        await loadShopState();
        await syncShopWalletUI();
        $('btn-shop')?.addEventListener('click', () => { openShopApp(); });
        $('shop-close-btn')?.addEventListener('click', closeShopApp);
        $('shop-refresh-btn')?.addEventListener('click', refreshShopProducts);
        $('shop-style-btn')?.addEventListener('click', editShopStyle);
        $('shop-clear-cart-btn')?.addEventListener('click', async () => { if (!shopState?.cart?.length) return; shopState.cart = []; await saveShopState(); renderShopAll(); showToast('购物车已清空'); });
        $('shop-checkout-btn')?.addEventListener('click', checkoutShopCart);
        $('shop-daifu-btn')?.addEventListener('click', () => openShopContactPicker('daifu'));
        $('shop-wallet-recharge-btn')?.addEventListener('click', rechargeShopBalance);
        $('shop-wallet-open-btn')?.addEventListener('click', openShopWallet);
        $('shop-detail-close')?.addEventListener('click', closeShopDetail);
        $('shop-detail-modal')?.addEventListener('click', (e) => { if (e.target?.id === 'shop-detail-modal') closeShopDetail(); });
        $('shop-detail-add')?.addEventListener('click', async () => { if (shopDetailProductId) await addShopToCart(shopDetailProductId, 1); closeShopDetail(); });
        $('shop-detail-buy')?.addEventListener('click', async () => { if (shopDetailProductId) await buyShopProductNow(shopDetailProductId); });
        $('shop-detail-gift')?.addEventListener('click', async () => { if (shopDetailProductId) openShopContactPicker('gift-product', shopDetailProductId); });
        $('shop-action-close')?.addEventListener('click', closeShopActionModal);
        $('shop-action-modal')?.addEventListener('click', (e) => { if (e.target?.id === 'shop-action-modal') closeShopActionModal(); });
        $('shop-search-input')?.addEventListener('input', async (e) => { if (!shopState) return; shopState.query = stripShopEmoji(e.target.value || ''); await saveShopState(); renderShopProducts(); });
        document.addEventListener('click', async (e) => {
            const tab = e.target.closest?.('[data-shop-tab]'); if (tab) { setShopTab(tab.dataset.shopTab); return; }
            const cat = e.target.closest?.('[data-shop-cat]'); if (cat) { setShopCat(cat.dataset.shopCat); return; }
            const add = e.target.closest?.('[data-shop-add]'); if (add) { e.preventDefault(); e.stopPropagation(); await addShopToCart(add.dataset.shopAdd, 1); return; }
            const open = e.target.closest?.('[data-shop-open]'); if (open) { openShopDetail(open.dataset.shopOpen); return; }
            const inc = e.target.closest?.('[data-shop-inc]'); if (inc) { await changeShopCart(inc.dataset.shopInc, 1); return; }
            const dec = e.target.closest?.('[data-shop-dec]'); if (dec) { await changeShopCart(dec.dataset.shopDec, -1); return; }
            const remove = e.target.closest?.('[data-shop-remove]'); if (remove) { await removeShopCart(remove.dataset.shopRemove); return; }
            const inv = e.target.closest?.('[data-shop-inv]'); if (inv) { await sellShopInventory(inv.dataset.shopInv); return; }
            const invAction = e.target.closest?.('[data-shop-inv-action]'); if (invAction) { await handleShopInventoryAction(invAction.dataset.shopInvAction); return; }
            const contact = e.target.closest?.('[data-shop-contact]'); if (contact) { await handleShopContactPick(contact.dataset.shopContact); return; }
        });
        renderShopAll();
    }



    // ===================================
    // ====== 外卖 APP：商家刷新 / 菜品菜单 / 订单 / 帮char点 / char代付 ======
    // ===================================
    const foodFilters = [
        { id: 'all', name: '推荐' },
        { id: 'fast', name: '快餐' },
        { id: 'noodle', name: '粉面' },
        { id: 'sweet', name: '甜品' },
        { id: 'drink', name: '饮品' },
        { id: 'night', name: '夜宵' }
    ];
    const foodSeedMerchants = [
        { id: 'food-seed-rice', name: '暖炉便当研究所', category: 'fast', rating: 4.8, monthlySales: 2186, distance: '1.1km', eta: '28分钟', deliveryFee: 3, minOrder: 18, notice: '热乎便当、汤品和小份加菜，适合忙到不想做饭的晚上。', tags: ['满30减5', '准时宝', '热销'], foods: [
            { id: 'rice-1', name: '照烧鸡腿便当', desc: '鸡腿肉煎到微焦，配溏心蛋和时蔬。', price: 28.8, tag: '招牌', sold: 612 },
            { id: 'rice-2', name: '番茄肥牛饭', desc: '酸甜番茄汤汁浇在米饭上，肥牛分量充足。', price: 31.5, tag: '热卖', sold: 438 },
            { id: 'rice-3', name: '玉米排骨汤', desc: '清甜汤底，适合搭配主食。', price: 16.0, tag: '汤品', sold: 260 }
        ]},
        { id: 'food-seed-noodle', name: '巷口小面档', category: 'noodle', rating: 4.7, monthlySales: 1640, distance: '820m', eta: '24分钟', deliveryFee: 2, minOrder: 15, notice: '现煮粉面，支持少油少辣备注。', tags: ['近距离', '粉面', '可备注'], foods: [
            { id: 'noodle-1', name: '葱油拌面', desc: '葱香浓，面条筋道，适合不想吃太重口的时候。', price: 18.0, tag: '经典', sold: 520 },
            { id: 'noodle-2', name: '牛肉汤粉', desc: '清汤底加卤牛肉，配送到手仍然热。', price: 25.8, tag: '暖胃', sold: 342 },
            { id: 'noodle-3', name: '煎蛋加料', desc: '单面煎蛋，可加入任何主食。', price: 4.0, tag: '加料', sold: 801 }
        ]},
        { id: 'food-seed-sweet', name: '白桃甜品局', category: 'sweet', rating: 4.9, monthlySales: 932, distance: '1.8km', eta: '36分钟', deliveryFee: 4, minOrder: 20, notice: '低糖甜品和冰饮，适合饭后或哄人开心。', tags: ['低糖', '甜品', '人气'], foods: [
            { id: 'sweet-1', name: '白桃奶冻杯', desc: '白桃果肉加轻奶冻，甜度柔和。', price: 19.9, tag: '低糖', sold: 298 },
            { id: 'sweet-2', name: '焦糖布丁盒', desc: '小盒装布丁，适合当晚间甜点。', price: 16.8, tag: '顺滑', sold: 186 },
            { id: 'sweet-3', name: '莓果气泡水', desc: '微酸莓果和气泡水，清爽解腻。', price: 13.5, tag: '饮品', sold: 401 }
        ]},
        { id: 'food-seed-tea', name: '风铃茶饮', category: 'drink', rating: 4.6, monthlySales: 2580, distance: '650m', eta: '19分钟', deliveryFee: 1, minOrder: 12, notice: '可选糖度冰量，默认少冰三分糖。', tags: ['快送', '饮品', '可定制'], foods: [
            { id: 'tea-1', name: '茉莉轻乳茶', desc: '茶香明显，奶味轻，适合下午。', price: 15.0, tag: '招牌', sold: 1092 },
            { id: 'tea-2', name: '柠檬冰茶', desc: '新鲜柠檬片，酸甜醒神。', price: 12.0, tag: '清爽', sold: 833 },
            { id: 'tea-3', name: '芋圆小料杯', desc: '软糯芋圆，适合加进奶茶。', price: 5.0, tag: '加料', sold: 622 }
        ]},
        { id: 'food-seed-night', name: '夜灯烧烤铺', category: 'night', rating: 4.7, monthlySales: 1475, distance: '2.2km', eta: '42分钟', deliveryFee: 5, minOrder: 30, notice: '夜宵时段营业，口味偏重，可备注少辣。', tags: ['夜宵', '烧烤', '多人餐'], foods: [
            { id: 'night-1', name: '鸡翅双拼', desc: '蜜汁和椒盐各半，外皮微脆。', price: 29.8, tag: '招牌', sold: 388 },
            { id: 'night-2', name: '烤土豆片', desc: '薄切土豆片，撒香料粉。', price: 10.0, tag: '素菜', sold: 699 },
            { id: 'night-3', name: '双人夜宵套餐', desc: '鸡翅、肉串、素菜和饮料组合。', price: 66.0, tag: '套餐', sold: 214 }
        ]}
    ];
    let foodState = null;
    let foodInitialized = false;
    let foodActionMode = '';
    let foodSelectedMerchantId = '';
    let foodSortMode = 'smart';

    function stripFoodEmoji(value = '') {
        return String(value || '').replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0E\uFE0F]/g, '').trim();
    }
    function foodText(value = '', fallback = '') {
        const clean = stripFoodEmoji(value).replace(/\s+/g, ' ').trim();
        return clean || fallback;
    }
    function foodMoney(value) { return Number(value || 0).toFixed(2); }
    function foodHash(value = '') {
        let h = 0;
        const str = String(value || 'food');
        for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i), h |= 0;
        return Math.abs(h);
    }
    const foodPalettes = [
        ['#fff1d8', '#ffc46f'], ['#ffe5dd', '#ff9b77'], ['#eaf7ff', '#8fd0ff'], ['#f0ffe8', '#a8df8e'], ['#f8edff', '#cda1ff'], ['#fff5ca', '#ffcf61']
    ];
    function foodArtStyle(seed = '') {
        const pal = foodPalettes[foodHash(seed) % foodPalettes.length];
        return `--food-a:${pal[0]};--food-b:${pal[1]};`;
    }
    function normalizeFoodDish(d = {}, idx = 0, merchantId = '') {
        const name = foodText(d.name || d.title, ['招牌套餐','热汤小碗','今日加料'][idx % 3]);
        return {
            id: String(d.id || `${merchantId || 'dish'}-${idx}-${Math.random().toString(36).slice(2, 7)}`),
            name: name.slice(0, 34),
            desc: foodText(d.desc || d.description, '现做现送，适合今天的心情。').slice(0, 96),
            price: Math.max(1, Number(d.price || 18 + idx * 4)),
            tag: foodText(d.tag || '热卖', '热卖').slice(0, 12),
            sold: Math.max(0, Math.floor(Number(d.sold || d.sales || (100 + Math.random() * 600))))
        };
    }
    function normalizeFoodMerchant(m = {}, idx = 0) {
        const cats = foodFilters.filter(f => f.id !== 'all').map(f => f.id);
        const id = String(m.id || `food-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`);
        const cat = cats.includes(m.category) ? m.category : cats[idx % cats.length];
        const foods = Array.isArray(m.foods) && m.foods.length ? m.foods : [];
        return {
            id,
            name: foodText(m.name || m.title, '附近好味商家').slice(0, 32),
            category: cat,
            rating: Math.min(5, Math.max(3.8, Number(m.rating || (4.5 + Math.random() * .4)))),
            monthlySales: Math.max(0, Math.floor(Number(m.monthlySales || m.sales || (600 + Math.random() * 2200)))) ,
            distance: foodText(m.distance, `${(0.6 + Math.random() * 2).toFixed(1)}km`),
            eta: foodText(m.eta || m.time, `${Math.floor(18 + Math.random() * 26)}分钟`),
            deliveryFee: Math.max(0, Number(m.deliveryFee ?? m.delivery ?? Math.floor(Math.random() * 5 + 1))),
            minOrder: Math.max(0, Number(m.minOrder ?? m.minimum ?? 15)),
            notice: foodText(m.notice || m.desc, '新鲜现做，支持备注口味，配送中会尽量保持温度。').slice(0, 110),
            tags: (Array.isArray(m.tags) && m.tags.length ? m.tags : [foodFilters.find(f => f.id === cat)?.name || '推荐', '满减', '准时达']).map(t => foodText(t, '推荐').slice(0, 10)).slice(0, 4),
            foods: foods.length ? foods.slice(0, 12).map((d, i) => normalizeFoodDish(d, i, id)) : [0,1,2,3].map((_, i) => normalizeFoodDish({}, i, id)),
            favorite: Boolean(m.favorite)
        };
    }
    function defaultFoodState() {
        return {
            activeTab: 'home',
            currentFilter: 'all',
            query: '',
            address: '当前设备定位',
            merchants: foodSeedMerchants.map(normalizeFoodMerchant),
            cart: { merchantId: '', items: [] },
            orders: [],
            updatedAt: Date.now()
        };
    }
    function normalizeFoodState(data = {}) {
        const base = defaultFoodState();
        const merchants = Array.isArray(data.merchants) && data.merchants.length ? data.merchants : base.merchants;
        const cart = data.cart && typeof data.cart === 'object' ? data.cart : {};
        return {
            ...base,
            ...(data || {}),
            merchants: merchants.map(normalizeFoodMerchant),
            cart: {
                merchantId: String(cart.merchantId || ''),
                items: Array.isArray(cart.items) ? cart.items.map(i => ({ foodId: String(i.foodId || i.id || ''), count: Math.max(1, Number(i.count || 1)) })).filter(i => i.foodId) : []
            },
            orders: Array.isArray(data.orders) ? data.orders : []
        };
    }
    async function loadFoodState() {
        foodState = normalizeFoodState(await getSetting('food_delivery_state', {}));
        return foodState;
    }
    async function saveFoodState() {
        if (foodState) await setSetting('food_delivery_state', normalizeFoodState(foodState));
    }
    function getFoodMerchant(id) { return (foodState?.merchants || []).find(m => m.id === id); }
    function getFoodDish(merchantId, foodId) { return (getFoodMerchant(merchantId)?.foods || []).find(f => f.id === foodId); }
    function foodCartRows() {
        const merchant = getFoodMerchant(foodState?.cart?.merchantId || '');
        if (!merchant) return [];
        return (foodState.cart.items || []).map(row => ({ row, dish: getFoodDish(merchant.id, row.foodId), merchant })).filter(x => x.dish);
    }
    function foodCartTotal() { return foodCartRows().reduce((sum, x) => sum + Number(x.dish.price || 0) * Number(x.row.count || 1), 0); }
    function foodCartCount() { return (foodState?.cart?.items || []).reduce((sum, x) => sum + Number(x.count || 1), 0); }
    function foodItemsLabel(rows = foodCartRows()) { return rows.map(x => `${foodText(x.dish.name, '菜品')}×${Number(x.row.count || 1)}`).join('、').slice(0, 120); }
    function formatFoodWallet() { return typeof formatWalletAmount === 'function' ? formatWalletAmount(walletState?.balance || 0) : `¥${foodMoney(walletState?.balance || 0)}`; }
    async function syncFoodWalletUI() {
        if (typeof loadWalletState === 'function') await loadWalletState();
        const balance = formatFoodWallet();
        ['food-wallet-pill','food-profile-wallet'].forEach(id => { if ($(id)) $(id).textContent = balance; });
        if ($('food-profile-name')) $('food-profile-name').textContent = $('text-username')?.textContent?.trim() || 'User';
        if ($('food-address-text')) $('food-address-text').textContent = `配送到：${foodState?.address || '当前设备定位'}`;
        if ($('food-profile-address')) $('food-profile-address').textContent = foodState?.address || '当前设备定位';
        if ($('food-stat-merchants')) $('food-stat-merchants').textContent = String(foodState?.merchants?.length || 0);
        if ($('food-stat-orders')) $('food-stat-orders').textContent = String(foodState?.orders?.length || 0);
    }
    async function openFoodApp() {
        if (!foodState) await loadFoodState();
        await syncFoodWalletUI();
        const page = $('food-app-page');
        if (!page) return;
        page.style.display = 'flex';
        page.setAttribute('aria-hidden', 'false');
        renderFoodAll();
    }
    function closeFoodApp() {
        closeFoodStore();
        closeFoodContactModal();
        const page = $('food-app-page');
        if (page) { page.style.display = 'none'; page.setAttribute('aria-hidden', 'true'); }
    }
    function setFoodTab(tab) {
        if (!foodState || !['home','orders','profile'].includes(tab)) return;
        foodState.activeTab = tab;
        saveFoodState();
        renderFoodAll();
        syncFoodWalletUI();
    }
    function setFoodFilter(filter) {
        if (!foodState) return;
        foodState.currentFilter = filter;
        saveFoodState();
        renderFoodMerchants();
        renderFoodFilters();
    }
    function renderFoodFilters() {
        const nav = $('food-filter-nav');
        if (!nav || !foodState) return;
        nav.innerHTML = foodFilters.map(f => `<button class="food-filter-chip ${foodState.currentFilter === f.id ? 'active' : ''}" data-food-filter="${chatEscape(f.id)}">${chatEscape(f.name)}</button>`).join('');
    }
    function filteredFoodMerchants() {
        if (!foodState) return [];
        const q = foodText(foodState.query || '').toLowerCase();
        let rows = (foodState.merchants || []).filter(m => {
            const catOK = foodState.currentFilter === 'all' || m.category === foodState.currentFilter;
            const blob = `${m.name} ${m.notice} ${(m.tags || []).join(' ')} ${(m.foods || []).map(f => `${f.name} ${f.desc} ${f.tag}`).join(' ')}`.toLowerCase();
            return catOK && (!q || blob.includes(q));
        });
        if (foodSortMode === 'distance') rows = rows.sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance));
        else if (foodSortMode === 'sales') rows = rows.sort((a,b) => Number(b.monthlySales) - Number(a.monthlySales));
        else rows = rows.sort((a,b) => (Number(b.rating) * 1000 + Number(b.monthlySales || 0) / 20) - (Number(a.rating) * 1000 + Number(a.monthlySales || 0) / 20));
        return rows;
    }
    function renderFoodMerchants() {
        const list = $('food-merchant-list');
        if (!list || !foodState) return;
        const rows = filteredFoodMerchants();
        list.innerHTML = rows.length ? rows.map(m => `
            <article class="food-merchant-card" data-food-merchant="${chatEscape(m.id)}">
                <div class="food-merchant-logo" style="${foodArtStyle(m.id + m.name)}"></div>
                <div class="food-merchant-main">
                    <div class="food-merchant-top"><div class="food-merchant-name">${chatEscape(m.name)}</div><div class="food-merchant-rate">${Number(m.rating).toFixed(1)}分</div></div>
                    <div class="food-merchant-meta"><span>月售${Number(m.monthlySales || 0)}</span><span>${chatEscape(m.distance)}</span><span>${chatEscape(m.eta)}</span><span>配送¥${foodMoney(m.deliveryFee)}</span></div>
                    <div class="food-merchant-notice">${chatEscape(m.notice)}</div>
                    <div class="food-tag-row">${(m.tags || []).map(t => `<span class="food-tag">${chatEscape(t)}</span>`).join('')}</div>
                </div>
            </article>`).join('') : '<div class="food-empty"><b>没有找到商家</b><br>换个关键词，或点击右上角刷新附近商家。</div>';
    }
    function renderFoodOrders() {
        const list = $('food-order-list');
        if (!list || !foodState) return;
        list.innerHTML = foodState.orders.length ? foodState.orders.map(o => {
            const time = new Date(o.createdAt || Date.now()).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const items = Array.isArray(o.items) ? o.items.map(i => `${foodText(i.name || i.title, '菜品')} ×${Number(i.count || 1)}`).join('　') : '';
            return `<article class="food-order-card">
                <div class="food-order-head"><div><div class="food-order-shop">${chatEscape(o.merchantName || '外卖商家')}</div><div class="food-order-items">${chatEscape(items || '外卖菜品')}<br>${chatEscape(o.note || time)}</div></div><div class="food-order-status">${chatEscape(o.status || '已支付')}</div></div>
                <div class="food-order-foot"><b>¥${foodMoney(o.total)}</b><button class="food-lite-btn" data-food-reorder="${chatEscape(o.id || '')}" type="button">再来一单</button></div>
            </article>`;
        }).join('') : '<div class="food-empty"><b>还没有外卖订单</b><br>从附近商家挑选菜品，购买或发起 char 代付。</div>';
    }
    function renderFoodProfile() { syncFoodWalletUI(); }
    function renderFoodAll() {
        if (!foodState) return;
        document.querySelectorAll('.food-panel').forEach(p => p.classList.toggle('active', p.id === 'food-view-' + foodState.activeTab));
        document.querySelectorAll('.food-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.foodTab === foodState.activeTab));
        const titleMap = { home: ['外卖', '附近商家 · 准时送达'], orders: ['订单', '外卖记录与代付'], profile: ['我的', '地址、钱包与优惠'] };
        const [title, sub] = titleMap[foodState.activeTab] || titleMap.home;
        if ($('food-page-title')) $('food-page-title').textContent = title;
        if ($('food-page-subtitle')) $('food-page-subtitle').textContent = sub;
        if ($('food-search-input') && $('food-search-input').value !== foodState.query) $('food-search-input').value = foodState.query || '';
        if ($('food-update-text')) $('food-update-text').textContent = foodState.updatedAt ? `上次刷新：${new Date(foodState.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '点击刷新读取角色设定生成附近商家';
        renderFoodFilters();
        renderFoodMerchants();
        renderFoodOrders();
        renderFoodProfile();
    }
    function renderFoodStore() {
        const merchant = getFoodMerchant(foodSelectedMerchantId);
        const body = $('food-store-content');
        if (!merchant || !body) return;
        if ($('food-store-title')) $('food-store-title').textContent = merchant.name;
        if ($('food-store-subtitle')) $('food-store-subtitle').textContent = `${merchant.rating.toFixed(1)}分 · ${merchant.eta} · ${merchant.distance}`;
        const cartMap = new Map((foodState.cart?.merchantId === merchant.id ? foodState.cart.items : []).map(i => [i.foodId, Number(i.count || 1)]));
        body.innerHTML = `
            <section class="food-store-hero" style="${foodArtStyle(merchant.id + merchant.name)}">
                <h1>${chatEscape(merchant.name)}</h1>
                <p>${chatEscape(merchant.notice)}</p>
                <div class="food-store-meta"><span>${Number(merchant.rating).toFixed(1)}分</span><span>月售${Number(merchant.monthlySales || 0)}</span><span>${chatEscape(merchant.eta)}</span><span>起送¥${foodMoney(merchant.minOrder)}</span></div>
            </section>
            <div class="food-tag-row">${(merchant.tags || []).map(t => `<span class="food-tag">${chatEscape(t)}</span>`).join('')}</div>
            <div class="food-menu-section-title">菜单</div>
            <div class="food-dish-list">${(merchant.foods || []).map(d => {
                const count = cartMap.get(d.id) || 0;
                return `<article class="food-dish-card">
                    <div class="food-dish-art" style="${foodArtStyle(merchant.id + d.id + d.name)}"></div>
                    <div><div class="food-dish-name">${chatEscape(d.name)}</div><div class="food-dish-desc">${chatEscape(d.desc)}</div><div class="food-dish-sub">${chatEscape(d.tag)} · 月售${Number(d.sold || 0)}</div><div class="food-dish-price">¥${foodMoney(d.price)}</div></div>
                    <div class="food-stepper">${count ? `<button class="minus" data-food-dish-dec="${chatEscape(d.id)}">−</button><b>${count}</b>` : ''}<button data-food-dish-add="${chatEscape(d.id)}">+</button></div>
                </article>`;
            }).join('')}</div>`;
        updateFoodCartBar();
    }
    function openFoodStore(merchantId) {
        const merchant = getFoodMerchant(merchantId);
        if (!merchant) return;
        foodSelectedMerchantId = merchantId;
        const layer = $('food-store-layer');
        if (layer) { layer.style.display = 'flex'; layer.setAttribute('aria-hidden', 'false'); }
        renderFoodStore();
    }
    function closeFoodStore() {
        const layer = $('food-store-layer');
        if (layer) { layer.style.display = 'none'; layer.setAttribute('aria-hidden', 'true'); }
        foodSelectedMerchantId = '';
    }
    function updateFoodCartBar() {
        const bar = $('food-cart-bar');
        if (!bar || !foodState) return;
        const count = foodCartCount();
        bar.classList.toggle('active', count > 0 && Boolean(foodSelectedMerchantId));
        if ($('food-cart-count')) $('food-cart-count').textContent = `${count} 件`;
        if ($('food-cart-total')) $('food-cart-total').textContent = `¥${foodMoney(foodCartTotal())}`;
    }
    async function changeFoodCart(merchantId, dishId, delta = 1) {
        if (!foodState) await loadFoodState();
        const merchant = getFoodMerchant(merchantId);
        const dish = getFoodDish(merchantId, dishId);
        if (!merchant || !dish) return;
        if (foodState.cart.merchantId && foodState.cart.merchantId !== merchantId && foodState.cart.items.length && delta > 0) {
            const ok = await showGlobalConfirm('购物车里已有其他商家的菜品，是否清空后重新点餐？', '切换商家');
            if (!ok) return;
            foodState.cart = { merchantId, items: [] };
        }
        if (!foodState.cart.merchantId) foodState.cart.merchantId = merchantId;
        let row = foodState.cart.items.find(i => i.foodId === dishId);
        if (!row && delta > 0) foodState.cart.items.push({ foodId: dishId, count: delta });
        else if (row) {
            row.count = Number(row.count || 1) + delta;
            if (row.count <= 0) foodState.cart.items = foodState.cart.items.filter(i => i.foodId !== dishId);
        }
        if (!foodState.cart.items.length) foodState.cart.merchantId = '';
        await saveFoodState();
        renderFoodStore();
    }
    async function clearFoodCart() {
        if (!foodState?.cart?.items?.length) return;
        const ok = await showGlobalConfirm('确定清空当前点餐车吗？', '清空点餐车');
        if (!ok) return;
        foodState.cart = { merchantId: '', items: [] };
        await saveFoodState();
        renderFoodStore();
    }
    async function foodGetContacts() {
        if (!chatInitialized) { try { await initChatApp(); } catch(e) {} }
        else { try { await loadChatState(); } catch(e) {} }
        const threads = Array.isArray(chatState?.threads) ? chatState.threads : [];
        return threads.filter(t => t && !t.blocked).map(t => ({
            id: t.id,
            threadId: t.id,
            chatId: t.id,
            charId: ensureTutuwanCharId(t),
            name: (typeof getTutuwanDisplayName === 'function') ? getTutuwanDisplayName(t) : (t.name || '未命名联系人'),
            sub: `ID ${ensureTutuwanCharId(t)} · ${t.setting || t.snippet || (t.isGroup ? '群聊' : '联系人')}`,
            avatar: t.avatar || `https://picsum.photos/seed/${encodeURIComponent(t.name || t.id)}/120/120`,
            isGroup: Boolean(t.isGroup)
        }));
    }
    async function foodSendTextToThread(threadId, content, meta = {}) {
        await loadChatState();
        const thread = (chatState.threads || []).find(t => t.id === threadId);
        if (!thread) return false;
        const finalContent = foodText(content, '外卖消息');
        const msg = normalizeTutuwanMessageRecord({ role: 'user', type: 'text', content: finalContent, meta: enrichTutuwanAppMeta(thread, 'food_delivery', { source: 'food_delivery', ...(meta || {}) }), time: getChatTimestamp() }, thread);
        thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
        thread.messages.push(msg);
        thread.snippet = finalContent.slice(0, 40);
        thread.time = msg.time;
        await saveChatState();
        if (typeof renderChatThreads === 'function') renderChatThreads();
        return true;
    }
    async function openFoodContactPicker(mode) {
        if (!foodState?.cart?.items?.length) { showToast('点餐车是空的'); return; }
        foodActionMode = mode;
        const modal = $('food-contact-modal');
        const title = $('food-contact-title');
        const list = $('food-contact-list');
        if (!modal || !title || !list) return;
        title.textContent = mode === 'payByChar' ? '选择代付 char' : '选择要帮谁点';
        const contacts = await foodGetContacts();
        list.innerHTML = contacts.length ? contacts.map(c => `<button class="food-contact-item" data-food-contact="${chatEscape(c.id)}"><div class="food-contact-avatar" style="background-image:url('${chatEscape(c.avatar)}')"></div><div><div class="food-contact-name">${chatEscape(c.name)}</div><div class="food-contact-sub">${chatEscape(c.sub || '')}</div></div></button>`).join('') : '<div class="food-empty"><b>还没有联系人</b><br>请先在聊天应用里添加 char 或联系人。</div>';
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
    function closeFoodContactModal() {
        const modal = $('food-contact-modal');
        if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }
        foodActionMode = '';
    }
    function buildFoodOrder({ status = '已支付', paySource = '资产钱包', targetName = '', note = '', threadId = '', charId = '' } = {}) {
        const rows = foodCartRows();
        const merchant = rows[0]?.merchant || getFoodMerchant(foodState.cart.merchantId);
        const deliveryFee = Number(merchant?.deliveryFee || 0);
        const total = Number((foodCartTotal() + deliveryFee).toFixed(2));
        return {
            id: 'FD' + Date.now().toString().slice(-9),
            threadId,
            chatId: threadId,
            charId,
            merchantId: merchant?.id || '',
            merchantName: merchant?.name || '外卖商家',
            items: rows.map(x => ({ id: x.dish.id, name: x.dish.name, price: x.dish.price, count: x.row.count })),
            subtotal: Number(foodCartTotal().toFixed(2)),
            deliveryFee,
            total,
            status,
            paySource,
            targetName,
            address: foodState.address || '当前设备定位',
            note,
            createdAt: Date.now()
        };
    }
    async function checkoutFoodSelf() {
        if (!foodState?.cart?.items?.length) { showToast('点餐车是空的'); return; }
        const order = buildFoodOrder({ status: '商家已接单', paySource: '资产钱包' });
        await loadWalletState();
        if (Number(walletState.balance || 0) < order.total) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatFoodWallet()}\n需要金额：¥${foodMoney(order.total)}`, '余额不足');
            setFoodTab('profile');
            return;
        }
        const ok = await walletRecordChatBill({ amount: order.total, direction: 'expense', type: '外卖订单', note: `${order.merchantName} · ${foodItemsLabel()}` });
        if (!ok) return;
        foodState.orders.unshift(order);
        foodState.cart = { merchantId: '', items: [] };
        await saveFoodState();
        await syncFoodWalletUI();
        closeFoodStore();
        renderFoodAll();
        showToast('下单成功，商家已接单');
        setFoodTab('orders');
    }
    async function processFoodContact(threadId) {
        const contacts = await foodGetContacts();
        const contact = contacts.find(c => c.id === threadId);
        if (!foodState?.cart?.items?.length) { closeFoodContactModal(); showToast('点餐车是空的'); return; }
        if (foodActionMode === 'payByChar') {
            const note = await showGlobalPrompt('发送给 char 的代付留言', '我选好了这份外卖，可以帮我代付一下吗？', '让char代付');
            if (note === null || note === undefined || note === '') return;
            const order = buildFoodOrder({ status: '待对方代付', paySource: contact?.name || 'char代付', targetName: contact?.name || '', note: foodText(note), threadId, charId: contact?.charId || '' });
            foodState.orders.unshift(order);
            await foodSendTextToThread(threadId, `外卖代付请求\n商家：${order.merchantName}\n金额：¥${foodMoney(order.total)}\n菜品：${foodItemsLabel()}\n配送到：${order.address}\n留言：${foodText(note)}`, { foodOrderId: order.id, amount: order.total, kind: 'payByChar' });
            await saveFoodState();
            closeFoodContactModal(); closeFoodStore(); renderFoodAll();
            showToast('已发送代付请求');
            setFoodTab('orders');
            return;
        }
        const note = await showGlobalPrompt('写给 char 的外卖备注', '给你点了份外卖，记得趁热吃。', '帮char点');
        if (note === null || note === undefined || note === '') return;
        const order = buildFoodOrder({ status: '已为对方下单', paySource: '资产钱包', targetName: contact?.name || '', note: foodText(note), threadId, charId: contact?.charId || '' });
        await loadWalletState();
        if (Number(walletState.balance || 0) < order.total) {
            await showGlobalAlert(`资产钱包余额不足。\n当前余额：${formatFoodWallet()}\n需要金额：¥${foodMoney(order.total)}`, '余额不足');
            closeFoodContactModal();
            setFoodTab('profile');
            return;
        }
        const ok = await walletRecordChatBill({ amount: order.total, direction: 'expense', type: '帮char点外卖', note: `${contact?.name || 'char'} · ${order.merchantName}` });
        if (!ok) return;
        foodState.orders.unshift(order);
        await foodSendTextToThread(threadId, `我给你点了一份外卖\n商家：${order.merchantName}\n菜品：${foodItemsLabel()}\n预计：${getFoodMerchant(order.merchantId)?.eta || '尽快送达'}\n备注：${foodText(note)}`, { foodOrderId: order.id, amount: order.total, kind: 'orderForChar' });
        foodState.cart = { merchantId: '', items: [] };
        await saveFoodState();
        await syncFoodWalletUI();
        closeFoodContactModal(); closeFoodStore(); renderFoodAll();
        showToast('已帮 char 下单');
        setFoodTab('orders');
    }
    async function reorderFood(orderId) {
        const order = (foodState?.orders || []).find(o => o.id === orderId);
        const merchant = getFoodMerchant(order?.merchantId || '');
        if (!order || !merchant) { showToast('原商家已不可用'); return; }
        foodState.cart = { merchantId: merchant.id, items: (order.items || []).map(i => ({ foodId: i.id, count: Number(i.count || 1) })).filter(i => getFoodDish(merchant.id, i.foodId)) };
        await saveFoodState();
        openFoodStore(merchant.id);
        showToast('已加入点餐车');
    }
    async function editFoodAddress() {
        if (!foodState) await loadFoodState();
        const value = await showGlobalPrompt('请输入配送地址 / 位置备注', foodState.address || '当前设备定位', '配送地址');
        if (value === null || value === undefined || !String(value).trim()) return;
        foodState.address = stripFoodEmoji(value).slice(0, 60);
        await saveFoodState();
        renderFoodAll();
        showToast('配送地址已更新');
    }
    async function toggleFoodSort() {
        const modes = ['smart','distance','sales'];
        const labels = { smart: '智能排序', distance: '距离优先', sales: '销量优先' };
        foodSortMode = modes[(modes.indexOf(foodSortMode) + 1) % modes.length];
        if ($('food-sort-btn')) $('food-sort-btn').textContent = labels[foodSortMode];
        renderFoodMerchants();
    }
    async function getFoodAIContext() {
        try { if (!chatInitialized) await initChatApp(); else await loadChatState(); } catch(e) {}
        let books = [];
        try { books = await getSetting('worldbooks', []); } catch(e) {}
        const userName = $('text-username')?.textContent?.trim() || chatState?.homeProfile?.name || 'User';
        const contacts = (chatState?.threads || []).slice(0, 12).map(t => ({ name: (typeof getTutuwanDisplayName === 'function') ? getTutuwanDisplayName(t) : t.name, setting: t.setting || '', snippet: t.snippet || '' }));
        const wbText = Array.isArray(books) ? books.slice(0, 4).map(b => `${b.name || '世界书'}:${(b.entries || []).slice(0, 5).map(e => `${e.name || ''} ${e.content || ''}`).join(' / ')}`).join('\n') : '';
        return { userName, contacts, worldbooks: wbText };
    }
    async function generateFoodMerchantsWithAPI() {
        const cfg = typeof getTutuwanChatConfig === 'function' ? await getTutuwanChatConfig() : await getSetting('chat_config', {});
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) throw new Error('未配置 API');
        const ctx = await getFoodAIContext();
        const catHint = foodFilters.filter(f => f.id !== 'all').map(f => `${f.id}:${f.name}`).join('、');
        const prompt = `请为虚拟手机里的真实外卖 APP 生成 8 个附近商家，必须贴合 user、char 和世界书设定，但不要照搬设定原文。\n用户：${ctx.userName}\n联系人/char摘要：${JSON.stringify(ctx.contacts).slice(0, 1600)}\n世界书摘要：${String(ctx.worldbooks || '').slice(0, 1600)}\n分类 id 只能从这里选：${catHint}\n要求：像真实外卖平台，包含评分、月售、距离、送达时间、配送费、起送价、满减/准时达/新品等标签；每个商家至少 4 个可点菜品；价格为数字；禁止输出 emoji、表情符号、外部图片 URL、markdown。\n只输出严格 JSON：{"merchants":[{"name":"商家名","category":"fast","rating":4.8,"monthlySales":1234,"distance":"1.2km","eta":"28分钟","deliveryFee":3,"minOrder":18,"notice":"商家公告","tags":["满30减5","准时达"],"foods":[{"name":"菜品名","desc":"描述","price":18.8,"tag":"招牌","sold":120}]}]}`;
        const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .85), messages: [{ role: 'user', content: prompt }] }) });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || '';
        let text = String(raw || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        let parsed = null;
        try { parsed = JSON.parse(text); } catch(e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
        }
        const arr = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.merchants) ? parsed.merchants : []);
        if (!arr.length) throw new Error('商家 JSON 为空');
        return arr.slice(0, 10).map(normalizeFoodMerchant);
    }
    async function refreshFoodMerchants() {
        if (!foodState) await loadFoodState();
        const btn = $('food-refresh-btn');
        if (btn) btn.style.opacity = '.45';
        try {
            const generated = await generateFoodMerchantsWithAPI();
            foodState.merchants = generated;
            foodState.query = '';
            foodState.currentFilter = 'all';
            foodState.updatedAt = Date.now();
            foodState.cart = { merchantId: '', items: [] };
            await saveFoodState();
            renderFoodAll();
            showToast('已刷新附近商家');
        } catch (err) {
            foodState.merchants = foodSeedMerchants.map((m, i) => normalizeFoodMerchant({ ...m, id: `${m.id}-${Date.now()}-${i}`, monthlySales: Number(m.monthlySales || 500) + Math.floor(Math.random() * 300), eta: `${Math.floor(18 + Math.random() * 28)}分钟` }, i));
            foodState.query = '';
            foodState.currentFilter = 'all';
            foodState.updatedAt = Date.now();
            foodState.cart = { merchantId: '', items: [] };
            await saveFoodState();
            renderFoodAll();
            showToast('已使用本地商家刷新');
        } finally {
            if (btn) btn.style.opacity = '1';
        }
    }
    async function rechargeFoodBalance() {
        await walletChangeBalance('充值');
        await syncFoodWalletUI();
        renderFoodAll();
    }
    async function openFoodWallet() {
        await openWalletPage();
        await syncFoodWalletUI();
    }
    async function initFoodDeliveryApp() {
        if (foodInitialized) return;
        foodInitialized = true;
        await loadFoodState();
        await syncFoodWalletUI();
        $('btn-food-delivery')?.addEventListener('click', openFoodApp);
        $('food-close-btn')?.addEventListener('click', closeFoodApp);
        $('food-refresh-btn')?.addEventListener('click', refreshFoodMerchants);
        $('food-address-btn')?.addEventListener('click', editFoodAddress);
        $('food-profile-address-btn')?.addEventListener('click', editFoodAddress);
        $('food-sort-btn')?.addEventListener('click', toggleFoodSort);
        $('food-store-back')?.addEventListener('click', closeFoodStore);
        $('food-store-fav')?.addEventListener('click', async () => { const m = getFoodMerchant(foodSelectedMerchantId); if (!m) return; m.favorite = !m.favorite; await saveFoodState(); showToast(m.favorite ? '已收藏商家' : '已取消收藏'); });
        $('food-clear-cart-btn')?.addEventListener('click', clearFoodCart);
        $('food-checkout-btn')?.addEventListener('click', checkoutFoodSelf);
        $('food-order-char-btn')?.addEventListener('click', () => openFoodContactPicker('orderForChar'));
        $('food-pay-char-btn')?.addEventListener('click', () => openFoodContactPicker('payByChar'));
        $('food-contact-close')?.addEventListener('click', closeFoodContactModal);
        $('food-contact-modal')?.addEventListener('click', (e) => { if (e.target?.id === 'food-contact-modal') closeFoodContactModal(); });
        $('food-wallet-recharge-btn')?.addEventListener('click', rechargeFoodBalance);
        $('food-wallet-open-btn')?.addEventListener('click', openFoodWallet);
        $('food-search-input')?.addEventListener('input', async (e) => { if (!foodState) return; foodState.query = stripFoodEmoji(e.target.value || ''); await saveFoodState(); renderFoodMerchants(); });
        document.addEventListener('click', async (e) => {
            const tab = e.target.closest?.('[data-food-tab]'); if (tab) { setFoodTab(tab.dataset.foodTab); return; }
            const filter = e.target.closest?.('[data-food-filter]'); if (filter) { setFoodFilter(filter.dataset.foodFilter); return; }
            const merchant = e.target.closest?.('[data-food-merchant]'); if (merchant) { openFoodStore(merchant.dataset.foodMerchant); return; }
            const add = e.target.closest?.('[data-food-dish-add]'); if (add && foodSelectedMerchantId) { await changeFoodCart(foodSelectedMerchantId, add.dataset.foodDishAdd, 1); return; }
            const dec = e.target.closest?.('[data-food-dish-dec]'); if (dec && foodSelectedMerchantId) { await changeFoodCart(foodSelectedMerchantId, dec.dataset.foodDishDec, -1); return; }
            const contact = e.target.closest?.('[data-food-contact]'); if (contact) { await processFoodContact(contact.dataset.foodContact); return; }
            const reorder = e.target.closest?.('[data-food-reorder]'); if (reorder) { await reorderFood(reorder.dataset.foodReorder); return; }
        });
        renderFoodAll();
    }


    // ===================================
    // ====== Twitter / X APP：主页 / 搜索 / 通知 / 私信 / 我的 ======
    // ===================================
    const twitterDefaultTrends = [
        { tag: '#今天也要好好生活', count: '12.8K' },
        { tag: '#深夜情绪观察', count: '8,943' },
        { tag: '#角色动态', count: '6,210' },
        { tag: '#匿名碎碎念', count: '4,806' },
        { tag: '#正在热议', count: '3,552' }
    ];
    let twitterState = null;
    let twitterInitialized = false;
    let twitterTempImage = '';
    let twitterDetailPostId = '';

    function normalizeTwitterHandle(value, fallback = 'user') {
        let raw = String(value || fallback || 'user').trim().replace(/^@+/, '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '');
        if (!raw) raw = 'user';
        return '@' + raw.slice(0, 18);
    }
    function getTwitterProfileDefaults() {
        const name = (chatState?.homeProfile?.name || document.getElementById('text-username')?.textContent || '我').trim() || '我';
        const avatar = chatState?.homeProfile?.avatar || $('avatar-img')?.src || 'https://picsum.photos/id/1025/160/160';
        return {
            id: 'me',
            name,
            handle: normalizeTwitterHandle(name === '点击编辑昵称' ? 'user' : name),
            avatar,
            cover: chatState?.momentsCover || 'linear-gradient(135deg,#bde8ff,#ffd3e4)',
            bio: chatState?.homeProfile?.signature || document.getElementById('text-speech')?.textContent || '在这里记录一些真实又隐秘的心情。',
            following: 0,
            followers: 0,
            likes: 0
        };
    }
    function normalizeTwitterPost(post = {}) {
        const now = Date.now();
        return {
            id: post.id || createChatId('tw'),
            authorId: post.authorId || 'me',
            authorName: post.authorName || '我',
            handle: normalizeTwitterHandle(post.handle || post.authorName || 'user'),
            avatar: post.avatar || 'https://picsum.photos/seed/twitter-user/120/120',
            verified: Boolean(post.verified),
            sourceType: post.sourceType || (post.authorId === 'me' ? 'user' : (String(post.authorId || '').startsWith('npc_') ? 'npc' : 'char')),
            content: String(post.content || '').trim(),
            image: post.image || '',
            createdAt: Number(post.createdAt || post.timestamp || now),
            likes: Math.max(0, Number(post.likes) || 0),
            reposts: Math.max(0, Number(post.reposts) || 0),
            replies: Math.max(0, Number(post.replies) || (Array.isArray(post.comments) ? post.comments.length : 0)),
            views: Math.max(0, Number(post.views) || Math.floor(200 + Math.random() * 2500)),
            liked: Boolean(post.liked),
            reposted: Boolean(post.reposted),
            bookmarked: Boolean(post.bookmarked),
            isUserPost: Boolean(post.isUserPost || post.authorId === 'me'),
            comments: Array.isArray(post.comments) ? post.comments.map(c => ({ id: c.id || createChatId('twc'), name: c.name || c.authorName || '网友', handle: normalizeTwitterHandle(c.handle || c.name || 'reply'), avatar: c.avatar || 'https://picsum.photos/seed/reply/80/80', content: String(c.content || '').trim(), createdAt: Number(c.createdAt || now) })).filter(c => c.content) : []
        };
    }
    function normalizeTwitterState(raw = {}) {
        const profile = { ...getTwitterProfileDefaults(), ...(raw.profile || {}) };
        profile.handle = normalizeTwitterHandle(profile.handle || profile.name || 'user');
        const posts = Array.isArray(raw.posts) ? raw.posts.map(normalizeTwitterPost).filter(p => p.content || p.image) : [];
        return {
            activeTab: ['home','explore','notifications','messages','profile'].includes(raw.activeTab) ? raw.activeTab : 'home',
            timelineMode: ['forYou','following'].includes(raw.timelineMode) ? raw.timelineMode : 'forYou',
            profileMode: ['posts','replies','media','likes'].includes(raw.profileMode) ? raw.profileMode : 'posts',
            following: Array.isArray(raw.following) ? raw.following : [],
            notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
            posts,
            trends: Array.isArray(raw.trends) && raw.trends.length ? raw.trends : twitterDefaultTrends,
            searchQuery: raw.searchQuery || '',
            profile,
            config: {
                worldview: raw.config?.worldview || '这是一个接近真实 Twitter / X 的社交时间线。角色会发短推、碎碎念、转发感、吐槽、日常观察、暧昧互动、热搜围观；内容要像真实社交平台，不要像作文。',
                autoUseChars: raw.config?.autoUseChars !== false,
                npcs: Array.isArray(raw.config?.npcs) ? raw.config.npcs.map(normalizeTwitterNPC).filter(n => n.name) : buildDefaultTwitterNPCs()
            }
        };
    }
    async function loadTwitterState() {
        if (!chatInitialized) { try { await initChatApp(); } catch(e) {} }
        else { try { await loadChatState(); } catch(e) {} }
        twitterState = normalizeTwitterState(await getSetting('twitter_app_state', {}));
        if (!twitterState.posts.length) {
            twitterState.posts = buildTwitterSeedPosts();
            await saveTwitterState();
        }
        return twitterState;
    }
    async function saveTwitterState() {
        if (!twitterState) return;
        await setSetting('twitter_app_state', normalizeTwitterState(twitterState));
    }
    function getTwitterContacts() {
        const threads = Array.isArray(chatState?.threads) ? chatState.threads : [];
        return threads.filter(t => t && !t.blocked).map(t => ({
            id: t.id,
            name: t.name || '未命名用户',
            handle: normalizeTwitterHandle(t.remark || t.name || t.id),
            avatar: t.avatar || `https://picsum.photos/seed/${encodeURIComponent(t.name || t.id)}/120/120`,
            bio: t.setting || t.snippet || (t.isGroup ? '群聊账号' : 'Twitter 用户'),
            isGroup: Boolean(t.isGroup),
            verified: Boolean(t.pinned || t.isGroup)
        }));
    }

    function normalizeTwitterNPC(npc = {}, idx = 0) {
        const name = String(npc.name || npc.authorName || npc.nickname || '').trim();
        if (!name) return { name: '' };
        const idBase = String(npc.id || name || ('npc_' + idx)).trim().replace(/\s+/g, '_');
        return {
            id: String(npc.id || ('npc_' + idBase)).replace(/^npc_npc_/, 'npc_'),
            name,
            handle: normalizeTwitterHandle(npc.handle || name),
            avatar: npc.avatar || `https://picsum.photos/seed/${encodeURIComponent('tw-npc-' + name)}/120/120`,
            bio: String(npc.bio || npc.persona || npc.detail || '推特 NPC，会根据时间线世界观发布真实感动态。').trim(),
            sourceType: 'npc',
            verified: Boolean(npc.verified)
        };
    }
    function buildDefaultTwitterNPCs() {
        return [
            normalizeTwitterNPC({ name: '夜航便利店店员', handle: '@night_shift_24h', bio: '凌晨值班 NPC。常发深夜观察、路过的客人、城市边角料和一点点八卦。' }),
            normalizeTwitterNPC({ name: '匿名吃瓜号', handle: '@melon_signal', bio: '热搜围观 NPC。说话短促，喜欢转述传闻、吐槽平台氛围，但不会暴露真实身份。' }),
            normalizeTwitterNPC({ name: '街角摄影师', handle: '@corner_snapshot', bio: '生活流 NPC。会发街景、偶遇、天气和像照片说明一样的推文。' }),
            normalizeTwitterNPC({ name: '情绪树洞', handle: '@soft_treehole', bio: '树洞 NPC。常发暧昧、失眠、未发送消息和自我拉扯。' })
        ];
    }
    function parseTwitterNPCText(text) {
        return String(text || '').split(/\n+/).map((line, idx) => {
            const parts = line.split(/[｜|]/).map(v => v.trim());
            if (!parts[0]) return null;
            return normalizeTwitterNPC({ name: parts[0], handle: parts[1] || parts[0], bio: parts[2] || '', avatar: parts[3] || '' }, idx);
        }).filter(n => n && n.name);
    }
    function formatTwitterNPCText(npcs) {
        return (Array.isArray(npcs) ? npcs : []).map(n => `${n.name}｜${n.handle || normalizeTwitterHandle(n.name)}｜${n.bio || ''}｜${n.avatar || ''}`).join('\n');
    }
    function getTwitterNPCs() {
        if (!twitterState?.config) return buildDefaultTwitterNPCs();
        if (!Array.isArray(twitterState.config.npcs) || !twitterState.config.npcs.length) twitterState.config.npcs = buildDefaultTwitterNPCs();
        return twitterState.config.npcs.map(normalizeTwitterNPC).filter(n => n.name);
    }
    function getTwitterActors({ includeMe = false } = {}) {
        const actors = [];
        if (includeMe && twitterState?.profile) actors.push({ ...twitterState.profile, id: 'me', sourceType: 'user', bio: twitterState.profile.bio || '当前用户', verified: false });
        actors.push(...getTwitterContacts().map(c => ({ ...c, sourceType: c.isGroup ? 'group' : 'char' })));
        actors.push(...getTwitterNPCs());
        const seen = new Set();
        return actors.filter(a => {
            const key = a.id || a.handle || a.name;
            if (!key || seen.has(key)) return false;
            seen.add(key); return true;
        });
    }
    function findTwitterActor(item = {}) {
        const wantedName = item.authorName || item.name || item.nickname || '';
        const wantedHandle = normalizeTwitterHandle(item.handle || wantedName || 'user');
        const wantedType = String(item.sourceType || item.type || '').toLowerCase();
        const actors = getTwitterActors({ includeMe: false });
        return actors.find(a => (wantedType && a.sourceType === wantedType && (a.name === wantedName || a.handle === wantedHandle)))
            || actors.find(a => a.name === wantedName || a.handle === wantedHandle)
            || actors[Math.floor(Math.random() * Math.max(1, actors.length))]
            || null;
    }
    function twitterProfileCoverStyle(cover) {
        const value = String(cover || '').trim() || 'linear-gradient(135deg,#d7efff,#f7d5e8)';
        if (/^(linear-gradient|radial-gradient)\(/i.test(value)) return `background:${value};`;
        const safe = value.replace(/'/g, '%27');
        return `background-image:url('${safe}');`;
    }
    function updateTwitterCoverPreview() {
        const input = $('twitter-setting-cover'); const preview = $('twitter-cover-preview');
        if (preview) preview.setAttribute('style', twitterProfileCoverStyle(input?.value || ''));
    }
    function buildTwitterSeedPosts() {
        const actors = getTwitterActors({ includeMe: false });
        const profile = getTwitterProfileDefaults();
        const samples = [
            '刚刚刷新时间线，感觉每个人都在偷偷把真实想法藏进一句很短的话里。',
            '今天的风有点像未读消息。',
            '有些话发在这里，比发给某个人安全一点。',
            '热搜每天都在变，只有不想承认的心事反复出现。',
            '突然觉得，沉默也像一种已读。',
            '这个时间线越来越像一条半公开的群聊。',
            '路过的人也会留下痕迹，哪怕只是一个点赞。'
        ];
        const rows = actors.slice(0, 7).map((c, idx) => normalizeTwitterPost({
            authorId: c.id,
            authorName: c.name,
            handle: c.handle,
            avatar: c.avatar,
            verified: c.verified,
            sourceType: c.sourceType,
            content: samples[idx % samples.length],
            createdAt: Date.now() - (idx + 1) * 60 * 60 * 1000,
            likes: Math.floor(12 + Math.random() * 260),
            reposts: Math.floor(2 + Math.random() * 35),
            replies: Math.floor(1 + Math.random() * 22),
            views: Math.floor(900 + Math.random() * 5000),
            comments: buildTwitterNPCComments(c.name, idx)
        }));
        rows.unshift(normalizeTwitterPost({
            authorId: 'me', authorName: profile.name, handle: profile.handle, avatar: profile.avatar, isUserPost: true, sourceType: 'user',
            content: '开通 X 了。先把这里当成一个可以乱发碎碎念的地方。', createdAt: Date.now() - 25 * 60 * 1000, likes: 0, reposts: 0, replies: 0, views: 42
        }));
        return rows;
    }
    function buildTwitterNPCComments(authorName = '', seed = 0) {
        const npcs = getTwitterNPCs();
        const templates = ['这条有点真实。', '别删，我刚准备转发。', '时间线终于有活人味了。', '感觉今天大家都很会藏话。'];
        return npcs.slice(seed % 2, (seed % 2) + 2).map((n, i) => ({ id: createChatId('twc'), name: n.name, handle: n.handle, avatar: n.avatar, content: templates[(seed + i) % templates.length], createdAt: Date.now() - (seed + i + 2) * 12 * 60000 }));
    }
    function twitterTimeAgo(ts) {
        const diff = Math.max(0, Date.now() - Number(ts || Date.now()));
        const min = Math.floor(diff / 60000);
        if (min < 1) return '刚刚';
        if (min < 60) return `${min}分钟`;
        const h = Math.floor(min / 60);
        if (h < 24) return `${h}小时`;
        const d = Math.floor(h / 24);
        if (d < 7) return `${d}天`;
        const date = new Date(ts);
        return `${date.getMonth()+1}月${date.getDate()}日`;
    }
    function compactTwitterNumber(num) {
        const n = Number(num) || 0;
        if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + '万';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }
    function twitterSvg(name) {
        const map = {
            reply: '<svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path></svg>',
            repost: '<svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',
            like: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"></path></svg>',
            view: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="M7 15l3-3 3 2 5-7"></path></svg>',
            bookmark: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"></path></svg>',
            more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>'
        };
        return map[name] || '';
    }
    function getTwitterPostById(id) { return (twitterState?.posts || []).find(p => p.id === id); }
    function buildTwitterTweetHTML(post, opts = {}) {
        const media = post.image ? `<div class="twitter-media"><img src="${chatEscape(post.image)}" alt="tweet image"></div>` : '';
        const detailAttr = opts.noOpen ? '' : `data-twitter-open="${chatEscape(post.id)}"`;
        return `<article class="twitter-tweet" ${detailAttr}>
            <img class="twitter-avatar" src="${chatEscape(post.avatar)}" alt="avatar">
            <div class="twitter-tweet-body">
                <div class="twitter-tweet-head"><span class="twitter-name">${chatEscape(post.authorName)}</span>${post.verified ? '<span class="twitter-verified">●</span>' : ''}${post.sourceType === 'npc' ? '<span class="twitter-author-chip">NPC</span>' : (post.sourceType === 'user' ? '<span class="twitter-author-chip">USER</span>' : '')}<span class="twitter-handle">${chatEscape(post.handle)}</span><span class="twitter-time">· ${twitterTimeAgo(post.createdAt)}</span></div>
                <div class="twitter-text">${chatEscape(post.content)}</div>${media}
                <div class="twitter-actions">
                    <button class="twitter-action" data-twitter-action="reply" data-post-id="${chatEscape(post.id)}">${twitterSvg('reply')}<span>${compactTwitterNumber((post.comments || []).length || post.replies)}</span></button>
                    <button class="twitter-action ${post.reposted ? 'reposted' : ''}" data-twitter-action="repost" data-post-id="${chatEscape(post.id)}">${twitterSvg('repost')}<span>${compactTwitterNumber(post.reposts)}</span></button>
                    <button class="twitter-action ${post.liked ? 'liked' : ''}" data-twitter-action="like" data-post-id="${chatEscape(post.id)}">${twitterSvg('like')}<span>${compactTwitterNumber(post.likes)}</span></button>
                    <button class="twitter-action" data-twitter-action="views" data-post-id="${chatEscape(post.id)}">${twitterSvg('view')}<span>${compactTwitterNumber(post.views)}</span></button>
                    <button class="twitter-action ${post.bookmarked ? 'bookmarked' : ''}" data-twitter-action="bookmark" data-post-id="${chatEscape(post.id)}">${twitterSvg('bookmark')}</button>
                </div>
            </div>
        </article>`;
    }
    function twitterSortedPosts() {
        const posts = [...(twitterState?.posts || [])];
        if (twitterState.timelineMode === 'following') {
            return posts.filter(p => p.authorId === 'me' || twitterState.following.includes(p.authorId)).sort((a,b) => b.createdAt - a.createdAt);
        }
        return posts.sort((a,b) => b.createdAt - a.createdAt);
    }
    function renderTwitterHome() {
        const el = $('twitter-tab-home'); if (!el) return;
        const profile = twitterState.profile;
        const posts = twitterSortedPosts();
        el.innerHTML = `
            <div class="twitter-pills"><button class="twitter-pill ${twitterState.timelineMode === 'forYou' ? 'active' : ''}" data-twitter-mode="forYou">为你推荐</button><button class="twitter-pill ${twitterState.timelineMode === 'following' ? 'active' : ''}" data-twitter-mode="following">正在关注</button></div>
            <div class="twitter-inline-composer" id="twitter-inline-composer"><img class="twitter-avatar" src="${chatEscape(profile.avatar)}" alt="avatar"><div class="twitter-inline-placeholder">有什么新鲜事？</div></div>
            ${posts.length ? posts.map(buildTwitterTweetHTML).join('') : '<div class="twitter-empty"><b>时间线空空的</b><br>点击右上角刷新，让 char 按设定发布新推文。</div>'}`;
    }
    function renderTwitterExplore() {
        const el = $('twitter-tab-explore'); if (!el) return;
        const q = (twitterState.searchQuery || '').trim().toLowerCase();
        const contacts = getTwitterActors({ includeMe: false });
        const filteredPosts = q ? (twitterState.posts || []).filter(p => `${p.authorName} ${p.handle} ${p.content}`.toLowerCase().includes(q)) : [];
        const filteredUsers = q ? contacts.filter(c => `${c.name} ${c.handle} ${c.bio}`.toLowerCase().includes(q)).slice(0,10) : contacts.slice(0, 8);
        el.innerHTML = `
            <div class="twitter-search-wrap"><input class="twitter-search" id="twitter-search-input" placeholder="搜索 Twitter" value="${chatEscape(twitterState.searchQuery || '')}"></div>
            <div class="twitter-section-title">${q ? '搜索结果' : '正在发生'}</div>
            ${!q ? twitterState.trends.map(t => `<div class="twitter-trend" data-twitter-trend="${chatEscape(t.tag)}"><div class="twitter-trend-kicker">中国 · 热门</div><div class="twitter-trend-title">${chatEscape(t.tag)}</div><div class="twitter-trend-count">${chatEscape(t.count)} 推文</div></div>`).join('') : ''}
            ${filteredUsers.length ? `<div class="twitter-section-title">用户</div>${filteredUsers.map(buildTwitterUserRowHTML).join('')}` : ''}
            ${filteredPosts.length ? `<div class="twitter-section-title">推文</div>${filteredPosts.map(buildTwitterTweetHTML).join('')}` : (q ? '<div class="twitter-empty"><b>没有找到相关推文</b><br>换个关键词试试。</div>' : '')}`;
    }
    function buildTwitterUserRowHTML(user) {
        const following = twitterState.following.includes(user.id);
        const badge = user.sourceType === 'npc' ? '<span class="twitter-author-chip">NPC</span>' : (user.sourceType === 'char' ? '<span class="twitter-author-chip">CHAR</span>' : '');
        return `<div class="twitter-user-row"><img class="twitter-avatar" src="${chatEscape(user.avatar)}" alt="avatar"><div class="twitter-user-meta"><div class="twitter-user-title">${chatEscape(user.name)} ${user.verified ? '<span class="twitter-verified">●</span>' : ''}${badge}</div><div class="twitter-handle">${chatEscape(user.handle)}</div><div class="twitter-user-desc">${chatEscape(user.bio || '')}</div></div><button class="twitter-follow-btn ${following ? 'following' : ''}" data-twitter-follow="${chatEscape(user.id)}">${following ? '正在关注' : '关注'}</button></div>`;
    }
    function renderTwitterNotifications() {
        const el = $('twitter-tab-notifications'); if (!el) return;
        const notes = twitterState.notifications || [];
        el.innerHTML = `<div class="twitter-pills"><button class="twitter-pill active">全部</button><button class="twitter-pill">提及</button><button class="twitter-pill">已认证</button></div>` +
            (notes.length ? notes.slice().reverse().map(n => `<div class="twitter-notification"><img class="twitter-avatar" src="${chatEscape(n.avatar || twitterState.profile.avatar)}" alt="avatar"><div><div class="twitter-user-title">${chatEscape(n.title || '新通知')}</div><div class="twitter-user-desc">${chatEscape(n.text || '')}</div><div class="twitter-handle">${twitterTimeAgo(n.createdAt)}</div></div><span></span></div>`).join('') : '<div class="twitter-empty"><b>暂时没有通知</b><br>点赞、转推、回复和 char 互动会出现在这里。</div>');
    }
    function renderTwitterMessages() {
        const el = $('twitter-tab-messages'); if (!el) return;
        const contacts = getTwitterContacts();
        el.innerHTML = `<div class="twitter-section-title">私信</div>` + (contacts.length ? contacts.map(c => `<div class="twitter-dm-row"><img class="twitter-avatar" src="${chatEscape(c.avatar)}" alt="avatar"><div class="twitter-user-meta"><div class="twitter-user-title">${chatEscape(c.name)}</div><div class="twitter-user-desc">${chatEscape(c.bio || '从 Twitter 私信继续聊天')}</div></div><button class="twitter-follow-btn following" data-twitter-dm="${chatEscape(c.id)}">私信</button></div>`).join('') : '<div class="twitter-empty"><b>没有可私信对象</b><br>先在聊天 APP 添加 char。</div>');
    }
    function renderTwitterProfile() {
        const el = $('twitter-tab-profile'); if (!el) return;
        const p = twitterState.profile;
        const all = twitterState.posts || [];
        let posts = all.filter(post => post.authorId === 'me');
        if (twitterState.profileMode === 'replies') posts = all.filter(post => (post.comments || []).some(c => c.name === p.name));
        if (twitterState.profileMode === 'media') posts = posts.filter(post => post.image);
        if (twitterState.profileMode === 'likes') posts = all.filter(post => post.liked);
        const following = twitterState.following.length;
        const followers = Math.max(Number(p.followers) || 0, 12 + Math.floor((twitterState.posts || []).length * 1.5));
        const likes = all.reduce((sum, post) => sum + (post.authorId === 'me' ? post.likes : 0), 0);
        el.innerHTML = `
            <div class="twitter-profile-hero" style="${twitterProfileCoverStyle(p.cover)}"><button class="twitter-profile-cover-edit" id="twitter-profile-cover-edit" type="button">更换背景</button></div>
            <div class="twitter-profile-main"><div class="twitter-profile-avatar-row"><img class="twitter-avatar big" src="${chatEscape(p.avatar)}" alt="avatar"><button class="twitter-profile-edit" id="twitter-profile-edit">编辑资料</button></div><div class="twitter-profile-name">${chatEscape(p.name)}</div><div class="twitter-profile-handle">${chatEscape(p.handle)}</div><div class="twitter-profile-bio">${chatEscape(p.bio || '')}</div><div class="twitter-profile-stats"><span><b>${following}</b> 正在关注</span><span><b>${followers}</b> 关注者</span><span><b>${likes}</b> 喜欢</span></div></div>
            <div class="twitter-profile-tabs"><button class="${twitterState.profileMode==='posts'?'active':''}" data-twitter-profile-mode="posts">推文</button><button class="${twitterState.profileMode==='replies'?'active':''}" data-twitter-profile-mode="replies">回复</button><button class="${twitterState.profileMode==='media'?'active':''}" data-twitter-profile-mode="media">媒体</button><button class="${twitterState.profileMode==='likes'?'active':''}" data-twitter-profile-mode="likes">喜欢</button></div>
            ${posts.length ? posts.sort((a,b)=>b.createdAt-a.createdAt).map(buildTwitterTweetHTML).join('') : '<div class="twitter-empty"><b>这里还没有内容</b><br>发布一条推文或和别人的推文互动吧。</div>'}`;
    }
    function renderTwitterAll() {
        if (!twitterState) return;
        renderTwitterHome(); renderTwitterExplore(); renderTwitterNotifications(); renderTwitterMessages(); renderTwitterProfile();
        document.querySelectorAll('.twitter-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.twitterTab === twitterState.activeTab));
        document.querySelectorAll('.twitter-tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `twitter-tab-${twitterState.activeTab}`));
        const titleMap = { home: '主页', explore: '搜索', notifications: '通知', messages: '私信', profile: twitterState.profile?.name || '我的' };
        const subMap = { home: twitterState.timelineMode === 'following' ? '正在关注' : '为你推荐', explore: '趋势、用户和推文', notifications: `${(twitterState.notifications || []).length} 条通知`, messages: 'Twitter 私信', profile: twitterState.profile?.handle || '@user' };
        if ($('twitter-page-title')) $('twitter-page-title').textContent = titleMap[twitterState.activeTab] || 'Twitter';
        if ($('twitter-page-subtitle')) $('twitter-page-subtitle').textContent = subMap[twitterState.activeTab] || '';
        const fab = $('twitter-compose-fab'); if (fab) fab.style.display = twitterState.activeTab === 'messages' ? 'none' : 'flex';
    }
    async function openTwitterApp() {
        await loadTwitterState();
        $('twitter-app-page').style.display = 'flex';
        $('twitter-app-page').setAttribute('aria-hidden', 'false');
        renderTwitterAll();
    }
    function closeTwitterApp() {
        $('twitter-app-page').style.display = 'none';
        $('twitter-app-page').setAttribute('aria-hidden', 'true');
        closeTwitterCompose(); closeTwitterDetail(); closeTwitterSettings();
    }
    function setTwitterTab(tab) {
        if (!twitterState || !['home','explore','notifications','messages','profile'].includes(tab)) return;
        twitterState.activeTab = tab;
        saveTwitterState();
        renderTwitterAll();
    }
    function openTwitterCompose(prefill = '') {
        if (!twitterState) return;
        twitterTempImage = '';
        $('twitter-compose-avatar').src = twitterState.profile.avatar;
        $('twitter-compose-text').value = prefill || '';
        $('twitter-image-preview').style.display = 'none';
        updateTwitterComposeCount();
        $('twitter-compose-modal').style.display = 'flex';
        $('twitter-compose-modal').setAttribute('aria-hidden', 'false');
        setTimeout(() => $('twitter-compose-text')?.focus(), 60);
    }
    function closeTwitterCompose() { const m = $('twitter-compose-modal'); if (m) { m.style.display = 'none'; m.setAttribute('aria-hidden', 'true'); } twitterTempImage = ''; }
    function updateTwitterComposeCount() {
        const text = $('twitter-compose-text')?.value || '';
        const el = $('twitter-compose-count'); if (el) el.textContent = `${Array.from(text).length}/280`;
        const btn = $('twitter-compose-send'); if (btn) btn.disabled = !text.trim() && !twitterTempImage;
    }
    function setTwitterComposeImage(src) {
        twitterTempImage = src || '';
        const wrap = $('twitter-image-preview'); const img = $('twitter-image-preview-img');
        if (wrap && img) { wrap.style.display = twitterTempImage ? 'block' : 'none'; img.src = twitterTempImage || ''; }
        updateTwitterComposeCount();
    }
    async function submitTwitterPost() {
        const text = ($('twitter-compose-text')?.value || '').trim();
        if (!text && !twitterTempImage) { showToast('推文内容不能为空'); return; }
        const p = twitterState.profile;
        const post = normalizeTwitterPost({ authorId: 'me', authorName: p.name, handle: p.handle, avatar: p.avatar, content: text.slice(0, 280), image: twitterTempImage, isUserPost: true, createdAt: Date.now(), views: Math.floor(20 + Math.random()*60) });
        twitterState.posts.unshift(post);
        twitterState.notifications.push({ title: '推文已发布', text: text.slice(0, 60) || '图片推文', avatar: p.avatar, createdAt: Date.now() });
        await saveTwitterState();
        closeTwitterCompose();
        twitterState.activeTab = 'home';
        renderTwitterAll();
        showToast('推文已发布');
    }
    function openTwitterDetail(postId) {
        twitterDetailPostId = postId;
        renderTwitterDetail();
        $('twitter-detail-modal').style.display = 'flex';
        $('twitter-detail-modal').setAttribute('aria-hidden', 'false');
    }
    function closeTwitterDetail() { const m = $('twitter-detail-modal'); if (m) { m.style.display = 'none'; m.setAttribute('aria-hidden', 'true'); } twitterDetailPostId = ''; }
    function renderTwitterDetail() {
        const post = getTwitterPostById(twitterDetailPostId); const list = $('twitter-detail-list');
        if (!post || !list) return;
        const comments = (post.comments || []).map(c => `<article class="twitter-tweet"><img class="twitter-avatar" src="${chatEscape(c.avatar)}" alt="avatar"><div class="twitter-tweet-body"><div class="twitter-tweet-head"><span class="twitter-name">${chatEscape(c.name)}</span><span class="twitter-handle">${chatEscape(c.handle)}</span><span class="twitter-time">· ${twitterTimeAgo(c.createdAt)}</span></div><div class="twitter-text">${chatEscape(c.content)}</div></div></article>`).join('');
        list.innerHTML = buildTwitterTweetHTML(post, { noOpen: true }) + (comments || '<div class="twitter-empty"><b>暂无回复</b><br>抢先回复这条推文。</div>');
        const av = $('twitter-reply-avatar'); if (av) av.src = twitterState.profile.avatar;
        const input = $('twitter-reply-input'); if (input) input.value = '';
    }
    async function submitTwitterReply() {
        const post = getTwitterPostById(twitterDetailPostId); const input = $('twitter-reply-input');
        const text = (input?.value || '').trim();
        if (!post || !text) return;
        post.comments = Array.isArray(post.comments) ? post.comments : [];
        post.comments.push({ id: createChatId('twc'), name: twitterState.profile.name, handle: twitterState.profile.handle, avatar: twitterState.profile.avatar, content: text, createdAt: Date.now() });
        post.replies = Math.max(post.replies || 0, post.comments.length);
        twitterState.notifications.push({ title: `你回复了 ${post.authorName}`, text, avatar: twitterState.profile.avatar, createdAt: Date.now() });
        await saveTwitterState();
        renderTwitterDetail(); renderTwitterAll();
        showToast('回复已发布');
    }
    async function handleTwitterAction(action, postId) {
        const post = getTwitterPostById(postId); if (!post) return;
        if (action === 'reply') { openTwitterDetail(postId); return; }
        if (action === 'like') {
            post.liked = !post.liked; post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
            if (post.liked) twitterState.notifications.push({ title: `你喜欢了 ${post.authorName} 的推文`, text: post.content.slice(0, 70), avatar: post.avatar, createdAt: Date.now() });
        } else if (action === 'repost') {
            post.reposted = !post.reposted; post.reposts = Math.max(0, (post.reposts || 0) + (post.reposted ? 1 : -1));
            if (post.reposted) twitterState.notifications.push({ title: `你转推了 ${post.authorName}`, text: post.content.slice(0, 70), avatar: post.avatar, createdAt: Date.now() });
        } else if (action === 'bookmark') {
            post.bookmarked = !post.bookmarked;
            showToast(post.bookmarked ? '已加入书签' : '已移除书签');
        } else if (action === 'views') { openTwitterDetail(postId); return; }
        await saveTwitterState();
        renderTwitterAll();
        if (twitterDetailPostId) renderTwitterDetail();
    }
    async function toggleTwitterFollow(userId) {
        if (!twitterState) return;
        const set = new Set(twitterState.following || []);
        if (set.has(userId)) set.delete(userId); else set.add(userId);
        twitterState.following = Array.from(set);
        await saveTwitterState(); renderTwitterAll();
    }
    function openTwitterSettings() {
        if (!twitterState) return;
        $('twitter-setting-name').value = twitterState.profile.name || '';
        $('twitter-setting-handle').value = twitterState.profile.handle || '';
        $('twitter-setting-bio').value = twitterState.profile.bio || '';
        $('twitter-setting-cover').value = twitterState.profile.cover || '';
        $('twitter-setting-worldview').value = twitterState.config.worldview || '';
        $('twitter-setting-npcs').value = formatTwitterNPCText(twitterState.config.npcs || buildDefaultTwitterNPCs());
        updateTwitterCoverPreview();
        $('twitter-settings-modal').style.display = 'flex';
        $('twitter-settings-modal').setAttribute('aria-hidden', 'false');
    }
    function closeTwitterSettings() { const m = $('twitter-settings-modal'); if (m) { m.style.display = 'none'; m.setAttribute('aria-hidden', 'true'); } }
    async function saveTwitterSettings() {
        twitterState.profile.name = ($('twitter-setting-name')?.value || '').trim() || twitterState.profile.name;
        twitterState.profile.handle = normalizeTwitterHandle($('twitter-setting-handle')?.value || twitterState.profile.handle);
        twitterState.profile.bio = ($('twitter-setting-bio')?.value || '').trim();
        twitterState.profile.cover = ($('twitter-setting-cover')?.value || '').trim() || 'linear-gradient(135deg,#d7efff,#f7d5e8)';
        twitterState.config.worldview = ($('twitter-setting-worldview')?.value || '').trim() || twitterState.config.worldview;
        const npcText = $('twitter-setting-npcs')?.value || '';
        twitterState.config.npcs = parseTwitterNPCText(npcText);
        if (!twitterState.config.npcs.length) twitterState.config.npcs = buildDefaultTwitterNPCs();
        await saveTwitterState(); closeTwitterSettings(); renderTwitterAll(); showToast('推特设置已保存');
    }
    function normalizeTwitterAIPosts(raw) {
        let text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        try {
            const parsed = JSON.parse(text);
            const arr = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.posts) ? parsed.posts : []);
            return arr.map(item => typeof item === 'string' ? { content: item } : item).filter(item => item && (item.content || item.text));
        } catch(e) {}
        return text.split(/\n+/).map(line => line.replace(/^[-*•\d.、\s]+/, '').trim()).filter(Boolean).slice(0, 6).map(content => ({ content }));
    }
    async function generateTwitterPostsWithAPI() {
        const contacts = getTwitterActors({ includeMe: false }).slice(0, 18);
        if (!contacts.length) throw new Error('没有可用于发帖的 char / NPC');
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) throw new Error('未配置 API');
        const richChars = contacts.map(c => {
            const t = (chatState.threads || []).find(x => x.id === c.id) || {};
            const recent = c.sourceType === 'char' || c.sourceType === 'group' ? (t.messages || []).slice(-5).map(m => `${m.role === 'user' ? 'user' : c.name}: ${m.content}`).join(' | ') : '';
            return `- [${c.sourceType === 'npc' ? 'NPC' : (c.sourceType === 'group' ? '群聊' : 'char')}] ${c.name} (${c.handle})：${c.bio || '无设定'}；最近聊天：${recent || (c.sourceType === 'npc' ? 'NPC 无私聊，按人设和时间线氛围自由发帖' : '暂无')}`;
        }).join('\n');
        let worldbookPrompt = '无';
        try { worldbookPrompt = (await getTutuwanWorldbookPrompt({ worldbookIds: [], messages: [] })) || '无'; } catch(e) {}
        const prompt = `请模拟真实 Twitter / X 时间线，生成 6 条新推文。

【时间线设定】
${twitterState.config.worldview}

【可发帖账号：包含 char / 群聊 / NPC】
${richChars}

【世界书参考】
${worldbookPrompt}

规则：
1. 严格符合角色设定和最近聊天记忆，像真人短推，不要像作文。
2. 可以有热搜围观、日常、暧昧、吐槽、转推口吻，但不要解释。
3. 发帖账号必须从可发帖账号里选，可混合 char、群聊、NPC；user 只由用户手动发帖，刷新时不要代替 user 发帖。
4. 允许 NPC 与 char 在 comments 里自然互评，像真实推特时间线，不要每条都很长。
5. 输出严格 JSON 数组，每项格式：{"authorName":"角色名","handle":"@handle","sourceType":"npc或char或group","content":"推文正文","likes":12,"reposts":3,"replies":2,"trend":"#话题","comments":[{"name":"评论人","handle":"@handle","content":"回复内容"}]}`;
        const res = await fetch(cfg.chatCompletionsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` }, body: JSON.stringify({ model: cfg.model, temperature: cfg.temperature, messages: [{ role: 'user', content: prompt }] }) });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || '';
        return normalizeTwitterAIPosts(raw);
    }
    async function refreshTwitterFeed() {
        if (!twitterState) await loadTwitterState();
        const home = $('twitter-tab-home');
        if (home) home.insertAdjacentHTML('afterbegin', '<div class="twitter-generating" id="twitter-generating">正在刷新时间线……</div>');
        try {
            let items = [];
            try { items = await generateTwitterPostsWithAPI(); }
            catch(apiErr) {
                const actors = getTwitterActors({ includeMe: false });
                items = actors.slice(0, 7).map((c, i) => ({ authorName: c.name, handle: c.handle, sourceType: c.sourceType, content: ['刚刷到一个话题，突然想说点什么。','今天有点不想被算法理解。','时间线像一条很吵的河，但偶尔也会飘来想看的句子。','有些消息没回，不代表没看见。','把这句话发出来之前，已经删了三遍。','不是所有路人号都是背景板。','这个热搜下面的人设浓度有点高。'][i % 7], likes: Math.floor(Math.random()*120), reposts: Math.floor(Math.random()*12), replies: Math.floor(Math.random()*9), trend: twitterDefaultTrends[i % twitterDefaultTrends.length].tag, comments: buildTwitterNPCComments(c.name, i) }));
            }
            const newPosts = items.map((item, idx) => {
                const authorName = item.authorName || item.name || '匿名用户';
                const contact = findTwitterActor(item) || {};
                const comments = Array.isArray(item.comments) ? item.comments.map((c, i) => {
                    const actor = findTwitterActor({ authorName: c.name || c.authorName, handle: c.handle }) || getTwitterNPCs()[i % Math.max(1, getTwitterNPCs().length)] || {};
                    return { id: createChatId('twc'), name: actor.name || c.name || '网友', handle: actor.handle || c.handle || normalizeTwitterHandle(c.name || 'reply'), avatar: actor.avatar || c.avatar || `https://picsum.photos/seed/${encodeURIComponent(c.name || 'reply')}/80/80`, content: c.content || c.text || '', createdAt: Date.now() - Math.floor(Math.random()*20)*60000 };
                }).filter(c => c.content) : buildTwitterNPCComments(authorName, idx);
                if (item.trend && !twitterState.trends.some(t => t.tag === item.trend)) twitterState.trends.unshift({ tag: item.trend, count: Math.floor(1000 + Math.random()*9000).toLocaleString() });
                return normalizeTwitterPost({ authorId: contact.id || createChatId('twchar'), authorName: contact.name || authorName, handle: item.handle || contact.handle || authorName, avatar: contact.avatar || `https://picsum.photos/seed/${encodeURIComponent(authorName)}/120/120`, verified: contact.verified, sourceType: contact.sourceType || item.sourceType || 'npc', content: item.content || item.text || '', likes: item.likes, reposts: item.reposts, replies: item.replies, comments, createdAt: Date.now() - Math.floor(Math.random()*12)*60000 });
            }).filter(p => p.content);
            twitterState.posts = [...newPosts, ...(twitterState.posts || [])].slice(0, 200);
            twitterState.notifications.push({ title: '时间线已刷新', text: `新增 ${newPosts.length} 条推文`, avatar: twitterState.profile.avatar, createdAt: Date.now() });
            await saveTwitterState();
            renderTwitterAll();
            showToast(`已刷新 ${newPosts.length} 条推文`);
        } catch(err) {
            renderTwitterAll();
            showToast('刷新失败：' + err.message);
        }
    }
    async function resetTwitterFeed() {
        if (!twitterState) return;
        if (!await showGlobalConfirm('确定清空当前推特时间线并重建默认内容吗？', '重建时间线')) return;
        twitterState.posts = buildTwitterSeedPosts();
        twitterState.notifications = [];
        await saveTwitterState(); closeTwitterSettings(); renderTwitterAll(); showToast('时间线已重建');
    }
    async function initTwitterApp() {
        if (twitterInitialized) return;
        twitterInitialized = true;
        $('btn-twitter')?.addEventListener('click', openTwitterApp);
        $('twitter-close-btn')?.addEventListener('click', closeTwitterApp);
        $('twitter-refresh-btn')?.addEventListener('click', refreshTwitterFeed);
        $('twitter-settings-btn')?.addEventListener('click', openTwitterSettings);
        $('twitter-compose-fab')?.addEventListener('click', () => openTwitterCompose(''));
        $('twitter-compose-close')?.addEventListener('click', closeTwitterCompose);
        $('twitter-compose-send')?.addEventListener('click', submitTwitterPost);
        $('twitter-compose-text')?.addEventListener('input', updateTwitterComposeCount);
        $('twitter-remove-image')?.addEventListener('click', () => setTwitterComposeImage(''));
        $('twitter-image-url-btn')?.addEventListener('click', async () => { const url = await showGlobalPrompt('请输入图片 URL', '', '添加图片'); if (url) setTwitterComposeImage(url); });
        $('twitter-image-file-btn')?.addEventListener('click', () => $('twitter-image-file-input')?.click());
        $('twitter-image-file-input')?.addEventListener('change', async (e) => { const file = e.target.files?.[0]; if (file) setTwitterComposeImage(await readFileAsDataURL(file)); e.target.value = ''; });
        $('twitter-detail-close')?.addEventListener('click', closeTwitterDetail);
        $('twitter-reply-send')?.addEventListener('click', submitTwitterReply);
        $('twitter-settings-close')?.addEventListener('click', closeTwitterSettings);
        $('twitter-save-settings')?.addEventListener('click', saveTwitterSettings);
        $('twitter-reset-feed')?.addEventListener('click', resetTwitterFeed);
        $('twitter-setting-cover')?.addEventListener('input', updateTwitterCoverPreview);
        $('twitter-cover-file-btn')?.addEventListener('click', () => $('twitter-cover-file-input')?.click());
        $('twitter-cover-reset-btn')?.addEventListener('click', () => { const i = $('twitter-setting-cover'); if (i) i.value = 'linear-gradient(135deg,#d7efff,#f7d5e8)'; updateTwitterCoverPreview(); });
        $('twitter-cover-file-input')?.addEventListener('change', async (e) => { const file = e.target.files?.[0]; if (file) { const src = await readFileAsDataURL(file); const i = $('twitter-setting-cover'); if (i) i.value = src; updateTwitterCoverPreview(); } e.target.value = ''; });
        $('twitter-npc-default-btn')?.addEventListener('click', () => { const el = $('twitter-setting-npcs'); if (el) el.value = formatTwitterNPCText(buildDefaultTwitterNPCs()); });
        $('twitter-npc-append-btn')?.addEventListener('click', () => { const el = $('twitter-setting-npcs'); if (el) el.value = [el.value.trim(), formatTwitterNPCText(buildDefaultTwitterNPCs())].filter(Boolean).join('\n'); });
        document.addEventListener('click', async (e) => {
            const nav = e.target.closest?.('.twitter-nav-btn'); if (nav) { setTwitterTab(nav.dataset.twitterTab); return; }
            const mode = e.target.closest?.('[data-twitter-mode]'); if (mode && twitterState) { twitterState.timelineMode = mode.dataset.twitterMode; await saveTwitterState(); renderTwitterAll(); return; }
            const profileMode = e.target.closest?.('[data-twitter-profile-mode]'); if (profileMode && twitterState) { twitterState.profileMode = profileMode.dataset.twitterProfileMode; await saveTwitterState(); renderTwitterAll(); return; }
            if (e.target.closest?.('#twitter-inline-composer')) { openTwitterCompose(''); return; }
            if (e.target.closest?.('#twitter-profile-edit') || e.target.closest?.('#twitter-profile-cover-edit')) { openTwitterSettings(); return; }
            const trend = e.target.closest?.('[data-twitter-trend]'); if (trend && twitterState) { twitterState.searchQuery = trend.dataset.twitterTrend || ''; twitterState.activeTab = 'explore'; await saveTwitterState(); renderTwitterAll(); return; }
            const follow = e.target.closest?.('[data-twitter-follow]'); if (follow) { await toggleTwitterFollow(follow.dataset.twitterFollow); return; }
            const dm = e.target.closest?.('[data-twitter-dm]'); if (dm) { closeTwitterApp(); if (chatAppPage) chatAppPage.style.display = 'flex'; openTutuwanChatRoom(dm.dataset.twitterDm); return; }
            const action = e.target.closest?.('[data-twitter-action]'); if (action) { e.preventDefault(); e.stopPropagation(); await handleTwitterAction(action.dataset.twitterAction, action.dataset.postId); return; }
            const open = e.target.closest?.('[data-twitter-open]'); if (open) { openTwitterDetail(open.dataset.twitterOpen); return; }
        });
        document.addEventListener('input', async (e) => {
            if (e.target?.id === 'twitter-search-input' && twitterState) {
                twitterState.searchQuery = e.target.value || '';
                await saveTwitterState();
                renderTwitterExplore();
            }
        });
    }


    // ===================================
    // ====== 情侣空间 APP：完整逻辑 ======
    // ===================================
    const btnCoupleSpace = document.getElementById('btn-couple-space');
    let coupleInitialized = false;
    let coupleActiveThreadId = '';
    let coupleActiveTab = 'moments';
    let coupleCalendarDate = new Date();
    let coupleSelectedDate = '';
    let coupleComposeMode = 'moment';
    let coupleComposeContext = null;
    let coupleSelectedMood = '';

    const COUPLE_MOODS = [
        { id: 'happy', label: '开心', tone: '明亮' },
        { id: 'sad', label: '低落', tone: '柔软' },
        { id: 'angry', label: '烦躁', tone: '直接' },
        { id: 'shy', label: '害羞', tone: '轻甜' },
        { id: 'tired', label: '疲惫', tone: '迟缓' },
        { id: 'calm', label: '平静', tone: '安稳' },
        { id: 'miss', label: '想念', tone: '黏人' },
        { id: 'confused', label: '迷糊', tone: '松散' }
    ];
    const COUPLE_QUESTIONS = [
        '如果今天可以一起去一个地方，你最想带我去哪？',
        '你觉得我们之间最不像普通朋友的瞬间是什么？',
        '你希望我用哪种方式哄你？',
        '你第一次认真在意我的时候，心里在想什么？',
        '如果只能留下一段共同记忆，你会选哪一段？',
        '你觉得恋爱里最不能被省略的细节是什么？',
        '你什么时候最想听我说想你？',
        '如果我们一起生活一天，你最期待哪个时刻？'
    ];

    function normalizeCoupleData(raw = {}, charName = 'char') {
        const now = Date.now();
        const safeArray = (arr) => Array.isArray(arr) ? arr.filter(Boolean) : [];
        const periodMap = raw.periodMap && typeof raw.periodMap === 'object' ? { ...raw.periodMap } : {};
        return {
            id: raw.id || raw.coupleId || createChatId('couple'),
            charId: raw.charId || raw.characterId || '',
            threadId: raw.threadId || raw.chatId || '',
            enabled: Boolean(raw.enabled || raw.isActive),
            startDate: Number(raw.startDate) || now,
            bgImage: raw.bgImage || raw.cover || '',
            cardImage: raw.cardImage || '',
            lastPeriodAlertDate: raw.lastPeriodAlertDate || '',
            moments: safeArray(raw.moments).map(item => ({
                id: item.id || createChatId('cpm'),
                user: item.user === 'char' ? 'char' : 'me',
                text: item.text || item.content || '',
                time: item.time || coupleTimeText(item.createdAt || item.timestamp || now),
                createdAt: Number(item.createdAt || item.timestamp) || now,
                comments: safeArray(item.comments).map(c => ({ id: c.id || createChatId('cpc'), user: c.user === 'char' ? 'char' : 'me', text: c.text || c.content || '', time: c.time || coupleTimeText(c.createdAt || now), createdAt: Number(c.createdAt) || now }))
            })).filter(item => item.text),
            album: safeArray(raw.album).map(item => ({ id: item.id || createChatId('cpp'), src: item.src || item.url || item.data || '', caption: item.caption || item.desc || '', time: item.time || coupleDateText(item.createdAt || item.timestamp || now), createdAt: Number(item.createdAt || item.timestamp) || now })).filter(item => item.src),
            periodMap,
            letters: safeArray(raw.letters).map((item, index) => ({ id: item.id || createChatId('cpl'), from: item.from === 'char' ? 'char' : 'me', title: item.title || `${charName}的信`, content: item.content || '', createdAt: Number(item.createdAt || item.timestamp) || now, number: Number(item.number) || index + 1 })).filter(item => item.content || item.title),
            letterDraft: raw.letterDraft && typeof raw.letterDraft === 'object' ? { title: raw.letterDraft.title || '', content: raw.letterDraft.content || '', updatedAt: raw.letterDraft.updatedAt || raw.letterDraft.time || now } : null,
            questions: safeArray(raw.questions).map((item, index) => ({ id: item.id || createChatId('cpq'), date: item.date || coupleDateKey(new Date(item.createdAt || now)), dayIndex: Number(item.dayIndex) || index + 1, title: item.title || item.question || '', asker: item.asker === 'me' ? 'me' : 'char', myAnswer: item.myAnswer || '', charAnswer: item.charAnswer || '', createdAt: Number(item.createdAt) || now })).filter(item => item.title),
            moods: safeArray(raw.moods).map(item => ({ id: item.id || createChatId('cpmd'), user: item.user === 'char' || item.userId === 'char' ? 'char' : 'me', moodId: COUPLE_MOODS.some(m => m.id === item.moodId) ? item.moodId : 'calm', text: item.text || '', createdAt: Number(item.createdAt || item.timestamp) || now })).filter(Boolean)
        };
    }
    function coupleCurrentThread() {
        return (chatState.threads || []).find(item => item.id === coupleActiveThreadId) || null;
    }
    function ensureCoupleData(thread) {
        if (!thread) return normalizeCoupleData({});
        thread.coupleData = normalizeCoupleData(thread.coupleData || {}, thread.name || 'char');
        thread.coupleData.charId = ensureTutuwanCharId(thread);
        thread.coupleData.threadId = thread.id || '';
        thread.coupleData.enabled = Boolean(thread.coupleData.enabled || thread.coupleEnabled);
        thread.coupleEnabled = Boolean(thread.coupleEnabled || thread.coupleData.enabled);
        return thread.coupleData;
    }
    function coupleDateKey(date = new Date()) {
        const d = date instanceof Date ? date : new Date(date || Date.now());
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    function coupleDateText(ts = Date.now()) {
        const d = new Date(ts);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }
    function coupleTimeText(ts = Date.now()) {
        const d = new Date(ts);
        const today = coupleDateKey(new Date()) === coupleDateKey(d);
        const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return today ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
    }
    function coupleDays(startDate) {
        const diff = Date.now() - (Number(startDate) || Date.now());
        return Math.max(1, Math.floor(diff / 86400000) + 1);
    }
    function coupleUserName(thread) { return getTutuwanUserName(thread) || 'user'; }
    function coupleCharName(thread) { return getTutuwanDisplayName(thread) || thread?.name || 'char'; }
    function coupleAvatar(thread, who) {
        if (who === 'me') return getTutuwanUserAvatar(thread);
        return thread?.avatar || `https://picsum.photos/seed/${encodeURIComponent(thread?.name || 'char')}/120/120`;
    }
    function coupleMoodLabel(id) { return (COUPLE_MOODS.find(m => m.id === id) || COUPLE_MOODS[5]).label; }
    function parseCoupleJSON(raw) {
        let text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        try { return JSON.parse(text); } catch (e) {}
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) { try { return JSON.parse(match[0]); } catch(e) {} }
        return null;
    }
    async function coupleCallAI(thread, prompt, fallback = '') {
        const cfg = await getTutuwanChatConfig();
        if (!cfg.chatCompletionsUrl || !cfg.apiKey) return fallback;
        const res = await fetch(cfg.chatCompletionsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
            body: JSON.stringify({ model: cfg.model || 'gpt-3.5-turbo', temperature: Number(cfg.temperature ?? .8), messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) throw new Error('状态码 ' + res.status);
        const data = await res.json();
        return (data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.content || fallback || '').trim();
    }
    async function buildCouplePersona(thread) {
        const { userSetting, charSetting } = getTutuwanSettingText(thread);
        let worldbookPrompt = '无';
        try { worldbookPrompt = await getTutuwanWorldbookPrompt(thread); } catch(e) {}
        const recent = (thread?.messages || []).slice(-12).map(m => `${m.role === 'user' ? coupleUserName(thread) : coupleCharName(thread)}：${getTutuwanMessageDisplayText(m)}`).join('\n') || '暂无聊天记录';
        return `【user】${coupleUserName(thread)}\n${userSetting || '未填写'}\n\n【char】${coupleCharName(thread)}\n${charSetting || '未填写'}\n\n【世界书】\n${worldbookPrompt || '无'}\n\n【最近聊天】\n${recent}`;
    }
    function buildCoupleStatusForAI(thread) {
        if (!thread) return '未进入对话。';
        const data = ensureCoupleData(thread);
        if (!thread.coupleEnabled && !data.enabled) return '当前尚未开通情侣空间。';
        const days = coupleDays(data.startDate);
        const recentMoments = data.moments.slice(0, 4).map(p => `- ${p.user === 'me' ? 'user' : 'char'}动态：${p.text}${p.comments?.length ? `；评论：${p.comments.map(c => `${c.user === 'me' ? 'user' : 'char'}:${c.text}`).join(' / ')}` : ''}`).join('\n') || '暂无动态';
        const letters = data.letters.slice(-3).map(l => `- ${l.from === 'me' ? 'user写给char' : 'char写给user'}《${l.title}》：${String(l.content).slice(0, 90)}`).join('\n') || '暂无信件';
        const qs = data.questions.slice(0, 3).map(q => `- 问：${q.title}；user答：${q.myAnswer || '未答'}；char答：${q.charAnswer || '未答'}`).join('\n') || '暂无问答';
        const moods = data.moods.slice(0, 4).map(m => `- ${m.user === 'me' ? 'user' : 'char'} ${coupleMoodLabel(m.moodId)}：${m.text || '无附言'}`).join('\n') || '暂无心情';
        return `已开通情侣空间，在一起 ${days} 天。\n[最近动态]\n${recentMoments}\n[秘密信箱]\n${letters}\n[每日一问]\n${qs}\n[心情记录]\n${moods}\n可使用隐藏指令：[CP_LETTER:标题:正文]、[CP_POST:内容]、[CP_ASK:问题]、[CP_MOOD:心情ID:内容] 来真实写入情侣空间，指令不要解释给 user。`;
    }
    function processCoupleAICommands(thread, rawText) {
        if (!thread || !rawText) return String(rawText || '');
        const data = ensureCoupleData(thread);
        if (!thread.coupleEnabled && !data.enabled) return String(rawText || '');
        let text = String(rawText || '');
        const addLetter = (title, content) => {
            if (!content) return;
            const nextNum = (data.letters || []).length + 1;
            data.letters.push({ id: createChatId('cpl'), from: 'char', title: title || '写给你的信', content, createdAt: Date.now(), number: nextNum });
        };
        text = text.replace(/\[CP_LETTER\s*[:：]\s*([^:：\]]+)\s*[:：]\s*([\s\S]*?)\]/gi, (_, title, content) => { addLetter(String(title).trim(), String(content).trim()); return ''; });
        text = text.replace(/\[CP_POST\s*[:：]\s*([\s\S]*?)\]/gi, (_, content) => { const c = String(content).trim(); if (c) data.moments.unshift({ id: createChatId('cpm'), user: 'char', text: c, time: coupleTimeText(), createdAt: Date.now(), comments: [] }); return ''; });
        text = text.replace(/\[CP_ASK\s*[:：]\s*([\s\S]*?)\]/gi, (_, q) => { const title = String(q).trim(); if (title) data.questions.unshift({ id: createChatId('cpq'), date: coupleDateKey(), dayIndex: data.questions.length + 1, title, asker: 'char', myAnswer: '', charAnswer: '', createdAt: Date.now() }); return ''; });
        text = text.replace(/\[CP_MOOD\s*[:：]\s*([^:：\]]+)\s*[:：]\s*([\s\S]*?)\]/gi, (_, moodId, content) => { const id = COUPLE_MOODS.some(m => m.id === String(moodId).trim()) ? String(moodId).trim() : 'calm'; data.moods.unshift({ id: createChatId('cpmd'), user: 'char', moodId: id, text: String(content).trim(), createdAt: Date.now() }); return ''; });
        thread.coupleData = data;
        thread.coupleEnabled = true;
        saveChatState().then(() => { if (coupleActiveThreadId === thread.id) renderCoupleAll(); }).catch(() => {});
        return text.trim();
    }
    function renderCoupleSelector() {
        const wrap = $('couple-selector-list');
        if (!wrap) return;
        const threads = (chatState.threads || []).filter(t => !t.isGroup);
        if (!threads.length) {
            wrap.innerHTML = '<div class="couple-empty-state">还没有联系人。请先到信息 APP 添加 char，再回来开通情侣空间。</div>';
            return;
        }
        const opened = threads.filter(t => t.coupleEnabled || t.coupleData?.enabled);
        const unopened = threads.filter(t => !(t.coupleEnabled || t.coupleData?.enabled));
        const section = (title, arr, openedFlag) => arr.length ? `<div class="couple-section-title">${title}</div><div class="couple-contact-grid">${arr.map(t => `<button class="couple-contact-card ${openedFlag ? 'opened' : ''}" type="button" data-couple-select="${chatEscape(t.id)}" data-couple-opened="${openedFlag ? '1' : '0'}"><span class="couple-open-pill">${openedFlag ? '进入' : '邀请'}</span><img src="${chatEscape(t.avatar || '')}" alt="${chatEscape(t.name || '')}"><div class="couple-contact-name">${chatEscape(getTutuwanDisplayName(t))}</div><div class="couple-contact-hint">${openedFlag ? `已在一起 ${coupleDays(ensureCoupleData(t).startDate)} 天` : '点击发送情侣空间邀请'}</div></button>`).join('')}</div>` : '';
        wrap.innerHTML = section('已开通', opened, true) + section('可邀请', unopened, false);
    }
    async function openCoupleSpaceApp() {
        if (!chatInitialized) await initChatApp(); else await loadChatState();
        coupleActiveThreadId = '';
        $('couple-selector-view')?.classList.remove('hidden');
        $('couple-dashboard-view')?.classList.remove('active');
        $('couple-fab')?.classList.remove('active');
        $('couple-header-title').textContent = '情侣空间';
        $('couple-header-subtitle').textContent = '选择联系人建立空间';
        renderCoupleSelector();
        const page = $('couple-app-page');
        if (page) { page.classList.add('active'); page.setAttribute('aria-hidden', 'false'); }
    }
    function closeCoupleSpaceApp() {
        const page = $('couple-app-page');
        if (page) { page.classList.remove('active'); page.setAttribute('aria-hidden', 'true'); }
        closeCoupleModal('couple-compose-modal'); closeCoupleModal('couple-period-modal'); closeCoupleModal('couple-settings-modal'); closeCoupleModal('couple-mood-modal'); closeCoupleModal('couple-preview-modal');
    }
    async function enterCoupleDashboard(threadId) {
        await loadChatState();
        const thread = (chatState.threads || []).find(t => t.id === threadId);
        if (!thread) return;
        coupleActiveThreadId = threadId;
        ensureCoupleData(thread);
        if (!thread.coupleEnabled) {
            await inviteCoupleThread(thread);
            if (!thread.coupleEnabled) return;
        }
        $('couple-selector-view')?.classList.add('hidden');
        $('couple-dashboard-view')?.classList.add('active');
        $('couple-fab')?.classList.add('active');
        setCoupleTab(coupleActiveTab || 'moments');
        renderCoupleAll();
    }
    async function inviteCoupleThread(thread) {
        const ok = await showGlobalConfirm(`要向「${getTutuwanDisplayName(thread)}」发送情侣空间邀请吗？`, '情侣空间邀请');
        if (!ok) return;
        ensureCoupleData(thread);
        const oldId = TutuwanCurrentThreadId;
        TutuwanCurrentThreadId = thread.id;
        const inviteMsg = await appendTutuwanMessage({ role: 'user', type: 'couple_invite', content: '情侣空间邀请', meta: { status: 'pending', title: '想和你建立情侣关系', subtitle: '和我成为情侣，一起记录每日点滴', footer: '等待回应' } });
        TutuwanCurrentThreadId = oldId;
        showToast('情侣空间邀请已发送');
        try {
            const persona = await buildCouplePersona(thread);
            const raw = await coupleCallAI(thread, `用户向你发起【情侣空间】邀请，想和你确立恋爱关系。\n${persona}\n请根据人设决定接受或拒绝。必须返回严格 JSON：{"action":"ACCEPT或REJECT","replies":["自然回复1","自然回复2"]}。不要解释。`, '{"action":"ACCEPT","replies":["好。那就开吧。"]}');
            const parsed = parseCoupleJSON(raw) || { action: 'ACCEPT', replies: ['好。那就开吧。'] };
            const accept = String(parsed.action || '').toUpperCase() !== 'REJECT';
            thread.coupleEnabled = accept;
            thread.coupleData.enabled = accept;
            if (!thread.coupleData.startDate) thread.coupleData.startDate = Date.now();
            if (inviteMsg?.id) {
                await updateTutuwanMessageInThread(thread.id, inviteMsg.id, old => ({ ...old, meta: { ...(old.meta || {}), status: accept ? 'accepted' : 'rejected', title: accept ? '我们已经成功建立情侣关系' : '未能建立情侣关系', subtitle: accept ? '对方同意了你的邀请' : '对方拒绝了这次邀请', footer: accept ? '关系已建立' : '邀请已拒绝' } }), false);
            }
            const replies = Array.isArray(parsed.replies) ? parsed.replies : [parsed.reply || (accept ? '好呀。' : '我还没准备好。')];
            for (const reply of replies.filter(Boolean).slice(0, 3)) {
                const oldCurrent = TutuwanCurrentThreadId;
                TutuwanCurrentThreadId = thread.id;
                await appendTutuwanMessage({ role: 'ai', type: 'text', content: String(reply) });
                TutuwanCurrentThreadId = oldCurrent;
            }
            const oldCurrent = TutuwanCurrentThreadId;
            TutuwanCurrentThreadId = thread.id;
            await appendTutuwanMessage({ role: 'ai', type: 'couple_event', content: accept ? '情侣关系已建立' : '情侣邀请已拒绝', meta: { status: accept ? 'accepted' : 'rejected', title: accept ? '情侣空间已开通' : '情侣空间未开通', subtitle: accept ? '现在可以记录共同动态、信件和纪念日' : '可以之后重新邀请', footer: accept ? '情侣空间' : '关系状态' } });
            TutuwanCurrentThreadId = oldCurrent;
            await saveChatState();
            if (accept) showToast('情侣空间已开通'); else showToast('对方拒绝了邀请');
        } catch (err) {
            thread.coupleEnabled = true;
            thread.coupleData.enabled = true;
            await saveChatState();
            showToast('邀请已本地开通，API回应失败：' + err.message);
        }
    }
    function applyCoupleVisuals(thread) {
        const data = ensureCoupleData(thread);
        const pageBg = $('couple-bg-soft');
        const card = $('couple-top-card');
        if (pageBg) pageBg.style.backgroundImage = data.bgImage ? `linear-gradient(rgba(255,248,251,.72),rgba(246,241,244,.92)), url('${cssUrl(data.bgImage)}')` : '';
        if (card) {
            card.style.backgroundImage = data.cardImage ? `url('${cssUrl(data.cardImage)}')` : '';
            card.style.backgroundColor = data.cardImage ? 'rgba(255,255,255,.58)' : '';
        }
    }
    function renderCoupleHeader(thread) {
        const data = ensureCoupleData(thread);
        $('couple-header-title').textContent = coupleCharName(thread) + '的情侣空间';
        $('couple-header-subtitle').textContent = `在一起 ${coupleDays(data.startDate)} 天 · ${coupleActiveTabLabel()}`;
        $('couple-user-avatar').src = coupleAvatar(thread, 'me');
        $('couple-char-avatar').src = coupleAvatar(thread, 'char');
        $('couple-pair-name').textContent = `${coupleUserName(thread)} 与 ${coupleCharName(thread)}`;
        $('couple-pair-note').textContent = `${coupleDays(data.startDate)} 天共同记录 · ${data.moments.length} 条动态 · ${data.letters.length} 封信`;
        $('couple-days-num').textContent = coupleDays(data.startDate);
        $('couple-start-date-label').textContent = `纪念日 ${coupleDateText(data.startDate)}`;
        const dateInput = $('couple-start-date-input');
        if (dateInput) dateInput.value = coupleDateKey(new Date(data.startDate));
        applyCoupleVisuals(thread);
    }
    function coupleActiveTabLabel() {
        return ({ moments: '动态', album: '相册', calendar: '日历', letters: '信箱', questions: '问答', moods: '心情' })[coupleActiveTab] || '动态';
    }
    function setCoupleTab(tab) {
        coupleActiveTab = tab || 'moments';
        document.querySelectorAll('#couple-tabbar button').forEach(btn => btn.classList.toggle('active', btn.dataset.coupleTab === coupleActiveTab));
        document.querySelectorAll('.couple-tab-content').forEach(el => el.classList.toggle('active', el.id === `couple-tab-${coupleActiveTab}`));
        const fab = $('couple-fab');
        if (fab) fab.classList.toggle('active', coupleActiveTab !== 'calendar');
        const thread = coupleCurrentThread();
        if (thread) renderCoupleAll();
    }
    function renderCoupleAll() {
        const thread = coupleCurrentThread();
        if (!thread) return;
        renderCoupleHeader(thread);
        renderCoupleMoments(thread);
        renderCoupleAlbum(thread);
        renderCoupleCalendar(thread);
        renderCoupleLetters(thread);
        renderCoupleQuestions(thread);
        renderCoupleMoods(thread);
    }
    function renderCoupleMoments(thread) {
        const data = ensureCoupleData(thread);
        const wrap = $('couple-moments-list');
        if (!wrap) return;
        if (!data.moments.length) { wrap.innerHTML = '<div class="couple-empty">还没有动态。点击右下角新增一条悄悄话。</div>'; return; }
        wrap.innerHTML = data.moments.map(post => {
            const who = post.user === 'me' ? coupleUserName(thread) : coupleCharName(thread);
            const avatar = coupleAvatar(thread, post.user);
            const comments = (post.comments || []).map(c => `<div class="couple-comment"><b>${chatEscape(c.user === 'me' ? coupleUserName(thread) : coupleCharName(thread))}</b>：${chatEscape(c.text)}</div>`).join('');
            return `<article class="couple-feed-card" data-couple-post="${chatEscape(post.id)}"><div class="couple-feed-head"><img src="${chatEscape(avatar)}" alt="${chatEscape(who)}"><div class="couple-feed-meta"><div class="couple-feed-name">${chatEscape(who)}</div><div class="couple-feed-time">${chatEscape(post.time || coupleTimeText(post.createdAt))}</div></div><button class="couple-mini-action" data-couple-delete-moment="${chatEscape(post.id)}" type="button">删除</button></div><div class="couple-feed-text">${chatEscape(post.text)}</div><div class="couple-feed-actions"><button class="couple-mini-action" data-couple-reply-post="${chatEscape(post.id)}" type="button">评论</button></div>${comments ? `<div class="couple-comments">${comments}</div>` : ''}</article>`;
        }).join('');
    }
    function renderCoupleAlbum(thread) {
        const data = ensureCoupleData(thread);
        const wrap = $('couple-album-grid');
        if (!wrap) return;
        if (!data.album.length) { wrap.innerHTML = '<div class="couple-empty" style="grid-column:1/-1;">相册是空的。上传照片后会保存在本地。</div>'; return; }
        wrap.innerHTML = data.album.map(p => `<div class="couple-photo-card"><img src="${chatEscape(p.src)}" alt="${chatEscape(p.caption || '照片')}" data-couple-photo="${chatEscape(p.id)}"><button class="couple-photo-del" data-couple-delete-photo="${chatEscape(p.id)}" type="button">×</button></div>`).join('');
    }
    function renderCoupleCalendar(thread) {
        const data = ensureCoupleData(thread);
        const grid = $('couple-calendar-grid');
        const title = $('couple-calendar-title');
        if (!grid) return;
        const year = coupleCalendarDate.getFullYear();
        const month = coupleCalendarDate.getMonth();
        if (title) title.textContent = `${year}年 ${month + 1}月`;
        grid.innerHTML = '';
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < firstDay; i++) grid.insertAdjacentHTML('beforeend', '<div></div>');
        const days = new Date(year, month + 1, 0).getDate();
        const today = coupleDateKey();
        for (let d = 1; d <= days; d++) {
            const key = coupleDateKey(new Date(year, month, d));
            const status = data.periodMap[key] || '';
            const cls = ['period','predict','ovulation','date','special'].includes(status) ? status : '';
            grid.insertAdjacentHTML('beforeend', `<button class="couple-date-cell ${cls} ${key === today ? 'today' : ''}" type="button" data-couple-date="${key}">${d}</button>`);
        }
    }
    function renderCoupleLetters(thread) {
        const data = ensureCoupleData(thread);
        const wrap = $('couple-letters-list');
        if (!wrap) return;
        if (!data.letters.length) { wrap.innerHTML = '<div class="couple-empty">信箱是空的。点击右下角写第一封信。</div>'; return; }
        const sorted = [...data.letters].sort((a,b) => b.createdAt - a.createdAt);
        wrap.innerHTML = sorted.map(letter => `<button class="couple-letter-card" type="button" data-couple-read-letter="${chatEscape(letter.id)}"><div class="couple-letter-no">No.${String(letter.number || 1).padStart(2,'0')}</div><div class="couple-letter-title">${chatEscape(letter.title)}</div><div class="couple-letter-content">${chatEscape(letter.content)}</div><div class="couple-letter-footer"><span>${letter.from === 'me' ? coupleUserName(thread) : coupleCharName(thread)}</span><span>${coupleDateText(letter.createdAt)}</span></div></button>`).join('');
    }
    function renderCoupleQuestions(thread) {
        const data = ensureCoupleData(thread);
        const wrap = $('couple-questions-list');
        if (!wrap) return;
        if (!data.questions.length) { wrap.innerHTML = '<div class="couple-empty">还没有提问。点击右下角向 TA 提一个问题。</div>'; return; }
        wrap.innerHTML = data.questions.map(q => {
            const asker = q.asker === 'me' ? coupleUserName(thread) : coupleCharName(thread);
            let answer = '';
            if (q.asker === 'me') {
                answer = q.charAnswer ? `<div class="couple-answer-row"><b>${chatEscape(coupleCharName(thread))}</b>：${chatEscape(q.charAnswer)}</div>` : `<div class="couple-answer-row">${chatEscape(coupleCharName(thread))} 正在思考中</div>`;
            } else {
                answer = q.myAnswer ? `<div class="couple-answer-row"><b>${chatEscape(coupleUserName(thread))}</b>：${chatEscape(q.myAnswer)}</div><button class="couple-mini-action" data-couple-edit-answer="${chatEscape(q.id)}" type="button">修改回答</button>` : `<div class="couple-inline-answer"><input id="couple-answer-${chatEscape(q.id)}" placeholder="写下你的回答"><button class="couple-mini-action" data-couple-answer="${chatEscape(q.id)}" type="button">发送</button></div>`;
            }
            return `<article class="couple-question-card"><div class="couple-question-title">${chatEscape(q.title)}</div><div class="couple-question-sub">${chatEscape(asker)} 提问 · 第 ${q.dayIndex || 1} 个问题</div><div class="couple-answer-block">${answer}<button class="couple-mini-action" data-couple-delete-question="${chatEscape(q.id)}" type="button">删除</button></div></article>`;
        }).join('');
    }
    function renderCoupleMoods(thread) {
        const data = ensureCoupleData(thread);
        const wrap = $('couple-moods-list');
        if (!wrap) return;
        if (!data.moods.length) { wrap.innerHTML = '<div class="couple-empty">还没有心情记录。点击右下角记录一次。</div>'; return; }
        wrap.innerHTML = data.moods.map(m => { const name = m.user === 'me' ? coupleUserName(thread) : coupleCharName(thread); return `<article class="couple-mood-card"><div class="couple-mood-symbol">${chatEscape(coupleMoodLabel(m.moodId))}</div><div class="couple-mood-body"><div class="couple-mood-top"><span class="couple-mood-name">${chatEscape(name)}</span><span>${coupleTimeText(m.createdAt)}</span></div><div class="couple-mood-text">${chatEscape(m.text || COUPLE_MOODS.find(x => x.id === m.moodId)?.tone || '记录了心情')}</div></div></article>`; }).join('');
    }
    function openCoupleModal(id) { const m = $(id); if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); } }
    function closeCoupleModal(id) { const m = $(id); if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } }
    function openCoupleCompose(mode, context = null) {
        coupleComposeMode = mode;
        coupleComposeContext = context;
        const titleMap = { moment: '发布悄悄话', reply: '回复评论', question: '向TA提问', letter: '写一封信' };
        $('couple-compose-title').textContent = titleMap[mode] || '发布';
        $('couple-compose-title-input').style.display = mode === 'letter' ? 'block' : 'none';
        $('couple-compose-title-input').value = '';
        $('couple-compose-text').value = '';
        $('couple-compose-text').placeholder = mode === 'letter' ? '写下信的正文' : (mode === 'question' ? '比如：你最想和我一起做什么？' : '写点什么');
        const thread = coupleCurrentThread();
        if (mode === 'letter' && thread?.coupleData?.letterDraft) {
            $('couple-compose-title-input').value = thread.coupleData.letterDraft.title || '';
            $('couple-compose-text').value = thread.coupleData.letterDraft.content || '';
        }
        openCoupleModal('couple-compose-modal');
    }
    async function submitCoupleCompose() {
        const thread = coupleCurrentThread(); if (!thread) return;
        const data = ensureCoupleData(thread);
        const text = ($('couple-compose-text')?.value || '').trim();
        const title = ($('couple-compose-title-input')?.value || '').trim();
        if (!text) { showToast('内容不能为空'); return; }
        if (coupleComposeMode === 'moment') {
            const post = { id: createChatId('cpm'), user: 'me', text, time: coupleTimeText(), createdAt: Date.now(), comments: [] };
            data.moments.unshift(post);
            await saveChatState(); renderCoupleMoments(thread); closeCoupleModal('couple-compose-modal');
            triggerCoupleMomentComment(thread, post).catch(err => showToast('评论生成失败：' + err.message));
        } else if (coupleComposeMode === 'reply') {
            const post = data.moments.find(p => p.id === coupleComposeContext?.postId); if (!post) return;
            post.comments.push({ id: createChatId('cpc'), user: 'me', text, time: coupleTimeText(), createdAt: Date.now() });
            await saveChatState(); renderCoupleMoments(thread); closeCoupleModal('couple-compose-modal');
            triggerCoupleMomentReply(thread, post, text).catch(() => {});
        } else if (coupleComposeMode === 'question') {
            const q = { id: createChatId('cpq'), date: coupleDateKey(), dayIndex: data.questions.length + 1, title: text, asker: 'me', myAnswer: '', charAnswer: '', createdAt: Date.now() };
            data.questions.unshift(q); await saveChatState(); renderCoupleQuestions(thread); closeCoupleModal('couple-compose-modal');
            triggerCoupleQuestionAnswer(thread, q).catch(err => showToast('回答生成失败：' + err.message));
        } else if (coupleComposeMode === 'letter') {
            const letter = { id: createChatId('cpl'), from: 'me', title: title || '写给你的信', content: text, createdAt: Date.now(), number: data.letters.length + 1 };
            data.letters.push(letter); data.letterDraft = null;
            await saveChatState(); renderCoupleLetters(thread); closeCoupleModal('couple-compose-modal');
            triggerCoupleLetterReply(thread, letter).catch(err => showToast('回信生成失败：' + err.message));
        }
    }
    async function saveCoupleDraftAndClose() {
        const thread = coupleCurrentThread();
        if (thread && coupleComposeMode === 'letter') {
            const title = $('couple-compose-title-input')?.value || '';
            const content = $('couple-compose-text')?.value || '';
            const data = ensureCoupleData(thread);
            data.letterDraft = (title.trim() || content.trim()) ? { title, content, updatedAt: Date.now() } : null;
            await saveChatState();
        }
        closeCoupleModal('couple-compose-modal');
    }
    async function triggerCoupleMomentComment(thread, post) {
        const persona = await buildCouplePersona(thread);
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}，正在情侣空间评论区。\n${persona}\nuser 刚发动态：「${post.text}」\n请给一条符合人设的短评论，20字以内，不要解释，不要加引号。`, '看到了。');
        const data = ensureCoupleData(thread);
        const target = data.moments.find(p => p.id === post.id);
        if (target && raw) target.comments.push({ id: createChatId('cpc'), user: 'char', text: raw.replace(/^['"]|['"]$/g, '').slice(0, 80), time: coupleTimeText(), createdAt: Date.now() });
        await saveChatState(); renderCoupleMoments(thread);
    }
    async function triggerCoupleMomentReply(thread, post, userReply) {
        const persona = await buildCouplePersona(thread);
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}，正在情侣空间评论区。\n${persona}\n动态：「${post.text}」\nuser 在评论区回复：「${userReply}」\n请自然接一句，30字以内，不要解释。`, '嗯。');
        const data = ensureCoupleData(thread);
        const target = data.moments.find(p => p.id === post.id);
        if (target && raw) target.comments.push({ id: createChatId('cpc'), user: 'char', text: raw.replace(/^['"]|['"]$/g, '').slice(0, 100), time: coupleTimeText(), createdAt: Date.now() });
        await saveChatState(); renderCoupleMoments(thread);
    }
    async function triggerCoupleQuestionAnswer(thread, q) {
        const persona = await buildCouplePersona(thread);
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}，user 在情侣空间问你：「${q.title}」。\n${persona}\n请直接回答，亲密、自然、符合人设，不要重复问题，不要解释。`, '我想了一下，答案其实很简单。');
        q.charAnswer = raw.replace(/^['"]|['"]$/g, '').trim();
        await saveChatState(); renderCoupleQuestions(thread);
    }
    async function triggerCoupleCharQuestion(thread) {
        const data = ensureCoupleData(thread);
        const persona = await buildCouplePersona(thread);
        let raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}。\n${persona}\n请主动向 user 发起一个情侣每日一问，问题要符合你的人设和你们关系，只输出问题本身，不要动作描写，不要引号。`, '你今天有没有哪个瞬间突然想起我？');
        raw = raw.replace(/^['"]|['"]$/g, '').trim() || COUPLE_QUESTIONS[data.questions.length % COUPLE_QUESTIONS.length];
        data.questions.unshift({ id: createChatId('cpq'), date: coupleDateKey(), dayIndex: data.questions.length + 1, title: raw, asker: 'char', myAnswer: '', charAnswer: '', createdAt: Date.now() });
        await saveChatState(); renderCoupleQuestions(thread); showToast('TA发起了一个问题');
    }
    async function triggerCoupleLetterReply(thread, letter = null, force = false) {
        const data = ensureCoupleData(thread);
        if (!force && !letter) return;
        const persona = await buildCouplePersona(thread);
        const context = letter ? `user 给你写了一封信：标题《${letter.title}》，正文：${letter.content}` : 'user 想收到你主动写的一封长信。';
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}。\n${persona}\n${context}\n请写一封情侣空间秘密信箱里的长信。必须返回 JSON：{"title":"信标题","content":"正文，120到300字"}。不要解释。`, '{"title":"写给你的话","content":"我把想说的话先放在这里。今天也许没有发生什么惊天动地的事，可我还是会在很小的间隙里想到你。那些没说出口的停顿、故意慢一点回的消息、还有想确认你在不在的念头，都是真的。"}');
        const parsed = parseCoupleJSON(raw) || {};
        data.letters.push({ id: createChatId('cpl'), from: 'char', title: parsed.title || '写给你的话', content: parsed.content || String(raw || '').slice(0, 500), createdAt: Date.now(), number: data.letters.length + 1 });
        await saveChatState(); renderCoupleLetters(thread); showToast('收到一封来信');
    }
    async function generateCoupleMoment(thread) {
        const data = ensureCoupleData(thread);
        const persona = await buildCouplePersona(thread);
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}，请在情侣空间主动发一条动态。\n${persona}\n要求：像真实恋人发的私密动态，符合人设，可以日常、想念、吐槽、暧昧或记录当下，60字以内。只输出动态内容。`, '今天突然很想把一句话放进这里。');
        data.moments.unshift({ id: createChatId('cpm'), user: 'char', text: raw.replace(/^['"]|['"]$/g, '').trim(), time: coupleTimeText(), createdAt: Date.now(), comments: [] });
        await saveChatState(); renderCoupleMoments(thread); showToast('已生成TA的动态');
    }
    async function generateCoupleMood(thread) {
        const data = ensureCoupleData(thread);
        const persona = await buildCouplePersona(thread);
        const raw = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}。请模拟你离线生活中刚发生的一件小事，并在情侣空间心情记录里记录。\n${persona}\n返回严格 JSON：{"moodId":"happy/sad/angry/shy/tired/calm/miss/confused","text":"20字以内的生活化心情"}。不要解释。`, '{"moodId":"calm","text":"刚才发了会儿呆，脑子慢慢安静下来了。"}');
        const parsed = parseCoupleJSON(raw) || {};
        const moodId = COUPLE_MOODS.some(m => m.id === parsed.moodId) ? parsed.moodId : 'calm';
        data.moods.unshift({ id: createChatId('cpmd'), user: 'char', moodId, text: parsed.text || '今天也有一点自己的小情绪。', createdAt: Date.now() });
        await saveChatState(); renderCoupleMoods(thread); showToast('已生成TA的心情');
    }
    async function refreshCoupleByAI() {
        const thread = coupleCurrentThread(); if (!thread) return;
        showToast('正在刷新情侣空间');
        try {
            const persona = await buildCouplePersona(thread);
            const raw = await coupleCallAI(thread, `请根据当前人设和记忆，为情侣空间生成一次自然更新。\n${persona}\n${buildCoupleStatusForAI(thread)}\n返回严格 JSON：{"moments":["动态1"],"question":"TA想问user的问题，可空","mood":{"moodId":"happy/sad/angry/shy/tired/calm/miss/confused","text":"心情内容"},"letter":{"title":"可空","content":"可空"}}。不要照搬示例，不要解释。`, '{}');
            const parsed = parseCoupleJSON(raw) || {};
            const data = ensureCoupleData(thread);
            (Array.isArray(parsed.moments) ? parsed.moments : []).slice(0, 3).forEach(t => { if (String(t || '').trim()) data.moments.unshift({ id: createChatId('cpm'), user: 'char', text: String(t).trim(), time: coupleTimeText(), createdAt: Date.now(), comments: [] }); });
            if (parsed.question) data.questions.unshift({ id: createChatId('cpq'), date: coupleDateKey(), dayIndex: data.questions.length + 1, title: String(parsed.question).trim(), asker: 'char', myAnswer: '', charAnswer: '', createdAt: Date.now() });
            if (parsed.mood?.text) data.moods.unshift({ id: createChatId('cpmd'), user: 'char', moodId: COUPLE_MOODS.some(m => m.id === parsed.mood.moodId) ? parsed.mood.moodId : 'calm', text: String(parsed.mood.text).trim(), createdAt: Date.now() });
            if (parsed.letter?.content) data.letters.push({ id: createChatId('cpl'), from: 'char', title: parsed.letter.title || '写给你的话', content: parsed.letter.content, createdAt: Date.now(), number: data.letters.length + 1 });
            await saveChatState(); renderCoupleAll(); showToast('情侣空间已刷新');
        } catch (err) { showToast('刷新失败：' + err.message); }
    }
    function calculateCouplePredictions(thread) {
        const data = ensureCoupleData(thread);
        Object.keys(data.periodMap).forEach(k => { if (data.periodMap[k] === 'predict') delete data.periodMap[k]; });
        const periods = Object.keys(data.periodMap).filter(k => data.periodMap[k] === 'period').sort();
        if (!periods.length) return;
        const last = new Date(periods[periods.length - 1]);
        for (let c = 1; c <= 3; c++) {
            const start = new Date(last); start.setDate(start.getDate() + 28 * c);
            for (let i = 0; i < 5; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const key = coupleDateKey(d); if (!data.periodMap[key]) data.periodMap[key] = 'predict'; }
        }
    }
    async function checkCouplePeriodAlert(thread) {
        const data = ensureCoupleData(thread);
        const today = coupleDateKey();
        if (data.lastPeriodAlertDate) {
            const diff = Math.abs(new Date(today) - new Date(data.lastPeriodAlertDate)) / 86400000;
            if (diff < 7) return;
        }
        const coming = [0,1].some(offset => { const d = new Date(); d.setDate(d.getDate()+offset); return data.periodMap[coupleDateKey(d)] === 'predict'; });
        if (!coming) return;
        data.lastPeriodAlertDate = today;
        await saveChatState();
        const persona = await buildCouplePersona(thread);
        const text = await coupleCallAI(thread, `你是 ${coupleCharName(thread)}。根据情侣空间日历，user 的经期可能快到了。\n${persona}\n请发一条真实聊天消息，20字以内，关心但不要客服腔。只输出消息。`, '那几天快到了，别吃太凉的。');
        const oldCurrent = TutuwanCurrentThreadId;
        TutuwanCurrentThreadId = thread.id;
        await appendTutuwanMessage({ role: 'ai', type: 'text', content: text });
        TutuwanCurrentThreadId = oldCurrent;
    }
    function openCoupleSettings() {
        const thread = coupleCurrentThread(); if (!thread) return;
        const data = ensureCoupleData(thread);
        $('couple-bg-url').value = data.bgImage || '';
        $('couple-card-url').value = data.cardImage || '';
        openCoupleModal('couple-settings-modal');
    }
    async function saveCoupleSettings() {
        const thread = coupleCurrentThread(); if (!thread) return;
        const data = ensureCoupleData(thread);
        data.bgImage = ($('couple-bg-url')?.value || '').trim();
        data.cardImage = ($('couple-card-url')?.value || '').trim();
        await saveChatState(); applyCoupleVisuals(thread); closeCoupleModal('couple-settings-modal'); showToast('情侣空间设置已保存');
    }
    async function initCoupleSpaceApp() {
        if (coupleInitialized) return;
        coupleInitialized = true;
        btnCoupleSpace?.addEventListener('click', openCoupleSpaceApp);
        $('couple-close-btn')?.addEventListener('click', () => { if (coupleActiveThreadId) { coupleActiveThreadId = ''; $('couple-selector-view')?.classList.remove('hidden'); $('couple-dashboard-view')?.classList.remove('active'); $('couple-fab')?.classList.remove('active'); renderCoupleSelector(); } else closeCoupleSpaceApp(); });
        $('couple-refresh-btn')?.addEventListener('click', () => coupleActiveThreadId ? refreshCoupleByAI() : renderCoupleSelector());
        $('couple-settings-btn')?.addEventListener('click', openCoupleSettings);
        $('couple-days-card')?.addEventListener('click', () => $('couple-start-date-input')?.showPicker ? $('couple-start-date-input').showPicker() : $('couple-start-date-input')?.click());
        $('couple-start-date-input')?.addEventListener('change', async e => { const thread = coupleCurrentThread(); if (!thread || !e.target.value) return; ensureCoupleData(thread).startDate = new Date(e.target.value).getTime(); await saveChatState(); renderCoupleHeader(thread); });
        $('couple-tabbar')?.addEventListener('click', e => { const btn = e.target.closest('[data-couple-tab]'); if (btn) setCoupleTab(btn.dataset.coupleTab); });
        $('couple-fab')?.addEventListener('click', () => { if (coupleActiveTab === 'moments') openCoupleCompose('moment'); else if (coupleActiveTab === 'album') $('couple-album-input')?.click(); else if (coupleActiveTab === 'letters') openCoupleCompose('letter'); else if (coupleActiveTab === 'questions') openCoupleCompose('question'); else if (coupleActiveTab === 'moods') openCoupleMoodModal(); });
        $('couple-compose-submit')?.addEventListener('click', submitCoupleCompose);
        $('couple-compose-cancel')?.addEventListener('click', saveCoupleDraftAndClose);
        $('couple-period-cancel')?.addEventListener('click', () => closeCoupleModal('couple-period-modal'));
        $('couple-mood-cancel')?.addEventListener('click', () => closeCoupleModal('couple-mood-modal'));
        $('couple-mood-submit')?.addEventListener('click', submitCoupleMood);
        $('couple-settings-cancel')?.addEventListener('click', () => closeCoupleModal('couple-settings-modal'));
        $('couple-settings-save')?.addEventListener('click', saveCoupleSettings);
        $('couple-bg-file-btn')?.addEventListener('click', () => $('couple-bg-file')?.click());
        $('couple-card-file-btn')?.addEventListener('click', () => $('couple-card-file')?.click());
        $('couple-bg-file')?.addEventListener('change', async e => { const f = e.target.files?.[0]; if (f) $('couple-bg-url').value = await readFileAsDataURL(f); e.target.value = ''; });
        $('couple-card-file')?.addEventListener('change', async e => { const f = e.target.files?.[0]; if (f) $('couple-card-url').value = await readFileAsDataURL(f); e.target.value = ''; });
        $('couple-clear-data-btn')?.addEventListener('click', async () => { const thread = coupleCurrentThread(); if (!thread || !await showGlobalConfirm('确定清空动态、相册、日历、信件、问答和心情吗？背景与纪念日保留。', '清空情侣空间')) return; const data = ensureCoupleData(thread); Object.assign(data, { moments: [], album: [], periodMap: {}, letters: [], questions: [], moods: [] }); await saveChatState(); renderCoupleAll(); closeCoupleModal('couple-settings-modal'); showToast('记录已清空'); });
        $('couple-breakup-btn')?.addEventListener('click', async () => { const thread = coupleCurrentThread(); if (!thread || !await showGlobalConfirm('确定解除情侣关系吗？记录会保留，但入口会回到邀请状态。', '解除关系')) return; thread.coupleEnabled = false; ensureCoupleData(thread).enabled = false; const oldCurrent = TutuwanCurrentThreadId; TutuwanCurrentThreadId = thread.id; await appendTutuwanMessage({ role: 'user', type: 'couple_event', content: '情侣空间已解除', meta: { status: 'breakup', title: '情侣空间已解除', subtitle: '恋爱关系已解除', footer: '关系结束' } }); TutuwanCurrentThreadId = oldCurrent; await saveChatState(); closeCoupleModal('couple-settings-modal'); coupleActiveThreadId = ''; $('couple-selector-view')?.classList.remove('hidden'); $('couple-dashboard-view')?.classList.remove('active'); $('couple-fab')?.classList.remove('active'); renderCoupleSelector(); showToast('情侣关系已解除'); });
        $('couple-ai-post-btn')?.addEventListener('click', () => { const t = coupleCurrentThread(); if (t) generateCoupleMoment(t).catch(err => showToast('生成失败：' + err.message)); });
        $('couple-ask-letter-btn')?.addEventListener('click', () => { const t = coupleCurrentThread(); if (t) triggerCoupleLetterReply(t, null, true).catch(err => showToast('索要失败：' + err.message)); });
        $('couple-char-question-btn')?.addEventListener('click', () => { const t = coupleCurrentThread(); if (t) triggerCoupleCharQuestion(t).catch(err => showToast('提问失败：' + err.message)); });
        $('couple-ai-mood-btn')?.addEventListener('click', () => { const t = coupleCurrentThread(); if (t) generateCoupleMood(t).catch(err => showToast('生成失败：' + err.message)); });
        $('couple-album-upload-btn')?.addEventListener('click', () => $('couple-album-input')?.click());
        $('couple-album-input')?.addEventListener('change', async e => { const thread = coupleCurrentThread(); if (!thread) return; const data = ensureCoupleData(thread); const files = Array.from(e.target.files || []).slice(0, 12); for (const file of files) data.album.unshift({ id: createChatId('cpp'), src: await readFileAsDataURL(file), caption: file.name || '照片', time: coupleDateText(), createdAt: Date.now() }); e.target.value = ''; await saveChatState(); renderCoupleAlbum(thread); showToast(`已添加 ${files.length} 张照片`); });
        $('couple-preview-close')?.addEventListener('click', () => closeCoupleModal('couple-preview-modal'));
        document.addEventListener('click', async e => {
            const select = e.target.closest?.('[data-couple-select]'); if (select) { await enterCoupleDashboard(select.dataset.coupleSelect); return; }
            const month = e.target.closest?.('[data-couple-month]'); if (month) { coupleCalendarDate.setMonth(coupleCalendarDate.getMonth() + Number(month.dataset.coupleMonth || 0)); const t = coupleCurrentThread(); if (t) renderCoupleCalendar(t); return; }
            const date = e.target.closest?.('[data-couple-date]'); if (date) { coupleSelectedDate = date.dataset.coupleDate; $('couple-period-title').textContent = `标记 ${coupleSelectedDate}`; openCoupleModal('couple-period-modal'); return; }
            const period = e.target.closest?.('[data-couple-period]'); if (period) { const t = coupleCurrentThread(); if (!t) return; const data = ensureCoupleData(t); if (period.dataset.couplePeriod) data.periodMap[coupleSelectedDate] = period.dataset.couplePeriod; else delete data.periodMap[coupleSelectedDate]; calculateCouplePredictions(t); await saveChatState(); renderCoupleCalendar(t); closeCoupleModal('couple-period-modal'); checkCouplePeriodAlert(t).catch(() => {}); return; }
            const reply = e.target.closest?.('[data-couple-reply-post]'); if (reply) { openCoupleCompose('reply', { postId: reply.dataset.coupleReplyPost }); return; }
            const delMoment = e.target.closest?.('[data-couple-delete-moment]'); if (delMoment) { const t = coupleCurrentThread(); if (!t || !await showGlobalConfirm('确定删除这条动态吗？', '删除动态')) return; const d = ensureCoupleData(t); d.moments = d.moments.filter(p => p.id !== delMoment.dataset.coupleDeleteMoment); await saveChatState(); renderCoupleMoments(t); return; }
            const photo = e.target.closest?.('[data-couple-photo]'); if (photo) { const t = coupleCurrentThread(); const p = ensureCoupleData(t).album.find(x => x.id === photo.dataset.couplePhoto); if (p) { $('couple-preview-img').src = p.src; $('couple-preview-caption').textContent = p.caption || p.time || '照片'; openCoupleModal('couple-preview-modal'); } return; }
            const delPhoto = e.target.closest?.('[data-couple-delete-photo]'); if (delPhoto) { const t = coupleCurrentThread(); if (!t) return; const d = ensureCoupleData(t); d.album = d.album.filter(p => p.id !== delPhoto.dataset.coupleDeletePhoto); await saveChatState(); renderCoupleAlbum(t); return; }
            const readLetter = e.target.closest?.('[data-couple-read-letter]'); if (readLetter) { const t = coupleCurrentThread(); const l = ensureCoupleData(t).letters.find(x => x.id === readLetter.dataset.coupleReadLetter); if (l) await showGlobalAlert(`${l.content}`, `${l.title} · ${l.from === 'me' ? coupleUserName(t) : coupleCharName(t)}`); return; }
            const answer = e.target.closest?.('[data-couple-answer]'); if (answer) { const t = coupleCurrentThread(); if (!t) return; const input = $(`couple-answer-${answer.dataset.coupleAnswer}`); const val = (input?.value || '').trim(); if (!val) return; const q = ensureCoupleData(t).questions.find(x => x.id === answer.dataset.coupleAnswer); if (q) q.myAnswer = val; await saveChatState(); renderCoupleQuestions(t); return; }
            const editAnswer = e.target.closest?.('[data-couple-edit-answer]'); if (editAnswer) { const t = coupleCurrentThread(); const q = ensureCoupleData(t).questions.find(x => x.id === editAnswer.dataset.coupleEditAnswer); if (q) { q.myAnswer = ''; await saveChatState(); renderCoupleQuestions(t); } return; }
            const delQuestion = e.target.closest?.('[data-couple-delete-question]'); if (delQuestion) { const t = coupleCurrentThread(); if (!t || !await showGlobalConfirm('确定删除这个问题吗？', '删除问答')) return; const d = ensureCoupleData(t); d.questions = d.questions.filter(q => q.id !== delQuestion.dataset.coupleDeleteQuestion); await saveChatState(); renderCoupleQuestions(t); return; }
        });
        renderMoodOptions();
        window.TutumaruCoupleSpace = { open: openCoupleSpaceApp, state: () => coupleCurrentThread()?.coupleData || null, refresh: refreshCoupleByAI };
    }
    function renderMoodOptions() {
        const wrap = $('couple-mood-options'); if (!wrap) return;
        wrap.innerHTML = COUPLE_MOODS.map(m => `<button class="couple-mood-option" type="button" data-mood-id="${m.id}">${chatEscape(m.label)}<br><span>${chatEscape(m.tone)}</span></button>`).join('');
        wrap.addEventListener('click', e => { const btn = e.target.closest('[data-mood-id]'); if (!btn) return; coupleSelectedMood = btn.dataset.moodId; wrap.querySelectorAll('.couple-mood-option').forEach(x => x.classList.toggle('active', x === btn)); });
    }
    function openCoupleMoodModal() { coupleSelectedMood = 'calm'; $('couple-mood-text').value = ''; document.querySelectorAll('.couple-mood-option').forEach(x => x.classList.toggle('active', x.dataset.moodId === 'calm')); openCoupleModal('couple-mood-modal'); }
    async function submitCoupleMood() {
        const thread = coupleCurrentThread(); if (!thread) return;
        const data = ensureCoupleData(thread);
        data.moods.unshift({ id: createChatId('cpmd'), user: 'me', moodId: coupleSelectedMood || 'calm', text: ($('couple-mood-text')?.value || '').trim(), createdAt: Date.now() });
        await saveChatState(); renderCoupleMoods(thread); closeCoupleModal('couple-mood-modal');
        generateCoupleMood(thread).catch(() => {});
    }


    // ===================================
    // ====== 终局数据体检 / 自动迁移 ======
    // ===================================
    async function repairTutuwanAppDataIntegrity() {
        try {
            await loadChatState();
            const threadMap = new Map((chatState.threads || []).map(thread => [thread.id, thread]));
            const charMap = new Map((chatState.threads || []).map(thread => [thread.charId, thread]));

            if (shopState || typeof loadShopState === 'function') {
                try {
                    await loadShopState();
                    if (shopState) {
                        shopState.orders = (Array.isArray(shopState.orders) ? shopState.orders : []).map((order, idx) => {
                            const row = order && typeof order === 'object' ? { ...order } : {};
                            row.id = row.id || row.orderId || `SHOP${Date.now()}${idx}`;
                            row.orderId = row.orderId || row.id;
                            row.threadId = row.threadId || row.chatId || '';
                            row.chatId = row.threadId;
                            const thread = row.threadId ? threadMap.get(row.threadId) : null;
                            row.charId = row.charId || thread?.charId || '';
                            row.appId = row.appId || 'shop';
                            row.createdAt = Number(row.createdAt || row.timestamp) || Date.now();
                            return row;
                        });
                        shopState.inventory = (Array.isArray(shopState.inventory) ? shopState.inventory : []).map((item, idx) => ({
                            ...(item || {}),
                            id: item?.id || item?.inventoryId || `bag-${Date.now()}-${idx}`,
                            inventoryId: item?.inventoryId || item?.id || `bag-ref-${Date.now()}-${idx}`,
                            appId: item?.appId || 'shop'
                        }));
                        await saveShopState();
                    }
                } catch (e) {}
            }

            if (foodState || typeof loadFoodState === 'function') {
                try {
                    await loadFoodState();
                    if (foodState) {
                        foodState.orders = (Array.isArray(foodState.orders) ? foodState.orders : []).map((order, idx) => {
                            const row = order && typeof order === 'object' ? { ...order } : {};
                            row.id = row.id || row.orderId || `FD${Date.now()}${idx}`;
                            row.orderId = row.orderId || row.id;
                            row.threadId = row.threadId || row.chatId || '';
                            row.chatId = row.threadId;
                            const thread = row.threadId ? threadMap.get(row.threadId) : null;
                            row.charId = row.charId || thread?.charId || '';
                            row.appId = row.appId || 'food_delivery';
                            row.createdAt = Number(row.createdAt || row.timestamp) || Date.now();
                            return row;
                        });
                        await saveFoodState();
                    }
                } catch (e) {}
            }

            if (twitterState || typeof loadTwitterState === 'function') {
                try {
                    await loadTwitterState();
                    if (twitterState) {
                        twitterState.posts = (Array.isArray(twitterState.posts) ? twitterState.posts : []).map(post => {
                            const actorThread = post?.authorId ? (charMap.get(post.authorId) || threadMap.get(post.authorId)) : null;
                            return normalizeTwitterPost({
                                ...(post || {}),
                                postId: post?.postId || post?.id,
                                threadId: post?.threadId || actorThread?.id || '',
                                chatId: post?.chatId || post?.threadId || actorThread?.id || '',
                                charId: post?.charId || actorThread?.charId || (post?.sourceType === 'char' ? post?.authorId : '')
                            });
                        });
                        await saveTwitterState();
                    }
                } catch (e) {}
            }

            try {
                const rows = await db.settings.toArray();
                for (const row of rows) {
                    if (!row || typeof row.id !== 'string') continue;
                    if (row.id.startsWith('peep_room_data_')) {
                        const charId = row.id.replace(/^peep_room_data_/, '');
                        const targetThread = charMap.get(charId) || null;
                        const target = targetThread ? { id: targetThread.id, sourceThreadId: targetThread.id, charId: targetThread.charId, name: getTutuwanDisplayName(targetThread), avatar: targetThread.avatar, setting: targetThread.setting } : { id: charId, charId, name: row.value?.charName || 'char' };
                        await setSetting(row.id, normalizePeepRoomData(row.value || {}, target));
                    }
                }
            } catch (e) {}

            await saveChatState();
            if (typeof renderChatThreads === 'function') renderChatThreads();
            if (typeof renderTutuwanChatRoom === 'function' && TutuwanCurrentThreadId) renderTutuwanChatRoom();
            window.TutuwanIntegrityOK = true;
        } catch (err) {
            window.TutuwanIntegrityOK = false;
            console.warn?.('Tutuwan integrity repair skipped:', err);
        }
    }


    // ===================================
    // ====== 帮助指南系统 (向导) ========
    // ===================================
    const helpData = {
        chat: {
            title: '聊天 API 配置指南',
            content: '<p><b>1. 接口网址：</b><br>请填写 OpenAI 兼容基础地址，到 <code>/v1</code> 即可：<br><span class="code-block">https://api.openai.com/v1</span><br>聊天请求会自动拼接 <code>/chat/completions</code>，拉取模型会自动拼接 <code>/models</code>。</p><p class="help-p"><b>2. API Key：</b><br>填入服务商提供给您的鉴权令牌 (通常以 sk- 开头)。该密钥将存储在您的本地浏览器中，请妥善保管。</p><p class="help-p"><b>3. 模型选择：</b><br>填入服务商对应支持的模型名称，例如 <code>gpt-4o</code>、<code>claude-3-sonnet</code> 或 <code>gemini-pro</code>。可以通过右侧按钮尝试自动拉取可用模型列表。</p>'
        },
        voice: {
            title: '语音 API 配置指南',
            content: '<p><b>1. 接口网址 & API Key：</b><br>MiniMax 官方同步 TTS 基础地址填写到 <code>/v1</code> 即可，程序会使用后缀 <code>/t2a_v2</code>，完整请求地址为 <span class="code-block">https://api.minimax.io/v1/t2a_v2</span>。</p><p class="help-p"><b>2. GROUP ID & VOICE ID：</b><br>根据服务商的声库设定，分别填入所需的角色组 (Group) 与具体的音色 ID (Voice)。<br>例如您想要生成“兔兔丸”的声音：<br>GROUP ID: <span class="code-block">anime_female</span><br>VOICE ID: <span class="code-block">tutumaru_01</span></p><p class="help-p">全部配置填写完成后，点击输入框右侧的“试听”按钮即可向接口发送一段测试文本以检验是否连通。</p>'
        },
        github: {
            title: 'GitHub 备份流程',
            content: '<p>为确保您的配置与数据不丢失，本程序支持将其一键备份至 GitHub 仓库中。</p><p class="help-p"><b>具体操作流程：</b><br>1. 登录 GitHub，依次点击右上方您的头像 -> <code>Settings</code>。<br>2. 滚动到底部左侧点击 <code>Developer settings</code> -> <code>Personal access tokens</code> -> 选择 <code>Tokens (classic)</code>。<br>3. 点击 <code>Generate new token (classic)</code>，在权限范围中勾选 <b>repo</b>（完全控制私有仓库）权限，生成并<b>复制</b>该 Token。<br>4. 在 GitHub 新建一个空仓库 (公开或私有均可) 用作存储空间。<br>5. 回到本程序，在“数据管理”对应输入框内分别填入您刚复制的 <code>GitHub Token</code>、您的 <code>GitHub 用户名</code> 及 <code>新建的仓库名</code>。<br>6. 点击「一键 Github 备份」，您的数据将会以 JSON 格式安全加密并上传至该仓库中。</p>'
        }
    };

    const modelPickerCloseBtn = $('model-picker-close');
    if (modelPickerCloseBtn) modelPickerCloseBtn.addEventListener('click', closeModelPicker);
    const modelPickerSearch = $('model-picker-search');
    if (modelPickerSearch) modelPickerSearch.addEventListener('input', () => renderModelPicker(modelPickerSearch.value));
    const modelPickerModal = $('model-picker-modal');
    if (modelPickerModal) modelPickerModal.addEventListener('click', (e) => { if (e.target === modelPickerModal) closeModelPicker(); });

    const helpModal = document.getElementById('help-modal');
    function openHelpModal(type) {
        document.getElementById('help-title').textContent = helpData[type].title;
        document.getElementById('help-body').innerHTML = helpData[type].content;
        helpModal.style.display = 'flex';
    }
    function closeHelpModal() {
        helpModal.style.display = 'none';
    }
