const {
  trim,
  match,
  pipe,
  map,
  reject,
  isEmpty,
  last,
  split,
  applySpec,
  path,
  evolve,
  pathOr,
  findIndex,
  equals,
  inc,
} = require('ramda');

const lookupCredentials = pipe(
  map(match(/.*@.*/g)),
  reject(isEmpty),
  path([0, 0]),
  trim,
  split('@'),
  evolve([
    split(':'),
  ]),
  applySpec({
    username: path([0, 0]),
    password: pathOr(null, [0, 1]),
    host: last,
  }),
);

const lookupArg = (name, args) => pipe(
  findIndex(equals(name)),
  inc,
  idx => args[idx] || null,
)(args);

module.exports = {
  lookupCredentials,
  lookupArg,
};
