const bcrypt = require('bcryptjs');
const { Model } = require('sequelize'); 

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Cortes, { foreignKey: 'userId' });
    }
  }

  Users.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Mantener este índice único
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        // Eliminar el índice único aquí para reducir el número de índices
        // unique: true, 
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
        validate: {
          isIn: [['admin', 'user']],
        }
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }
    },
    {
      sequelize,
      modelName: 'Users',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password && user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.password && user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
    }
  );

  return Users;
};