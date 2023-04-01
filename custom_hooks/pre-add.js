/* eslint-disable prettier/prettier */
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

const WORKING_PATH = process.argv[2];

const pjson = require(path.resolve(WORKING_PATH, "package.json"));
const webpackConfig = require(path.resolve(WORKING_PATH, "webpack.config"));

const EXTERNALS_FILENAME = "externals.jsonc";
const COMMENTS_ESCAPE_REGEX = /(\/\*{1,}[^\/]{0,}\*{1,}\/)/gm;
const FILE_INSTRUCTION =
  "/**\n\tThis file was created automatically\n" +
  "\tIt has all externals libraries\n" +
  "\tBefore committing the changes make sure you've pasted correct cdn link for each library respectively \n*/\n";

const externals = webpackConfig()?.externals || [];
const dependencies = pjson["dependencies"];

const newExternalsArray = [];

for (const externalLib of externals) {
  if (Object.hasOwnProperty.call(dependencies, externalLib)) {
    const library = externalLib;

    newExternalsArray.push({
      lib: library,
      url: "",
      action: "added",
    });
  }
}

if (fs.existsSync(path.resolve(WORKING_PATH, EXTERNALS_FILENAME))) {
  exec(`git checkout -- ${EXTERNALS_FILENAME}`);

  const fileContent = fs
    .readFileSync(path.resolve(WORKING_PATH, EXTERNALS_FILENAME))
    .toString()
    .replace(COMMENTS_ESCAPE_REGEX, "");
  const jsonArray = JSON.parse(fileContent);

  for (const externalLibObj of jsonArray) {
    const { lib: prevLibrary, action: prevAction } = externalLibObj;

    /** здесь мы модифицируем уже созданный массив с внешними зависимостями
     * 1. Ищем библиотеку из прочитанного файла в только что созданном массиве с внешними зависимостями:
     * 2. Если библиотека присутствует и имеет статус "added", меняем ее статус на "unchanged", добавляем в массив
     * 3. Если библиотека присутствует со статусом "deleted", меняем ее статус на "added", добавляем в массив
     * 4. Если библиотека отсутствует, пихаем ее в новый массив со статусом "deleted"
     * 5. Если библиотека отсутствует со статусом "deleted", не добавляем ее в массив
     */

    const targetExternalLibIndex = newExternalsArray.findIndex(
      ({ lib }) => lib === prevLibrary
    );

    if (targetExternalLibIndex >= 0) {
      switch (prevAction) {
        case "added":
        case "unchanged": {
          newExternalsArray[targetExternalLibIndex] = {
            ...externalLibObj,
            action: "unchanged",
          };
          break;
        }
        case "deleted": {
          newExternalsArray[targetExternalLibIndex] = {
            ...externalLibObj,
            action: "added",
          };
        }
      }
    } else {
      prevAction !== "deleted" &&
        newExternalsArray.push({
          ...externalLibObj,
          action: "deteleted",
        });
    }
  }
}

if (newExternalsArray.length) {
  // Записываем внешние библиотеки и их версии в json, чтобы юзер позже смог руками воткнуть ссылки на cdn
  fs.writeFileSync(
    path.resolve(WORKING_PATH, EXTERNALS_FILENAME),
    FILE_INSTRUCTION +
    JSON.stringify(newExternalsArray, null, 2) +
    `\n/** Generated timestamp: ${Date.now()} */`
  );
  exec(`git add ${EXTERNALS_FILENAME}`);
}
