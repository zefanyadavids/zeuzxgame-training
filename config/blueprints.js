/**
 * Blueprint API Configuration
 * (sails.config.blueprints)
 *
 * For background on the blueprint API in Sails, check out:
 * https://sailsjs.com/docs/reference/blueprint-api
 *
 * For details and more available options, see:
 * https://sailsjs.com/config/blueprints
 */

module.exports.blueprints = {
  ember: {
    sideload: true
  },

  /***************************************************************************
  *                                                                          *
  * Automatically expose implicit routes for every action in your app?       *
  *                                                                          *
  ***************************************************************************/

  actions: true,


  /***************************************************************************
  *                                                                          *
  * Automatically expose RESTful routes for your models?                     *
  *                                                                          *
  ***************************************************************************/

  rest: true,


  /***************************************************************************
  *                                                                          *
  * Automatically expose CRUD "shortcut" routes to GET requests?             *
  * (These are enabled by default in development only.)                      *
  *                                                                          *
  ***************************************************************************/

  // shortcuts: true,

  prefix: '/api/v1',

    /***************************************************************************
     *                                                                          *
     * Whether to pluralize controller names in blueprint routes.               *
     *                                                                          *
     * (NOTE: This only applies to blueprint autoroutes, not manual routes from *
     * `sails.config.routes`)                                                   *
     *                                                                          *
     * For example, REST blueprints for `FooController` with `pluralize`        *
     * enabled:                                                                 *
     * GET /foos/:id?                                                           *
     * POST /foos                                                               *
     * PUT /foos/:id?                                                           *
     * DELETE /foos/:id?                                                        *
     *                                                                          *
     ***************************************************************************/

    pluralize: true,

    /***************************************************************************
     *                                                                          *
     * Whether the blueprint controllers should populate model fetches with     *
     * data from other models which are linked by associations                  *
     *                                                                          *
     * If you have a lot of data in one-to-many associations, leaving this on   *
     * may result in very heavy api calls                                       *
     *                                                                          *
     ***************************************************************************/

    // populate: true,

    /****************************************************************************
     *                                                                           *
     * Whether to run Model.watch() in the find and findOne blueprint actions.   *
     * Can be overridden on a per-model basis.                                   *
     *                                                                           *
     ****************************************************************************/

    // autoWatch: true,

    /****************************************************************************
     *                                                                           *
     * The default number of records to show in the response from a "find"       *
     * action. Doubles as the default size of populated arrays if populate is    *
     * true.                                                                     *
     *                                                                           *
     ****************************************************************************/

    // defaultLimit: 9999
    parseBlueprintOptions: function(req) {

      // Get the default query options.
      var queryOptions = req._sails.hooks.blueprints.parseBlueprintOptions(req);

      // If this is the "find" or "populate" blueprint action, and the normal query options
      // indicate that the request is attempting to set an exceedingly high `limit` clause,
      // then prevent it (we'll say `limit` must not exceed 100).
      if (req.options.blueprintAction === 'find' || req.options.blueprintAction === 'populate') {
        if (queryOptions.criteria.limit > 30) {
          queryOptions.criteria.limit = 1000;
        }
      }

      return queryOptions;

    }
};
