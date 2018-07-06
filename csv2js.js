const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

function csv2js() {
    fs.readFile(path.resolve(__dirname, './jira.csv'), 'utf8', (err, data) => {
        const col = data.split(/\r?\n|\r/);
        const arr = col.map(str => {
            return str.split(',');
        });
        let insertStr = '';
        arr.forEach(str => {
            if (str[3] && str[3] !== 'APP_' && str[3] !== 'WEB_') { // if str[3] has content
                const lineStr = `${str[3]}:'${str[3]}', // ${str[4]}\n`;
                insertStr = lineStr + insertStr;
            }
        });
        const writeStr = `
  const auth = {
    ${insertStr}
  }
  export default auth;
  `;
        fs.writeFile(
            path.resolve(__dirname, './auth.js'),
            prettier.format(writeStr, { singleQuote: true }),
            err => {
                if (err) throw err;
                console.log('done!');
            },
        );
    });
}

module.exports = csv2js; 