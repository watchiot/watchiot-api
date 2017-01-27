'use strict';

var Response = require('../../helper/response');
var rabbit = require('../../helper/rabbit');
var models = require('../../models');
var helper = require('../../helper');

module.exports = {
    project: function (req, res, next) {
        var userId = req.user.id;
        var namespace = req.params.space;
        var nameproject = req.params.project;

        models.projects.findProject(models, userId, namespace, nameproject, function (project) {
            if (project) {
                req.project = project;
                return next();
            }

            res.status(404).json(JSON.stringify(new Response(404, 'NOT FOUND', {
                description: 'The space name or project name does not exist'
            })));
        });
    },
    isStatus: function(req, res, next) {
        if(req.project.status){
            return next();
        }

        res.status(420).json(JSON.stringify(new Response(420, 'DISABLED PROJECT', {
            description: 'The project is disabled.'
        })));
    },
    isReady: function(req, res, next) {
        if(req.project.ready){
            return next();
        }

        res.status(420).json(JSON.stringify(new Response(420, 'BAD YML CONFIG PROJECT', {
            description: 'The project yml is not configured correctly. It is empty or contains errors'
        })));
    },
    validIp: function(req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.project.validIp(ip, function (valid) {
            if(valid) {
                return next();
            }

            res.status(403).json(JSON.stringify(new Response(403, 'FORBIDDEN', {
                description: 'You are using an IP that it is not specified in the project yml'
            })));
        });
    },
    reqPerhour: function (req, res, next) {
        var planId = req.user.plan_id;

        // find max amount of request per project
        models.plan_features.findReqPerHour(models, planId, function (planFeatures) {
            if (planFeatures && planFeatures.value) {

                /** define the limit request options per project **/
                var limitOpts= {
                    lookup: [req.user.id],
                    total: planFeatures.value, // request per hours
                    expire: 1000 * 60 * 60, //expire in one hour
                    onRateLimited: function (req, res) {
                        res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                            description: "You limit request per project is " + planFeatures.value + "/hr. " +
                            "You have to wait for " + res.get('X-Retry-After') + " sec"
                        })));
                    }
                };

                return next(limitOpts);
            }

            res.status(500).json(JSON.stringify(new Response(500, 'EXCEPTION', {})));
        });
    },
    hasMetric: function (req, res, next) {
        if(req.body && req.body.metrics && !helper.isEmpty(req.body.metrics)) {
            return next();
        }

        res.status(400).json(JSON.stringify(new Response(400, 'BAD REQUEST', {
            description: "You have to send the metrics"
        })));
    },
    validMetrics: function (req, res, next) {
        req.project.validMetrics(req.body.metrics, function(errors) {
            if(helper.isEmpty(errors)) {
                return next();
            }

            res.status(400).json(JSON.stringify(new Response(400, 'BAD REQUEST', {
                description: "Errors into the metrics",
                fields: errors
            })));
        });
    },
    evalMetrics: function (req, res, next) {
        req.project.evalMetrics(req.body.metrics, function (statusMetric, notif) {

            if (statusMetric) {
                req.statusMetric = statusMetric;
                req.notif = notif;
                return next();
            }

            res.status(420).json(JSON.stringify(new Response(420, 'BAD YML CONFIG PROJECT', {
                description: 'The project yml is not configured correctly'
            })));
        });
    },
    saveMetrics: function (req, res, next) {
        req.project.saveMetrics(req.body.metrics, req.statusMetric, function (metricId) {
            if (metricId) {
                return next();
            }
        });
    },
    saveNotif: function (req, res, next) {
        if(!req.notif) return next();
        req.project.saveNotif(req.notif, req.body.metrics, req.statusMetric, function (notifId) {
            if (notifId) {
                /** queue the notifications **/
                rabbit.publish(notifId, req.notif, req.body.metrics);
                return next();
            }
        });
    }
};