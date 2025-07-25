const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const from = path.join(__dirname, '..', 'src', 'ui', 'renderer', 'dist');
const to = path.join(__dirname, '..', 'dist', 'ui', 'renderer');

fse.copySync(from, to);
console.log('✅ Renderer copiado para dist.');
