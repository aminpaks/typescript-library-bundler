const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

module.exports.runScript = function runScript(scriptPath, callback) {
  // keep track of whether callback has been invoked to prevent multiple invocations
  let invoked = false;

  const process_1 = childProcess.fork(scriptPath);

  // listen for errors as they may prevent the exit event from firing
  process_1.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  process_1.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
}

module.exports.getProjects = function getProjects() {
  const dirs = fs.readdirSync(__dirname);
  const result = [];

  for (const dir of dirs) {
    const dirPath = path.resolve(__dirname, dir);
    if (fs.lstatSync(dirPath).isDirectory()) {
      result.push(dirPath);
    }
  }

  return result;
}

module.exports.runProjects = function runProjects(projectsPath, callback) {
  const allProjects = projectsPath.slice(0);
  const currentProject = allProjects.shift();

  if (currentProject) {

    process.chdir(currentProject);
    console.log('Current project to run', currentProject);

    require('../src/main')
      .main(currentProject)
      .then(() => runProjects(allProjects, callback));

  } else {
    callback();
  }
}
