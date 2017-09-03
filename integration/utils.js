const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports.getProjects = function getProjects(specificProject) {
  const dirs = fs.readdirSync(__dirname);
  const result = [];

  if (specificProject) {
    return [path.resolve(__dirname, specificProject)];
  }

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
    const projectName = path.basename(currentProject);
    console.log('Bundle started: ' + chalk.red.bold(projectName));

    require('../src/main')
      .main(currentProject)
      .then(() => {
        console.log(chalk.yellow('Bundle finished') + ': ' + chalk.green.underline(projectName));
        runProjects(allProjects, callback);
      });

  } else {
    callback();
  }
}
