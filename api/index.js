const anim = {
  byId: require('./anim/byId'),
  getNew: require('./anim/getNew'),
  getPopular: require('./anim/getPopular'),
  post: require('./anim/post')
}, session = {
  login: require('./session/login'),
  logout: require('./session/logout')
}, user = {
  create: require('./user/create'),
  edit: {
    auth: require('./user/edit/auth'),
    status: require('./user/edit/status'),
    information: require('./user/edit/information')
  },
  get: require('./user/get')
}
module.exports = {
  anim, session, user
}