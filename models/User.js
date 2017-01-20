/**
 * Provides User model.
 *
 * @module models
 * @submodule User
 */

'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const secret = require('../config/config.json')[env].secret;

/**
 * Model representing users.
 *
 * @class User
 */
module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 128]
      }
    },
    passwordHash: {
      type: DataTypes.STRING(128)
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        len: [6, 128]
      }
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true,
      isEmail: true,
      defaultValue: null
    }
  }, {
    tableName: 'user',
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        User.belongsToMany(models.UserGroup, { through: 'userUserGroups' });
        User.hasOne(models.UserSignature, {
          onDelete: 'CASCADE', onUpdate: 'CASCADE'
        });
      },

      /**
       * Finds a user by username.
       * @method findByUsername
       * @static
       * @param {String} username
       * @return {Promise<User, null>} Returns a promise of user or null if not exists.
       */
      findByUsername(username) {
        return User.findOne({
          where: {
            username: username
          }
        });
      },

      /**
       * Verifies a json web token (jwt). If it valid, returns decoded data of it.
       * @method verifyToken
       * @static
       * @param {String} token jwt of a user.
       * @return {Promise<String, Error>} Resolves decoded token data or rejects if it invalid.
       */
      verifyToken(token) {
        return new Promise((resolve, reject) => {
          jwt.verify(token, secret, (err, decoded) => {
            if (err) {
              reject(err);
            } else {
              resolve(decoded);
            }
          });
        });
      }

    },
    instanceMethods: {
      /**
       * Returns whether given password is correct.
       * @method verifyPassword
       * @param {String} password password of this user
       * @return {Promise<Bool>} Returns a promise that has true (correct) or false (incorrect).
       */
      verifyPassword(password) {
        return bcrypt.compare(password, this.passwordHash);
      },

      /**
       * Issues a json web token (jwt). You must call verifyPassword() to check password before issue it to the user.
       * @method issueToken
       * @return {Promise<String>} Resolves new jwt.
       */
      issueToken() {
        return new Promise((resolve, reject) => {
          jwt.sign({
            id: this.id,
            username: this.username,
            email: this.email
          }, secret, { expiresIn: '1h' }, (err, token) => {
            if (err) {
              reject(err);
            } else {
              resolve(token);
            }
          });
        });
      },

      /**
       * Returns signature of this user.
       * @method getSignature
       * @return {Promise<String>} Returns a promise of signature of this user.
       */
      getSignature() {
        return this.getUserSignature()
        .then((signature) => {
          if (signature) {
            return signature.text;
          } else {
            return `[[${this.userPageFullTitle}]]`;
          }
        });
      }
    },
    getterMethods: {
      /**
       * Indicates the full title of user page of this user.
       *
       * @attribute userPageFullTitle
       * @readOnly
       * @type String
       */
      userPageFullTitle() {
        return `사용자:${this.username}`;
      }
    },
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword
    }
  });
  return User;
};

function hashPassword(user) {
  if (!user.changed('password')) return;
  return bcrypt.hash(user.password, saltRounds)
  .then((hash) => {
    user.passwordHash = hash;
    user.password = undefined;
  });
}
