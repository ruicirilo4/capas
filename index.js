import fs from 'fs';
import request from 'request';
import cheerio from 'cheerio';
import http from 'http';

// URL da página com os trailers
const url = 'https://filmspot.pt/trailers/';

// Realizar uma solicitação HTTP para obter o conteúdo da página
request(url, (error, response, html) => {
  if (!error && response.statusCode === 200) {
    // Carregar o HTML da página usando Cheerio
    const $ = cheerio.load(html);

    // Array para armazenar informações dos filmes
    const filmes = [];

    // Encontrar todos os elementos de link que contêm informações sobre os trailers
    $('a[href^="/trailer/"]').each((index, element) => {
      const $element = $(element);
      const titulo_filme = $element.text().trim();
      const url_trailer = `URL_DO_YOUTUBE/${titulo_filme}`; // Substitua 'URL_DO_YOUTUBE' pelo URL correto do trailer no YouTube
      const url_capa = $element.find('img').attr('src');

      // Adicionar informações do filme ao array
      filmes.push({
        titulo: titulo_filme,
        trailer: url_trailer,
        capa: url_capa,
      });
    });

    // Gerar o HTML com base nos dados dos filmes
    const htmlFilmes = filmes.map(filme => `
      <div class="filme">
        <img src="${filme.capa}" alt="${filme.titulo}">
        <h2>${filme.titulo}</h2>
      </div>
    `).join('');

    // Criar o conteúdo HTML completo
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          h1 {
            text-align: center;
          }
          
          .filme {
            background-color: #fff;
            border-radius: 10px;
            margin-bottom: 20px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          
          img {
            max-width: 100%;
            height: auto;
          }
          
          h2 {
            text-align: center;
          }
          
          
          </style>
          <title>Capas de Filmes</title>
      </head>
      <body>
          <div class="container">
            <h1>Capas de Filmes</h1>
            ${htmlFilmes}
          </div>
      </body>
      </html>
    `;

    // Escrever o conteúdo HTML em um arquivo
    fs.writeFileSync('index.html', htmlContent);

    // Iniciar o servidor web para exibir a página HTML
    const server = http.createServer((req, res) => {
      const html = fs.readFileSync('index.html', 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } else {
    console.error('Falha ao acessar a página.');
  }
});
