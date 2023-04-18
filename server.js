const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const data = require('./data');

const render = (template, data) => {
  const fileContent = fs.readFileSync(`${__dirname}/views/${template}.html`, 'utf-8');
  let html = fileContent.replace(/{(\w+)}/g, (_, key) => {
    return data[key];
  });
  return html;
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const path = parsedUrl.pathname;
  const query = querystring.parse(parsedUrl.query);

  if (path === '/' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = render('index', { posts: data });
    res.end(html);
  } else if (path === '/new' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = render('new');
    res.end(html);
  } else if (path === '/new' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newPost = {
        id: Date.now(),
        title: querystring.parse(body).title,
        content: querystring.parse(body).content
      };
      data.push(newPost);
      res.writeHead(302, {'Location': '/'});
      res.end();
    });
  } else if (path === '/edit' && req.method === 'GET') {
    const post = data.find(post => post.id === parseInt(query.id));
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = render('edit', { post: post });
    res.end(html);
  } else if (path === '/edit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postIndex = data.findIndex(post => post.id === parseInt(query.id));
      data[postIndex].title = querystring.parse(body).title;
      data[postIndex].content = querystring.parse(body).content;
      res.writeHead(302, {'Location': '/'});
      res.end();
    });
  } else if (path === '/delete') {
    const postId = parseInt(query.id);
    data = data.filter(post => post.id !== postId);
    res.writeHead(302, {'Location': '/'});
    res.end();
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
  }

});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
