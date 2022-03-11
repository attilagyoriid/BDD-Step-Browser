/** @format */

var path = require("path");
var fs = require("fs");

function getAllFilesByExtension(basePath, extension, files, result) {
  files = files || fs.readdirSync(basePath);
  result = result || [];

  files.forEach(function (file) {
    var newbase = path.join(basePath, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = getAllFilesByExtension(
        newbase,
        extension,
        fs.readdirSync(newbase),
        result
      );
    } else {
      if (file.substr(-1 * (extension.length + 1)) == "." + extension) {
        result.push(newbase);
      }
    }
  });
  return result;
}

module.exports = getAllFilesByExtension