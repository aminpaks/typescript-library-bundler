const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports.getProjects = function getProjects(specificProject) {
  const currentDir = process.cwd();
  const dirs = fs.readdirSync(__dirname);
  const result = [];

  if (specificProject) {
    const dirPath = path.resolve(__dirname, specificProject);
    return [path.relative(currentDir, dirPath)];
  }

  for (const dir of dirs) {
    const dirPath = path.resolve(__dirname, dir);
    if (fs.lstatSync(dirPath).isDirectory()) {
      result.push(path.relative(currentDir, dirPath));
    }
  }

  return result;
}

module.exports.runProjects = function runProjects(projectsPath) {
  const allProjects = projectsPath.slice(0);
  const currentProject = allProjects.shift();

  if (currentProject) {

    const projectName = path.basename(currentProject);
    console.log('Bundle started: ' + chalk.red.bold(projectName));

    require('../src/main')
      .main(currentProject)
      .then(() => {
        console.log(chalk.yellow('Bundle finished') + ': ' + chalk.green.underline(projectName));
        runProjects(allProjects);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });

  } else {
    console.log('All done!');
    process.exit(0);
  }
}
