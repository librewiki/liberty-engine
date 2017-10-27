'use strict';

const LibertyModel = require('./LibertyModel');
const DataTypes = require('../DataTypes');
const QueryTypes = require('../QueryTypes');
const models = require('./');
const { articleParser } = require('../LibertyParser');
const validator = require('validator');
const errors = require('../errors');

const randomQuery =
`SELECT r1.id, r1.namespaceId, r1.title
  FROM article r1
  JOIN (SELECT CEIL(RAND() * (SELECT MAX(id) FROM article)) AS id) r2
  WHERE r1.id >= r2.id and namespaceId = 0
  ORDER BY r1.id ASC
  LIMIT :limit`;
const findQuery =
`(
  SELECT id, namespaceId, title, latestRevisionId, 0 as priority
  FROM article
  WHERE namespaceId = :namespaceId AND title = :title
)
UNION ALL
(
  SELECT id, article.namespaceId, article.title, latestRevisionId, 1 as priority
  FROM redirection, article
  WHERE sourceNamespaceId = :namespaceId AND sourceTitle = :title AND destinationArticleId = article.id
)
UNION ALL
(
  SELECT id, namespaceId, title, latestRevisionId, 2 as priority
  FROM article
  WHERE namespaceId = :namespaceId AND lowercaseTitle = :lowercaseTitle
)
UNION ALL
(
  SELECT id, article.namespaceId, article.title, latestRevisionId, 3 as priority
  FROM redirection, article
  WHERE sourceNamespaceId = :namespaceId AND lowercaseSourceTitle = :lowercaseTitle AND destinationArticleId = article.id
)
ORDER BY priority LIMIT 1`;

class Article extends LibertyModel {
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

