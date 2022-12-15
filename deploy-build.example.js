const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
    user: 'user',
    // Password optional, prompted if none given
    password: 'password',
    host: 'ftp.someserver.com',
    port: 21,
    localRoot: __dirname + '/local-folder',
    remoteRoot: '/public_html/remote-folder/',
    // this would upload everything except dot files
    include: ['*', '**/*', '.htaccess'],
    // include: ['*.php', 'dist/*', '.*'],
    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    exclude: ['dist/**/*.map', 'node_modules/**', 'node_modules/**/.*', '.git/**'],
    // delete ALL existing files at destination before uploading, if true
    deleteRemote: false,
    // Passive mode is forced (EPSV command is not sent)
    forcePasv: true,
    // use sftp or ftp
    sftp: false,
};

console.log(' --- Start FTP Transfer...');
ftpDeploy
    .deploy(config)
    .then((res) => console.log(' --- Finished FTP Transfer:', res))
    .catch((err) => console.log(err));
