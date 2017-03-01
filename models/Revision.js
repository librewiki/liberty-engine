/**
 * Provides Revision model.
 *
 * @module models
 * @submodule Revision
 */

'use strict';

const ip = require('ip');
const models = require('./');

/**
 * Model representing revisions.
 *
 * @class Revision
 */
module.exports = function(sequelize, DataTypes) {
  const Revision = sequelize.define('revision', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    changedLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'RENAME', 'DELETE'),
      validation: {
        isIn: [['CREATE', 'UPDATE', 'RENAME', 'DELETE']]
      },
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: ''
    },
    ipAddress: {
      type: 'VARBINARY(16)',
      allowNull: false,
      set(ipAddress) {
        this.setDataValue('ipAddress', ip.toBuffer(ipAddress));
      },
      get() {
        return ip.toString(this.getDataValue('ipAddress'));
      }
    }
  }, {
    updatedAt: false,
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        Revision.belongsTo(models.Wikitext, {
          foreignKey: { allowNull: true }
        });
        Revision.belongsTo(models.Article, {
          foreignKey: { allowNull: false }
        });
        Revision.belongsTo(models.User, {
          as: 'author',
          foreignKey: { allowNull: true }
        });
        Revision.hasOne(models.RenameLog, {
          onDelete: 'CASCADE', onUpdate: 'CASCADE'
        });
      },

      /**
       * Create a new revision and make it latest revision of an article.
       * @method createNew
       * @async
       * @static
       * @param {Object} option
       * @param {User} option.article an article to change.
       * @param {User} option.author user writing this.
       * @param {String} option.wikitext wikitext.
       * @param {String} option.ipAddress IP address of request.
       * @param {String} option.type one of 'new', 'updated', 'renamed', or 'deleted'.
       * @param {String} option.destinationFullTitle full title to rename.
       * @return {Promise<Revision>} Resolves new revision.
       */
      async createNew({ article, author, ipAddress, wikitext, type, newFullTitle, summary }) {
        let newRevision;
        switch (type) {
          case 'CREATE': {
            const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, article, author, wikitext, type });
            const wikitextInstance = await models.Wikitext.create({ text: replacedText });
            newRevision = await this.create({
              authorId: author.id,
              articleId: article.id,
              wikitextId: wikitextInstance.id,
              changedLength: wikitextInstance.text.length,
              ipAddress,
              type,
              summary
            });
            break;
          }
          case 'UPDATE': {
            const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, article, author, wikitext, type });
            const baseRevision = await article.getLatestRevision({ includeWikitext: true });
            const wikitextInstance = await models.Wikitext.create({ text: replacedText });
            newRevision = await this.create({
              authorId: author.id,
              articleId: article.id,
              wikitextId: wikitextInstance.id,
              changedLength: wikitextInstance.text.length - baseRevision.wikitext.text.length,
              ipAddress,
              type,
              summary
            });
            break;
          }
          case 'RENAME': {
            const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
            const baseRevision = await article.getLatestRevision({ includeWikitext: false });
            newRevision = await this.create({
              authorId: author.id,
              changedLength: 0,
              wikitextId: baseRevision.wikitextId,
              articleId: article.id,
              ipAddress,
              type,
              summary,
              renameLog: {
                oldNamespaceId: article.namespaceId,
                oldTitle: article.title,
                newNamespaceId: namespace.id,
                newTitle: title
              }
            }, {
              include: [models.RenameLog]
            });
            break;
          }
          case 'DELETE': {
            const baseRevision = await article.getLatestRevision({ includeWikitext: true });
            newRevision = await this.create({
              authorId: author.id,
              changedLength: -baseRevision.wikitext.text.length,
              wikitextId: null,
              articleId: article.id,
              ipAddress,
              type,
              summary
            });
            break;
          }
          default:
            throw new TypeError('No such type');
        }
        await article.update({ latestRevisionId: newRevision.id });
        return newRevision;
      }
    }
  });
  return Revision;
};
