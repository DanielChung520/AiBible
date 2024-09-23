import { askAi } from './askAi.js';
import { ItemManager } from './itemsDB.js';
import { BibleLoader } from './loadContent.js';
window.onload = function () {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const paramsBook = urlParams.get('book');
    const paramsChapter = urlParams.get('chapter');
    const paramsVerse = urlParams.get('verse');

    let book = paramsBook;
    let verse = paramsVerse;
    let currentChapter = paramsChapter

    // 如果接收到了外部参数，解析并使用外部参数
    if (paramsBook && paramsChapter && paramsVerse) {
        book = JSON.parse(decodeURIComponent(paramsBook));
        window.gbook = book;
        currentChapter = currentChapter;
        verse = paramsVerse;
    } else {
        // 如果没有接收到外部参数，使用默认初始化数据
        book = {
            book_cn: "創世記",
            abb_cn: "創",
            abb: "Gen",
            chapter: "1",
        };
        verse = "4";
    }
    // alert("hello")
    // 获取书籍数据并显示
    fetchBookDataAndDisplay(book, currentChapter, verse);

    displayChapter(currentChapter)
    window.currentChapter = currentChapter; // 保存当前章节数到全局变量
    window._book = book; // 保存当前书籍数据到全局变量

    
    // document.addEventListener("DOMContentLoaded", function () {
    //     document.getElementById('pre-page').addEventListener('click', function () { decreaseChapter});
    //     console.log("onload:", book)
    //     document.getElementById('next-page').addEventListener('click', increaseChapter);

    // });

    const preButton = document.getElementById('pre-chapter');
    preButton.addEventListener('click', function() { decreaseChapter(); // 返回到前一页
    });

    const nextButton = document.getElementById('next-chapter');
    nextButton.addEventListener('click', function() { increaseChapter(); // 返回到前一页
    });
}

function fetchBookDataAndDisplay(book, currentChapter, verse) {
    const bibleLoader = new BibleLoader();
    // 从本地数据中获取书籍数据
    bibleLoader.loadBookData(book).then(data => {
        window.bookData = data; // 这里的 data 是加载完成后的数据
        displayData(bookData, currentChapter, verse);
        // 在这里进行后续的操作
    }).catch(error => {
        console.error("加载书籍数据时出错:", error);
    });
}

// 当章节数增加时调用的函数
function increaseChapter() {
    var _chapter = Number(currentChapter);
    if (_chapter < Number(gbook.chapter)) {
        _chapter++;
        // 更新 book 的章节数
        window.currentChapter = String(_chapter);
        displayChapter(window.currentChapter);
        displayData(bookData, currentChapter); // 显示更新后的书籍数据
    }
}

// 当章节数减小时调用的函数
function decreaseChapter() {
    var _chapter = Number(currentChapter);
    if (_chapter > 1) {
        _chapter--;
        // book.chapter = currentChapter; // 更新 book 的章节数
        window.currentChapter = String(_chapter);
        displayChapter(window.currentChapter);
        displayData(bookData, currentChapter); // 显示更新后的书籍数据
    }
}

const translatSewitch = document.getElementById('translatSewitch');
translatSewitch.addEventListener('change', function () {
    if (this.checked) {
        translatSewitch.value = "all";
        displayData(bookData, currentChapter);
    } else {
        translatSewitch.value = "no";
        displayData(bookData, currentChapter);
    }
});


function displayChapter(currentChapter) {
    document.getElementById('bookTaitle').innerHTML = gbook.book_cn
    document.getElementById('chapterDisplay').innerText = '第' + currentChapter + '章';
    // fetchBookDataAndDisplay(bookData,currentChapter) ;
}

const mainElement = document.getElementById('main');


