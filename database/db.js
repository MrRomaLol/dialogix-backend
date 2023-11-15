const sqlite3 = require('sqlite3');
const async = require('async');
const {readFileSync} = require("fs");

const db = new sqlite3.Database('./database/local_database.db');

const sqlQuery = readFileSync("./database/queries/create_tables.sql").toString();
const queryArr = sqlQuery.toString().split(');');

db.serialize(function () {
    queryArr.forEach((query) => {
        if (query) {
            query += ');';
            db.run(query);
        }
    })
});

const dbQueue = async.queue((task, callback) => {
    switch (task.type) {
        case 'run':
            db.run(task.query, task.params, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, this);
                }
            })
            break;
        case 'all':
            db.all(task.query, task.params, function (err, rows) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, rows, this);
                }
            })
            break;
        case 'get':
            db.get(task.query, task.params, function (err, row) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, row, this);
                }
            })
            break;
        default:
            throw new Error('Method invalid')
    }
})

const dbWrapper = {
    run(query, params, cb) {
        dbQueue.push({
            type: 'run',
            query,
            params,
        }, (err, result) => cb?.(err, result));
    },
    all(query, params, cb) {
        dbQueue.push({
            type: 'all',
            query,
            params
        }, (err, rows, result) => cb?.(err, rows, result))
    },
    get(query, params, cb) {
        dbQueue.push({
            type: 'get',
            query,
            params
        }, (err, rows, result) => cb?.(err, rows, result))
    }
}

let isDBClosed = false;

const closeDB = (cb) => {
    if (isDBClosed) return;
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            isDBClosed = true;
            console.log('Database connection closed.');
            cb?.();
        }
    });
}

process.on('exit', () => {
    closeDB();
});

process.on('SIGINT', () => {
    closeDB(() => {
        process.exit(0);
    });
});

module.exports = dbWrapper;