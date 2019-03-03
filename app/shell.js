const {
  createFunctions,
} = require('./file-server');

const shell = ssh => new Promise((resolve, reject) => {
  ssh.shell({
    rows: process.stdout.rows,
    cols: process.stdout.columns,
  }, async (err, stream) => {
    if (err) {
      reject(err);

      return;
    }

    await createFunctions(stream);

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
  shell,
};
