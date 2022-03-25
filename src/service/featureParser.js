/** @format */

const parser = require("gherkin-parse");

const featureParser = (featurePath) => {
  const resultList = [];
  try {
    const result = parser.convertFeatureFileToJSON(featurePath);
    console.log(`feature parsed: ${JSON.stringify(result)}`);
    resultList.push(result);
  } catch (error) {
    console.error(error);
  }
  return resultList;
};

module.exports = featureParser;
