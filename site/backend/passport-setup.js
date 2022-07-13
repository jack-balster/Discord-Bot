const passport = require("passport");
var DiscordStrategy = require("passport-discord").Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.use(
    new DiscordStrategy({
        clientID: '996111085067309099',
        clientSecret: 'Yd4I1yiFGluyfaUaD0QiZJUe_-T6NB7A',
        callbackURL: 'http://localhost:4000/auth/discord/callback',
        scope: ["bot", "identify"]
    },
    async (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    })
)