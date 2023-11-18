var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./webapp.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {

    if (err !== null) {
        console.log(err);
    } else {
        createTables(db);
        runQueries(db);
    }

});

function createTables(db) {
    db.exec(`
    create table tasks (
        task_id integer primary key,
        task_desc text not null,
        task_done integer not null
    );
    
    insert into tasks (task_desc,task_done) 
        values ('Do taxes.',0),
               ('Buy milk.',0),
               ('Do dishes.',0);

    `, (err) => {
        console.log(err);
    });
};

function runQueries(db) {
    db.all(`select * from tasks`, (err, rows) => {
        if(rows !== undefined) {
            rows.forEach(row => {
                console.log(row);
            });
        } else {
            console.log("QUERY ERROR: "+err);
        }
    });
};