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
    // await askAi(); // 调用 AI 功能

    // 调用方法并将结果存储在全局变量中
    const type = title; // 替换为您需要的类型
    const itemsList = itemManager.getItemsByTypeSorted(type);
    window._itemslist = itemsList; // 存储到全局变量中
    changeTitle(title);
    console.log('itemsList:', itemsList);

    // 获取 HTML 列表元素
    const listGroup = document.querySelector('.list-group');

    // 清空现有的列表
    listGroup.innerHTML = '';

    // 遍历 itemsList 并添加到 HTML 列表中
    itemsList.forEach(item => {
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'list-group-item list-group-item-action';

        // 检查 item_desc 和 content 的值
        if (item.status === '0') {
            // 狀態為新增，设置背景颜色为淡黄色
            listItem.style.backgroundColor = 'lightyellow';

            listItem.textContent = `${item.no}.${item.item_desc}`; // 格式化文本

            // 添加点击事件，执行 ackAi 函数
            listItem.addEventListener('click', () => {
                const userConfirmed = window.confirm("已将您的题目转交Ai，请耐心等待！"); // 弹出确认框
                if (userConfirmed) {
                    askAi(item.id, window.itemType, item.item_desc); // 执行 AI 功能
                    console.log('Finished Ask Ai!');
                }
            });

        } else if (item.status === '1') {
            // 如果 item_desc 和 content 都不为空，设置背景颜色为白色
            listItem.style.backgroundColor = 'lightblue';
            listItem.textContent = `${item.no}.${item.item_desc}`; // 格式化文本

            // 添加点击事件，显示提示窗
            listItem.addEventListener('click', () => {
                const queryingModal = document.getElementById('queryingModal');
                queryingModal.style.display = 'block'; // 显示模态框

                // 确定按钮事件：关闭提示窗
                document.getElementById('confirmBtnQuery').onclick = function () {
                    queryingModal.style.display = 'none'; // 关闭模态框
                };

                // 重问按钮事件，可根据需要执行相应的操作
                document.getElementById('reAskBtn').onclick = function () {
                    askAi(item.id, window.itemType, item.item_desc); // 执行 AI 功能
                    console.log('用户选择了重问功能'); // 或者执行具体的逻辑
                    queryingModal.style.display = 'none'; // 关闭模态框
                };
            });
        }
        else if (item.status === '2') {
            // 如果 item_desc 和 content 都不为空，设置背景颜色为白色
            listItem.style.backgroundColor = 'white';
            listItem.textContent = `${item.no}.${item.item_desc}`; // 格式化文本

            // 添加点击事件，跳转到 itemContent.html，并传递 item 数据
            listItem.addEventListener('click', () => {
                const itemEncoded = encodeURIComponent(JSON.stringify(item)); // 将 item 转换为字符串并编码
                console.log('itemEncoded:', itemEncoded);
                window.location.href = `itemContent.html?item=${itemEncoded}`; // 跳转并传递 item 参数
            });
        }

        listGroup.appendChild(listItem); // 添加到列表中
    });


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

function deleteItem(id) {
}