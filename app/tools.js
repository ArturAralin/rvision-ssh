const {
  trim,
  match,
  pipe,
  map,
  reject,
  isEmpty,
  head,
  last,
  split,
  applySpec,
} = require('ramda');

const lookUpCredentials = pipe(
  map(match(/.*@.*/g)),
  reject(isEmpty),
  head,
  head,
  trim,
  split('@'),
  applySpec({
    username: head,
    host: last,
  }),
);

module.exports = {
  lookUpCredentials,
};
