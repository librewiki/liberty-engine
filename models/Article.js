'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');
const { articleParser } = require('../src/LibertyParser');

const randomQuery =
`SELECT r1.id, r1.namespaceId, r1.title
  FROM article r1
  JOIN (SELECT CEIL(RAND() * (SELECT MAX(id) FROM article)) AS id) r2
  WHERE r1.id >= r2.id and namespaceId = 0
  ORDER BY r1.id ASC
  LIMIT :limit`;
const findQuery =
`(
  SELECT namespaceId, title, 0 as priority
  FROM article
  WHERE namespaceId = :namespaceId AND title = :title AND deletedAt IS NULL
)
UNION ALL
(
  SELECT article.namespaceId, article.title, 1 as priority
  FROM redirection, article
  WHERE sourceNamespaceId = :namespaceId AND sourceTitle = :title AND destinationArticleId = article.id
)
UNION ALL
(
  SELECT namespaceId, title, 2 as priority
  FROM article
  WHERE namespaceId = :namespaceId AND lowercaseTitle = :lowercaseTitle AND deletedAt IS NULL
)
UNION ALL
(
  SELECT article.namespaceId, article.title, 3 as priority
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.STRING(128),
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
        type: Sequelize.VIRTUAL,
        get() {
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
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    };
  }
  static getOptions() {
    return {
      paranoid: true,
      indexes: [{
        fields: ['lowercaseTitle'],
      }],
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
      as: 'topics',
    });
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
      type: Sequelize.QueryTypes.SELECT,
      model: this,
    });
  }

  /**
   * @method findByFullTitleIncludeRedirection
   * @async
   * @static
   */
  static async findByFullTitleIncludeRedirection(fullTitle) {
    const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
    const [result] = await this.sequelize.query(findQuery, {
      replacements: {
        namespaceId: namespace.id,
        title,
        lowercaseTitle: title.toLowerCase(),
      },
      type: Sequelize.QueryTypes.SELECT,
    });
    return result;
  }
  /**
   * @method existsIncludeRedirection
   * @async
   * @static
   */
  static async existsIncludeRedirection(fullTitle) {
    return !!await this.findByFullTitleIncludeRedirection(fullTitle);
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
    return this.autoTransaction(transaction, async () => {
      const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
      const article = await this.create({
        namespaceId: namespace.id,
        title,
      }, { transaction });
      await models.Revision.createNew({
        article,
        ipAddress,
        author,
        wikitext,
        type: 'CREATE',
        summary: summary ? `(new) ${summary}` : '(new)',
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
    return this.autoTransaction(transaction, async () => {
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
    return this.autoTransaction(transaction, () => models.Revision.createNew({
      article: this,
      ipAddress,
      author,
      wikitext,
      type: 'EDIT',
      summary,
      transaction,
    }));
  }

  /**
   * Rename this article and add a new revision.
   * @method rename
   * @async
   * @param {Object} option
   * @param {String} option.ipAddress ip address.
   * @param {User} option.author author.
   * @param {String} option.newFullTitle full title to change into.
   * @param {String} [option.summary] summary.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  rename({
    ipAddress, author, newFullTitle, summary = '', transaction,
  }) {
    return this.autoTransaction(transaction, async () => {
      const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
      const revision = await models.Revision.createNew({
        article: this,
        ipAddress,
        author,
        type: 'RENAME',
        newFullTitle,
        summary,
        transaction,
      });
      await this.update({
        namespaceId: namespace.id,
        title,
        transaction,
      });
      return revision;
    });
  }

  /**
   * Remove this article.
   * @method delete
   * @async
   * @param {Object} option
   * @param {String} option.ipAddress ip address.
   * @param {User} option.author author.
   * @param {String} [option.summary] summary.
   * @return {Promise<Revision>} Resolves latest revision.
   */
  delete({ ipAddress, author, summary, transaction }) {
    return this.autoTransaction(transaction, async () => {
      const revision = await models.Revision.createNew({
        article: this,
        ipAddress,
        author,
        type: 'DELETE',
        summary,
        transaction,
      });
      await this.destroy({ transaction });
      return revision;
    });
  }
  addNewRedirection({ ipAddress, fullTitle, user, transaction }) {
    return this.autoTransaction(transaction, async () => {
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
    });
  }

  deleteRedirection({ ipAddress, fullTitle, user, transaction }) {
    return this.autoTransaction(transaction, async () => {
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

  // eslint-disable-next-line
  allowedActions(/* user */) {
    return [
      'article:read',
      'article:edit',
      'article:rename',
      'discussion:read',
      'discussion:add-topic',
    ];
  }
}

module.exports = Article;
