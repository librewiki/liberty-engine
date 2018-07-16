'use strict';

const LibertyModel = require('./LibertyModel');
const DataTypes = require('../DataTypes');
const models = require('./');

class RevisionArchive extends LibertyModel {
  static getAttributes() {
    return {
      /**
       * Primary key.
       *
       * @property id
       * @type Number
       */
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      namespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },

      fullTitle: {
        type: DataTypes.VIRTUAL,
        get() {
          if (
            this.getDataValue('namespaceId') === null
            || this.getDataValue('namespaceId') === undefined
            || this.getDataValue('title') === null
            || this.getDataValue('title') === undefined
          ) {
            return undefined;
          }
          return models.Namespace.joinNamespaceIdTitle(this.getDataValue('namespaceId'), this.getDataValue('title'));
        },
      },

      revisionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      revisionCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      changedLength: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      type: {
        type: DataTypes.ENUM('CREATE', 'EDIT', 'RENAME'),
        validation: {
          isIn: [['CREATE', 'EDIT', 'RENAME']],
        },
        allowNull: false,
      },

      summary: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: '',
      },

      authorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ipAddress: DataTypes.ipAddress(),
    };
  }

  static getOptions() {
    return {
      timestamps: false,
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
  }
}

module.exports = RevisionArchive;
