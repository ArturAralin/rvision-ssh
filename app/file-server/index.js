const {
  pipe,
  split,
  map,
  slice,
  fromPairs,
} = require('ramda');
const {
  sftpConnect,
  sftpGetHandlerRequest,
} = require('./sftp');

const PORT = 8888;
const SESSION_COMMANDS = `get() { echo "action=get&serverPath=$1&clientPath=$2" | netcat localhost ${PORT}; };put() { echo "action=put&serverPath=$2&clientPath=$1" | netcat localhost ${PORT}; } # hide_me\n`;

const forwardInPort = (port, ssh) => new Promise((resolve, reject) => {
  ssh.forwardIn('127.0.0.1', port, (err) => {
    if (err) {
      reject(err);

      return;
    }

    resolve();
  });
});

const createFunctions = async (stream) => {
  stream.write(SESSION_COMMANDS);
};

const handleRequest = pipe(
  buf => buf.toString(),
  slice(0, -1),
  split('&'),
  map(split('=')),
  fromPairs,
);

const fileServer = async (ssh) => {
  await forwardInPort(PORT, ssh);
  const sftp = await sftpConnect(ssh);
  const sftpHandler = sftpGetHandlerRequest(sftp);

  ssh
    .on('tcp connection', (info, accept) => {
      const stream = accept();

      stream.on('data', async (data) => {
        const { msg } = await sftpHandler(handleRequest(data));
        stream.end(`${msg}\n`);
      });
    });
};

module.exports = {
  fileServer,
  createFunctions,
};
