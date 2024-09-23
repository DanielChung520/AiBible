import fs from 'fs-extra';

fs.writeJson('./test.json', { hello: 'world' })
  .then(() => console.log('File written successfully!'))
  .catch(err => console.error(err));