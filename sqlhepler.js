var Sqlite3 = require('sqlite3')
module.exports = {
    run : function(sql, args){
        var db = new Sqlite3.Database('db/sn.db');
        db.run(sql, args)
        db.close()
    },
    all : function(sql, param, callback){
        var db = new Sqlite3.Database('db/sn.db');
        db.all(sql,param, callback);
        db.close()
    },
    get : function(sql, param, callback){
        var db = new Sqlite3.Database('db/sn.db');
        db.get(sql,param, callback);
        db.close()
    },
}