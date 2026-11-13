const { applyTheme } = require(process.env.APPLY_THEME);
const { THEME } = require('./lib');
applyTheme(__dirname + '/raw.pptx', THEME).then(()=>console.log('theme ok')).catch(e=>{console.error(e);process.exit(1)});