// 显示数据
function displayData(bookData, currentChapter) {

    mainElement.innerHTML = '';  // 清空 main 元素的內容
    mainElement.className = 'top_div';

    const topDiv = document.createElement('div')
    topDiv.className = 'top_div'
    mainElement.appendChild(topDiv)



    // 先過濾出當前章節的數據
    const currentChapterData = bookData.filter(row =>
        (row.chapter === currentChapter.toString()) &&
        (translatSewitch.value === 'all' ? (row.lang === 'zh' || row.lang === 'en') : row.lang === 'zh')
    );

    var list = []; // 创建一个空数组来追踪被选中的章节
    currentChapterData.forEach(row => {
        // 创建一个新的 div 元素
        const contentDiv = document.createElement('div');
        const firstCharacter = row.no + '.';
        const remainingContent = row.content;

        // 使用 <span> 包装首个字符
        contentDiv.innerHTML = `<span class="first-letter">${firstCharacter}</span>${remainingContent}`;
        contentDiv.className = row.lang === 'zh' ? 'contentZh' : 'contentEn';


        // 创建一个新的小方块元素
        const marker = document.createElement('div');
        marker.className = 'marker';

        // 为 div 元素添加点击事件处理器
        let isMarked = false; // 用于跟踪 contentDiv 的状态
        if (row.lang == 'zh') {
            contentDiv.addEventListener('click', function () {
                if (isMarked) {
                    // 如果已经标记，则从数组中移除
                    const index = list.indexOf(row.no);
                    if (index > -1) {
                        list.splice(index, 1);

                    }
                    marker.classList.remove('marked');
                    isMarked = false;
                } else {
                    // 如果未标记，则添加到数组中
                    list.push(row.no);
                    marker.classList.add('marked');
                    isMarked = true;

                }

            });

            // 将 marker 元素和 div 元素添加到 topDiv 元素中

        }
        contentDiv.insertBefore(marker, contentDiv.firstChild);
        // 将 contentDiv 元素添加到 topDiv 元素中
        topDiv.appendChild(contentDiv);
    });


    const bibleBooks = document.getElementById('bibleBooks');
    // const readingPlan = document.getElementById('readingPlan');
    // const wordSerach = document.getElementById('searchVerse');
    // const translation = document.getElementById('translation');
    // const myLecture = document.getElementById('myLecture');
    // const myLife = document.getElementById('myLife');
    const aiExplaining = document.getElementById('aiExplaining');
    const myCollection = document.getElementById('myCollection');
    // const sysConfig = document.getElementById('sysConfig');

    bibleBooks.addEventListener('click', function () {
        console.log('click bibleBooks')
        window.location.replace('index.html');

    });
    // readingPlan.addEventListener('click', function () {
    //     console.log('click readingPlan')
    //     window.location.replace('items.html');

    // });
    // wordSerach.addEventListener('click', function () {
    //     console.log('click wordSerach')
    // });

    // wordSerach.addEventListener('click', function () {
    //     console.log('click wordSerach')
    // });

    // myLecture.addEventListener('click', function () {
    //     console.log('click myLecture')
    // });

    // myLife.addEventListener('click', function () {
    //     console.log('click myLife')
    // });
    aiExplaining.addEventListener('click', function () {
        console.log('click aiExplaining')
        const itemManager = new ItemManager();
        const item = itemManager.items
        // 修复条件判断，使用双等号或全等号进行相等判断

        let verseString = _book.book_cn + " 第" + currentChapter + "章，第" + combineRange(list) + "節";

        if (list.length === 0) {

            try {
                showRemind(undefined, "您尚未點選任何經節！");
            } catch (error) {
                console.error('An error occurred:', error);
                // 處理錯誤
            }
        }
        else {
            try {

                showRemind('已為您提交解經', '您本次提交的解經內容：<br><h5>' +
                    verseString + '</h5><br> 由於Ai查詢需要一些時間，請耐心等待。你可以先離開畫面後，到「Ai解經」列表清單查看', 10000);
                const itemId = itemManager.addItemAndReturnId('Ai解經', verseString);

                askAi(itemId, 'Ai解經', verseString); // 执行 AI 功能
                console.log('Finished Ask Ai!');

            } catch (error) {
                console.error('An error occurred:', error);
                // 发生异常时关闭模态框
                const modal = new bootstrap.Modal(document.getElementById('myModal'));
                modal.hide();
                // 其他错误处理操作
            }

        }
        // 在if语句外部定义combineRange函数
        function combineRange(arr) {
            arr.sort((a, b) => a - b); // 对数组进行排序
            let ranges = [], rstart, rend;
            for (let i = 0; i < arr.length; i++) {
                rstart = arr[i];
                rend = rstart;
                while (arr[i + 1] - arr[i] === 1) {
                    rend = arr[i + 1]; // 判断连续的数
                    i++;
                }
                ranges.push(rend !== rstart ? rstart + '-' + rend : rstart);
            }
            return ranges.join(',');
        };

    });
    myCollection.addEventListener('click', function () {
        window.location.replace('items.html');
        console.log('click myCollection')
    });
    // sysConfig.addEventListener('click', function () {
    //     console.log('click sysConfig')
    // });
}

function bibleCatalogue() {
    return fetch('/src/assets/book_catalogue.csv')
        .then(response => response.text())
        .then(data => {
            // 解析 CSV 數據
            const rows = data.split('\n');
            let books = rows.slice(1).map(row => {
                const cells = row.split(',');
                return {
                    idx: parseInt(cells[0]),
                    abb_cn: cells[1],
                    book: cells[2],
                    book_cn: cells[3],
                    abb: cells[4],
                    atype: cells[5],
                    chapter: parseInt(cells[6]),
                    va: cells[7],
                    b: cells[8],
                };
            });
        })
        .catch(error => {
            // 处理异常
            console.error('发生错误：', error);
        });
}



function showRemind(title = '提醒您！', message = '请填写内容!') {
    const modal = new bootstrap.Modal(document.getElementById('myModal'));
    const reminderContent = document.querySelector('.modal-title');  // 获取模态框标题元素
    const rmButton = document.getElementById('bmButton');

    // 设置模态框中的提醒信息---
    reminderContent.innerText = title;  // 修改模态框标题
    document.querySelector('.modal-body').innerHTML = message;  // 使用innerHTML设置模态框内容

    modal.show()

    rmButton.addEventListener('click', function () {
        // 在按钮被点击后执行的操作
        modal.hide();
        // 进行其他操作...
    });
}

