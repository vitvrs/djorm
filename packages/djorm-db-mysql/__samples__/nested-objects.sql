CREATE TABLE `user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `frontendConfig`  TEXT,
  `personalKey`  TEXT,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `lookuptable` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `inputVariable` VARCHAR(255) NOT NULL,
  `weight` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `userlookuptable` (
  `id` INT(11) NOT NULL,
  `userId` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `ultlt` FOREIGN KEY (`id`) REFERENCES `lookuptable` (`id`),
  CONSTRAINT `ultu` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) DEFAULT CHARSET=utf8;
