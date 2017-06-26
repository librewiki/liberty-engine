'use strict';

const LibertyModel = require('./LibertyModel');
const DataTypes = require('../src/DataTypes');
const models = require('./');

class Revision extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      changedLength: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: DataTypes.ENUM('CREATE', 'EDIT', 'RENAME', 'DELETE'),
        validation: {
          isIn: [['CREATE', 'EDIT', 'RENAME', 'DELETE']],
        },
        allowNull: false,
      },
      summary: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: '',
      },
      ipAddress: DataTypes.ipAddress(),
    };
  }
  static getOptions() {
    return {
      updatedAt: false,
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Wikitext, {
      foreignKey: { allowNull: true },
    });
    this.belongsTo(models.Article, {
      foreignKey: { allowNull: false },
    });
    this.belongsTo(models.User, {
      as: 'author',
      foreignKey: { allowNull: true },
    });
    this.hasOne(models.RenameLog, {
      onDelete: 'CASCADE', onUpdate: 'CASCADE',
    });
  }
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
  static async createNew({
    article, author, ipAddress, wikitext, type, newFullTitle, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      let newRevision;
      switch (type) {
        case 'CREATE': {
          const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, author, wikitext });
          const wikitextInstance = await models.Wikitext.create({
            text: replacedText,
          }, { transaction });
          newRevision = await this.create({
            authorId: author.id,
            articleId: article.id,
            wikitextId: wikitextInstance.id,
            changedLength: wikitextInstance.text.length,
            ipAddress,
            type,
            summary,
          }, { transaction });
          break;
        }
        case 'EDIT': {
          const replacedText = await models.Wikitext.replaceOnSave({
            ipAddress,
            author,
            wikitext,
          });
          const baseRevision = await article.getLatestRevision({
            includeWikitext: true,
            transaction,
          });
          const wikitextInstance = await models.Wikitext.create({ text: replacedText });
          newRevision = await this.create({
            authorId: author.id,
            articleId: article.id,
            wikitextId: wikitextInstance.id,
            changedLength: wikitextInstance.text.length - baseRevision.wikitext.text.length,
            ipAddress,
            type,
            summary,
          }, { transaction });
          break;
        }
        case 'RENAME': {
          const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
          const baseRevision = await article.getLatestRevision({
            includeWikitext: false,
            transaction,
          });
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
              newTitle: title,
            },
          }, {
            include: [models.RenameLog],
            transaction,
          });
          break;
        }
        case 'DELETE': {
          const baseRevision = await article.getLatestRevision({
            includeWikitext: true,
            transaction,
          });
          newRevision = await this.create({
            authorId: author.id,
            changedLength: -baseRevision.wikitext.text.length,
            wikitextId: null,
            articleId: article.id,
            ipAddress,
            type,
            summary,
          }, { transaction });
          break;
        }
        default:
          throw new TypeError('No such type');
      }
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      return newRevision;
    });
  }
}

module.exports = Revision;
