CREATE TABLE `user` (
  `id`  INT(11) NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(255) NOT NULL,
  `frontendConfig`  TEXT,
  `personalKey`  TEXT,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
