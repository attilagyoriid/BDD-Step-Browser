/** @format */

const transform = require("node-json-transform").transform;

const featureMap = {
  item: {
    featureName: "feature.name",
    scenarioNum: "feature.children",
    tags: "feature.tags",
    scenarios: "feature.children",
  },

  operate: [
    {
      run: function (val) {
        if (val && val.length) {
          return val.length;
        } else {
          return 0;
        }
      },
      on: "scenarioNum",
    },
    {
      run: function (val) {
        if (val && val.length) {
          return val.map((x) => x.name);
        } else {
          return [];
        }
      },
      on: "tags",
    },
    {
      run: function (val) {
        if (val && val.length) {
          const result = val.map((x) => {
            let tags1 = [];
            let stepNum = 0;
            let steps = [];
            if (x && x.tags) {
              tags1 = x.tags.map((y) => {
                console.log(`Taaaags: ${JSON.stringify(y)}`);
                return y.name;
              });
            }

            if (x && x.steps) {
              stepNum = x.steps.length;
            }

            if (x && x.steps) {
              steps = x.steps.map((y) => {
                return {
                  keyword: y.keyword,
                  location: y.location,
                  stepName: y.text,
                };
              });
            }

            return {
              scenarioName: x.name,
              tags: tags1,
              stepNums: stepNum,
              location: x.location,
              steps,
            };
          });

          return result;
        } else {
          return [];
        }
      },
      on: "scenarios",
    },
  ],
};

const featureDataTransformer = (entry, path) => {
  const featureData = transform(entry, featureMap);
  if (featureData[0]) {
    featureData[0]["featurePath"] = path ?? "";
    console.log(`feature transformed data: ${JSON.stringify(featureData)}`);
    return featureData;
  }

  return {};
};

module.exports = featureDataTransformer;
