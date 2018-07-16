'use strict';

const env = process.env.NODE_ENV || 'development';
const saltRounds = 10;

const { promisify } = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const { Op } = require('sequelize');
const DataTypes = require('../DataTypes');
const models = require('./');
const { secret } = require('../../config/config.json')[env];
const sendEmail = require('../sendEmail');
const { ACCESS_ADMIN_PANEL } = require('../SpecialPermissions');
const LibertyModel = require('./LibertyModel');
const notification = require('../notification');

const jwtVerifyAsync = promisify(jwt.verify);
const jwtSignAsync = promisify(jwt.sign);
const randomBytesAsync = promisify(crypto.randomBytes);

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
    return jwtVerifyAsync(token, secret);
  }

  static async initialize() {
    this.anonymous = new User({
      id: null,
      username: '(anonymous)',
      email: null,
      emailConfirmed: true,
      roles: [models.Role.Known.anonymous],
    }, {
      include: [models.Role],
    });
  }

  static async hashPasswordHook(user) {
    if (!user.changed('password')) return;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.passwordHash = hash;
    user.password = undefined;
  }

  static validateUsername(username) {
    return models.Article.validateTitle(username);
  }

  static async signUp({ email, password, username }) {
    if (!this.validateUsername(username)) throw new Error('Invalid Username');
    const { loggedIn } = models.Role.Known;
    const confirmCode = (await randomBytesAsync(48)).toString('hex');
    const user = await this.create({
      username,
      password,
      email,
      emailConfirmed: false,
      confirmCode,
      confirmCodeExpiry: moment().add(1, 'days').toDate(),
    });
    await user.addRole(loggedIn);
    notification.send({ message: `${username} 사용자가 가입했습니다.` });
    sendEmail({
      to: email,
      subject: '이메일 인증입니다.',
      text: `이메일 인증 코드는 하루 동안 유효합니다.
${username} 사용자가 아닌 경우, 이 메일을 삭제해 주십시오.
http://${models.Setting.get('domain')}/api/email-confirm?username=${encodeURIComponent(username)}&code=${confirmCode}`,
    })
      .catch((err) => { });
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
    return jwtSignAsync(payload, secret, { expiresIn: '1d' });
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
    return jwtSignAsync(payload, secret, { expiresIn: '7d' });
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
          [Op.in]: roleNames,
        },
      },
    });
  }

  async getSpecialPermissionSet() {
    const roles = this.roles || await this.getRoles();
    const permissionSet = new Set();
    for (const role of roles) {
      for (const x of role.getSpecialPermissionSet()) {
        permissionSet.add(x);
      }
    }
    return permissionSet;
  }

  async hasSpecialPermissionTo(permissionName) {
    const roles = this.roles || await this.getRoles();
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

  async isReadable(article) {
    const roles = this.roles || await this.getRoles();
    const list = await Promise.all(roles.map(role => role.isReadable(article)));
    return list.includes(true);
  }

  async isEditable(article) {
    const roles = this.roles || await this.getRoles();
    const list = await Promise.all(roles.map(role => role.isEditable(article)));
    return list.includes(true);
  }

  async isRenamable(article) {
    const roles = this.roles || await this.getRoles();
    const list = await Promise.all(roles.map(role => role.isRenamable(article)));
    return list.includes(true);
  }

  async isDeletable(article) {
    const roles = this.roles || await this.getRoles();
    const list = await Promise.all(roles.map(role => role.isDeletable(article)));
    return list.includes(true);
  }

  async isCreatable(namespace) {
    const roles = this.roles || await this.getRoles();
    const list = await Promise.all(roles.map(role => role.isCreatable(namespace)));
    return list.includes(true);
  }
}

module.exports = User;
