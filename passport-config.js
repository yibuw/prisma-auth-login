const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    // console.log(
    //   '🚀 ~ file: passport-config.js ~ line 6 ~ authenticateUser ~ email, password, done',
    //   email,
    //   password,
    //   done
    // );
    // const user = getUserByEmail(email);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const res = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return done(null, res);
  });
}

module.exports = initialize;
