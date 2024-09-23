// import { marked } from 'marked';
document.getElementById('render-button').addEventListener('click', function() {
    // 获取 textarea 的内容
    const markdownContent = document.getElementById('markdown-input').value;

    // 使用 marked.js 解析 Markdown
    const htmlContent = marked.parse(markdownContent);

    // 将解析后的 HTML 插入输出区域
    document.getElementById('markdown-output').innerHTML = htmlContent;
});