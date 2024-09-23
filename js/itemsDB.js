// itemCsv.js
export class Item {
    constructor(type, id, no, item_desc, content, status) {
        this.type = type;
        this.id = id;
        this.no = no;
        this.item_desc = item_desc;
        this.content = content;
        this.status = status;
    }

    toCSV() {
        return `${this.type},${this.id},${this.no},${this.item_desc},${this.content},${this.status}`;
    }
}

export class ItemManager {
    constructor() {
        this.items = this.loadItems(); // 启动时加载项目
    }

    loadItems() {
        // 从 localStorage 加载项目
        const data = localStorage.getItem('items');
        if (data) {
            const allItems = JSON.parse(data);
            return allItems.map(item => new Item(item.type, item.id, item.no, item.item_desc, item.content, item.status));
        }
        return [];
    }

    saveItems() {
        // 保存项目到 localStorage
        localStorage.setItem('items', JSON.stringify(this.items));
        console.log('Items 已成功存储到 localStorage');
    }

    getItemsByTypeSorted(type) {
        return this.items
            .filter(item => item.type === type)
            .map(item => ({ type: item.type, id: item.id, no: item.no, item_desc: item.item_desc, content: item.content, status: item.status }))
            .sort((a, b) => a.no - b.no);
    }

    addItem(type, item_desc) {
        const id = Date.now().toString(36);
        const maxNo = this.items
            .filter(item => item.type === type)
            .reduce((max, item) => item.no > max ? item.no : max, 0);
        const no = maxNo + 1;
        const newItem = new Item(type, id, no, item_desc, '', '0');

        this.items.push(newItem);
        this.saveItems(); // 保存到 localStorage
        console.log(`新增项: ${JSON.stringify(newItem)}`);
    }

    addItemAndReturnId(type, item_desc) {
        const id = Date.now().toString(36);
        const maxNo = this.items
            .filter(item => item.type === type)
            .reduce((max, item) => item.no > max ? item.no : max, 0);
        const no = maxNo + 1;
        const newItem = new Item(type, id, no, item_desc, '', '0');

        this.items.push(newItem);
        this.saveItems(); // 保存到 localStorage
        console.log(`新增项: ${JSON.stringify(newItem)}`);

        return id; // 返回新项的 id
    }


    updateItem(id, content) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.content = content;
            item.status = '2';
            this.saveItems(); // 保存到 localStorage
            console.log(`更新项: ${JSON.stringify(item)}`);
        } else {
            console.log(`未找到匹配的项`);
        }
    }

    updateStatus(id, status) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.status = status;
            this.saveItems(); // 保存到 localStorage
            console.log(`更新项: ${JSON.stringify(item)} 的狀態為 ${status}`);
        } else {
            console.log(`未找到匹配的项`);
        }
    }

    deleteItem(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const deletedItem = this.items.splice(index, 1)[0];
            this.saveItems(); // 保存到 localStorage
            console.log(`删除项: ${JSON.stringify(deletedItem)}`);
        } else {
            console.log(`未找到匹配的项`);
        }
    }
}

// 测试功能
