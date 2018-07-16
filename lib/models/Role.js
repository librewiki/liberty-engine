'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class Role extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
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
    this.belongsToMany(models.User, {
      through: models.UserRoleMap,
    });
    this.belongsToMany(models.SpecialPermission, {
      through: models.SpecialPermissionRoleMap,
    });
    this.hasMany(models.ArticlePermission);
    this.hasMany(models.NamespacePermission);
  }

  static async initialize() {
    this.permissionSets.clear();
    const roles = await this.findAll({ include: models.SpecialPermission });
    for (const role of roles) {
      const permissionSet = new Set();
      this.permissionSets.set(role.id, permissionSet);
      for (const permission of role.specialPermissions) {
        permissionSet.add(permission.name);
      }
    }
    this.Known = {
      root: await models.Role.findOne({ where: { name: 'root' } }),
      anonymous: await models.Role.findOne({ where: { name: 'anonymous' } }),
      loggedIn: await models.Role.findOne({ where: { name: 'loggedIn' } }),
    };
    const rootPermissionSet = new Set();
    const allSpecialPermissions = await models.SpecialPermission.findAll();
    for (const permission of allSpecialPermissions) {
      rootPermissionSet.add(permission.name);
    }
    this.permissionSets.set(this.Known.root.id, rootPermissionSet);
  }

  getSpecialPermissionSet() {
    return Role.permissionSets.get(this.id);
  }

  hasSpecialPermissionTo(permissionName) {
    if (this.id === Role.Known.root.id) return true;
    const permissionSet = Role.permissionSets.get(this.id);
    return permissionSet.has(permissionName);
  }

  async isReadable(article) {
    if (this.id === Role.Known.root.id) return true;
    const [articlePermission] = await this.getArticlePermissions({
      where: { articleId: article.id },
    });
    if (articlePermission && articlePermission.readable !== null) {
      return articlePermission.readable;
    }
    const [namespacePermission] = await this.getNamespacePermissions({
      where: { namespaceId: article.namespaceId },
    });
    const namespaceLevel = namespacePermission !== undefined && namespacePermission.readable;
    return namespaceLevel;
  }

  async isEditable(article) {
    if (this.id === Role.Known.root.id) return true;
    const [articlePermission] = await this.getArticlePermissions({
      where: { articleId: article.id },
    });
    if (articlePermission && articlePermission.editable !== null) {
      return articlePermission.editable;
    }
    const [namespacePermission] = await this.getNamespacePermissions({
      where: { namespaceId: article.namespaceId },
    });
    const namespaceLevel = namespacePermission !== undefined && namespacePermission.editable;
    return namespaceLevel;
  }

  async isRenamable(article) {
    if (this.id === Role.Known.root.id) return true;
    const [articlePermission] = await this.getArticlePermissions({
      where: { articleId: article.id },
    });
    if (articlePermission && articlePermission.renamable !== null) {
      return articlePermission.renamable;
    }
    const [namespacePermission] = await this.getNamespacePermissions({
      where: { namespaceId: article.namespaceId },
    });
    const namespaceLevel = namespacePermission !== undefined && namespacePermission.renamable;
    return namespaceLevel;
  }

  async isDeletable(article) {
    if (this.id === Role.Known.root.id) return true;
    const [articlePermission] = await this.getArticlePermissions({
      where: { articleId: article.id },
    });
    if (articlePermission && articlePermission.deletable !== null) {
      return articlePermission.deletable;
    }
    const [namespacePermission] = await this.getNamespacePermissions({
      where: { namespaceId: article.namespaceId },
    });
    const namespaceLevel = namespacePermission !== undefined && namespacePermission.deletable;
    return namespaceLevel;
  }

  async isCreatable(namespace) {
    if (this.id === Role.Known.root.id) return true;
    const [namespacePermission] = await this.getNamespacePermissions({
      where: { namespaceId: namespace.id },
    });
    return namespacePermission !== undefined && namespacePermission.creatable;
  }

  async remove({ transaction } = {}) {
    return this.autoTransaction(transaction, async (transaction) => {
      await models.UserRoleMap.destroy({
        where: {
          roleId: this.id,
        },
        transaction,
      });
      return this.destroy({ transaction });
    });
  }
}

Role.permissionSets = new Map();

module.exports = Role;
