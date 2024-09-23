export class BibleLoader {
    async loadBookData(book) {
        const filePath = `/src/bible/${book.abb_cn}(${book.abb}).csv`;

        try {
            const response = await fetch(filePath);
            const data = await response.text();
            const rows = data.split('\n').slice(1);
            const bookData = rows.map(row => {
                const cells = row.split('|');
                return {
                    chapter: cells[1],
                    sec: cells[2],
                    no: cells[3],
                    content: cells[4],
                    lang: cells[5]
                };
            });

            console.log(bookData);
            return bookData;
        } catch (error) {
            console.error('Error:', error);
            return await Promise.reject(error);
        }
    }

    bibleCatalogue() {
        return fetch('/src/assets/book_catalogue.csv')
            .then(response => response.text())
            .then(data => {
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
                return books;
            })
            .catch(error => {
                console.error('Error:', error);
                return Promise.reject(error);
            });
    }
}


