/**
 * Provides Article model.
 *
 * @module models
 * @submodule Article
 */

'use strict';

const models = require('./');
const { articleParser } = require('../src/LibertyParser');
/**
 * Model representing articles.
 *
 * @class Article
 */
module.exports = function(sequelize, DataTypes) {
  const Article = sequelize.define('article', {
    /**
     * Primary key.
     *
     * @property id
     * @type Number
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    /**
     * ID of namespace it belongs to.
     *
     * @property namespaceId
     * @type Number
     */
    namespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    /**
     * The title of this article.
     *
     * @property title
     * @type String
     */
    title: {
      type: DataTypes.STRING(128),
      allowNull: false
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
        return models.Namespace.joinNamespaceIdTitle(this.getDataValue('namespaceId'), this.getDataValue('title'));
      }
    },

    /**
     * Id  of latest revision.
     *
     * @property title
     * @type String
     */
    latestRevisionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    paranoid: true,
    indexes: [{
      unique: true, fields: ['namespaceId', 'title']
    }, {
      fields: ['lowercaseTitle']
    }],
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        Article.belongsTo(models.Namespace, { foreignKey: 'namespaceId' });
        Article.hasMany(models.Revision);
        Article.hasMany(models.Redirection, { foreignKey: 'destinationArticleId' });
        Article.hasMany(models.DiscussionTopic, { as: 'topics' });
      },

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
       *   Aritcle.createNew({ fullTitle: 'ns:title', author: 'author', wikitext: 'sample [[wikitext]]' });
       */
      async createNew({ fullTitle, ipAddress, author, wikitext, summary = '' }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        const article = await this.create({
          namespaceId: namespace.id,
          title: title
        });
        await models.Revision.createNew({ article, ipAddress, author, wikitext, type: 'CREATE', summary: summary? '(new) ' + summary: '(new)' });
        return article;
      },


      findByFullTitle(fullTitle) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return this.findOne({
          where: {
            namespaceId: namespace.id,
            title: title
          }
        });
      },

      randomQueryString: `SELECT r1.id, r1.namespaceId, r1.title
          FROM articles r1
          JOIN (SELECT CEIL(RAND() * (SELECT MAX(id) FROM articles)) AS id) r2
          WHERE r1.id >= r2.id and namespaceId = 0
          ORDER BY r1.id ASC
          LIMIT :limit`,

      findRandomly({ limit }) {
        return sequelize.query(this.randomQueryString, {
          replacements: { limit }, type: sequelize.QueryTypes.SELECT, model: this
        });
      },

      findQuery: `(
      	SELECT namespaceId, title, 0 as priority
      	FROM articles
      	WHERE namespaceId = :namespaceId AND title = :title AND deletedAt IS NULL
      )
      UNION ALL
      (
      	SELECT articles.namespaceId, articles.title, 1 as priority
      	FROM redirections, articles
      	WHERE sourceNamespaceId = :namespaceId AND sourceTitle = :title AND destinationArticleId = articles.id
      )
      UNION ALL
      (
      	SELECT namespaceId, title, 2 as priority
      	FROM articles
      	WHERE namespaceId = :namespaceId AND lowercaseTitle = :lowercaseTitle AND deletedAt IS NULL
      )
      UNION ALL
      (
      	SELECT articles.namespaceId, articles.title, 3 as priority
      	FROM redirections, articles
      	WHERE sourceNamespaceId = :namespaceId AND lowercaseSourceTitle = :lowercaseTitle AND destinationArticleId = articles.id
      )
      ORDER BY priority LIMIT 1`,

      findByFullTitleIncludeRedirection(fullTitle) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);

        return sequelize.query(this.findQuery, {
          replacements: {
            namespaceId: namespace.id,
            title: title,
            lowercaseTitle: title.toLowerCase()
          }, type: sequelize.QueryTypes.SELECT
        })
        .then(([result]) => {
          return result;
        });
      },

      existsIncludeRedirection(fullTitle) {
        return this.findByFullTitleIncludeRedirection(fullTitle)
        .then(result => !!result);
      }

    },
    instanceMethods: {
      /**
       * Get the latest revision.
       * @method getLatestRevision
       * @param {Object} option
       * @param {String} option.includeWikitext include wikitext instance.
       * @return {Promise<Revision>} Resolves latest revision.
       */
      getLatestRevision({ includeWikitext, transaction } = {}) {
        if (includeWikitext) {
          return models.Revision.findById(this.latestRevisionId, {
            include: [models.Wikitext]
          }, { transaction });
        } else {
          return models.Revision.findById(this.latestRevisionId, { transaction });
        }
      },

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
      edit({ ipAddress, author, wikitext, summary = '' }) {
        return models.Revision.createNew({ article: this, ipAddress, author, wikitext, type: 'EDIT', summary });
      },

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
      async rename({ ipAddress, author, newFullTitle, summary = '' }) {
        const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
        const revision = await models.Revision.createNew({ article: this, ipAddress, author, type: 'RENAME', newFullTitle, summary });
        await this.update({ namespaceId: namespace.id, title: title });
        return revision;
      },

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
      async delete({ ipAddress, author, summary }) {
        const revision = await models.Revision.createNew({ article: this, ipAddress, author, type: 'DELETE', summary });
        await this.destroy();
        return revision;
      },

      async addNewRedirection({ ipAddress, fullTitle, user }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        await models.Redirection.create({
          sourceNamespaceId: namespace.id,
          sourceTitle: title,
          destinationArticleId: this.id
        });
        await models.RedirectionLog.create({
          type: 'ADD',
          sourceNamespaceId: namespace.id,
          sourceTitle: title,
          destinationArticleId: this.id,
          user,
          ipAddress
        });
      },

      async deleteRedirection({ ipAddress, fullTitle, user }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        const redir = await models.Redirection.findOne({
          where: {
            sourceNamespaceId: namespace.id,
            sourceTitle: title,
            destinationArticleId: this.id
          }
        });
        await redir.destroy();
        await models.RedirectionLog.create({
          type: 'DELETE',
          sourceNamespaceId: namespace.id,
          sourceTitle: title,
          destinationArticleId: this.id,
          user,
          ipAddress
        });
      },

      /**
       * Render its latest wikitext to HTML.
       * @async
       * @return {Promise<RenderResult>} Resolves result of rendering.
       */
      render() {
        return articleParser.parseRender({ article: this });
      },

      allowedActions(/* user */) {
        return [
          'article:read',
          'article:edit',
          'article:rename',
          'discussion:read',
          'discussion:add-topic'
        ];
      },

    }
  });
  return Article;
};
