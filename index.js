/**
 * Created by jhorlin.dearmas on 11/26/2014.
 */

    
var express;
try {
    express = require('express');
} catch (err) {
    throw new Error("express-composer extends express. Please manually install express by running 'npm install express'");
}
exports = module.exports = require('./lib/conductor');
exports.Validator = require('joi');
exports.Scope = require('./lib/scope');
exports.composer = require('./lib/composer');
