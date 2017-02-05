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
    createdAt: false,
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
       * @static
       * @param {Object} option
       * @param {User} option.article an article to change.
       * @param {User} option.author user writing this.
       * @param {String} option.wikitext wikitext.
       * @param {String} option.ipAddress IP address of request.
       * @param {String} option.type one of 'new', 'updated', 'renamed', or 'deleted'.
       * @param {String} option.destinationFullTitle full title to rename.
       * @return {Promise<Revision>} Returns a promise of new revision.
       */
      createNew({ article, author, ipAddress, wikitext, type, newFullTitle, summary }) {
        return Promise.resolve()
        .then(() => {
          switch (type) {
            case 'CREATE': {
              return models.Wikitext.replaceOnSave({ ipAddress, article, author, wikitext, type })
              .then((replacedText) => {
                return models.Wikitext.create({ text: replacedText })
                .then((wikitextInstance) => {
                  return this.create({
                    authorId: author.id,
                    articleId: article.id,
                    wikitextId: wikitextInstance.id,
                    changedLength: wikitextInstance.text.length,
                    ipAddress,
                    type,
                    summary
                  });
                });
              });
            }
            case 'UPDATE': {
              return models.Wikitext.replaceOnSave({ ipAddress, article, author, wikitext, type })
              .then((replacedText) => {
                return article.getLatestRevision({ includeWikitext: true })
                .then((baseRevision) => {
                  return models.Wikitext.create({ text: replacedText })
                  .then((wikitextInstance) => {
                    return this.create({
                      authorId: author.id,
                      articleId: article.id,
                      wikitextId: wikitextInstance.id,
                      changedLength: wikitextInstance.text.length - baseRevision.wikitext.text.length,
                      ipAddress,
                      type,
                      summary
                    });
                  });
                });
              });
            }
            case 'RENAME': {
              const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
              return article.getLatestRevision({ includeWikitext: false })
              .then((baseRevision) => {
                return this.create({
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
              });
            }
            case 'DELETE': {
              return article.getLatestRevision({ includeWikitext: true })
              .then((baseRevision) => {
                return this.create({
                  authorId: author.id,
                  changedLength: -baseRevision.wikitext.text.length,
                  wikitextId: null,
                  articleId: article.id,
                  ipAddress,
                  type,
                  summary
                });
              });
            }
            default:
              throw new TypeError('No such type');
          }
        })
        .then((newRevision) => {
          return article.update({ latestRevisionId: newRevision.id });
        });
      }
    }
  });
  return Revision;
};
