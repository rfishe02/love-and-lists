const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var sqlite3 = require("sqlite3").verbose();

const bcrypt = require("bcrypt");

passport.use(
  "signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const encrypted_password = await bcrypt.hash(password, 10);

        const db = new sqlite3.Database("./webapp.db");
        db.serialize(() => {
          const stmt = db.prepare(
            `insert into users (user_email,user_password) values (?,?)`
          );

          stmt.run(email, encrypted_password, (err) => {
            if (err == null) {
              const user_id = stmt.lastID;
              stmt.finalize();
              return done(null, {
                user_id: user_id,
              });
            } else {
              done(err);
            }
          });
        });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (email, password, done) {
      try {
        const db = new sqlite3.Database("./webapp.db");
        db.serialize(() => {
          db.all(
            `select * from users where user_email = ?`,
            email,
            (err, rows) => {
              if (err !== undefined && rows !== undefined) {
                if (rows.length > 0) {
                  const found_user = rows[0];

                  bcrypt.compare(
                    password,
                    found_user.user_password,
                    function (err, result) {
                      if (result) {
                        return done(
                          null,
                          {
                            user_id: found_user.user_id,
                          },
                          { message: "Successful login" }
                        );
                      } else {
                        return done(null, false, {
                          message: "Wrong username or password",
                        });
                      }
                    }
                  );
                } else {
                  return done(null, false, {
                    message: "Wrong username or password",
                  });
                }
              } else {
                return done(null, false, { message: err });
              }
            }
          );
        });
      } catch (err) {
        done(err);
      }
    }
  )
);
