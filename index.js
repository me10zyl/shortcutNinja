//express_demo.js 文件
var express = require('express');
var app = express();
var sqlhelper = require('./sqlhepler')
var multer  = require('multer')
var fs = require('fs')

app.set('view engine', 'pug')
app.use(express.static('templates'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

var upload = multer({ dest: 'uploads/' })

BASE_DIR = __dirname + "/templates"


var Ret = function () {
    this.message = "成功";
    this.success = true;
}

var Dojo = function () {
    this.dojo_name = null;
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
    this.dojo_shortcuts = [];
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
            var dojo = JSON.parse(row.data);
            var dojo_level = new Dojo_level();
            for( var i in dojo.dojo_levels){
                if(dojo.dojo_levels[i].level_value == level){
                    dojo_level = dojo.dojo_levels[i];
                    break;
                }
            }
            res.render(path('dojo_level'), {
                dojo_level: dojo_level,
                dojo_shortcuts: dojo_level.dojo_shortcuts,
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
        sl.level_value = 1
        dojo.os = 'windows'
        sl.dojo_shortcuts.push(sc)
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


app.post('/dojo/new/upload', upload.single('scs'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any

    fs.readFile(req.file.path, function (err, data) {
        if(err){
            return res.json({
                msg : err
            })

        }
        var splits = data.toString().split(/\r?\n/ig)
        var dojo_levels = []
        var start = false;
        var level = null;
        var end = false;
        for(var i in splits){
            var split = splits[i]
            if(end){
                end = false;
                start = false;
            }else if(start){
                level = new Dojo_level();
                dojo_levels.push(level)
                level.level_name = split;
                end = true;
            }else if(/^---/.test(split)){
                start = true;
            }else{
                var s = new Dojo_shortcut();
                let strings = split.split(" ");
                s.shortcut_key = strings[0]
                if(s.shortcut_key == ""){
                    continue
                }
                s.shortcut_desc = ""
                for(var i in strings){
                    if(i != 0) {
                        s.shortcut_desc += strings[i] + " "
                    }
                }
                s.shortcut_desc = s.shortcut_desc.trim()
                level.dojo_shortcuts.push(s)
            }
        }
        res.json({
            msg : "成功",
            data : dojo_levels
        })
    });
})

app.post('/dojo/delete', function (req, res) {
    var id = req.body.id

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