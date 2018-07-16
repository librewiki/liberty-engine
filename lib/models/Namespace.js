'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');
const errors = require('../errors');

class Namespace extends LibertyModel {
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
      },

      /**
       * Name of namespace.
       *
       * @property name
       * @type String
       */
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.hasMany(models.Article);
    this.hasMany(models.NamespacePermission);
  }

  /**
   * Loads all namespaces and caches the instances of Namespace.
   * It should be called when the app starts.
   * @method initialize
   * @async
   * @static
   * @return {Promise<undefined>} Resolves undefined when initialization finished.
   */
  static async initialize() {
    this.idKeyMap.clear();
    this.nameKeyMap.clear();
    const namespaces = await this.findAll();
    for (const namespace of namespaces) {
      this.idKeyMap.set(namespace.id, namespace);
      this.nameKeyMap.set(namespace.name, namespace);
    }
    this.Known = {
      FILE: this.getById(6),
      TEMPLATE: this.getById(10),
      CATEGORY: this.getById(14),
    };
  }

  static getAll() {
    return Array.from(this.idKeyMap.values());
  }

  /**
   * Returns an instance of Namespace. Each object is unique across app.
   * @method getById
   * @static
   * @param {Number} id id of the namespace.
   * @return {Namespace} Returns an instance of Namespace. If not exists, returns null.
   */
  static getById(id) {
    const namespace = this.idKeyMap.get(id);
    if (namespace) {
      return namespace;
    }
    return null;
  }

  /**
   * Returns an instance of Namespace. Each object is unique across app.
   * @method getByName
   * @static
   * @param {String} name name of the namespace.
   * @return {Namespace} Returns an instance of Namespace. If not exists, returns null.
   */
  static getByName(name) {
    const namespace = this.nameKeyMap.get(name);
    if (namespace) {
      return namespace;
    }
    return null;
  }

  /**
   * Splits full title into namespace instance and title
   * @method splitFullTitle
   * @static
   * @param {String} fullTitle full title of an article.
   * @return {Object} returns object { namespace, title }
   */
  static splitFullTitle(fullTitle) {
    if (!fullTitle.includes(':')) {
      return {
        namespace: this.getById(0),
        title: fullTitle,
      };
    }
    const [first, ...rest] = fullTitle.split(':');
    const namespace = this.getByName(first.trim());
    if (namespace) {
      return {
        namespace,
        title: rest.join(':').trim(),
      };
    }
    return {
      namespace: this.getById(0),
      title: fullTitle.trim(),
    };
  }

  /**
   * Returns full title from namespace id and title
   * @method joinNamespaceIdTitle
   * @static
   * @param {Number} id namespace id.
   * @param {String} title title.
   * @return {String} Returns full title.
   */
  static joinNamespaceIdTitle(id, title) {
    title = title.trim();
    if (id === 0) {
      if (this.getByName(title.includes(':') && title.split(':')[0])) {
        throw new errors.MalformedTitleError('title should not contain namespace name.');
      }
      return title;
    }
    return `${this.getById(id).name}:${title}`;
  }
}

/**
 * Map holding id as a key and namespace as a value.
 *
 * @property _idKeyMap
 * @static
 * @private
 * @type Map<Namespace>
 * @default Map{}
 */
Namespace.idKeyMap = new Map();

/**
 * Map holding name as a key and namespace as a value.
 *
 * @property _idKeyMap
 * @static
 * @private
 * @type Map<Namespace>
 * @default Map{}
 */
Namespace.nameKeyMap = new Map();

module.exports = Namespace;
