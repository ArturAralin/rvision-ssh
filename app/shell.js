const streamFilter = require('stream-filter');
const {
  createFunctions,
} = require('./file-server');

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

    // sorry. I have not time
    stream
      .pipe(streamFilter((buf) => {
        const s = buf.toString();

        return !/# hide_me/g.test(s);
      }))
      .pipe(process.stdout);

    setTimeout(() => {
      createFunctions(stream);
    }, 300);

    process.stdout.on('resize', () => {
      stream.setWindow(process.stdout.rows, process.stdout.columns, 0, 0);
    });
  });
});

module.exports = {
  shell,
};
