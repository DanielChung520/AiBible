import { askAi } from './askAi.js';
window.onload = function () {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const itemEncoded = urlParams.get('item'); // 获取编码后的 item
    

    // 解码 item 并转换为对象
    let item = null;
    if (itemEncoded) {
        const decodedItem = decodeURIComponent(itemEncoded); // 解码

        item = JSON.parse(decodedItem); // 解析为对象
    }
    var title = item ? item.type : null;
    const type = item ? item.type : null; // 从 item 对象中获取描述
    const desc = item ? item.item_desc : null; // 从 item 对象中获取描述
    const content = item ? item.content : null; // 从 item 对象中获取内容
    window.itemType = type
    
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', function() {
        window.history.back(); // 返回到前一页
    });
    
    const reAskButton = document.getElementById('reask-button');
    reAskButton.addEventListener('click', function() {
        listItem.addEventListener('click', () => {
            const userConfirmed = window.confirm("已将您的题目转交Ai，请耐心等待！"); // 弹出确认框
            if (userConfirmed) {
                
                askAi(item.id, item.type, item.item_desc); // 执行 AI 功能
                console.log('Finished Ask Ai!');
            }
        });
        window.history.back(); // 返回到前一页
        
    });
    

    // 如果接收到了外部参数，解析并使用外部参数
    if (type) {
       title = type+'：'+desc;
    } else {
        // 如果没有接收到外部参数，使用默认初始化数据
        title = 'Ai解經';
    }
    displayTitle(title)

    displayContent(content);
};


// displayContent(content);  // 调用显示内容函数

function displayTitle(title) {  // 显示标题栏
    // 获取 title-bar 元素
    const titleElement = document.querySelector('.content-bar');
    titleElement.innerText = title;
}

function displayContent(content) {  // 显示内容

    const htmlContent = marked.parse(content); // 例如，如果使用marked.js来解析Markdown
    // outputElement.innerHTML = htmlContent; 
    document.getElementById('markdown-output').innerHTML = htmlContent;
}


function changeTitle() {
    const title = document.getElementById('title-input').value;
    displayTitle(title);
}