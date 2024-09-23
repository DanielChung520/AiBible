import { BibleLoader } from './loadContent.js';
window.onload = function () {
    const loader = new BibleLoader();

    loader.bibleCatalogue()
        .then(books => {
            // 现在 books 包含了你的书籍数据
            console.log(books);
            // 调用展示书籍的函数
            displayBooks(books);

            // 可选择加载某本书的数据
            const bookToLoad = books[0];  // 假设选择第一本书
            return loader.loadBookData(bookToLoad);
        })
        .then(bookData => {
            // 现在 bookData 包含了所选书籍的数据
            console.log(bookData);
            // 进行进一步处理或展示书籍数据
        })
        .catch(error => {
            // 处理获取数据失败的情况
            console.error('Error fetching data:', error);
        });
        

        const buttomButton = document.querySelector('.fixed-button');

        // 为按钮添加点击事件处理程序
        buttomButton.addEventListener('click', function (event) {
            event.preventDefault(); // 防止表单提交，保持页面不刷新
            window.location.href = "items.html";
            console.log('click navigateButton')
        });

};
;

// 按照 idx 欄位排序書卷


// 顯示書卷
// const container = document.getElementById('books');
function displayBooks(books) {
   
    const container = document.getElementById('main1');
    // container.className = 'books'
    const bookCover = document.createElement('div');
    bookCover.className = 'book_cover';
    container.appendChild(bookCover);

    books.forEach(book => {
        if (book.idx == '39.1') {
            const div = document.createElement('div');
            bookCover.appendChild(div);
        }
        else {
            const div = document.createElement('div');
            div.className = 'book ' + book.va;  // 使用 b 欄位的值作為類別名稱
            bookCover.appendChild(div);
            // 創建一個 span 元素來顯示中文簡稱
            const span_cn = document.createElement('span');
            span_cn.textContent = book.abb_cn;
            div.appendChild(span_cn);

            // 創建一個 span 元素來顯示英文簡稱
            const span_en = document.createElement('span');
            span_en.textContent = book.abb;
            div.appendChild(span_en);

            // ========為每個書卷添加點擊事件=======
            div.addEventListener('click', () => {
                event.stopPropagation();  // 阻止事件冒泡

                // 檢查是否已經存在一個彈出視窗，如果存在，那麼就先移除它
                const existingPopup = document.querySelector('.popup');
                if (existingPopup) {
                    document.body.removeChild(existingPopup);
                }

                // 創建一個半透明的遮罩層
                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                document.body.appendChild(overlay);


                // 創建一個彈出視窗
                const popup = document.createElement('div');
                popup.className = 'popup';

                popup.style.zIndex = 10000;  // 將彈出視窗的 z-index 設置為一個很大的值，使其顯示在其他元素之上

                // 在彈出視窗的最上方添加一個元素來顯示 book.book_cb
                const bookTitle = document.createElement('div');
                bookTitle.textContent = book.book_cn;
                bookTitle.style.display = 'block';  // 使標題佔用整個行
                popup.appendChild(bookTitle);

                // add Chapter grid container 
                const ChapterCantainer = document.createElement('div')
                ChapterCantainer.className = "pop-grid"
                popup.appendChild(ChapterCantainer)
                // 為每個章節創建一個 grid 項目
                for (let i = 1; i <= book.chapter; i++) {
                    const chapterDiv = document.createElement('div');
                    chapterDiv.textContent = i;

                    chapterDiv.addEventListener('click', (event) => {
                        event.stopPropagation();  // 阻止事件冒泡
                        console.log('Chapter clicked:', i);

                        // 載入並處理書卷數據
                        const bibleLoader = new BibleLoader();
                        bibleLoader.loadBookData(book).then(bookData => {
                            // 計算點選的章共有多少節
                            const verses = bookData.filter(row => Number(row.chapter) === i);

                            const verseCount = verses.length;


                            // 關閉前一個彈出視窗
                            overlay.removeChild(popup);

                            // 創建一個新的彈出視窗來顯示節數的 grid
                            const versePopup = document.createElement('div');
                            versePopup.className = 'popup';

                            // Create Verse Popup Taitle
                            const verseTaitle = document.createElement('div');
                            verseTaitle.textContent = `${book.book_cn} 第${book.chapter}章`;
                            verseTaitle.className = 'title2';
                            versePopup.appendChild(verseTaitle);

                            const verseGrid = document.createElement('div');
                            verseGrid.className = 'pop-grid';
                            versePopup.appendChild(verseGrid);

                            // 為每個節創建一個 grid 項目
                            for (let j = 1; j <= verseCount; j++) {
                                const verseDiv = document.createElement('div');
                                verseDiv.textContent = j;
                                verseDiv.addEventListener('click', () => {
                                    // 点击事件处理逻辑
                                    openContentPage(book, i,j);
                                });
                                verseGrid.appendChild(verseDiv);
                            }

                            // 將新的彈出視窗添加到頁面上

                            overlay.appendChild(versePopup);
                            // 為 versePopup 添加點擊事件監聽器，點擊時移除 versePopup
                            // 調用 makeDraggable 函數，使 popup 可拖動
                            makeDraggable(versePopup);

                        });

                    });

                    ChapterCantainer.appendChild(chapterDiv);
                }

                // 將彈出視窗添加到頁面上
                overlay.appendChild(popup);

                // 調用 makeDraggable 函數，使 popup 可拖動
                makeDraggable(popup);
                document.body.appendChild(overlay);

                // 為 window 添加點擊事件監聽器，點擊時移除彈出視窗
                overlay.addEventListener('click', function handler(e) {
                    if (popup && overlay.contains(popup)) {
                        overlay.removeChild(popup);
                    }

                    // overlay.removeChild(versePopup)
                    document.body.removeChild(overlay);
                    e.stopPropagation();  // 阻止事件冒泡
                });
            });

            bookCover.appendChild(div);
        }
    });
    // });

}


function makeDraggable(element) {
    let drag = false;
    let offsetX, offsetY;

    // 當觸摸開始時，開始拖動
    element.addEventListener('touchstart', (event) => {
        drag = true;
        offsetX = event.touches[0].clientX - element.offsetLeft;
        offsetY = event.touches[0].clientY - element.offsetTop;
        event.stopPropagation();
    });

    // 當觸摸移動時，如果正在拖動，則更新元素的位置
    document.addEventListener('touchmove', (event) => {
        if (drag) {
            element.style.left = `${event.touches[0].clientX - offsetX}px`;
            element.style.top = `${event.touches[0].clientY - offsetY}px`;
            event.preventDefault();  // 阻止預設行為
        }
    });

    // 當觸摸結束時，停止拖動
    document.addEventListener('touchend', () => {
        drag = false;
    });
}


// function openContentPage(book, chapter,verse, showPopup) {
//     const url = `content.html?book=${JSON.stringify(book)}&chapter=${chapter}&verse=${verse}`;
//     console.log('Opening content page:', url);
//     const contentWindow = window.open(url, '_blank');

//     // 在内容加载完成后显示弹出窗口
//     contentWindow.addEventListener('load', function () {
//         if (showPopup) {
//             // 将原先的弹出窗口逻辑放在 content.html 页面的加载完成后执行
//             contentWindow.showVersePopup();
//         }
//     });
// }
function openContentPage(book, chapter, verse, showPopup) {
    const url = `content.html?book=${JSON.stringify(book)}&chapter=${chapter}&verse=${verse}`;
    console.log('Opening content page:', url);
    window.location.href = url; // 使用当前标签页加载新页面

    // 如果需要在页面加载后执行某些逻辑，可以通过在 content.html 中处理
}