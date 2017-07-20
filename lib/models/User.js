'use strict';

const DataTypes = require('../DataTypes');
const models = require('./');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const jwt = require('jsonwebtoken');

const env = process.env.NODE_ENV || 'development';
const secret = require('../../config/config.json')[env].secret;
const crypto = require('crypto');
const sendMail = require('../sendMail');
const moment = require('moment');
const { ACCESS_ADMIN_PANEL } = require('../specialPermissionConstants');
const LibertyModel = require('./LibertyModel');

class User extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emailConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      confirmCode: {
        type: DataTypes.STRING(96),
        allowNull: true,
      },
      confirmCodeExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 128],
        },
      },
      passwordHash: {
        type: DataTypes.STRING(128),
      },
      password: {
        type: DataTypes.VIRTUAL,
        validate: {
          len: [6, 128],
        },
      },
      passwordExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: true,
        validate: {
          isEmail: true,
        },
        defaultValue: null,
      },
      isAnonymous: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue('id') === null;
        },
      },
    };
  }
  static getOptions() {
    return {
      hooks: {
        beforeCreate: this.hashPasswordHook,
        beforeUpdate: this.hashPasswordHook,
      },
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsToMany(models.Role, {
      through: models.UserRoleMap,
    });
    this.hasOne(models.UserSignature, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  /**
   * Finds a user by username.
   * @method findByUsername
   * @async
   * @static
   * @param {String} username
   * @return {Promise<User, null>} Resolves user or null if not exists.
   */
  static findByUsername(username) {
    return this.findOne({
      where: {
        username,
      },
    });
  }

  /**
   * Verifies a json web token (jwt). If it valid, returns decoded data of it.
   * @method verifyToken
   * @async
   * @static
   * @param {String} token jwt of a user.
   * @return {Promise<String, Error>} Resolves decoded token data or rejects if it invalid.
   */
  static verifyToken(token) {
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

  static initialize() {
    this.anonymous = new User({
      id: null,
      username: '(anonymous)',
      email: null,
      emailConfirmed: true,
    });
  }

  static async hashPasswordHook(user) {
    if (!user.changed('password')) return;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.passwordHash = hash;
    user.password = undefined;
  }

  static async signUp({ email, password, username }) {
    const userEmailShouldBeConfirmed = models.Setting.get('userEmailShouldBeConfirmed');
    if (userEmailShouldBeConfirmed) {
      const confirmCode = await new Promise((resolve, reject) => {
        crypto.randomBytes(48, (err, buffer) => {
          if (err) return reject(err);
          return resolve(buffer.toString('hex'));
        });
      });
      const user = await this.create({
        username,
        password,
        email,
        emailConfirmed: false,
        confirmCode,
        confirmCodeExpiry: moment().add(1, 'days').toDate(),
      });
      sendMail({
        to: email,
        subject: '메일 인증입니다.',
        text: `메일 인증 코드는 하루 동안 유효합니다.
${username} 사용자가 아닌 경우, 이 메일을 삭제해 주십시오.
http://localhost:3001/mail-confirm?username=${encodeURIComponent(username)}&code=${confirmCode}`,
      })
        .catch((err) => {
          console.error(err);
          console.error('Please check mail config.');
        });
      return user;
    }
    const user = await this.create({
      username,
      password,
      email,
      emailConfirmed: true,
    });
    return user;
  }

  /**
   * Returns whether given password is correct.
   * @method verifyPassword
   * @async
   * @param {String} password password of this user
   * @return {Promise<Bool>} Resolves true (correct) or false (incorrect).
   */
  verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Issues a json web token (jwt).
   * @method issueToken
   * @async
   * @return {Promise<String>} Resolves new jwt.
   */
  async issueToken() {
    const payload = {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: (await this.getRoles()).map(role => role.name),
      isAdmin: await this.hasSpecialPermissionTo(ACCESS_ADMIN_PANEL),
      type: 'ACCESS',
    };
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, { expiresIn: '30min' }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  /**
   * Issues a refresh token.
   * @method issueToken
   * @async
   * @return {Promise<String>} Resolves new refresh token.
   */
  async issueRefreshToken() {
    const payload = {
      id: this.id,
      type: 'REFRESH',
    };
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      });
    });
  }

  /**
   * Returns signature of this user.
   * @method getSignature
   * @async
   * @return {Promise<String>} Resolves the signature of this user.
   */
  async getSignature(ipAddress) {
    if (this.isAnonymous) {
      return `[[사용자:${ipAddress}]]`;
    }
    const signature = await this.getUserSignature();
    if (signature) {
      return signature.text;
    }
    return `[[${this.userPageFullTitle}]]`;
  }

  /**
   * Returns which this user has one of the passed roles.
   * @method hasAnyRole
   * @async
   * @param {String[]} roleNames Array of name of roles
   * @return {Promise<Bool>} Resolves true or false
   */
  async hasAnyRole(roleNames) {
    return !!await this.countRoles({
      where: {
        name: {
          $in: roleNames,
        },
      },
    });
  }

  async hasSpecialPermissionTo(permissionName) {
    const roles = await this.getRoles();
    for (const role of roles) {
      if (role.hasSpecialPermissionTo(permissionName)) {
        return true;
      }
    }
    return false;
  }

  get userPageFullTitle() {
    return `사용자:${this.username}`;
  }
}

module.exports = User;
