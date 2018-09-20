//express_demo.js 文件
var express = require('express');
var app = express();
var sqlhelper = require('./sqlhepler')

app.set('view engine', 'pug')
app.use(express.static('templates'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

BASE_DIR = __dirname + "/templates"

var Ret = function () {
    this.message = "成功";
    this.success = true;
}

var Dojo = function () {
    this.dojo_name = null;
    this.dojo_shortcuts = [];
    this.dojo_levels = []
}

var Dojo_shortcut = function () {
    this.shortcut_key = null;
    this.shortcut_desc = null;
    this.level_value = null;
}

var Dojo_level = function () {
    this.level_name = null;
    this.level_value = null;
}

function path(filename) {
    return BASE_DIR + "/" + filename + ".pug";
}

app.get(['/'], function (req, res) {
    sqlhelper.all("select * from dojos", [],  function (err, rows) {
        var dojos = rows.map(function(row){
            let dojo = JSON.parse(row.data);
            dojo.dojo_id = row.id;
            return dojo;
        })

        res.render(path('index'), {
            dojos: dojos
        });
    });
})

app.get('/dojo', function (req, res) {
    if (req.query && req.query.id) {
        var id = req.query.id
        sqlhelper.get("select * from dojos where id = ?", [id], function (err, row) {
            console.log(row)
            var dojo = JSON.parse(row.data);
            res.render(path('dojo'), {
                dojo: dojo,
                id : row.id
            })
        })
    }
});

app.get('/dojo_level', function (req, res) {
    if (req.query && req.query.id) {
        var id = req.query.id
        var level = req.query.level;
        sqlhelper.get("select * from dojos where id = ?", [id], function (err, row) {
            console.log(row)
            var dojo = JSON.parse(row.data);
            var dojo_level = new Dojo_level();
            for( var i in dojo.dojo_levels){
                if(dojo.dojo_levels[i].level_value == level){
                    dojo_level = dojo.dojo_levels[i];
                    break;
                }
            }
            var dojo_level_shortcuts = []
            for(var i in dojo.dojo_shortcuts){
                if(dojo.dojo_shortcuts[i].level_value == level){
                    dojo_level_shortcuts.push(dojo.dojo_shortcuts[i])
                }
            }
            res.render(path('dojo_level'), {
                dojo_level: dojo_level,
                dojo_shortcuts: dojo_level_shortcuts,
                dojo : dojo,
                id : row.id
            })
        })
    }
});


app.get('/dojo/new', function (req, res) {
    if (req.query && req.query.id) {
        var id = req.query.id
        sqlhelper.get("select * from dojos where id = ?", [id], function (err, row) {
            console.log(row)
            var dojo = JSON.parse(row.data);
            res.render(path('dojo_new'), {
                dojo: dojo,
                isEdit : true,
                id : row.id
            })
        })
    } else {
        var dojo = new Dojo();
        var sc = new Dojo_shortcut();
        var sl = new Dojo_level();
        dojo.os = 'windows'
        dojo.dojo_shortcuts.push(sc)
        dojo.dojo_levels.push(sl)
        res.render(path('dojo_new'), {
            dojo: dojo,
            isEdit : false
        })
    }
})

app.post('/dojo/new', function (req, res) {
    var dojo = req.body
    var id = req.body.dojo_id
    if(id) {
        sqlhelper.run("update dojos set data= ? where id = ?", [JSON.stringify(dojo), id])
    } else {
        sqlhelper.run("insert into dojos (data) values(?)", [JSON.stringify(dojo)])
    }
    res.end(JSON.stringify(new Ret()))
})

app.post('/dojo/delete', function (req, res) {
    var id = req.body.id
    console.log(id)
    if(id) {
        sqlhelper.run("delete from dojos where id = ?", [id])
    }
    res.end(JSON.stringify(new Ret()))
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log(new Date() + " 应用实例，访问地址为 http://%s:%s", host, port)

})