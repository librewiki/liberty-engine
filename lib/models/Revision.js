'use strict';

const striptags = require('striptags');
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
      wikitextId: {
        type: DataTypes.INTEGER,
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
      updatedAt: false,
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Wikitext);
    this.belongsTo(models.Article);
    this.belongsTo(models.User, {
      as: 'author',
      foreignKey: { allowNull: true },
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
    article, author, ipAddress, wikitext, summary, transaction, createdAt,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, author, wikitext });
      const wikitextInstance = await models.Wikitext.create({
        text: replacedText,
      }, { transaction });
      const parser = new EditingParser();
      const renderResult = await parser.parseRender({ wikitext: replacedText, article });
      await models.ArticleLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.articles,
        transaction,
      });
      await models.FileLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.files,
        transaction,
      });
      await models.CategoryLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.categories,
        transaction,
      });
      const newRevision = await this.create({
        authorId: author.id,
        articleId: article.id,
        wikitextId: wikitextInstance.id,
        changedLength: wikitextInstance.text.length,
        ipAddress,
        type: 'CREATE',
        createdAt: createdAt ? createdAt.toDate() : null,
        summary: summary ? `New article: ${summary}` : 'New article',
      }, { transaction });
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      await models.ArticleSearch.create({
        articleId: article.id,
        content: striptags(renderResult.html).trim(),
      }, { transaction });
      return newRevision;
    });
  }

  static createToEditArticle({
    article, author, ipAddress, wikitext, summary, createdAt, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const replacedText = await models.Wikitext.replaceOnSave({
        ipAddress,
        author,
        wikitext,
      });
      const parser = new EditingParser();
      const renderResult = await parser.parseRender({ wikitext: replacedText, article });
      await models.ArticleLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.articles,
        transaction,
      });
      await models.FileLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.files,
        transaction,
      });
      await models.CategoryLink.updateLinks({
        sourceArticle: article,
        linkSet: renderResult.link.categories,
        transaction,
      });
      const baseRevision = await article.getLatestRevision({
        includeWikitext: true,
        transaction,
      });
      const wikitextInstance = await models.Wikitext.create({
        text: replacedText,
      }, { transaction });
      const newRevision = await this.create({
        authorId: author.id,
        articleId: article.id,
        wikitextId: wikitextInstance.id,
        changedLength: wikitextInstance.text.length - baseRevision.wikitext.text.length,
        ipAddress,
        type: 'EDIT',
        createdAt: createdAt ? createdAt.toDate() : null,
        summary,
      }, { transaction });
      await article.update({
        latestRevisionId: newRevision.id,
      }, { transaction });
      await this.insertCache({ revisionId: newRevision.id, transaction });
      await models.ArticleSearch.upsert({
        articleId: article.id,
        content: striptags(renderResult.html).trim(),
      }, { transaction });
      return newRevision;
    });
  }

  static createToRenameArticle({
    article, author, ipAddress, newFullTitle, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
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
        summary: summary ? `Rename ${article.fullTitle} -> ${newFullTitle}: ${summary}` : `Rename ${article.fullTitle} -> ${newFullTitle}`,
      }, {
        transaction,
      });
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
    return this.autoTransaction(transaction, async (transaction) => {
      const revision = await Revision.findByPk(revisionId, {
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
