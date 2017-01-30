/**
 * Provides Namespace model.
 *
 * @module models
 * @submodule Namespace
 */

'use strict';

/**
 * Model representing namespaces.
 *
 * @class Namespace
 */
module.exports = function(sequelize, DataTypes) {
  const Namespace = sequelize.define('namespace', {
    /**
     * Primary key.
     *
     * @property id
     * @type Number
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
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
      unique: true
    }
  }, {
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        Namespace.hasMany(models.Article);
      },

      /**
       * Map holding id as a key and namespace as a value.
       *
       * @property _idKeyMap
       * @static
       * @private
       * @type Map<Namespace>
       * @default Map{}
       */
      _idKeyMap: new Map(),

      /**
       * Map holding name as a key and namespace as a value.
       *
       * @property _idKeyMap
       * @static
       * @private
       * @type Map<Namespace>
       * @default Map{}
       */
      _nameKeyMap: new Map(),


      /**
       * Loads all namespaces and caches the instances of Namespace.
       * It should be called when the app starts.
       * @method initialize
       * @static
       * @return {Promise} Returns a promise.
       */
      initialize() {
        this._idKeyMap.clear();
        this._nameKeyMap.clear();
        return this.findAll()
        .then((namespaces) => {
          namespaces.forEach((namespace) => {
            this._idKeyMap.set(namespace.id, namespace);
            this._nameKeyMap.set(namespace.name, namespace);
          });
        });
      },

      getAll() {
        return Array.from(this._idKeyMap.values());
      },

      /**
       * Returns an instance of Namespace. Each object is unique across app.
       * @method getById
       * @static
       * @param {Number} id id of the namespace.
       * @return {Namespace} Returns an instance of Namespace. If not exists, returns null.
       */
      getById(id) {
        const namespace = this._idKeyMap.get(id);
        if (namespace) {
          return namespace;
        } else {
          return null;
        }
      },

      /**
       * Returns an instance of Namespace. Each object is unique across app.
       * @method getByName
       * @static
       * @param {String} name name of the namespace.
       * @return {Namespace} Returns an instance of Namespace. If not exists, returns null.
       */
      getByName(name) {
        const namespace = this._nameKeyMap.get(name);
        if (namespace) {
          return namespace;
        } else {
          return null;
        }
      },

      /**
       * Split full title into namespace instance and title
       * @method splitFullTitle
       * @static
       * @param {String} fullTitle full title of an article.
       * @return {Promise} Returns a promise.
       */
      splitFullTitle(fullTitle) {
        let [first, ...rest] = fullTitle.split(':');
        let namespace = this.getByName(first);
        if (namespace) {
          return {
            namespace: namespace,
            title: rest.join(':')
          };
        } else {
          return {
            namespace: this.getById(0),
            title: fullTitle
          };
        }
      },

      joinNamespaceIdTitle(id, title) {
        if (id === 0) {
          if (this.getByName(title.split(':')[0])) {
            const err = new Error('title should not contain namespace name.');
            err.name = 'MalformedTitleError';
            throw err;
          }
          return title;
        }
        return this.getById(id).name + ':' + title;
      }
    }
  });
  return Namespace;
};
