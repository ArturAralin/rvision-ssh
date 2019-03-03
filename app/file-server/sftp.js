const {
  pipe,
  split,
  last,
} = require('ramda');
const fs = require('fs');
const { PassThrough } = require('stream');

const getFileName = pipe(
  split('/'),
  last,
);

const sftpConnect = ssh => new Promise((resolve, reject) => {
  ssh.sftp((err, sftp) => {
    if (err) {
      reject(err);

      return;
    }

    resolve(sftp);
  });
});

const get = (sftp, serverPath, clientPath) => new Promise((resolve, reject) => {
  const fileName = getFileName(serverPath);
  const absoluteClientFileName = `${clientPath}/${fileName}`;

  sftp.readFile(serverPath, {}, (err, buf) => {
    if (err) {
      reject(err);

      return;
    }

    const pt = new PassThrough();
    pt.end(buf);
    const ws = fs.createWriteStream(absoluteClientFileName);
    pt.pipe(ws);

    ws.on('close', () => {
      resolve({
        msg: 'Successfully downloaded',
      });
    });
  });
});

const put = (sftp, serverPath, clientPath) => new Promise((resolve, reject) => {
  const fileName = getFileName(clientPath);
  const absoluteServerFileName = `${serverPath}/${fileName}`;

  const rs = fs.createReadStream(clientPath);
  const ws = sftp.createWriteStream(absoluteServerFileName);

  rs.pipe(ws);

  ws.on('close', () => {
    resolve({
      msg: 'Successfully uploaded',
    });
  });

  ws.on('error', reject);
});

const sftpGetHandlerRequest = sftp => ({
  action,
  serverPath,
  clientPath,
}) => {
  switch (action) {
    case 'get':
      return get(sftp, serverPath, clientPath);
    case 'put':
      return put(sftp, serverPath, clientPath);
    default:
      return Promise.resolve({
        msg: 'Unknown action',
      });
  }
};

module.exports = {
  sftpConnect,
  sftpGetHandlerRequest,
};
