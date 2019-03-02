const {
  lookUpCredentials,
} = require('./app/tools');
const sshClient = require('./app/client');

const ARGS = process.argv.slice(2);
const PORT = 22;
const PASSWORD = '75847845';

(async () => {
  const {
    username,
    host,
  } = lookUpCredentials(ARGS);

  let ssh;

  try {
    ssh = await sshClient.connect(username, host, PORT, PASSWORD);
  } catch (err) {
    // oops
    console.error(err);
  }

  await sshClient.shell(ssh);

  process.exit(0);
})();
