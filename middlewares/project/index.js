'use strict';

var Response = require('../../data/response');
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
                description: 'The Namespace or Project name does not exist.'
            })));
        });

    },
    reqPerhour: function (req, res, next) {
        var planId = req.user.plan_id;

        // find max amount of request per project
        models.plan_features.findReqPerHour(models, planId, function (planFeatures) {
            if (planFeatures && planFeatures.value) {
                req.reqPerHour = planFeatures.value;
                return next();
            }

            res.status(500).json(JSON.stringify(new Response(500, 'EXCEPTION', {})));
        });
    },
    limit: function (req, res, next) {
        var reqPerHour = req.reqPerHour;

        helper.limit(req, res, next, {
            lookup: [req.user.id],
            total: reqPerHour, // reqPerHour requests per one hour
            expire: 1000 * 60 * 60, //expire in one hour
            onRateLimited: function (req, res) {
                res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                    description: "You limit of request per project is " + reqPerHour + "/hr. " +
                    "You have to wait for " + res.get('X-Retry-After') + " sec"
                })));
            }
        });
    },
    metric: function (req, res, next) {
        return next();
    },
    notif: function (req, res, next) {
        return next();
    }
};