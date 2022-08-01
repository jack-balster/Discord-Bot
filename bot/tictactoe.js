//export sequelize model for tictactoe table
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tictactoe', { //table named tictactoe
        //convert everything to sequelize syntax (already know what DB table should look like from MIS 325)
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true, //unique users
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0, //starts at 0 and will increment by 1 if they win
            allowNull: false,
        }
    })
}
