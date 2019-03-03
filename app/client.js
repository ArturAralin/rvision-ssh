const { Client } = require('ssh2');

const connect = (username, host, port, password, privateKey) => new Promise((resolve, reject) => {
  const sshConnection = new Client();

  sshConnection
    .on('ready', () => {
      resolve(sshConnection);
    })
    .on('error', reject)
    .connect({
      username,
      host,
      port,
      password,
      privateKey,
    });
});

module.exports = {
  connect,
};
