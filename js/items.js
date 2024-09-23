import { askAi } from './askAi.js';
import { ItemManager } from './itemsDB.js';


// const manager = new ItemManager();

window.onload = function () {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const itemType = window.itemType;

    // 如果接收到了外部参数，解析并使用外部参数
    if (itemType) {
        window.itemType = itemType;
    } else {
        // 如果没有接收到外部参数，使用默认初始化数据
        window.itemType = 'Ai解經';
    }
    const input = document.querySelector('.form-control');
    const addButton = document.querySelector('.btn-primary');

    // 为按钮添加点击事件处理程序
    addButton.addEventListener('click', function (event) {
        event.preventDefault(); // 防止表单提交，保持页面不刷新
        newItem(input.value.trim(), itemType); // 调用 newItem 函数
        input.value = ''; // 清空输入框
    });
    // displayTitle(window.itemType);
    displayItems(window.itemType);
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const activeTab = event.target.getAttribute('href'); // 获取当前激活标签的 href
            console.log(`当前选中标签: ${activeTab}`); // 这里可以执行你预留的功能

            switch (activeTab) {
                case '#aiExp':
                    window.itemType = 'Ai解經';
                    displayItems(window.itemType);
                    console.log(`切换到 ${window.itemType} 的逻辑執行`);
                    break;
                case '#lecture':
                    window.itemType = '講章';
                    displayItems(window.itemType);
                    console.log(`切换到 ${window.itemType} 的逻辑執行`);
                    break;
                case '#encuragement':
                    window.itemType = '勉勵';
                    displayItems(window.itemType);
                    console.log(`切换到 ${window.itemType} 的逻辑執行`);
                    break;
                default:
                    break;
            }
        });
    });

    // 获取设置图标元素
    const bibleIcon = document.getElementById('bibleIcon');

    // 添加点击事件监听器
    bibleIcon.addEventListener('click', function (event) {
        event.preventDefault(); // 防止链接的默认行为（例如跳转）
        window.location.replace('index.html');
    });

    // 获取设置图标元素
    const settingsIcon = document.getElementById('refreshIcon');

    // 添加点击事件监听器
    settingsIcon.addEventListener('click', function (event) {
        event.preventDefault(); // 防止链接的默认行为（例如跳转）

        displayItems(window.itemType);
    });


}

async function displayItems(title) { // 显示列表
    const itemManager = new ItemManager(); // 实例化 ItemManager
    await itemManager.loadItems(); // 等待数据加载完成

    const type = title; // 替换为您需要的类型
    const itemsList = itemManager.getItemsByTypeSorted(type);
    window._itemslist = itemsList; // 存储到全局变量中
    changeTitle(title);
    console.log('itemsList:', itemsList);

    const listGroup = document.querySelector('.list-group');
    listGroup.innerHTML = ''; // 清空现有的列表

    itemsList.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div class="list-item-content">
                <span>${item.no}.${item.item_desc}</span>
            </div>
            <div class="list-item-action">删除</div>
        `;

        const listItemContent = listItem.querySelector('.list-item-content');
        const listItemAction = listItem.querySelector('.list-item-action');

        // 设置背景颜色和点击事件
        if (item.status === '0') {
            listItem.style.backgroundColor = 'lightyellow';
            listItem.setAttribute('data-status-text', '詢問Ai');

            listItem.addEventListener('click', () => {
                const userConfirmed = window.confirm("已将您的题目转交Ai，请耐心等待！");
                if (userConfirmed) {
                    askAi(item.id, window.itemType, item.item_desc);
                    console.log('Finished Ask Ai!');
                }
            });

        } else if (item.status === '1') {
            listItem.style.backgroundColor = 'lightblue';
            listItem.setAttribute('data-status-text', '詢問中');

            listItem.addEventListener('click', () => {
                const queryingModal = document.getElementById('queryingModal');
                queryingModal.style.display = 'block';

                document.getElementById('confirmBtnQuery').onclick = function () {
                    queryingModal.style.display = 'none';
                };

                document.getElementById('reAskBtn').onclick = function () {
                    askAi(item.id, window.itemType, item.item_desc);
                    console.log('用户选择了重问功能');
                    queryingModal.style.display = 'none';
                };
            });
        } else if (item.status === '2') {
            listItem.style.backgroundColor = 'white';
            listItem.setAttribute('data-status-text', '已回復');

            listItem.addEventListener('click', () => {
                const itemEncoded = encodeURIComponent(JSON.stringify(item));
                console.log('itemEncoded:', itemEncoded);
                window.location.href = `itemContent.html?item=${itemEncoded}`;
            });
        }

        // 添加滑动效果
        let startX = 0, currentItem;
        
        listItem.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
            currentItem = listItem;
        });

        listItem.addEventListener('touchmove', (event) => {
            if (!currentItem) return;

            const currentX = event.touches[0].clientX;
            const diff = startX - currentX;
            if (diff >= 0 && diff <= 100) {
                listItemContent.style.transform = `translateX(-${diff}px)`;
                listItemAction.style.transform = `translateX(-${diff}px)`;
            }
        });

        listItem.addEventListener('touchend', (event) => {
            if (!currentItem) return;
            const endX = event.changedTouches[0].clientX;
            const diff = startX - endX;
            if (diff > 50) {
                listItemContent.style.transform = 'translateX(-100px)';
                listItemAction.style.transform = 'translateX(-100px)';
            } else {
                listItemContent.style.transform = 'translateX(0)';
                listItemAction.style.transform = 'translateX(0)';
            }
            currentItem = null;
        });

        listItemAction.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡
            deleteItem(item.id, listItem);
        });

        listGroup.appendChild(listItem); // 添加到列表中
    });
}

function deleteItem(id, listItem) {
    const itemManager = new ItemManager();
    itemManager.deleteItem(id);
    listItem.remove(); // 从列表中移除该项
}

function newItem(itemDesc) {  // 添加新项目
    console.log('newItem:', itemDesc)
    const itemManager = new ItemManager()
    if (itemDesc) {
        // 调用 ItemManager 的 addItem 方法
        itemManager.addItem(window.itemType, itemDesc);

        // 可选择更新列表，以显示新添加的项
        displayItems(itemType);
    } else {
        alert('请输入有效的项目描述！');
    }
    displayItems(window.itemType);
}

function changeTitle(title) {
    const titleMeta = document.querySelector('meta[name="title"]');
    titleMeta.setAttribute('content', title); // 更新内容
    document.title = titleMeta.content; // 同步更改 document.title
}

