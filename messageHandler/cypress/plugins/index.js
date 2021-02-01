/// <reference types="cypress" />

const fs = require("fs")
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  const c = JSON.parse(fs.readFileSync("config/config.json").toString());
  config.customConfig = c 
  return config;
}
