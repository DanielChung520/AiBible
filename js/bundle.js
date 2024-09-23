(function (express, fs, uuid) {
  'use strict';

  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  // path.normalize(path)
  // posix version
  function normalize(path) {
    var isPathAbsolute = isAbsolute(path),
        trailingSlash = substr(path, -1) === '/';

    // Normalize the path
    path = normalizeArray(filter(path.split('/'), function(p) {
      return !!p;
    }), !isPathAbsolute).join('/');

    if (!path && !isPathAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isPathAbsolute ? '/' : '') + path;
  }
  // posix version
  function isAbsolute(path) {
    return path.charAt(0) === '/';
  }

  // posix version
  function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(filter(paths, function(p, index) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  }
  function filter (xs, f) {
      if (xs.filter) return xs.filter(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
          if (f(xs[i], i, xs)) res.push(xs[i]);
      }
      return res;
  }

  // String.prototype.substr - negative index don't work in IE8
  var substr = 'ab'.substr(-1) === 'b' ?
      function (str, start, len) { return str.substr(start, len) } :
      function (str, start, len) {
          if (start < 0) start = str.length + start;
          return str.substr(start, len);
      }
  ;

  const app = express();
  const port = 3300;

  app.use(express.json()); // 解析 JSON 请求体

  class Item {
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

  class ItemManager {
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
          const id = uuid.v4();
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
          if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
              this.items = data.map(line => {
                  const [type, id, no, item_desc, content] = line.split(',');
                  return new Item(type, id, Number(no), item_desc, content);
              });
          }
      }

      saveItems() {
          const filePath = join(__dirname, 'items.csv');
          const csvData = this.items.map(item => item.toCSV()).join('\n');
          fs.writeFileSync(filePath, csvData);
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

  new ItemManager();

  window.onload = function () {
      // 解析 URL 参数
      const urlParams = new URLSearchParams(window.location.search);
      const itemType = urlParams.get('type');
    
      // 如果接收到了外部参数，解析并使用外部参数
      if (itemType) {
          window.itemType = itemType;
      } else {
          // 如果没有接收到外部参数，使用默认初始化数据
          window.itemType = 'Ai解經';
      }
      // getItems(window.itemType); // 获取数据并渲染页面
  };




  // function getItems(itemType) {
  //     fetch(`http://localhost:3300/items/${window.itemType}`)
  //     .then(response => response.json())
  //     .then(data => {
  //         // 处理获取的 items 数据
  //         console.log(data);
  //     })
  //     // .catch(error => console.error('Error:', error));
  // }

  // function addItem(type, item_desc) {
  //     fetch('http://localhost:3300/items', {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ type, item_desc }),
  //     })
  //     .then(response => response.json())
  //     .then(data => {
  //         console.log(data.message); // 输出成功信息
  //     })
  //     .catch(error => {
  //         console.error('Error:', error);
  //     });
  // }

  // function updateItem(type, item_desc, content) {
  //     fetch('http://localhost:3300/items', {
  //         method: 'PUT',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ type, item_desc, content }),
  //     })
  //     .then(response => response.json())
  //     .then(data => {
  //         console.log(data.message); // 输出成功信息
  //     })
  //     .catch(error => {
  //         console.error('Error:', error);
  //     });
  // }

  // function deleteItem(type, item_desc) {
  //     fetch('http://localhost:3300/items', {
  //         method: 'DELETE',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ type, item_desc }),
  //     })
  //     .then(response => response.json())
  //     .then(data => {
  //         console.log(data.message); // 输出成功信息
  //     })
  //     .catch(error => {
  //         console.error('Error:', error);
  //     });
  // }

})(express, fs, uuid);
