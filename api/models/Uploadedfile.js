/**
 * Uploadedfile.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "seller_uploadedfile",
	attributes: {
		UUID: {
			type: 'string'
		},
		sourceNum: {
			type: 'number', columnType: 'integer', allowNull: true
		},
		sourceName: {
			type: 'string', allowNull: true
		},
		filePath: {
			type: 'string'
		},
		fileType: {
			type: 'string'
    },
    name: {
      type: "string", allowNull: true
    },
    size: {
      type: "number", allowNull: true
    },

		createdBy: {
      // model: 'user'
      type: "number", columnType: "integer", allowNull: true
		},
		updatedBy: {
      // model: 'user'
      type: "number", columnType: "integer", allowNull: true
		}
	}
};

