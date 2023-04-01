const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

const WORKING_PATH = process.argv[2];
const EXTERNALS_FILENAME = "externals.jsonc";
const COMMENTS_ESCAPE_REGEX = /(\/\*{1,}[^\/]{0,}\*{1,}\/)/gm;

const webpackConfig = require(path.resolve(WORKING_PATH, "webpack.config.js"));

if (
  webpackConfig()?.externals &&
  !fs.existsSync(path.resolve(WORKING_PATH, EXTERNALS_FILENAME))
) {
  console.error("Make sure the file for external libraries exists!");
  console.info(
    "To generate file for external libraries run yarn generate:externals"
  );
  process.exit(1);
}

/**
 * Пре коммит хук, проверяющий при наличии файла с внешними библиотеками, что для них заполнены cdn ссылки
 */
if (fs.existsSync(path.resolve(WORKING_PATH, EXTERNALS_FILENAME))) {
  // TODO: протестировать (что если файл действительно никак не был изменен?)
  exec(`git diff --name-only ${EXTERNALS_FILENAME}`, (_, stdout) => {
    if (!stdout.length) {
      console.error(
        "Make sure you ran yarn generate:externals before commiting your code!"
      );
      process.exit(1);
    }
  });

  const fileContent = fs
    .readFileSync(path.resolve(WORKING_PATH, EXTERNALS_FILENAME))
    .toString()
    .replace(COMMENTS_ESCAPE_REGEX, "");
  const jsonArray = JSON.parse(fileContent);

  const libsToCheck = [];
  let checkPassed = true;

  for (const externalLibObj of jsonArray) {
    const { lib, url } = externalLibObj;

    // Проверяется только заполненность юрла, его достижимость проверяется при помощи import-map-deployer
    if (url.length === 0) {
      checkPassed = false;
      libsToCheck.push(lib);
    }
  }

  if (!checkPassed) {
    console.error(
      `You haven't specify urls for following libraries:\n${libsToCheck.join(
        "\n"
      )}`
    );
    process.exit(1);
  }
}

process.exit(0);
