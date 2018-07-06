const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const exportCsv = function () {
  return axios.get('http://wiki.blacklake.tech/pages/viewpage.action?pageId=6066782', {
    headers: {
      'Cookie': 'seraph.confluence=1966086%3A9db518fb6c454c250c6a91497a6d3dc53fa2fbc4; _ga=GA1.2.741704788.1516419729; __utma=1.741704788.1516419729.1525833361.1526459565.22; __utmz=1.1526459565.22.7.utmcsr=jira.blacklake.tech|utmccn=(referral)|utmcmd=referral|utmcct=/browse/GC-2043; ApplicationGatewayAffinity=9546239c3671bec1499dd14dd48745313b822698e6385fbb4bbfea1147d78180; JSESSIONID=7EAFE035698D0ABE94A1FEE45EFFF577; structure.pages.referrer="http://jira.blacklake.tech"'
    }
  })
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const trs = $('table>tbody').find('tr');
      let all = ''
      const rowspan = [];
      trs.each((trIndex, tr) => {
        $(tr).find('td').each((index, td) => {
          let rowspanCount = $(td).attr('rowspan');
          if (rowspanCount) {
            let text = $(td).text();
            rowspan.push({
              text,
              start: trIndex + 1,
              end: trIndex + parseInt(rowspanCount) - 1,
            })
          }
        })
      })


      trs.each((trIndex, tr) => {
        if (trIndex > 1) {
          $(tr).find('td').each((index, td) => {
            if (index === 1 && trIndex >= rowspan[0].start && trIndex <= rowspan[0].end) {
              $(td).after(`<td>${rowspan[0].text}</td>`);
              if (trIndex === rowspan[0].end) {
                rowspan.shift();
              }
            }
          })
        }
      })


      trs.each((trIndex, tr) => { // 遍历每行
        if (trIndex > 1) {
          let line = ''; // every line content
          let terminal = '';
          $(tr).find('td').each((index, td) => {
            const text = $(td).text();
            if (index === 1) {
              terminal = text;
            }
            if (index === 3 && terminal !== '' && text !== ' ') {
              line = line + terminal.toUpperCase() + '_' + text + ','
            } else {
              line = line + $(td).text().toUpperCase() + ','
            }

          });
          all = all + '\n' + line;
        }
      })
      const pathname = path.resolve(__dirname, 'jira.csv');
      fs.writeFile(pathname, all, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
      )
    })
    .catch((err) => {
      console.log(err);
    })
}
module.exports = exportCsv; 