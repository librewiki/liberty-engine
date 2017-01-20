/**
 * Provides Article model.
 *
 * @module models
 * @submodule Article
 */

'use strict';

const models = require('./');

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
      },

      /**
       * Create a new article.
       * @method createNew
       * @static
       * @param {Object} option
       * @param {String} option.fullTitle full title of an article.
       * @param {User} option.author user writing this.
       * @param {String} option.text wikitext.
       * @return {Promise<Article>} Resolves new article.
       * @example
       *   Aritcle.createNew({ fullTitle: 'ns:title', author: 'author', wikitext: 'sample [[wikitext]]' });
       */
      createNew({ fullTitle, author, text }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return this.create({
          namespaceId: namespace.id,
          title: title
        })
        .then((article) => {
          return models.Revision.createNew({ article, author, text, status: 'new' });
        });
      },


      findByFullTitle(fullTitle) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return this.findOne({
          namespaceId: namespace.id,
          title: title
        });
      },

      randomQueryString: `SELECT r1.id, r1.namespaceId, r1.title
          FROM articles r1
          JOIN (SELECT CEIL(RAND() * (SELECT MAX(id) FROM article)) AS id) r2
          WHERE r1.id >= r2.id and namespace_id = 0
          ORDER BY r1.id ASC
          LIMIT :limit`,

      findRandomly({ limit }) {
        return sequelize.query(this.randomQueryString, {
          replacements: { limit }, type: sequelize.QueryTypes.SELECT, model: this
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
      getLatestRevision({ includeWikitext }) {
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
       * @method getLatestRevision
       * @param {Object} option
       * @param {User} option.text author.
       * @param {String} option.text wikitext.
       * @return {Promise<Revision>} Resolves latest revision.
       */
      edit({ author, text }) {
        return models.Revision.createNew({ article: this, author, text, status: 'updated' });
      },

      rename({ author, fullTitle }) {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return models.Revision.createNew({ article: this, author, status: 'renamed', destinationFullTitle: fullTitle })
        .then(() => {
          return this.update({ namespaceId: namespace.id, title: title });
        });
      },

      delete({ author }) {
        return models.Revision.createNew({ article: this, author, status: 'deleted' })
        .then(() => {
          return this.destroy();
        });
      },

      /**
       * Render its latest wikitext to HTML.
       * @return {Promise<RenderResult>} Resolves result of rendering.
       */
      render() {
        return Promise.resolve({
          html: 'a<a class="new" href="asdf">asdf</a>vvvv'
        });
        // return this.getLatestRevision()
        // .then((revision) => {
        //   return revision.render();
        // });
      }

    }
  });
  return Article;
};
