import express from 'express';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

const app = express();
const port = 3300;

app.use(express.json()); // 解析 JSON 请求体

export class Item {
    constructor(type, id, no, item_desc, content) {
        this.type = type;          
        this.id = id;              
        this.no = no;              
        this.item_desc = item_desc; 
        this.content = content;    
    }

    toCSV() {
        return `${this.type},${this.id},${this.no},${this.item_desc},${this.content}`;
    }
}

export class ItemManager {
    constructor() {
        this.items = []; 
        this.loadItems(); 
    }

    getItemsByTypeSorted(type) {
        return this.items
            .filter(item => item.type === type) 
            .map(item => ({ no: item.no, item_desc: item.item_desc, content: item.content })) 
            .sort((a, b) => a.no - b.no); 
    }
    
    ddItem(type, itaem_desc) {
        const id = uuidv4();
        const maxNo = this.items
            .filter(item => item.type === type)
            .reduce((max, item) => item.no > max ? item.no : max, 0);
        const no = maxNo + 1; 
        const newItem = new Item(type, id, no, item_desc, '');
        this.items.push(newItem);
        this.saveItems(); 
        console.log(`新增项: ${JSON.stringify(newItem)}`);
    }

    updateItem(type, item_desc, content) {
        const item = this.items.find(item => item.type === type && item.item_desc === item_desc);
        if (item) {
            item.content = content;
            this.saveItems(); 
            console.log(`更新项: ${JSON.stringify(item)}`);
        } else {
            console.log(`未找到匹配的项`);
        }
    }

    deleteItem(type, item_desc) {
        const index = this.items.findIndex(item => item.type === type && item.item_desc === item_desc);
        if (index !== -1) {
            const deletedItem = this.items.splice(index, 1);
            this.saveItems(); 
            console.log(`删除项: ${JSON.stringify(deletedItem)}`);
        } else {
            console.log(`未找到匹配的项`);
        }
    }

    loadItems() {
        const filePath = join(__dirname, 'items.csv');
        if (existsSync(filePath)) {
            const data = readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
            this.items = data.map(line => {
                const [type, id, no, item_desc, content] = line.split(',');
                return new Item(type, id, Number(no), item_desc, content);
            });
        }
    }

    saveItems() {
        const filePath = join(__dirname, 'items.csv');
        const csvData = this.items.map(item => item.toCSV()).join('\n');
        writeFileSync(filePath, csvData);
    }
}


// const manager = new ItemManager();

// 定义 API 路由
app.post('/items', (req, res) => {
    const { type, item_desc } = req.body;
    manager.addItem(type, item_desc);
    res.status(201).json({ message: 'Item added successfully.' });
});

app.put('/items', (req, res) => {
    const { type, item_desc, content } = req.body;
    manager.updateItem(type, item_desc, content);
    res.status(200).json({ message: 'Item updated successfully.' });
});

app.delete('/items', (req, res) => {
    const { type, item_desc } = req.body;
    manager.deleteItem(type, item_desc);
    res.status(200).json({ message: 'Item deleted successfully.' });
});

app.get('/items/:type', (req, res) => {
    const type = req.params.type;
    const items = manager.getItemsByTypeSorted(type);
    res.status(200).json(items);
});

// 启动服务器

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = { ItemManager };