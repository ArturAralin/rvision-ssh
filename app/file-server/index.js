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

const SESSION_COMMANDS = `get() { echo "action=get&serverPath=$1&clientPath=$2" | netcat localhost 8888; } &>/dev/null
`;

const forwardInPort = (port, ssh) => new Promise((resolve, reject) => {
  ssh.forwardIn('127.0.0.1', port, (err) => {
    if (err) {
      reject(err);

      return;
    }

    resolve();
  });
});


// TODO: hide commands injection output
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
  const PORT = 8888;
  await forwardInPort(PORT, ssh);
  const sftp = await sftpConnect(ssh);
  const sftpHandler = sftpGetHandlerRequest(sftp);

  ssh
    .on('tcp connection', (info, accept) => {
      let message;
      const stream = accept();

      stream.on('data', (data) => {
        const { msg } = sftpHandler(handleRequest(data));
        message = msg;
      });

      stream.on('end', () => {
        stream.end(message);
      });
    });
};

module.exports = {
  fileServer,
  createFunctions,
};
