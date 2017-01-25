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
        Article.hasMany(models.Revision, { as: 'histories' });
        Article.hasMany(models.Redirection, { foreignKey: 'destinationArticleId' });
      },

      /**
       * Create a new article.
       * @method createNew
       * @static
       * @param {Object} option
       * @param {String} option.fullTitle full title of an article.
       * @param {User} option.author user writing this.
       * @param {String} option.text wikitext.
       * @param {String} [option.summary] summary.
       * @return {Promise<Article>} Resolves new article.
       * @example
       *   Aritcle.createNew({ fullTitle: 'ns:title', author: 'author', wikitext: 'sample [[wikitext]]' });
       */
      createNew({ fullTitle, ipAddress, author, text, summary = '' }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return this.create({
          namespaceId: namespace.id,
          title: title
        })
        .then((article) => {
          return models.Revision.createNew({ article, ipAddress, author, text, status: 'new', summary: 'new: ' + summary });
        });
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

      findByFullTitleCaseInsensitive(fullTitle) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return this.findOne({
          where: {
            namespaceId: namespace.id,
            lowercaseTitle: title.toLowerCase()
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

      exists(fullTitle) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);

        let findQuery = `(
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
        ORDER BY priority LIMIT 1`;

        return sequelize.query(findQuery, {
          replacements: {
            namespaceId: namespace.id,
            title: title,
            lowercaseTitle: title.toLowerCase()
          }, type: sequelize.QueryTypes.SELECT
        })
        .then(([result]) => {
          return !!result;
        });
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
      getLatestRevision({ includeWikitext } = {}) {
        if (includeWikitext) {
          return models.Revision.findById(this.latestRevisionId, {
            include: [models.Wikitext]
          });
        } else {
          return models.Revision.findById(this.latestRevisionId);
        }
      },

      /**
       * Update with new revision and wikitext.
       * @method edit
       * @param {Object} option
       * @param {String} option.ipAddress ip address.
       * @param {User} option.author author.
       * @param {String} option.text wikitext.
       * @param {String} [option.summary] summary.
       * @return {Promise<Revision>} Resolves latest revision.
       */
      edit({ ipAddress, author, text, summary = '' }) {
        return models.Revision.createNew({ article: this, ipAddress, author, text, status: 'updated', summary });
      },

      /**
       * Rename this article and add a new revision.
       * @method rename
       * @param {Object} option
       * @param {String} option.ipAddress ip address.
       * @param {User} option.author author.
       * @param {String} option.newFullTitle full title to change into.
       * @param {String} [option.summary] summary.
       * @return {Promise<Revision>} Resolves latest revision.
       */
      rename({ ipAddress, author, newFullTitle, summary = '' }) {
        const { namespace, title } = models.Namespace.splitFullTitle(newFullTitle);
        return models.Revision.createNew({ article: this, ipAddress, author, status: 'renamed', newFullTitle, summary })
        .then(() => {
          return this.update({ namespaceId: namespace.id, title: title });
        });
      },

      /**
       * Remove this article.
       * @method delete
       * @param {Object} option
       * @param {String} option.ipAddress ip address.
       * @param {User} option.author author.
       * @param {String} [option.summary] summary.
       * @return {Promise<Revision>} Resolves latest revision.
       */
      delete({ ipAddress, author, summary }) {
        return models.Revision.createNew({ article: this, ipAddress, author, status: 'deleted', summary })
        .then(() => {
          return this.destroy();
        });
      },

      /**
       * Render its latest wikitext to HTML.
       * @return {Promise<RenderResult>} Resolves result of rendering.
       */
      render() {
        return articleParser.parseRender({ article: this })
        .then((result) => {
          return result;
        });
      }

    }
  });
  return Article;
};
