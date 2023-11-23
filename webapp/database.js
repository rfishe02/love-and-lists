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
    create table users (
        user_id integer primary key,
        user_name text not null,
        user_email text,
        user_password text not null
    );

    create table tasks (
        task_id integer primary key,
        task_desc text not null,
        task_status integer not null,
        task_user integer not null,
        foreign key (task_user) references users(user_id)
    );

    create table characters (
        chara_id integer primary key,
        chara_name text not null,
        chara_archetype text not null,
        chara_eyes text not null,
        chara_hair text not null,
        chara_bond integer not null,
        chara_user integer not null,
        foreign key (chara_user) references users(user_id)
    );

    insert into users (user_id,user_name,user_password) 
        values (1,'Rosalind','password');

    insert into tasks (task_desc,task_status,task_user) 
        values ('Do laundry.',0,1),
               ('Buy groceries.',0,1),
               ('Clean kitchen.',0,1);

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