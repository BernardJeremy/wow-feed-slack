const url = require('url');

function sanitize(str) {
  return str.replace(new RegExp('\\n', 'g'), '').replace(new RegExp('\\t', 'g'), '');
}

function handleText(item) {
  return sanitize(item.data);
}

function handleTag(item, baseUrl) {
  if (item.name === 'a' && item.children && item.children.length && item.children.length > 0 && item.children[0].data && sanitize(item.children[0].data) !== '') {
    const link = (item.attribs.href[0] === '/' ? url.parse(baseUrl).hostname + item.attribs.href : url.resolve(baseUrl, item.attribs.href));
    return `<${link}|${sanitize(item.children[0].data)}>`;
  } else if (item.name === 'strong') {
    return sanitize(`*${item.children[0].data}*`);
  }
  return '';
}


/**
 * Feed parser
 */
class Parser {

  constructor() {
    this.type = {
      TAG: 'tag',
      TEXT: 'text',
    };

    this.fctMapper = {};
    this.fctMapper[this.type.TAG] = handleTag;
    this.fctMapper[this.type.TEXT] = handleText;
  }

  parse(context, baseUrl) {
    let parsedStr = '';
    context.forEach((item) => {
      parsedStr += this.fctMapper[item.type](item, baseUrl);
    });

    return parsedStr;
  }


}

module.exports = Parser;
