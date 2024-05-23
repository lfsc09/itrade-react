[![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen)](https://github.com/lfsc09/itrade-react/blob/main/LICENSE)
![Static Badge](https://img.shields.io/badge/docker--compose-3.8-blue)
![Static Badge](https://img.shields.io/badge/MUI-package--lock.json-blue)

***Use `package-lock.json` when building since newer versions of the libraries, expecially `MUI` will break the code.***

*Code was written a couple of years ago, and was not updated since then.*

</br>

## Plugins

### Essential plugins

#### <ins>SASS</ins>

To use `.scss`.

```bash
npm install sass
```

#### <ins>React Router DOM</ins>

Client routing.

```bash
npm install react-router-dom
```

#### <ins>REDUX</ins> (https://redux-toolkit.js.org/introduction/getting-started)

```bash
npm install @reduxjs/toolkit react-redux
```

#### <ins>AXIOS</ins> (https://axios-http.com/docs/api_intro)

HTTP request.

```bash
npm install axios
```

#### <ins>JWT-TOKEN</ins>

For JWT Token decode.

```bash
npm install jwt-decode
```

</br>

### MUI plugins

#### <ins>Material-UI</ins> (https://mui.com/pt/material-ui/getting-started/installation/)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

##### _Para os componentes ainda em Testes_

```bash
npm install @mui/lab
```

#### <ins>Material-UI (Icons)</ins>

```bash
npm install @mui/icons-material
```

#### <ins>Material-Table</ins> (https://material-table.com/#/)

```bash
npm install material-table
```

##### _Caso não esteja ja usando MUI instalar o core_

```bash
npm install @material-ui/core
```

#### <ins>Robot Fonts</ins> (https://mui.com/pt/material-ui/getting-started/installation/)

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
```

```html
<style>
    * {
        margin: 0;
        font-family: 'Roboto', sans-serif;
    }
</style>
```

</br>

### Extra Plugins

#### <ins>Formik</ins> (https://formik.org/docs/overview)

Form validation.

```bash
npm install formik
```

#### <ins>Yup</ins> (https://github.com/jquense/yup)

```bash
npm install yup
```

#### <ins>Date-fns</ins>

Date formatting.

```bash
npm install date-fns
```

#### <ins>Framer Motion</ins> (https://www.framer.com/motion/)

Animation plugin.

```bash
npm install framer-motion
```

#### <ins>Cripto-JS</ins> (https://www.code-sample.com/2019/12/react-encryption-decryption-data-text.html)

Encryption/Decription libraries.

```bash
npm install cripto-js
```

#### <ins>CKEditor</ins> (https://ckeditor.com/docs/ckeditor5/latest)

Text editor interface.

##### <ins>Default build</ins>

```bash
npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

#### <ins>Progress-bar</ins> (https://github.com/badrap/bar-of-progress)

Top page progress bar.

```bash
npm install @badrap/bar-of-progress
```

#### <ins>Clonedeep</ins> (https://lodash.com/docs/#cloneDeep)

For cloning objects in JS.

```bash
npm install lodash.clonedeep
```

#### <ins>Match-sorter</ins> (https://github.com/kentcdodds/match-sorter)

For custom array sorting based on multiple and similar values.

```bash
npm install match-sorter
```

#### <ins>Rechart</ins> (https://recharts.org/en-US/api)

Chart plugin.

```bash
npm install recharts
```

</br>

## Environment Variables

```properties
REACT_APP_BASE_URL: http://<url_to_api>
```

</br>

## Deploy

```bash
docker compose up -d
```

### If not using Docker

If using Apache, include this `.htaccess` in the project root, so `React Routes` can work.

```apache
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
