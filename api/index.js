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
  edit: require('./user/edit'),
  get: require('./user/get')
}
module.exports = {
  anim, session, user
}