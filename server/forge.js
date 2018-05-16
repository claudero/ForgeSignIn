/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

'use strict'; // http://www.w3schools.com/js/js_strict.asp

// web framework
let express = require('express');
let router = express.Router();
let rp = require('request-promise');

// make requests for tokens
let Token = require('./forge.token');

router.get('/api/getapptoken', function (req, res) {
  console.log(req.query);
  if(!req.query.client_id) {
      res.status(400).end();
      return;
  }
  if(!req.query.client_secret) {
      res.status(400).end();
      return;
  }
  if(!req.query.token) {
      res.status(400).end();
      return;
  }

  var t = new Token(req.query.client_id, req.query.client_secret);

  t.getTokenInternal(function (err, token) {
    if(err) {
        res.status(400).end(err);
    } else {
        res.status(200).end(token);
    }

  });
});


router.get('/api/getengines', function (req, res) {
    console.log('getting a call to engine details');
    let response = {
        engines : []
    };


    let enginesUrl = {
        url: 'https://developer.api.autodesk.com/da/us-east/v3/engines',
        headers: {
            'Authorization': req.headers.authorization
        }
    };

    let fetch = [
        rp(enginesUrl).then(function (result) {
            let engines = JSON.parse(result);

            return Promise.all(engines.data.map( function (engine) {

                let enginesDetailsUrl = {
                    url: 'https://developer.api.autodesk.com/da/us-east/v3/engines/' + engine,
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                };

                return rp(enginesDetailsUrl).then( function (engineDetails) {
                    let engine = JSON.parse(engineDetails);

                    return {
                        productVersion : engine.productVersion,
                        description : engine.description,
                        version : engine.version.toString(),
                        id : engine.id
                    };
                });
            }));
        })
    ];

    Promise.all(fetch)
        .then(function (result) {
            console.log(result[0]);
            response.engines = result[0].map( function (engines) {
                return engines;
            });
            res.status(200).end(JSON.stringify(response));
        })
        .catch(function (err) {
            console.log(err);
            res.status(400).end(JSON.stringify(err));
        });
});


router.get('/api/getapplications', function (req, res) {
    console.log('getting a call to application details');
    let response = {
        applications : []
    };

    let appsUrl = {
        url: 'https://developer.api.autodesk.com/da/us-east/v3/apps',
        headers: {
            'Authorization': req.headers.authorization
        }
    };

    let fetch = [
        rp(appsUrl).then(function (result) {
            let apps = JSON.parse(result);
            return Promise.all(apps.data.map( function (app) {

                let appsDetailsUrl = {
                    url: 'https://developer.api.autodesk.com/da/us-east/v3/apps/' + app,
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                };

                return rp(appsDetailsUrl).then( function (appDetails) {

                    let app = JSON.parse(appDetails);

                    return {
                        engine : app.engine,
                        description : app.description,
                        version : app.version.toString(),
                        id : app.id
                    };
                });
            }));
        })
    ];

    Promise.all(fetch)
        .then(function (result) {
            console.log(result[0]);

            response.applications = result[0].map( function (apps) {
                return apps;
            });

            res.status(200).end(JSON.stringify(response));
        })
        .catch(function (err) {
            console.log(err);
            res.status(400).end(JSON.stringify(err));
        });
});



router.get('/api/getactivities', function (req, res) {
    console.log('getting a call to get activities details');
    let response = {
        activities : []
    };


    let activitiesUrl = {
        url: 'https://developer.api.autodesk.com/da/us-east/v3/activities',
        headers: {
            'Authorization': req.headers.authorization
        }
    };

    let fetch = [
        rp(activitiesUrl).then(function (result) {
            let activities = JSON.parse(result);
            return Promise.all(activities.data.map( function (activity) {

                let activityDetailsUrl = {
                    url: 'https://developer.api.autodesk.com/da/us-east/v3/activities/' + activity,
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                };

                return rp(activityDetailsUrl).then( function (activityDetails) {

                    let activity = JSON.parse(activityDetails);

                    activity.version = activity.version.toString();
                    return activity;
                });
            }));
        })
    ];

    Promise.all(fetch)
        .then(function (result) {
            console.log("getting results");
            console.log(result[0]);

            response.activities = result[0].map( function (activity) {
                return activity;
            });
            res.status(200).end(JSON.stringify(response));
        })
        .catch(function (err) {
            console.log(err);
            res.status(400).end(JSON.stringify(err));
        });
});
module.exports = router;