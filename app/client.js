const { Client } = require('ssh2');

const connect = (username, host, port, password) => new Promise((resolve, reject) => {
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
    });
});

const shell = ssh => new Promise((resolve, reject) => {
  ssh.shell({
    rows: process.stdout.rows,
    cols: process.stdout.columns,
  }, (err, stream) => {
    if (err) {
      reject(err);

      return;
    }

    stream.on('close', () => {
      process.stdin.unref();
      resolve();
    });

    process.stdin.setRawMode(true);
    process.stdin.pipe(stream);
    stream.pipe(process.stdout);
    process.stdout.on('resize', () => {
      stream.setWindow(process.stdout.rows, process.stdout.columns, 0, 0);
    });
  });
});

module.exports = {
  connect,
  shell,
};
