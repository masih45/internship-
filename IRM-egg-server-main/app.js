'use strict';

module.exports = app => {
  app.beforeStart(async () => {
    // ⚠️ Sync all models to the DB — for dev only
  });
};
