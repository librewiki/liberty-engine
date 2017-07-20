'use strict';

const LibertyModel = require('./LibertyModel');
const DataTypes = require('../DataTypes');
const EditingParser = require('../LibertyParser/src/Parser/EditingParser');
const models = require('./');

class Revision extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    this.belongsTo(models.Article);
    this.belongsTo(models.User, {
      as: 'author',
      foreignKey: { allowNull: true },
    });
    this.hasOne(models.RenameLog, {
      onDelete: 'CASCADE', onUpdate: 'CASCADE',
    });
  }

  static async initialize() {
    this.caches = [];
    const revisions = await this.findAll({
      limit: 50,
      order: [['id', 'DESC']],
    });
    revisions.reverse();
    for (const rev of revisions) {
      await this.insertCache({ revisionId: rev.id });
    }
  }

  static createToCreateArticle({
    article, author, ipAddress, wikitext, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, author, wikitext });
      const wikitextInstance = await models.Wikitext.create({
        text: replacedText,
      }, { transaction });
      const parser = new EditingParser();
      const renderResult = await parser.parseRender({ wikitext: replacedText, article });
      const links = Array.from(renderResult.link.articles).map((fullTitle) => {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return {
          destinationNamespaceId: namespace.id,
          destinationTitle: title,
          sourceArticleId: article.id,
        };
      });
      await models.ArticleLink.destroy({
        where: {
          sourceArticleId: article.id,
        },
        transaction,
      });
      await models.ArticleLink.bulkCreate(links, { transaction });
      const newRevision = await this.create({
        authorId: author.id,
        articleId: article.id,
        wikitextId: wikitextInstance.id,
        changedLength: wikitextInstance.text.length,
        ipAddress,
        type: 'CREATE',
        summary,
      }, { transaction });
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      return newRevision;
    });
  }

  static createToEditArticle({
    article, author, ipAddress, wikitext, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      const replacedText = await models.Wikitext.replaceOnSave({
        ipAddress,
        author,
        wikitext,
      });
      const parser = new EditingParser();
      const renderResult = await parser.parseRender({ wikitext: replacedText, article });
      const links = Array.from(renderResult.link.articles).map((fullTitle) => {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return {
          destinationNamespaceId: namespace.id,
          destinationTitle: title,
          sourceArticleId: article.id,
        };
      });
      await models.ArticleLink.destroy({
        where: {
          sourceArticleId: article.id,
        },
        transaction,
      });
      await models.ArticleLink.bulkCreate(links, { transaction });
      const baseRevision = await article.getLatestRevision({
        includeWikitext: true,
        transaction,
      });
      const wikitextInstance = await models.Wikitext.create({ text: replacedText });
      const newRevision = await this.create({
        authorId: author.id,
        articleId: article.id,
        wikitextId: wikitextInstance.id,
        changedLength: wikitextInstance.text.length - baseRevision.wikitext.text.length,
        ipAddress,
        type: 'EDIT',
        summary,
      }, { transaction });
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      return newRevision;
    });
  }

  static createToRenameArticle({
    article, author, ipAddress, newFullTitle, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
      const baseRevision = await article.getLatestRevision({
        includeWikitext: false,
        transaction,
      });
      const newRevision = await this.create({
        authorId: author.id,
        changedLength: 0,
        wikitextId: baseRevision.wikitextId,
        articleId: article.id,
        ipAddress,
        type: 'RENAME',
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
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      return newRevision;
    });
  }

  static createToDeleteArticle({
    article, author, ipAddress, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      await models.ArticleLink.destroy({
        where: {
          sourceArticleId: article.id,
        },
        transaction,
      });
      const baseRevision = await article.getLatestRevision({
        includeWikitext: true,
        transaction,
      });
      const newRevision = await this.create({
        authorId: author.id,
        changedLength: -baseRevision.wikitext.text.length,
        wikitextId: null,
        articleId: article.id,
        ipAddress,
        type: 'DELETE',
        summary,
      }, { transaction });
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      return newRevision;
    });
  }

  static getRecentDistinctRevisions({ limit = 50 }) {
    return this.caches.slice(0, limit);
  }
  static async insertCache({ revisionId, transaction }) {
    return this.autoTransaction(transaction, async () => {
      const revision = await Revision.findById(revisionId, {
        include: [Revision.associations.author, Revision.associations.article],
        transaction,
      });
      let dupl = null;
      for (let i = 0; i < this.caches.length; i += 1) {
        if (this.caches[i].articleId === revision.articleId) {
          dupl = i;
          break;
        }
      }
      if (dupl !== null) {
        this.caches.splice(dupl, 1);
      }
      this.caches.unshift(revision);
      if (this.caches.length > 50) {
        this.caches.length = 50;
      }
    });
  }
}

Revision.caches = [];

module.exports = Revision;
