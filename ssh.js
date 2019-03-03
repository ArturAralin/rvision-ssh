const path = require('path');
const fs = require('fs');
const {
  lookupCredentials,
  lookupArg,
} = require('./app/tools');
const sshClient = require('./app/client');
const { shell } = require('./app/shell');
const {
  fileServer,
} = require('./app/file-server');

const PORT = 22;

const getPrivateKey = (args) => {
  const privateKeyName = lookupArg('-i', args);
  const absolutePath = path.resolve(__dirname, privateKeyName);
  let fileStat;

  try {
    fileStat = fs.lstatSync(absolutePath);
  } catch (err) {
    return null;
  }

  if (fileStat.isFile()) {
    return fs
      .readFileSync(absolutePath)
      .toString();
  }

  return null;
};

(async () => {
  const ARGS = process.argv.slice(2);
  const {
    username,
    password,
    host,
  } = lookupCredentials(ARGS);
  const privateKey = getPrivateKey(ARGS);

  let ssh;

  try {
    ssh = await sshClient.connect(username, host, PORT, password, privateKey);
  } catch (err) {
    // oops
    console.error(err);
    process.exit(1);
  }

  await Promise.all([
    fileServer(ssh),
    shell(ssh),
  ]);

  process.exit(0);
})();
