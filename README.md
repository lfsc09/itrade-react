## Criando um Novo Projeto React

https://mui.com/pt/material-ui/getting-started/installation/

`npx create-react-app project-name`

</br>

## Plugins Utilizados

### Plugins Essenciais

##### <ins>SASS</ins>

Plugin para utilização de arquivos .scss

`npm install sass`

</br>

##### <ins>React Router DOM</ins>

Roteamento de Componentes (URLs) - Client Side

`npm install react-router-dom`

</br>

##### <ins>REDUX</ins> (https://redux-toolkit.js.org/introduction/getting-started)

Plugin Redux

`npm install @reduxjs/toolkit react-redux`

</br>

##### <ins>AXIOS</ins> (https://axios-http.com/docs/api_intro)

Plugin wrapper de Request http

`npm install axios`

</br>

##### <ins>JWT-TOKEN</ins>

Plugin para decode do Token JWT

`npm install jwt-decode`

</br>

### Plugins MUI

##### <ins>Material-UI</ins> (https://mui.com/pt/material-ui/getting-started/installation/)

`npm install @mui/material @emotion/react @emotion/styled`

###### <ins>_Para os componentes ainda em Testes_</ins>

`npm install @mui/lab`

</br>

##### <ins>Material-UI (Icons)</ins>

`npm install @mui/icons-material`

</br>

##### <ins>MATERIAL-TABLE</ins> (https://material-table.com/#/)

`npm install material-table`

###### <ins>_Caso não esteja ja usando MUI instalar o core_</ins>

`npm install @material-ui/core`

</br>

##### <ins>FONTES-ROBOT</ins> (https://mui.com/pt/material-ui/getting-started/installation/)

```
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
```

```
<style>
    * {
        margin: 0;
        font-family: 'Roboto', sans-serif;
    }
</style>
```

</br>

### Plugins Extra

##### <ins>FORMIK</ins> (https://formik.org/docs/overview)

Plugin Validação de Formulários

`npm install formik`

###### <ins>_Yup_</ins> (https://github.com/jquense/yup)

`npm install yup`

</br>

##### <ins>DATE-FNS</ins>

Plugin para formatação de Datas

`npm install date-fns`

</br>

##### <ins>FRAMER MOTION</ins> (https://www.framer.com/motion/)

Plugin para Animações

`npm install framer-motion`

</br>

##### <ins>CRIPTO-JS</ins> (https://www.code-sample.com/2019/12/react-encryption-decryption-data-text.html)

Plugin para bibliotecas de encriptação/desencriptação

`npm install cripto-js`

</br>

##### <ins>CKEDITOR5</ins> (https://ckeditor.com/docs/ckeditor5/latest)

Plugin para Editor de Texto

###### <ins>Para build normal</ins>

`npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic`

###### <ins>Para custom builds, criadas a partir do site deles</ins>

`Arquivo baixado separadamente do site deve ser extraido direto no root do projeto`

`Adicionar manualmente no package.json e package-lock.json`

```
{
    ...
    ckeditor5-custom-build: 'file:ckeditor5'
}
```

</br>

##### <ins>PROGRESS-BAR</ins> (https://github.com/badrap/bar-of-progress)

Plugin Progress Bar on Top, estilo Github

`npm install @badrap/bar-of-progress`

</br>

##### <ins>CLONEDEEP</ins> (https://lodash.com/docs/#cloneDeep)

Plugin para clonagem deep por valor de objetos JS

`npm install lodash.clonedeep`

</br>

##### <ins>MATCH-SORTER</ins> (https://github.com/kentcdodds/match-sorter)

Plugin de ordenação de Arrays, utilizado pelo o Menu Top para ordenação das opções do menu

`npm install match-sorter`

</br>

##### <ins>RECHART</ins> (https://recharts.org/en-US/api)

Plugin dos gráficos

`npm install recharts`

</br>

## Variáveis de Ambiente

##### <ins>.ENV</ins>

Foi criado arquivos <ins>_.env.development_</ins> e <ins>_.env.production_</ins> para ter as variaveis que possuem valores diferentes de acordo com o ambiente executado. (_Ao realizar o BUILD é utilizado o <ins>.env.production</ins>_)

###### <ins>Variáveis</ins>

```
{
    REACT_APP_API_URL: 'Utilizada pelo AXIOS como baseURL'
}
```

</br>

##### <ins>PACKAGE.JSON</ins>

No package.json do projeto React, deve ser incluido:

```
{
    ...
    "homepage": "https://itrade-dongs.net/itrade",
    ...
}
```

Para a URL com subdominio poder ser corretamente incluido na hora do BUILD, nos arquivos CSS e JS. Senão não carrega corretamente os arquivos em produção.

</br>

## Deploy

##### <ins>FTP-DEPLOY</ins>

É utilizado este plugin do Node, para realizar o envio por FTP dos arquivos da BUILD para o servidor.

Foi criado o script **deploy-build.example.js** como exemplo que deve ser preenchido.

</br>

##### <ins>PACKAGE.JSON</ins>

No package.json do projeto React, deve ser incluido:

```
{
    ...
    "scripts": {
        "deploy": "node deploy-build",
        ...
    }
}
```

</br>

## No servidor WEB

##### <ins>.HTACCESS</ins>

Deve-se incluir no ROOT este arquivo, para possibilitar o REACT ROUTES trabalhar

```
<IfModule mod_rewrite.c>
    Options -Indexes

    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-l
    RewriteRule . itrade/index.html [L]
</IfModule>
```