      /**
       * ID of namespace it belongs to.
       *
       * @property namespaceId
       * @type Number
       */
      namespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'article_namespaceId_title_unique',
      },

      /**
       * The title of this article.
       *
       * @property title
       * @type String
       */
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: 'article_namespaceId_title_unique',
      },

      lowercaseTitle: 'VARCHAR(128) AS (lower(`title`)) PERSISTENT',

      /**
       * Full title of this article.
       *
       * @property title
       * @type String
       */
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

      /**
       * Id  of latest revision.
       *
       * @property title
       * @type String
       */
      latestRevisionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    };
  }
  static getOptions() {
    return {
      indexes: [
        {
          fields: ['lowercaseTitle'],
        },
        {
          fields: ['updatedAt'],
        },
      ],
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    Article.belongsTo(models.Namespace);
    Article.hasMany(models.Revision);
    Article.hasMany(models.Redirection, {
      foreignKey: 'destinationArticleId',
    });
    Article.hasMany(models.DiscussionTopic, {
      as: 'discussionTopics',
    });
    Article.hasOne(models.MediaFile, {
      foreignKey: 'descriptionArticleId',
    });
    Article.hasOne(models.ArticleSearch);
    Article.hasMany(models.ArticleLink, {
      foreignKey: 'sourceArticleId',
    });
    Article.hasMany(models.CategoryLink, {
      foreignKey: 'sourceArticleId',
    });
    Article.hasMany(models.FileLink, {
      foreignKey: 'sourceArticleId',
    });
    Article.hasOne(models.ArticleSearch);
  }

  static validateFullTitle(fullTitle) {
    if (typeof fullTitle !== 'string') {
      return false;
    }
    if (fullTitle.length === 0) {
      return false;
    }
    if (fullTitle.startsWith(' ') || fullTitle.endsWith(' ')) {
      return false;
    }
    const { title } = models.Namespace.splitFullTitle(fullTitle);
    return this.validateTitle(title);
  }

  static validateTitle(title) {
    if (title.startsWith(' ') || title.endsWith(' ')) {
      return false;
    }
    if (models.Namespace.splitFullTitle(title).namespace.id !== 0) {
      return false;
    }
    if (title.startsWith(':')) {
      return false;
    }
    if (validator.stripLow(title) !== title) {
      // includes ascii control characters and newline characters
      return false;
    }
    return true;
  }

  static findByFullTitle(fullTitle) {
    const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
    return this.findOne({
      where: {
        namespaceId: namespace.id,
        title,
      },
    });
  }

  static findRandomly({ limit = 1 } = {}) {
    return this.sequelize.query(randomQuery, {
      replacements: { limit },
      type: QueryTypes.SELECT,
      model: this,
    });
  }

  /**
   * @method findByFullTitleWithRedirection
   * @async
   * @static
   */
  static async findByFullTitleWithRedirection({ fullTitle, caseSensitive = false }) {
    const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
    const [article] = await this.sequelize.query(findQuery, {
      replacements: {
        namespaceId: namespace.id,
        title,
        lowercaseTitle: title.toLowerCase(),
      },
      type: QueryTypes.SELECT,
      model: this,
    });
    if (!article) {
      return null;
    }
    let type;
    switch (article.dataValues.priority) {
      case 0:
        type = 'EXACT';
        break;
      case 1:
        type = 'REDIRECTION';
        break;
      case 2:
        if (caseSensitive) {
          return null;
        }
        type = 'CASE_INSENSITIVE';
        break;
      case 3:
        if (caseSensitive) {
          return null;
        }
        type = 'CASE_INSENSITIVE_REDIRECTION';
        break;
      default:
        throw new Error('Query Error.');
    }
    return { article, type };
  }

  /**
   * @method existsWithRedirection
   * @async
   * @static
   */
  static async existsWithRedirection({ fullTitle, caseSensitive }) {
    return !!await this.findByFullTitleWithRedirection({ fullTitle, caseSensitive });
  }

  /**
   * Create a new article.
   * @method createNew
   * @async
   * @static
   * @param {Object} option
   * @param {String} option.fullTitle full title of an article.
   * @param {User} option.author user writing this.
   * @param {String} option.wikitext wikitext.
   * @param {String} [option.summary] summary.
   * @return {Promise<Article>} Resolves new article.
   * @example
   *   Aritcle.createNew({
   *     fullTitle: 'ns:title',
   *     author: 'author',
   *     wikitext: 'sample [[wikitext]]'
   *   });
   */
  static createNew({
    fullTitle, ipAddress, author, wikitext, summary = '', transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      if (!this.validateFullTitle(fullTitle)) {
        throw new errors.MalformedTitleError();
      }
      const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
      const article = await this.create({
        namespaceId: namespace.id,
        title,
      }, { transaction });
      await models.Revision.createToCreateArticle({
        article,
        ipAddress,
        author,
        wikitext,
        summary,
        transaction,
      });
      await Article.update({
        updatedAt: this.sequelize.fn('NOW'),
      }, {
        where: {
          id: this.id,
        },
        transaction,
      });
      return article;
    });
  }

  /**
   * Get the latest revision.
   * @method getLatestRevision
   * @async
   * @param {Object} option
   * @param {String} option.includeWikitext include wikitext instance.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  getLatestRevision({ includeWikitext, transaction } = {}) {
    return this.autoTransaction(transaction, async (transaction) => {
      if (includeWikitext) {
        return models.Revision.findById(this.latestRevisionId, {
          include: [models.Wikitext],
        }, { transaction });
      }
      return models.Revision.findById(this.latestRevisionId, { transaction });
    });
  }

  /**
   * Update with new revision and wikitext.
   * @method edit
   * @async
   * @param {Object} option
   * @param {String} option.ipAddress ip address.
   * @param {User} option.author author.
   * @param {String} option.wikitext wikitext.
   * @param {String} [option.summary] summary.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  edit({
    ipAddress, author, wikitext, summary = '', transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const revision = await models.Revision.createToEditArticle({
        article: this,
        ipAddress,
        author,
        wikitext,
        summary,
        transaction,
      });
      return revision;
    });
  }

  /**
   * Rename this article and add a new revision.
   * @method rename
   * @async
   * @param {Object} option
   * @param {String} option.ipAddress ip address.
   * @param {User} option.user user.
   * @param {String} option.newFullTitle full title to change into.
   * @param {String} [option.summary] summary.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  rename({
    ipAddress, user, newFullTitle, summary = '', transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
      await models.ArticleRenameLog.create({
        oldNamespaceId: this.namespaceId,
        oldTitle: this.title,
        newNamespaceId: namespace.id,
        newTitle: title,
        summary,
        userId: user.id,
        ipAddress,
      }, { transaction });
      const revision = await models.Revision.createToRenameArticle({
        article: this,
        ipAddress,
        author: user,
        newFullTitle,
        summary,
        transaction,
      });
      await this.update({
        namespaceId: namespace.id,
        title,
      }, { transaction });
      return revision;
    });
  }

  /**
   * Remove this article.
   * @method delete
   * @async
   * @param {Object} option
   * @param {String} option.ipAddress ip address.
   * @param {User} option.user user.
   * @param {String} [option.summary] summary.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  delete({
    ipAddress, user, summary, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      await models.ArticleDeleteLog.create({
        namespaceId: this.namespaceId,
        title: this.title,
        summary,
        userId: user.id,
        ipAddress,
      }, { transaction });
      const revisions = await this.getRevisions({ transaction });
      for (const revision of revisions) {
        await models.RevisionArchive.create({
          articleId: this.id,
          namespaceId: this.namespaceId,
          title: this.title,
          revisionId: revision.id,
          revisionCreatedAt: revision.createdAt,
          wikitextId: revision.wikitextId,
          changedLength: revision.changedLength,
          type: revision.type,
          summary: revision.summary,
          authorId: revision.authorId,
          ipAddress: revision.ipAddress,
        }, { transaction });
      }
      for (const revision of revisions) {
        await revision.destroy({ transaction });
      }
      await models.ArticleSearch.destroy({
        where: {
          articleId: this.id,
        },
        transaction,
      });
      await this.destroy({ transaction });
    });
  }

  addNewRedirection({
    ipAddress, fullTitle, user, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
      await models.Redirection.create({
        sourceNamespaceId: namespace.id,
        sourceTitle: title,
        destinationArticleId: this.id,
        transaction,
      });
      await models.RedirectionLog.create({
        type: 'ADD',
        sourceNamespaceId: namespace.id,
        sourceTitle: title,
        destinationArticleId: this.id,
        user,
        ipAddress,
        transaction,
      });
      await Article.update({
        updatedAt: this.sequelize.fn('NOW'),
      }, {
        where: {
          id: this.id,
        },
        transaction,
      });
    });
  }

  deleteRedirection({
    ipAddress, fullTitle, user, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
      const redir = await models.Redirection.findOne({
        where: {
          sourceNamespaceId: namespace.id,
          sourceTitle: title,
          destinationArticleId: this.id,
        },
        transaction,
      });
      await redir.destroy({ transaction });
      await models.RedirectionLog.create({
        type: 'DELETE',
        sourceNamespaceId: namespace.id,
        sourceTitle: title,
        destinationArticleId: this.id,
        user,
        ipAddress,
      }, { transaction });
      await Article.update({
        updatedAt: this.sequelize.fn('NOW'),
      }, {
        where: {
          id: this.id,
        },
        transaction,
      });
    });
  }

  /**
   * Render its latest wikitext to HTML.
   * @async
   * @return {Promise<RenderResult>} Resolves result of rendering.
   */
  render() {
    return articleParser.parseRender({ article: this });
  }

  async getAllowedActions(user) {
    return (await Promise.all([
      user.isReadable(this).then(able => (able ? 'article:read' : null)),
      user.isEditable(this).then(able => (able ? 'article:edit' : null)),
      user.isRenamable(this).then(able => (able ? 'article:rename' : null)),
      user.isDeletable(this).then(able => (able ? 'article:delete' : null)),
      'discussion:read',
      'discussion:add-topic',
    ])).filter(item => item !== null);
  }
}

module.exports = Article;
