import { ItemManager } from './itemsDB.js';
export function askAi(session_id, type, question) {
    const itemManager = new ItemManager();
    const url = 'http://127.0.0.1:5501/get_answer'; // Flask 服务地址
    const data = {
        session_id: session_id,
        user_input: question,
        preface: type,
        ai_model: "gpt-3.5-turbo" // 替换为适用的模型名称
    };
    itemManager.updateStatus(session_id, '1')
    try {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'xxx-xxx'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    itemManager.updateStatus(session_id, '1')
                    throw new Error(`网络响应错误：${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const answer = data.answer;
                const sessionId = data.session_id;

                // 调用 ItemManager.updateItem 方法来更新内容

                itemManager.updateItem(sessionId, answer);
            })
            .catch(error => {
                itemManager.updateStatus(session_id, '1')
                console.error('请求失败:', error);
            });
    }
    catch (error) {
        itemManager.updateStatus(session_id, '1');
        console.error('發生不明原因，请求失败:', error);
        // 在发生错误时更新状态
    }
}
