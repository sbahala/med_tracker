import '@testing-library/jest-dom';
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
module.exports = {  
    moduleNameMapper: {
        '^../../firebase$': '<rootDir>/src/firebase.js',
    },
  };